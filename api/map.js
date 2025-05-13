// Vercel Serverless Function to handle map settings
// This will be deployed as an API endpoint at /api/map

// Import Node.js file system module for data persistence
const fs = require('fs');
const path = require('path');

// Path to our data file in /tmp (writable on Vercel)
const DATA_FILE = path.join('/tmp', 'admin-map.json');

// Helper to read map settings from file
const readMapSettings = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading map settings file:', error);
  }
  // Default map settings if file doesn't exist or there's an error
  return {
    iframeCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3703.493925964318!2d73.719295!3d21.8384759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39601d55e43af21f%3A0xb8e23c01a1f6eb18!2sStatue%20Of%20Unity!5e0!3m2!1sen!2sin!4v1747137082051!5m2!1sen!2sin" width="80%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    directionsUrl: 'https://goo.gl/maps/Pof8eHp1tpyZmPAt8',
    height: '220',
    lastUpdated: new Date().toISOString()
  };
};

// Helper to write map settings to file
const writeMapSettings = (data) => {
  try {
    // Ensure we only save what we expect to save
    const current = readMapSettings();
    const newData = { ...current, ...data, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing map settings file:', error);
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
  
  // Handle GET request - return current map settings
  if (req.method === 'GET') {
    const mapSettings = readMapSettings();
    return res.status(200).json(mapSettings);
  }
  
  // Handle POST request - update map settings
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Basic validation
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data format' });
      }
      
      // Only allow updating specific fields
      const allowedFields = ['iframeCode', 'directionsUrl', 'height'];
      const updates = {};
      
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updates[field] = data[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      const success = writeMapSettings(updates);
      
      if (success) {
        return res.status(200).json({ success: true, message: 'Map settings updated successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to save map settings' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}; 