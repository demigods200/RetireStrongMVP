"use client";

import { useState } from "react";
import { Card, Button } from "@retire-strong/shared-ui";
import { getApiUrl } from "@/lib/api-client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  safetyFiltered?: boolean;
}

interface CoachChatProps {
  userId: string;
}

export function CoachChat({ userId }: CoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");

  const sendMessage = async (e: React.FormEvent, retryMessage?: string) => {
    e.preventDefault();

    const messageToSend = retryMessage || input;

    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    // Only add user message if not retrying (it's already in the messages)
    if (!retryMessage) {
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      console.log("✅ User message added:", {
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp
      });
    }

    setLastUserMessage(messageToSend);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/coach/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userMessage: messageToSend,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      // Log full response for debugging
      console.log("Coach API response:", { status: response.status, data });

      if (!response.ok || !data.success) {
        // More helpful error messages based on the error type
        let errorMessage = "I&apos;m having trouble responding right now. Please try again.";

        if (response.status === 500) {
          errorMessage = "I&apos;m experiencing technical difficulties. Please try again in a moment.";
        } else if (response.status === 400) {
          errorMessage = "I didn't quite understand that. Could you try rephrasing your question?";
        } else if (response.status === 429) {
          errorMessage = "I need a moment to catch my breath. Please wait a few seconds and try again.";
        } else if (data.error?.code === "VALIDATION_ERROR") {
          errorMessage = "There was an issue with your message format. Please try again.";
        } else if (data.error?.message) {
          // Use backend error message if it's user-friendly
          errorMessage = data.error.message;
        }

        throw new Error(errorMessage);
      }

      // Validate that we have the expected data structure
      if (!data.data || typeof data.data.message !== 'string') {
        console.error("Invalid response structure:", data);
        throw new Error("I received an unexpected response. Please try asking your question again.");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.data.message,
        timestamp: data.data.timestamp,
        safetyFiltered: data.data.safetyFiltered,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setError(null); // Clear any previous errors

      console.log("✅ Message added to UI:", {
        role: assistantMessage.role,
        contentLength: assistantMessage.content.length,
        contentPreview: assistantMessage.content.substring(0, 100),
        safetyFiltered: assistantMessage.safetyFiltered
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "I'm having trouble connecting right now. Please try again.";

      setError(errorMessage);

      // Log detailed error for debugging
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("Coach chat error:");
      console.error("User message:", messageToSend);
      console.error("Error:", err);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = (e: React.FormEvent) => {
    if (lastUserMessage) {
      sendMessage(e, lastUserMessage);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        title="Chat with Your Coach"
        subtitle={`Ask questions, get personalized guidance ${messages.length > 0 ? `• ${messages.length} message${messages.length === 1 ? '' : 's'}` : ''}`}
      >
        <div className="space-y-4">
          {/* Messages */}
          <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">👋 Hi! I&apos;m your Retire Strong Coach.</p>
                <p className="mt-2">Ask me anything about your exercise plan, movement, or wellness journey.</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 shadow-sm ${msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    // Force background and text colors inline to override any CSS conflicts
                    backgroundColor: msg.role === "user" ? "#059669" : "#f3f4f6",
                    color: msg.role === "user" ? "#ffffff" : "#1f2937",
                    border: msg.role === "assistant" ? "1px solid #d1d5db" : "none",
                  }}
                >
                  <div className="text-sm leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {msg.safetyFiltered && (
                    <div className="text-xs mt-2 pt-2 border-t border-gray-300 opacity-75">
                      ✓ Reviewed by Safety Brain
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💬</span>
                <div className="flex-1">
                  <p className="font-medium mb-1">Having trouble connecting</p>
                  <p className="text-sm mb-3">{error}</p>
                  <div className="flex items-center space-x-3">
                    {lastUserMessage && (
                      <button
                        onClick={retryLastMessage}
                        className="text-sm bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? "Retrying..." : "Try Again"}
                      </button>
                    )}
                    <button
                      onClick={() => setError(null)}
                      className="text-sm text-amber-700 hover:text-amber-900 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach a question..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-white text-gray-900 placeholder-gray-400"
              maxLength={2000}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            All coach responses are reviewed by our Safety Brain to ensure they're safe and appropriate.
          </p>
        </div>
      </Card>

      <Card title="Safety First" subtitle="What the Safety Brain does">
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>✓ Blocks unsafe advice:</strong> No medical diagnosis, unsafe exercises, or over-promising.
          </p>
          <p>
            <strong>✓ Age-aware safety:</strong> Ensures recommendations are appropriate for older adults.
          </p>
          <p>
            <strong>✓ Evidence-based:</strong> All guidance is grounded in clinical guidelines and research.
          </p>
        </div>
      </Card>
    </div>
  );
}

