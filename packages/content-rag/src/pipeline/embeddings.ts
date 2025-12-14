/**
 * Embedding generation for RAG content
 * Uses AWS Bedrock Titan Embeddings for vector generation
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export interface EmbeddingConfig {
  region?: string;
  modelId?: string;
}

/**
 * Generate embeddings using AWS Bedrock
 */
export class EmbeddingGenerator {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(config: EmbeddingConfig = {}) {
    this.client = new BedrockRuntimeClient({
      region: config.region || process.env.AWS_REGION || 'us-east-2',
    });
    // Using Amazon Titan Text Embeddings V2 - user confirmed this Model ID
    this.modelId = config.modelId || 
      process.env.BEDROCK_EMBEDDING_MODEL_ID || 
      'amazon.titan-embed-text-v2:0';
  }

  /**
   * Generate embedding vector for a text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: text,
        }),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.embedding as number[];
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Embedding generation failed');
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // For MVP, process sequentially
    // In production, could batch or parallelize
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      const a = vecA[i] ?? 0;
      const b = vecB[i] ?? 0;
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

