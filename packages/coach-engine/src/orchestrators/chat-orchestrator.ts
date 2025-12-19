/**
 * Chat orchestrator for coach engine
 * Handles LLM interaction with Claude via AWS Bedrock
 */

import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { COACH_SYSTEM_PROMPT } from '../prompts/system-prompt';
import { queryRag } from '../tools/rag-query-tool';
import type { ChatRequest, CoachResponse, CoachMessage } from '../types';

export interface ChatOrchestratorConfig {
  region?: string;
  modelId?: string;
}

/**
 * Chat orchestrator that manages LLM interactions
 */
export class ChatOrchestrator {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(config: ChatOrchestratorConfig = {}) {
    this.client = new BedrockRuntimeClient({
      region: config.region || process.env.AWS_REGION || 'us-east-2',
    });
    // Using Claude 3.5 Sonnet v2 via cross-region inference profile
    // This supports ON_DEMAND throughput (direct model IDs require INFERENCE_PROFILE)
    this.modelId = config.modelId ||
      process.env.BEDROCK_CLAUDE_MODEL_ID ||
      'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
  }

  /**
   * Process a chat message
   * This is the main entry point for conversational interactions
   */
  async chat(request: ChatRequest): Promise<CoachResponse> {
    const { userMessage, context, useRag = true } = request;

    console.log('🟢 ChatOrchestrator.chat() called');
    console.log('🟢 Model ID:', this.modelId);
    console.log('🟢 Region:', await this.client.config.region());

    // Build conversation history
    const messages = this.buildMessages(context.conversationHistory || [], userMessage);

    // If RAG is enabled, query for relevant context
    let ragContext = '';
    const ragSources: Array<{ collection: string; title: string; excerpt: string }> = [];

    if (useRag) {
      try {
        const ragResult = await queryRag({
          query: userMessage,
          limit: 3,
        });

        if (ragResult.results.length > 0) {
          ragContext = '\n\n# Relevant Context from Knowledge Base\n\n';
          ragResult.results.forEach((result, index) => {
            ragContext += `## Source ${index + 1} (${result.collection})\n${result.content}\n\n`;
            ragSources.push({
              collection: result.collection,
              title: result.source,
              excerpt: result.content.substring(0, 200) + '...',
            });
          });
        }
      } catch (error) {
        console.error('RAG query failed:', error);
        // Continue without RAG rather than failing
      }
    }

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context, ragContext);

    console.log('🟢 About to invoke Bedrock model...');

    // Call Claude via Bedrock
    let response: string;
    try {
      response = await this.invokeModel(systemPrompt, messages);
      console.log('🟢 Bedrock response received, length:', response.length);
    } catch (error: any) {
      console.error('🔴 Failed to invoke Bedrock model');
      throw error; // Re-throw to be caught by CoachService
    }

    // Return response (Safety Brain will filter it in domain-core)
    return {
      message: response,
      safetyFiltered: false, // Will be filtered by domain-core
      sources: ragSources.length > 0 ? ragSources : undefined,
    };
  }

  /**
   * Explain a plan in natural language
   */
  async explainPlan(plan: unknown, context: any): Promise<CoachResponse> {
    const planStr = JSON.stringify(plan, null, 2);

    const userMessage = `Please explain this exercise plan to me in a warm, encouraging way. 
    
    Help me understand:
    - What exercises I'll be doing and why
    - How this plan fits my goals and limitations
    - What to expect and how to get started
    
    Plan:
    ${planStr}`;

    return this.chat({
      userMessage,
      context,
      useRag: true,
    });
  }

  /**
   * Build messages array for Claude
   */
  private buildMessages(
    history: CoachMessage[],
    currentMessage: string
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history (exclude system messages)
    for (const msg of history) {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    return messages;
  }

  /**
   * Build system prompt with user context
   */
  private buildSystemPrompt(context: any, ragContext: string): string {
    let prompt = COACH_SYSTEM_PROMPT;

    // Add coach persona context if available
    if (context.coachPersona) {
      prompt += `\n\n# Your Persona\n\n`;
      prompt += `Your name is ${context.coachPersona.name}.\n`;
      if (context.coachPersona.description) {
        prompt += `Description: ${context.coachPersona.description}\n`;
      }
      // Add specific instruction to adopt this persona
      prompt += `You must embody this persona in your response. Introduce yourself as ${context.coachPersona.name} if asked.`;
    }

    // Add user context
    prompt += '\n\n# User Context\n\n';

    if (context.userName) {
      prompt += `User's name: ${context.userName}\n`;
    }

    if (context.userAge) {
      prompt += `User's age: ${context.userAge}\n`;
    }

    if (context.limitations && context.limitations.length > 0) {
      prompt += `User's limitations: ${context.limitations.join(', ')}\n`;
    }

    if (context.motivationProfile) {
      prompt += `Motivation profile: ${context.motivationProfile}\n`;
    }

    // Add RAG context if available
    if (ragContext) {
      prompt += ragContext;
    }

    return prompt;
  }

  /**
   * Invoke Claude model via Bedrock using Converse API
   * NOTE: Inference profiles REQUIRE the Converse API, not InvokeModelCommand
   */
  private async invokeModel(
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    try {
      console.log('🟡 Using Converse API with inference profile');
      console.log('🟡 Inference Profile ID:', this.modelId);

      const command = new ConverseCommand({
        modelId: this.modelId, // This is the inference profile ID
        messages: messages.map(msg => ({
          role: msg.role,
          content: [{ text: msg.content }],
        })),
        system: [{ text: systemPrompt }],
        inferenceConfig: {
          maxTokens: 1024,
          temperature: 0.7,
        },
      });

      console.log('🟡 Sending Converse command...');
      const response = await this.client.send(command);
      console.log('🟡 Converse response received');

      // Extract content from response
      if (response.output?.message?.content && response.output.message.content.length > 0) {
        const text = response.output.message.content[0]?.text;
        if (text) {
          return text;
        }
      }

      throw new Error('No content in Claude response');
    } catch (error: any) {
      const region = await this.client.config.region();
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Claude invocation failed:');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Inference Profile ID:', this.modelId);
      console.error('Region:', region);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('HTTP status:', error.$metadata?.httpStatusCode);
      console.error('Request ID:', error.$metadata?.requestId);
      console.error('Full error:', JSON.stringify(error, null, 2));
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw new Error(`Failed to get response from coach: ${error.message}`);
    }
  }
}

