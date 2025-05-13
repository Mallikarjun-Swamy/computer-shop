// Vercel Serverless Function to handle content (services, products, etc.)
// This will be deployed as an API endpoint at /api/content

// Import Node.js file system module for data persistence
const fs = require('fs');
const path = require('path');

// Path to our data file in /tmp (writable on Vercel)
const DATA_FILE = path.join('/tmp', 'admin-content.json');

// Helper to read content from file
const readContent = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading content file:', error);
  }
  // Default content if file doesn't exist or there's an error
  return {
    services: [
      {
        icon: 'fas fa-laptop',
        title: 'Laptop Repair',
        description: 'Professional laptop repair services with quick turnaround time.'
      },
      {
        icon: 'fas fa-desktop',
        title: 'Computer Sales',
        description: 'Wide range of computers and laptops for personal and business use.'
      },
      {
        icon: 'fas fa-microchip',
        title: 'Parts & Accessories',
        description: 'Quality computer parts and accessories from trusted brands.'
      },
      {
        icon: 'fas fa-virus-slash',
        title: 'Virus Removal',
        description: 'Effective virus and malware removal services for your devices.'
      },
      {
        icon: 'fas fa-network-wired',
        title: 'Network Setup',
        description: 'Professional network setup and troubleshooting services.'
      },
      {
        icon: 'fas fa-tools',
        title: 'Maintenance',
        description: 'Regular maintenance services to keep your systems running smoothly.'
      }
    ],
    products: [
      {
        image: 'images/laptop1.jpg',
        title: 'Premium Laptops',
        description: 'High-performance laptops for professionals and gamers'
      },
      {
        image: 'images/desktop1.jpg',
        title: 'Desktop Systems',
        description: 'Powerful desktop computers for every need'
      },
      {
        image: 'images/parts1.jpg',
        title: 'Computer Parts',
        description: 'Quality components for upgrades and repairs'
      },
      {
        image: 'images/accessories1.jpg',
        title: 'Accessories',
        description: 'Wide range of accessories to enhance your computing experience'
      }
    ],
    lastUpdated: new Date().toISOString()
  };
};

// Helper to write content to file
const writeContent = (data) => {
  try {
    // Ensure we only save what we expect to save
    const current = readContent();
    const newData = { ...current, ...data, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing content file:', error);
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
  
  // Handle GET request - return current content
  if (req.method === 'GET') {
    const content = readContent();
    return res.status(200).json(content);
  }
  
  // Handle POST request - update content
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Basic validation
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data format' });
      }
      
      // Only allow updating services or products
      const allowedFields = ['services', 'products'];
      const updates = {};
      
      for (const field of allowedFields) {
        if (data[field]) {
          updates[field] = data[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      const success = writeContent(updates);
      
      if (success) {
        return res.status(200).json({ success: true, message: 'Content updated successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to save content' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}; 