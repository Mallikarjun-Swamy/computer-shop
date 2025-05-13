import { createClient } from '@vercel/edge-config';

let edgeConfig;

try {
  edgeConfig = createClient(process.env.EDGE_CONFIG);
} catch (error) {
  console.error('Failed to create Edge Config client:', error);
}

export async function getData(key) {
  try {
    if (!edgeConfig) {
      throw new Error('Edge Config client not initialized');
    }
    const data = await edgeConfig.get(key);
    return data;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
}

export async function setData(key, value) {
  try {
    if (!edgeConfig) {
      throw new Error('Edge Config client not initialized');
    }
    await edgeConfig.set(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error);
    return false;
  }
}

export async function hasData(key) {
  try {
    if (!edgeConfig) {
      throw new Error('Edge Config client not initialized');
    }
    return await edgeConfig.has(key);
  } catch (error) {
    console.error(`Error checking if key ${key} exists:`, error);
    return false;
  }
} 