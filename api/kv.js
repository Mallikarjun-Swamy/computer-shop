// Vercel KV connection utility
import { createClient } from '@vercel/kv';

// KV client will use the environment variables set by Vercel
// KV_URL and KV_REST_API_TOKEN will be automatically set when you link the KV database in Vercel dashboard
export const kv = createClient({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Helper function for error handling
export async function safeKVOperation(operation, fallback = null) {
  try {
    return await operation();
  } catch (error) {
    console.error('KV operation failed:', error);
    return fallback;
  }
} 