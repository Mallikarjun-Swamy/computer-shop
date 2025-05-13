// Vercel Serverless Function to handle admin panel settings
// This will be deployed as an API endpoint at /api/settings

// Import Edge Config client
import { getData, setData } from './edge-config';

// Default settings if none exist in the database
const DEFAULT_SETTINGS = {
  adminPassword: 'admin@123',
  businessInfo: {
    name: 'Mahatma Enterprise',
    address: '123 Tech Street, Digital City, 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@mahatmaenterprise.com',
    hours: 'Monday - Friday: 9am - 6pm\nSaturday: 10am - 4pm\nSunday: Closed'
  },
  socialMedia: {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/'
  },
  lastUpdated: new Date().toISOString()
};

// Helper to read settings from Edge Config
const readSettings = async () => {
  try {
    const settings = await getData('settings');
    return settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Helper to write settings to Edge Config
const writeSettings = async (data) => {
  try {
    // Ensure we only save what we expect to save
    const current = await readSettings();
    const newData = { ...current, ...data, lastUpdated: new Date().toISOString() };
    await setData('settings', newData);
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
};

// Main function that handles HTTP requests
export default async function handler(req, res) {
  // Set CORS headers to allow your website to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request - return current settings
  if (req.method === 'GET') {
    try {
      const settings = await readSettings();
      
      // Don't send the admin password in the response
      const { adminPassword, ...safeSettings } = settings;
      
      return res.status(200).json(safeSettings);
    } catch (error) {
      console.error('Error reading settings:', error);
      return res.status(500).json({ error: 'Failed to retrieve settings' });
    }
  }
  
  // Handle POST request - update settings
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Basic validation
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data format' });
      }
      
      // Handle password update separately with verification
      if (data.password) {
        const settings = await readSettings();
        
        // Verify current password before allowing update
        if (data.currentPassword !== settings.adminPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Update password
        await writeSettings({ adminPassword: data.password });
        
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
      }
      
      // Handle other settings updates
      const success = await writeSettings(data);
      
      if (success) {
        return res.status(200).json({ success: true, message: 'Settings updated successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
} 