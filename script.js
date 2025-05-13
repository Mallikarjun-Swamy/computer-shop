// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('nav');
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            nav.classList.toggle('active');
            
            // Toggle icon between bars and times
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Auto-hide menu when mouse leaves it (mobile/tablet only)
    if (window.innerWidth <= 768) {
        const header = document.querySelector('header');
        
        // When mouse leaves the nav menu
        nav.addEventListener('mouseleave', function() {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                if (mobileNavToggle) {
                    const icon = mobileNavToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // When touch happens outside nav and header (for touch devices)
        document.addEventListener('touchstart', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !header.contains(e.target) &&
                !mobileNavToggle.contains(e.target)) {
                nav.classList.remove('active');
                if (mobileNavToggle) {
                    const icon = mobileNavToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile nav if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                mobileNavToggle.querySelector('i').classList.remove('fa-times');
                mobileNavToggle.querySelector('i').classList.add('fa-bars');
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Adjusted for new header height and positioning
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Dynamic Background Image Changer
    const backgroundImages = [
        'images/bg1.jpg',
        'images/bg2.jpg',
        'images/bg3.jpg'
    ];
    
    const backgroundVideos = [
        'videos/bg1.mp4'
    ];
    
    const bgOverlay = document.querySelector('.bg-overlay');
    let currentIndex = 0;
    let useVideo = false; // Toggle between image and video
    let preloadedImages = [];
    
    // Preload background images for instant switching
    function preloadBackgroundImages() {
        preloadedImages = [];
        backgroundImages.forEach(imgSrc => {
            const img = new Image();
            img.onerror = () => {
                console.error(`Failed to load image: ${imgSrc}`);
                // Remove failed image from array
                const index = backgroundImages.indexOf(imgSrc);
                if (index > -1) {
                    backgroundImages.splice(index, 1);
                }
            };
            img.onload = () => {
                preloadedImages.push(img);
            };
            img.src = imgSrc;
        });
        console.log('Background images preloaded');
    }
    
    // Preload images immediately on page load
    preloadBackgroundImages();
    
    // Function to change background instantly (no transition)
    function changeBackground() {
        // Check if we have any background images
        if (backgroundImages.length === 0) {
            return; // No valid images to display
        }
        
        // Set new background image immediately
        currentIndex = (currentIndex + 1) % backgroundImages.length;
        bgOverlay.style.backgroundImage = `url('${backgroundImages[currentIndex]}')`;
    }
    
    // Initial background setup
    if (backgroundImages.length > 0) {
        // Disable transition completely for instant switching
        bgOverlay.style.transition = 'none';
        bgOverlay.style.backgroundImage = `url('${backgroundImages[0]}')`;
        
        // Change background periodically
        setInterval(changeBackground, 10000); // Change every 10 seconds
    }
    
    // Load services from localStorage
    loadServicesFromLocalStorage();
    
    // Load products from localStorage
    loadProductsFromLocalStorage();
    
    // Load business information from localStorage
    loadBusinessInfoFromLocalStorage();
    
    // Load social media links from localStorage
    loadSocialMediaLinksFromLocalStorage();
    
    // Load branding (logo and colors) from localStorage
    loadBrandingFromLocalStorage();
    
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Show loading indicator
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Prepare data to send
            const templateParams = {
                name: name,
                email: email,
                phone: phone || 'Not provided',
                subect: subject || 'Contact Form Submission',
                message: message
            };
            
            // Send the email using EmailJS
            emailjs.send('service_sh62xvy', 'template_qgjwg4s', templateParams)
                .then(function() {
                    // Show success message
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                    
                    // Reset button
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                })
                .catch(function(error) {
                    console.error('Email sending failed:', error);
                    alert('Oops! There was a problem sending your message. Please try again later or contact us directly.');
                    
                    // Reset button
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
    
    // Add scroll animation for elements
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .product-card, .about-content, .contact-content');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Add fade-in class for CSS animation
    const style = document.createElement('style');
    style.innerHTML = `
        .service-card, .product-card, .about-content, .contact-content {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // Run animation on scroll
    window.addEventListener('scroll', animateOnScroll);
    // Run once on page load
    animateOnScroll();
    
    // Initialize Google Map
    initializeGoogleMap();
});

// Function to load branding (logo and colors) from localStorage
function loadBrandingFromLocalStorage() {
    // Logo update
    const logoImages = document.querySelectorAll('.logo img, .footer-logo img');
    const brandingSettings = JSON.parse(localStorage.getItem('brandingSettings')) || {};
    
    // Update logo if available in localStorage
    if (brandingSettings.logoUrl) {
        logoImages.forEach(img => {
            img.src = brandingSettings.logoUrl;
        });
    }
    
    // Brand colors update
    if (brandingSettings.primaryColor || brandingSettings.secondaryColor) {
        // Create a style element to override CSS variables
        const styleElement = document.createElement('style');
        
        // Set default values if not available
        const primaryColor = brandingSettings.primaryColor || '#f8c200';
        const secondaryColor = brandingSettings.secondaryColor || '#444444';
        
        // Create CSS with updated variables
        styleElement.textContent = `
            :root {
                --primary-color: ${primaryColor};
                --secondary-color: ${secondaryColor};
            }
        `;
        
        // Add the style element to the head
        document.head.appendChild(styleElement);
    }
}

// Function to load business information from localStorage
function loadBusinessInfoFromLocalStorage() {
    // Get business info elements
    const addressElement = document.querySelector('.contact-item:nth-of-type(1) p');
    const phoneElement = document.querySelector('.contact-item:nth-of-type(2) p');
    const emailElement = document.querySelector('.contact-item:nth-of-type(3) p');
    const hoursElements = document.querySelectorAll('.contact-item:nth-of-type(4) div p');
    
    if (!addressElement || !phoneElement || !emailElement || !hoursElements.length) return;
    
    // Get business info from localStorage or use defaults
    const businessInfo = JSON.parse(localStorage.getItem('businessInfo')) || {
        name: 'Mahatma Enterprise',
        address: '123 Tech Street, Digital City, 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@mahatmaenterprise.com',
        hours: 'Monday - Friday: 9am - 6pm\nSaturday: 10am - 4pm\nSunday: Closed'
    };
    
    // Update contact information in the page
    addressElement.textContent = businessInfo.address;
    phoneElement.textContent = businessInfo.phone;
    emailElement.textContent = businessInfo.email;
    
    // Update business hours
    const hoursLines = businessInfo.hours.split('\n');
    if (hoursLines.length > 0) {
        // If we have more lines than paragraph elements, create additional ones
        if (hoursLines.length > hoursElements.length) {
            const hoursContainer = hoursElements[0].parentNode;
            
            // Add additional paragraph elements for each line
            for (let i = hoursElements.length; i < hoursLines.length; i++) {
                const newP = document.createElement('p');
                hoursContainer.appendChild(newP);
            }
            
            // Get the updated collection of paragraph elements
            const updatedHoursElements = hoursContainer.querySelectorAll('p');
            
            // Update content for each paragraph
            hoursLines.forEach((line, index) => {
                if (updatedHoursElements[index]) {
                    updatedHoursElements[index].textContent = line;
                }
            });
        } else {
            // We have enough or exactly the right number of paragraph elements
            hoursLines.forEach((line, index) => {
                if (hoursElements[index]) {
                    hoursElements[index].textContent = line;
                }
            });
        }
    }
    
    // Update page title if necessary
    document.title = `${businessInfo.name} - Computer & Laptop Sales and Service`;
}

// Function to load social media links from localStorage
function loadSocialMediaLinksFromLocalStorage() {
    const socialIcons = document.querySelectorAll('.social-icons a');
    if (!socialIcons.length) return;
    
    // Get social media links from localStorage or use defaults
    const socialMedia = JSON.parse(localStorage.getItem('socialMedia')) || {
        facebook: 'https://facebook.com/',
        twitter: 'https://twitter.com/',
        instagram: 'https://instagram.com/',
        linkedin: 'https://linkedin.com/'
    };
    
    // Update href attributes for social media icons
    // Assuming the order is: Facebook, Twitter, Instagram, LinkedIn
    if (socialIcons[0]) socialIcons[0].href = socialMedia.facebook;
    if (socialIcons[1]) socialIcons[1].href = socialMedia.twitter;
    if (socialIcons[2]) socialIcons[2].href = socialMedia.instagram;
    if (socialIcons[3]) socialIcons[3].href = socialMedia.linkedin;
}

// Function to load services from localStorage
function loadServicesFromLocalStorage() {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;
    
    // Clear existing content
    servicesGrid.innerHTML = '';
    
    // Get services from localStorage or use default ones
    const services = JSON.parse(localStorage.getItem('services')) || [
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
    ];
    
    // Create service cards
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        serviceCard.innerHTML = `
            <i class="${service.icon}"></i>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        `;
        
        servicesGrid.appendChild(serviceCard);
    });
}

// Function to load products from localStorage
function loadProductsFromLocalStorage() {
    const productsSlider = document.querySelector('.products-slider');
    if (!productsSlider) return;
    
    // Clear existing content
    productsSlider.innerHTML = '';
    
    // Get products from localStorage or use default ones
    const products = JSON.parse(localStorage.getItem('products')) || [
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
    ];
    
    // Function to handle image loading errors
    function handleImageError(img, title) {
        // Fallback to a placeholder image or use a different approach
        img.src = 'https://via.placeholder.com/500x300?text=' + encodeURIComponent(title);
        console.error(`Failed to load product image for "${title}"`);
    }
    
    // Create product cards
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Use default image if none provided
        const imageSrc = product.image || 'images/placeholder.jpg';
        const safeTitle = product.title || 'Product';
        
        // Create the HTML structure
        productCard.innerHTML = `
            <img src="${imageSrc}" alt="${safeTitle}" onerror="this.onerror=null; this.src='https://via.placeholder.com/500x300?text=${encodeURIComponent(safeTitle)}';">
            <h3>${safeTitle}</h3>
            <p>${product.description || 'No description available'}</p>
        `;
        
        productsSlider.appendChild(productCard);
    });
}

// Function to check if today's background has already been set
function getTodaysBackground() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('backgroundDate');
    
    if (today === storedDate) {
        // Return the stored background if it's still the same day
        return localStorage.getItem('todaysBackground');
    }
    
    return null;
}

// Function to set today's background
function setTodaysBackground(backgroundUrl) {
    const today = new Date().toDateString();
    localStorage.setItem('backgroundDate', today);
    localStorage.setItem('todaysBackground', backgroundUrl);
}

// Function to initialize Google Map from localStorage settings
function initializeGoogleMap() {
    const mapContainer = document.getElementById('googleMapContainer');
    const directionsLink = document.getElementById('mapDirectionsLink');
    
    if (!mapContainer || !directionsLink) return;
    
    try {
        // Get map settings from localStorage or use defaults
        const mapSettings = JSON.parse(localStorage.getItem('mapSettings')) || {
            iframeCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3703.493925964318!2d73.719295!3d21.8384759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39601d55e43af21f%3A0xb8e23c01a1f6eb18!2sStatue%20Of%20Unity!5e0!3m2!1sen!2sin!4v1747137082051!5m2!1sen!2sin" width="80%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
            directionsUrl: 'https://goo.gl/maps/Pof8eHp1tpyZmPAt8'
        };
        
        // Insert the iframe code directly if it exists and is not empty
        if (mapSettings.iframeCode && mapSettings.iframeCode.trim() !== '') {
            mapContainer.innerHTML = mapSettings.iframeCode;
        } else {
            mapContainer.innerHTML = '<p>No map available</p>';
        }
        
        // Create directions link if the URL exists
        if (mapSettings.directionsUrl && mapSettings.directionsUrl.trim() !== '') {
            directionsLink.innerHTML = `
                <a href="${mapSettings.directionsUrl}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-directions"></i> Get Directions
                </a>
            `;
        } else {
            directionsLink.innerHTML = '';
        }
    } catch (error) {
        console.error('Error initializing Google Map:', error);
        mapContainer.innerHTML = '<p>Error loading map</p>';
        directionsLink.innerHTML = '';
    }
}

// Admin panel login handler
document.addEventListener('DOMContentLoaded', function() {
    const adminLink = document.querySelector('.admin-link a');
    
    if (adminLink) {
        adminLink.addEventListener('click', function(e) {
            // Check if user is already logged in
            const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
            
            if (!isLoggedIn) {
                e.preventDefault();
                const password = prompt('Please enter admin password:');
                
                // Get stored password or use default
                const storedPassword = localStorage.getItem('adminPassword') || 'admin123';
                
                // Check password
                if (password === storedPassword) {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    window.location.href = 'admin.html';
                } else {
                    alert('Incorrect password');
                }
            }
        });
    }
});

// Function to update admin password
function updateAdminPassword(oldPassword, newPassword) {
    // Check current password
    const storedPassword = localStorage.getItem('adminPassword') || 'admin@123';
    
    if (oldPassword === storedPassword) {
        localStorage.setItem('adminPassword', newPassword);
        return true;
    }
    return false;
} 