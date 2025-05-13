// Vercel Serverless Function to handle content (services, products, etc.)
// This will be deployed as an API endpoint at /api/content

// Import Edge Config client
import { getData, setData } from './edge-config';

// Default content if none exists in the database
const DEFAULT_CONTENT = {
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

// Helper to read content from Edge Config
const readContent = async () => {
  try {
    const content = await getData('content');
    return content || DEFAULT_CONTENT;
  } catch (error) {
    console.error('Error reading content:', error);
    return DEFAULT_CONTENT;
  }
};

// Helper to write content to Edge Config
const writeContent = async (data) => {
  try {
    // Ensure we only save what we expect to save
    const current = await readContent();
    const newData = { ...current, ...data, lastUpdated: new Date().toISOString() };
    await setData('content', newData);
    return true;
  } catch (error) {
    console.error('Error writing content:', error);
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
  
  // Handle GET request - return current content
  if (req.method === 'GET') {
    try {
      const content = await readContent();
      return res.status(200).json(content);
    } catch (error) {
      console.error('Error reading content:', error);
      return res.status(500).json({ error: 'Failed to retrieve content' });
    }
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
      
      const success = await writeContent(updates);
      
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
} 