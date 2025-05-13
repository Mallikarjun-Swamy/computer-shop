// Vercel Serverless Function to handle admin panel settings
// This will be deployed as an API endpoint at /api/settings

// Import Node.js file system module for data persistence
const fs = require('fs');
const path = require('path');

// Path to our data file in /tmp (writable on Vercel)
const DATA_FILE = path.join('/tmp', 'admin-settings.json');

// Helper to read settings from file
const readSettings = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading settings file:', error);
  }
  // Default settings if file doesn't exist or there's an error
  return {
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
};

// Helper to write settings to file
const writeSettings = (data) => {
  try {
    // Ensure we only save what we expect to save
    const current = readSettings();
    const newData = { ...current, ...data, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings file:', error);
    return false;
  }
};

// Main function that handles HTTP requests
module.exports = (req, res) => {
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
    const settings = readSettings();
    
    // Don't send the admin password in the response
    const { adminPassword, ...safeSettings } = settings;
    
    return res.status(200).json(safeSettings);
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
        const settings = readSettings();
        
        // Verify current password before allowing update
        if (data.currentPassword !== settings.adminPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Update password
        settings.adminPassword = data.password;
        writeSettings(settings);
        
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
      }
      
      // Handle other settings updates
      const success = writeSettings(data);
      
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
}; 