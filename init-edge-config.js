// This script generates commands to initialize your Edge Config with default data
// You'll need to run these commands in your terminal after creating the Edge Config in Vercel

// Default settings
const defaultSettings = {
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

// Default content
const defaultContent = {
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

// Default map settings
const defaultMapSettings = {
  iframeCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3703.493925964318!2d73.719295!3d21.8384759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39601d55e43af21f%3A0xb8e23c01a1f6eb18!2sStatue%20Of%20Unity!5e0!3m2!1sen!2sin!4v1747137082051!5m2!1sen!2sin" width="80%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  directionsUrl: 'https://goo.gl/maps/Pof8eHp1tpyZmPAt8',
  height: '220',
  lastUpdated: new Date().toISOString()
};

// Generate command for settings
console.log('\n============= SETTINGS =============');
console.log('Run this command to initialize settings:');
console.log(`npx vercel env pull .env.local && npx vercel edge-config push settings.json`);
console.log('\nCreate a file named settings.json with this content:');
console.log(JSON.stringify(defaultSettings, null, 2));

// Generate command for content
console.log('\n============= CONTENT =============');
console.log('Run this command to initialize content:');
console.log(`npx vercel edge-config push content.json`);
console.log('\nCreate a file named content.json with this content:');
console.log(JSON.stringify(defaultContent, null, 2));

// Generate command for map settings
console.log('\n============= MAP SETTINGS =============');
console.log('Run this command to initialize map settings:');
console.log(`npx vercel edge-config push mapSettings.json`);
console.log('\nCreate a file named mapSettings.json with this content:');
console.log(JSON.stringify(defaultMapSettings, null, 2)); 