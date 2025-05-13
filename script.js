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
    
    // API utility functions
    async function fetchWithFallback(apiEndpoint, localStorageKey, defaultValue = {}) {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.warn(`API request failed, falling back to localStorage for ${localStorageKey}:`, error);
            return JSON.parse(localStorage.getItem(localStorageKey)) || defaultValue;
        }
    }
    
    // Load data from all endpoints
    loadBusinessInfo();
    loadServices();
    loadProducts();
    loadMapSettings();
    
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
                    alert('Sorry, there was an error sending your message. Please try again or contact us directly.');
                    
                    // Reset button
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
    
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            // Check admin credentials
            checkAdminCredentials(username, password);
        });
    }
});

// Load Business Information
async function loadBusinessInfo() {
    try {
        const data = await fetchWithFallback('/api/settings', 'businessInfo', {});
        
        const businessInfo = data.businessInfo || {};
        const socialMedia = data.socialMedia || {};
        
        // Update business name in header
        const businessNameElements = document.querySelectorAll('.business-name');
        businessNameElements.forEach(element => {
            element.textContent = businessInfo.name || 'Mahatma Enterprise';
        });
        
        // Update business contact info in footer
        document.querySelectorAll('.business-address').forEach(el => {
            el.textContent = businessInfo.address || '123 Tech Street, Digital City, 12345';
        });
        
        document.querySelectorAll('.business-phone').forEach(el => {
            el.textContent = businessInfo.phone || '+1 (555) 123-4567';
        });
        
        document.querySelectorAll('.business-email').forEach(el => {
            el.textContent = businessInfo.email || 'info@mahatmaenterprise.com';
        });
        
        document.querySelectorAll('.business-hours').forEach(el => {
            el.innerHTML = (businessInfo.hours || 'Monday - Friday: 9am - 6pm<br>Saturday: 10am - 4pm<br>Sunday: Closed').replace(/\n/g, '<br>');
        });
        
        // Update social media links
        const facebookLinks = document.querySelectorAll('.social-facebook');
        facebookLinks.forEach(link => {
            link.href = socialMedia.facebook || 'https://facebook.com/';
        });
        
        const twitterLinks = document.querySelectorAll('.social-twitter');
        twitterLinks.forEach(link => {
            link.href = socialMedia.twitter || 'https://twitter.com/';
        });
        
        const instagramLinks = document.querySelectorAll('.social-instagram');
        instagramLinks.forEach(link => {
            link.href = socialMedia.instagram || 'https://instagram.com/';
        });
        
        const linkedinLinks = document.querySelectorAll('.social-linkedin');
        linkedinLinks.forEach(link => {
            link.href = socialMedia.linkedin || 'https://linkedin.com/';
        });
    } catch (error) {
        console.error('Error loading business info:', error);
        // Fall back to legacy method
        loadBusinessInfoFromLocalStorage();
        loadSocialMediaLinksFromLocalStorage();
    }
}

// Load Services
async function loadServices() {
    const servicesContainer = document.getElementById('servicesContainer');
    if (!servicesContainer) return;
    
    try {
        const data = await fetchWithFallback('/api/content', 'services', { services: [] });
        const services = data.services || [];
        
        if (services.length === 0) {
            console.warn('No services found');
            return;
        }
        
        // Clear the container
        servicesContainer.innerHTML = '';
        
        // Create service items
        services.forEach(service => {
            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'service-item';
            
            serviceDiv.innerHTML = `
                <div class="service-icon">
                    <i class="${service.icon || 'fas fa-laptop'}"></i>
                </div>
                <h3>${service.title || 'Service'}</h3>
                <p>${service.description || 'Service description'}</p>
            `;
            
            servicesContainer.appendChild(serviceDiv);
        });
    } catch (error) {
        console.error('Error loading services:', error);
        // Fall back to legacy method
        loadServicesFromLocalStorage();
    }
}

// Load Products
async function loadProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;
    
    try {
        const data = await fetchWithFallback('/api/content', 'products', { products: [] });
        const products = data.products || [];
        
        if (products.length === 0) {
            console.warn('No products found');
            return;
        }
        
        // Clear the container
        productsContainer.innerHTML = '';
        
        // Create product items
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product-item';
            
            productDiv.innerHTML = `
                <div class="product-image">
                    <img src="${product.image || 'images/placeholder.jpg'}" alt="${product.title || 'Product'}">
                </div>
                <h3>${product.title || 'Product'}</h3>
                <p>${product.description || 'Product description'}</p>
            `;
            
            productsContainer.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        // Fall back to legacy method
        loadProductsFromLocalStorage();
    }
}

// Load Map Settings
async function loadMapSettings() {
    const mapContainer = document.getElementById('googleMap');
    if (!mapContainer) return;
    
    try {
        const data = await fetchWithFallback('/api/map', 'mapSettings', {
            iframeCode: '',
            directionsUrl: '',
            height: '220'
        });
        
        if (data.iframeCode) {
            mapContainer.innerHTML = data.iframeCode;
        }
        
        // Update "Get Directions" link
        const directionsLink = document.getElementById('directionsLink');
        if (directionsLink && data.directionsUrl) {
            directionsLink.href = data.directionsUrl;
        }
    } catch (error) {
        console.error('Error loading map settings:', error);
        // Fall back to legacy method if available
        const mapSettings = JSON.parse(localStorage.getItem('mapSettings'));
        if (mapSettings && mapSettings.iframeCode) {
            mapContainer.innerHTML = mapSettings.iframeCode;
        }
    }
}

// Legacy functions for backward compatibility
function loadBusinessInfoFromLocalStorage() {
    const businessInfo = JSON.parse(localStorage.getItem('businessInfo')) || {};
    
    // Update business name in header
    const businessNameElements = document.querySelectorAll('.business-name');
    businessNameElements.forEach(element => {
        element.textContent = businessInfo.name || 'Mahatma Enterprise';
    });
    
    // Update business contact info in footer
    document.querySelectorAll('.business-address').forEach(el => {
        el.textContent = businessInfo.address || '123 Tech Street, Digital City, 12345';
    });
    
    document.querySelectorAll('.business-phone').forEach(el => {
        el.textContent = businessInfo.phone || '+1 (555) 123-4567';
    });
    
    document.querySelectorAll('.business-email').forEach(el => {
        el.textContent = businessInfo.email || 'info@mahatmaenterprise.com';
    });
    
    document.querySelectorAll('.business-hours').forEach(el => {
        el.innerHTML = (businessInfo.hours || 'Monday - Friday: 9am - 6pm<br>Saturday: 10am - 4pm<br>Sunday: Closed').replace(/\n/g, '<br>');
    });
}

function loadSocialMediaLinksFromLocalStorage() {
    const socialMedia = JSON.parse(localStorage.getItem('socialMedia')) || {};
    
    // Update social media links
    const facebookLinks = document.querySelectorAll('.social-facebook');
    facebookLinks.forEach(link => {
        link.href = socialMedia.facebook || 'https://facebook.com/';
    });
    
    const twitterLinks = document.querySelectorAll('.social-twitter');
    twitterLinks.forEach(link => {
        link.href = socialMedia.twitter || 'https://twitter.com/';
    });
    
    const instagramLinks = document.querySelectorAll('.social-instagram');
    instagramLinks.forEach(link => {
        link.href = socialMedia.instagram || 'https://instagram.com/';
    });
    
    const linkedinLinks = document.querySelectorAll('.social-linkedin');
    linkedinLinks.forEach(link => {
        link.href = socialMedia.linkedin || 'https://linkedin.com/';
    });
}

function loadServicesFromLocalStorage() {
    const servicesContainer = document.getElementById('servicesContainer');
    if (!servicesContainer) return;
    
    const services = JSON.parse(localStorage.getItem('services')) || [];
    
    if (services.length === 0) {
        console.warn('No services found in localStorage');
        return;
    }
    
    // Clear the container
    servicesContainer.innerHTML = '';
    
    // Create service items
    services.forEach(service => {
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-item';
        
        serviceDiv.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon || 'fas fa-laptop'}"></i>
            </div>
            <h3>${service.title || 'Service'}</h3>
            <p>${service.description || 'Service description'}</p>
        `;
        
        servicesContainer.appendChild(serviceDiv);
    });
}

function loadProductsFromLocalStorage() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (products.length === 0) {
        console.warn('No products found in localStorage');
        return;
    }
    
    // Clear the container
    productsContainer.innerHTML = '';
    
    // Create product items
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        
        productDiv.innerHTML = `
            <div class="product-image">
                <img src="${product.image || 'images/placeholder.jpg'}" alt="${product.title || 'Product'}">
            </div>
            <h3>${product.title || 'Product'}</h3>
            <p>${product.description || 'Product description'}</p>
        `;
        
        productsContainer.appendChild(productDiv);
    });
}

function loadBrandingFromLocalStorage() {
    // This function is kept for backward compatibility but not needed with API
    // Will be removed in future versions
    console.log('Legacy branding function called');
}

// Admin Login Functions
async function checkAdminCredentials(username, password) {
    if (username !== 'admin') {
        alert('Invalid username');
        return;
    }
    
    try {
        // Get admin password from API or localStorage
        let adminPassword;
        
        try {
            // We can't get the password from the API for security reasons
            // This is just a placeholder for potential future auth endpoint
            adminPassword = localStorage.getItem('adminPassword') || 'admin@123';
        } catch (error) {
            adminPassword = 'admin@123'; // Default fallback
        }
        
        if (password === adminPassword) {
            // Set logged in status and redirect
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Invalid password');
        }
    } catch (error) {
        console.error('Error checking admin credentials:', error);
        alert('An error occurred while logging in. Please try again.');
    }
} 