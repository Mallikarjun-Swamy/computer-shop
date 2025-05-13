# Computer Shop Website with Admin Panel

A fully responsive computer shop website with an integrated admin panel and API endpoints for storing and managing content.

## Features

- Responsive design that works on all devices
- Admin panel for managing content:
  - Business information (name, address, hours, etc.)
  - Social media links
  - Services offered (add, edit, delete)
  - Products (add, edit, delete)
  - Google Maps integration
  - Admin password management
- Serverless API endpoints for data persistence:
  - `/api/settings` - Business info, social media, admin password
  - `/api/content` - Services and products data
  - `/api/map` - Google Maps settings
- Fallback to localStorage when API is unavailable

## Optimizations

The codebase has been optimized with:

1. **Common Utility Functions**:
   - `apiRequest()` - Standardized API calls with error handling
   - `fetchWithFallback()` - Fetch from API with localStorage fallback
   - `saveWithFallback()` - Save to API with localStorage fallback
   - `setLoadingState()` - Handle UI loading states
   - `showNotification()` - Show standardized notifications

2. **Improved Error Handling**:
   - Graceful degradation when API is unavailable
   - User-friendly error messages
   - Loading indicators during operations

3. **Better UX**:
   - Consistent loading states
   - Notifications for success/error
   - Smoother transitions

4. **Performance Improvements**:
   - Reduced code duplication
   - Fewer API calls
   - Optimized DOM manipulation

## Deployment with Vercel Edge Config

This project now uses Vercel Edge Config for data persistence instead of the file system. This solves the issues with data being lost between deployments or not being shared between serverless function instances.

### Setting up Vercel Edge Config

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Link your project to Vercel** (if not already done):
   ```bash
   npx vercel link
   ```

3. **Set up Vercel Edge Config** in the Vercel dashboard:
   - Go to your project in the Vercel dashboard
   - Navigate to Storage → Edge Config
   - Click "Create"
   - Follow the prompts to create an Edge Config store
   - Once created, you'll get a connection string to use

4. **Set up environment variables**:
   - Copy the Edge Config connection string to your project
   - For local development, create a `.env.local` file with:
     ```
     EDGE_CONFIG="your_edge_config_connection_string_here"
     ```
   - For production, make sure this variable is set in your Vercel project settings

5. **Local development**:
   ```bash
   npm run dev
   ```

6. **Deploy to production**:
   ```bash
   npm run deploy
   ```

### How it Works

The application now uses Vercel Edge Config to store:
- Business information and social media links (`settings` key)
- Services and products data (`content` key)
- Google Maps settings (`mapSettings` key)

All API endpoints have been updated to use Edge Config, with fallback to localStorage in the frontend if the API fails.

## Technical Notes

- The server-side data is stored in Vercel's `/tmp` directory, which is ephemeral but persists between function invocations within the same instance
- For production use, consider upgrading to a proper database (MongoDB, PostgreSQL, etc.)
- API endpoints include CORS headers for cross-origin requests

## Admin Login

Default credentials:
- Username: admin
- Password: admin@123

Change the password immediately after first login.

## Getting Started

1. Clone or download this repository
2. Set up the required folders:
   - `images/` - Contains all images including logo, backgrounds, and product images
   - `videos/` - Contains background videos (optional)
3. Open `index.html` in your web browser to view the website

## Setup Instructions

### Image Generation

The project includes two utility HTML files to help you generate assets:

1. `create_logo.html` - Opens a logo generator where you can create and download the Mahatma Enterprise logo
2. `images.html` - Opens an image generator where you can create placeholder images for backgrounds and products

### Image Requirements

- Background images should be high resolution (1920x1080px recommended)
- Logo should be transparent PNG format
- Product images should be consistent in size (600x400px recommended)

## Customization

### Changing Colors

You can modify the color scheme by editing the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #f8c200;     /* Main accent color (gold) */
    --secondary-color: #444444;   /* Secondary color (dark gray) */
    --dark-color: #121212;        /* Background color (near black) */
    --light-color: #f4f4f4;       /* Light text color */
    --text-color: #e0e0e0;        /* Standard text color */
    /* Additional variables... */
}
```

### Adding Background Images/Videos

To add new background images, place them in the `images/` folder and update the array in `script.js`:

```javascript
const backgroundImages = [
    'images/bg1.jpg',
    'images/bg2.jpg',
    'images/bg3.jpg',
    'images/bg4.jpg',
    'images/bg5.jpg',
    // Add your new images here
];
```

To add new background videos, place them in the `videos/` folder and update the array in `script.js`:

```javascript
const backgroundVideos = [
    'videos/bg1.mp4',
    'videos/bg2.mp4',
    // Add your new videos here
];
```

## Technology Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Font Awesome for icons
- Google Fonts (Poppins)

## Browser Support

- Chrome
- Firefox
- Safari
- Edge
- Opera

## License

This project is available for personal and commercial use. 