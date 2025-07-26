import { useState } from 'react';
import { Platform } from 'react-native';

interface UseWebhookAIReturn {
  sendMessage: (message: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

const WEBHOOK_URL = 'https://thryvmotivational.app.n8n.cloud/webhook/8fe6d9bd-29ae-4128-aa22-847143b66ea7'

export function useWebhookAI(): UseWebhookAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Different request formatting for mobile vs web
      const isWeb = Platform.OS === 'web';
      
      let requestOptions: RequestInit;
      
      if (isWeb) {
        // Web version - using URLSearchParams
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        const urlencoded = new URLSearchParams();
        urlencoded.append("messageInput", message);
        urlencoded.append("sessionId", generateSessionId());

        requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: urlencoded,
          redirect: "follow" as RequestRedirect,
        };
      } else {
        // Mobile version - using JSON or manual form encoding
        const headers: Record<string, string> = {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "User-Agent": `SwuChatBot/${Platform.OS}`,
        };

        // Manual form encoding for better mobile compatibility
        const formBody = [
          `messageInput=${encodeURIComponent(message)}`,
          `sessionId=${encodeURIComponent(generateSessionId())}`
        ].join('&');

        requestOptions = {
          method: "POST",
          headers,
          body: formBody,
        };
      }

      console.log(`[${Platform.OS}] Sending request to:`, WEBHOOK_URL);
      console.log(`[${Platform.OS}] Request options:`, JSON.stringify(requestOptions, null, 2));

      const response = await Promise.race([
        fetch(WEBHOOK_URL, requestOptions),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]);

      console.log(`[${Platform.OS}] Response status:`, response.status);
      console.log(`[${Platform.OS}] Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${Platform.OS}] Error response:`, errorText);
        throw new Error(`n8n webhook error! status: ${response.status}, message: ${errorText}`);
      }

      // Get response as JSON
      const result = await response.json();
      console.log(`[${Platform.OS}] Success response:`, result);
      
      // Return the AI response or a default message
      return result.output || result.message || result.response || 'I received your message but the AI workflow didn\'t return a response.';

    } catch (err) {
      let errorMessage = 'Failed to connect to AI service';
      
      console.error(`[${Platform.OS}] Webhook Error:`, err);
      
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('Request timeout')) {
          errorMessage = 'AI response timed out - the workflow might be processing a complex request';
        } else if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
          errorMessage = 'Network connection failed - please check your internet connection';
        } else if (err.message.includes('ERR_NETWORK')) {
          errorMessage = 'Network error - please check your connection and try again';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Cross-origin request blocked - this is a web-specific issue';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Return a helpful fallback response
      return `I'm having trouble with the AI workflow right now. ${errorMessage}. Please try again in a moment.`;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error
  };
}

// Generate a simple session ID for n8n workflow tracking
function generateSessionId(): string {
  return `swu_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 