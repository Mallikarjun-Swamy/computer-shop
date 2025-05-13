# Mahatma Enterprise - Website

A premium single-page website for Mahatma Enterprise, a computer and laptop sales and service company.

## Features

- Premium black UI theme
- Responsive design for all devices
- Semi-transparent background
- Dynamic daily changing background images/videos
- Admin panel for managing business information

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

### Admin Panel

The admin panel allows you to manage:
- Business information (name, address, phone, etc.)
- Upload and manage background images/videos
- Upload and manage the company logo
- Manage services offered
- Manage products displayed

To access the admin panel:
1. Click on "Admin Login" in the website footer
2. Enter the default password: `admin123`

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