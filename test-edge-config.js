// Test script for Edge Config
import { createClient } from '@vercel/edge-config';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Set a default value for testing purposes
const testConnectionString = process.env.EDGE_CONFIG || 'https://edge-config.vercel.com/your_actual_connection_string_here';

async function testEdgeConfig() {
  console.log('Testing Edge Config connection...');
  console.log('Using connection string:', testConnectionString);
  
  try {
    // Create a client with the connection string
    const edgeConfig = createClient(testConnectionString);
    
    // Try to get a value (this will fail if the connection string is invalid)
    // If the Edge Config is empty, this will return null which is fine
    const testValue = await edgeConfig.get('test');
    console.log('Connection successful!');
    console.log('Test value:', testValue);
    
    // Test setting a value
    console.log('Setting a test value...');
    await edgeConfig.set('test', { timestamp: new Date().toISOString() });
    
    // Verify the value was set
    const verifyValue = await edgeConfig.get('test');
    console.log('Verify value:', verifyValue);
    
    // Initialize default settings if they don't exist
    if (!(await edgeConfig.has('settings'))) {
      console.log('Initializing default settings...');
      await edgeConfig.set('settings', {
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
      });
    }
    
    // Initialize default content if it doesn't exist
    if (!(await edgeConfig.has('content'))) {
      console.log('Initializing default content...');
      await edgeConfig.set('content', {
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
      });
    }
    
    // Initialize default map settings if they don't exist
    if (!(await edgeConfig.has('mapSettings'))) {
      console.log('Initializing default map settings...');
      await edgeConfig.set('mapSettings', {
        iframeCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3703.493925964318!2d73.719295!3d21.8384759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39601d55e43af21f%3A0xb8e23c01a1f6eb18!2sStatue%20Of%20Unity!5e0!3m2!1sen!2sin!4v1747137082051!5m2!1sen!2sin" width="80%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
        directionsUrl: 'https://goo.gl/maps/Pof8eHp1tpyZmPAt8',
        height: '220',
        lastUpdated: new Date().toISOString()
      });
    }
    
    console.log('Edge Config initialized successfully!');
    
  } catch (error) {
    console.error('Edge Config test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('Invalid URL') || error.message.includes('Invalid connection string')) {
      console.error('\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *');
      console.error('* ERROR: You need to update your EDGE_CONFIG value in .env.local    *');
      console.error('* The current value is invalid. Get a valid connection string from   *');
      console.error('* your Vercel dashboard under Storage > Edge Config.                 *');
      console.error('* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n');
    }
  }
}

// Run the test
testEdgeConfig(); 