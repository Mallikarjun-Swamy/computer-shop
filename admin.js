// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
    }
    
    // Admin Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html';
        });
    }
    
    // Load and save business information
    const businessInfoForm = document.getElementById('businessInfoForm');
    if (businessInfoForm) {
        // Load saved data
        loadBusinessInfo();
        
        // Save data on form submit
        businessInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBusinessInfo();
            showNotification('Business information saved successfully');
        });
    }
    
    // Social Media Form
    const socialMediaForm = document.getElementById('socialMediaForm');
    if (socialMediaForm) {
        // Load saved data
        loadSocialMedia();
        
        // Save data on form submit
        socialMediaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSocialMedia();
            showNotification('Social media links saved successfully');
        });
    }

    // Admin Password Change Form
    const adminPasswordForm = document.getElementById('adminPasswordForm');
    if (adminPasswordForm) {
        adminPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New password and confirmation do not match');
                return;
            }
            
            // Check for minimum password strength
            if (newPassword.length < 6) {
                alert('New password must be at least 6 characters long');
                return;
            }
            
            // Call the updateAdminPassword function from script.js
            if (typeof updateAdminPassword === 'function') {
                if (updateAdminPassword(currentPassword, newPassword)) {
                    showNotification('Password changed successfully');
                    adminPasswordForm.reset();
                } else {
                    alert('Current password is incorrect');
                }
            } else {
                alert('Password change function not available');
            }
        });
    }

    // Initialize Services Management
    initializeServicesManagement();
    
    // Initialize Products Management
    initializeProductsManagement();
    
    // Initialize Google Maps Settings
    initializeMapSettings();
});

// Business Information Functions
function loadBusinessInfo() {
    const businessInfo = JSON.parse(localStorage.getItem('businessInfo')) || {};
    
    if (businessInfo.name) document.getElementById('businessName').value = businessInfo.name;
    if (businessInfo.address) document.getElementById('businessAddress').value = businessInfo.address;
    if (businessInfo.phone) document.getElementById('businessPhone').value = businessInfo.phone;
    if (businessInfo.email) document.getElementById('businessEmail').value = businessInfo.email;
    if (businessInfo.hours) document.getElementById('businessHours').value = businessInfo.hours;
}

function saveBusinessInfo() {
    const businessInfo = {
        name: document.getElementById('businessName').value,
        address: document.getElementById('businessAddress').value,
        phone: document.getElementById('businessPhone').value,
        email: document.getElementById('businessEmail').value,
        hours: document.getElementById('businessHours').value
    };
    
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
}

// Social Media Functions
function loadSocialMedia() {
    const socialMedia = JSON.parse(localStorage.getItem('socialMedia')) || {};
    
    if (socialMedia.facebook) document.getElementById('facebookLink').value = socialMedia.facebook;
    if (socialMedia.twitter) document.getElementById('twitterLink').value = socialMedia.twitter;
    if (socialMedia.instagram) document.getElementById('instagramLink').value = socialMedia.instagram;
    if (socialMedia.linkedin) document.getElementById('linkedinLink').value = socialMedia.linkedin;
}

function saveSocialMedia() {
    const socialMedia = {
        facebook: document.getElementById('facebookLink').value,
        twitter: document.getElementById('twitterLink').value,
        instagram: document.getElementById('instagramLink').value,
        linkedin: document.getElementById('linkedinLink').value
    };
    
    localStorage.setItem('socialMedia', JSON.stringify(socialMedia));
}

// Services Management
function initializeServicesManagement() {
    const servicesList = document.querySelector('.services-list');
    const addServiceBtn = document.getElementById('addServiceBtn');
    
    if (servicesList && addServiceBtn) {
        // Load existing services
        loadServices();
        
        // Add new service
        addServiceBtn.addEventListener('click', function() {
            addNewService();
        });
    }
}

function loadServices() {
    const servicesList = document.querySelector('.services-list');
    servicesList.innerHTML = ''; // Clear list
    
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
    
    // Save default services if none exist
    if (!localStorage.getItem('services')) {
        localStorage.setItem('services', JSON.stringify(services));
    }
    
    // Create service items
    services.forEach((service, index) => {
        const serviceItem = createServiceItem(service, index);
        servicesList.appendChild(serviceItem);
    });
    
    // Add event listeners for edit and delete buttons
    addServiceEventListeners();
}

function createServiceItem(service, index) {
    const serviceItem = document.createElement('div');
    serviceItem.className = 'service-item';
    serviceItem.dataset.index = index;
    
    serviceItem.innerHTML = `
        <div class="service-header">
            <h3>${service.title}</h3>
            <div class="service-actions">
                <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        <div class="service-details">
            <div class="form-group">
                <label>Icon</label>
                <select class="service-icon">
                    <option value="fas fa-laptop" ${service.icon === 'fas fa-laptop' ? 'selected' : ''}>Laptop</option>
                    <option value="fas fa-desktop" ${service.icon === 'fas fa-desktop' ? 'selected' : ''}>Desktop</option>
                    <option value="fas fa-microchip" ${service.icon === 'fas fa-microchip' ? 'selected' : ''}>Microchip</option>
                    <option value="fas fa-tools" ${service.icon === 'fas fa-tools' ? 'selected' : ''}>Tools</option>
                    <option value="fas fa-virus-slash" ${service.icon === 'fas fa-virus-slash' ? 'selected' : ''}>Virus</option>
                    <option value="fas fa-network-wired" ${service.icon === 'fas fa-network-wired' ? 'selected' : ''}>Network</option>
                </select>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="service-title" value="${service.title}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="service-description">${service.description}</textarea>
            </div>
            <button class="btn btn-primary save-service-btn">Save Changes</button>
        </div>
    `;
    
    return serviceItem;
}

function addServiceEventListeners() {
    // Edit buttons
    document.querySelectorAll('.service-item .edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceItem = this.closest('.service-item');
            const details = serviceItem.querySelector('.service-details');
            
            if (details.style.display === 'block') {
                details.style.display = 'none';
            } else {
                document.querySelectorAll('.service-details').forEach(d => d.style.display = 'none');
                details.style.display = 'block';
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.service-item .delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this service?')) {
                const serviceItem = this.closest('.service-item');
                const index = serviceItem.dataset.index;
                
                // Get current services
                const services = JSON.parse(localStorage.getItem('services'));
                
                // Remove the service
                services.splice(index, 1);
                
                // Save updated services
                localStorage.setItem('services', JSON.stringify(services));
                
                // Reload services
                loadServices();
                showNotification('Service deleted successfully');
            }
        });
    });
    
    // Save buttons
    document.querySelectorAll('.service-item .save-service-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceItem = this.closest('.service-item');
            const index = serviceItem.dataset.index;
            
            // Get form values
            const icon = serviceItem.querySelector('.service-icon').value;
            const title = serviceItem.querySelector('.service-title').value;
            const description = serviceItem.querySelector('.service-description').value;
            
            // Validate
            if (!title || !description) {
                alert('Please fill in all fields');
                return;
            }
            
            // Get current services
            const services = JSON.parse(localStorage.getItem('services'));
            
            // Update service
            services[index] = { icon, title, description };
            
            // Save updated services
            localStorage.setItem('services', JSON.stringify(services));
            
            // Hide details
            serviceItem.querySelector('.service-details').style.display = 'none';
            
            // Update header title
            serviceItem.querySelector('.service-header h3').textContent = title;
            
            showNotification('Service updated successfully');
        });
    });
}

function addNewService() {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    
    // Add new empty service
    services.push({
        icon: 'fas fa-laptop',
        title: 'New Service',
        description: 'Service description here.'
    });
    
    // Save updated services
    localStorage.setItem('services', JSON.stringify(services));
    
    // Reload services
    loadServices();
    
    // Show edit form for the new service
    const serviceItems = document.querySelectorAll('.service-item');
    const newServiceItem = serviceItems[serviceItems.length - 1];
    newServiceItem.querySelector('.service-details').style.display = 'block';
    
    showNotification('New service added');
}

// Products Management
function initializeProductsManagement() {
    const productsList = document.querySelector('.products-list');
    const addProductBtn = document.getElementById('addProductBtn');
    
    if (productsList && addProductBtn) {
        // Load existing products
        loadProducts();
        
        // Add new product
        addProductBtn.addEventListener('click', function() {
            addNewProduct();
        });
    }
}

function loadProducts() {
    const productsList = document.querySelector('.products-list');
    productsList.innerHTML = ''; // Clear list
    
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
    
    // Save default products if none exist
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Create product items
    products.forEach((product, index) => {
        const productItem = createProductItem(product, index);
        productsList.appendChild(productItem);
    });
    
    // Add event listeners for edit and delete buttons
    addProductEventListeners();
}

function createProductItem(product, index) {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.dataset.index = index;
    
    productItem.innerHTML = `
        <div class="product-header">
            <h3>${product.title}</h3>
            <div class="product-actions">
                <button class="btn-icon edit-btn"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        <div class="product-details">
            <div class="form-group">
                <label>Image</label>
                <div class="product-image-preview">
                    <img src="${product.image}" alt="Product Image">
                    <input type="file" class="product-image-upload" accept="image/*">
                </div>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="product-title" value="${product.title}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="product-description">${product.description}</textarea>
            </div>
            <button class="btn btn-primary save-product-btn">Save Changes</button>
        </div>
    `;
    
    return productItem;
}

function addProductEventListeners() {
    // Edit buttons
    document.querySelectorAll('.product-item .edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            const details = productItem.querySelector('.product-details');
            
            if (details.style.display === 'block') {
                details.style.display = 'none';
            } else {
                document.querySelectorAll('.product-details').forEach(d => d.style.display = 'none');
                details.style.display = 'block';
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.product-item .delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this product?')) {
                const productItem = this.closest('.product-item');
                const index = productItem.dataset.index;
                
                // Get current products
                const products = JSON.parse(localStorage.getItem('products'));
                
                // Remove the product
                products.splice(index, 1);
                
                // Save updated products
                localStorage.setItem('products', JSON.stringify(products));
                
                // Reload products
                loadProducts();
                showNotification('Product deleted successfully');
            }
        });
    });
    
    // Save buttons
    document.querySelectorAll('.product-item .save-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            const index = productItem.dataset.index;
            
            // Get form values
            const title = productItem.querySelector('.product-title').value;
            const description = productItem.querySelector('.product-description').value;
            
            // Get current image from img src
            const currentImage = productItem.querySelector('.product-image-preview img').src;
            
            // Check if a new image was uploaded
            const imageFile = productItem.querySelector('.product-image-upload').files[0];
            
            // Validate
            if (!title || !description) {
                alert('Please fill in all fields');
                return;
            }
            
            // Get current products
            const products = JSON.parse(localStorage.getItem('products'));
            
            // If there's a new image, handle it
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Update product with new image
                    products[index] = {
                        image: e.target.result,
                        title: title,
                        description: description
                    };
                    
                    // Save updated products
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    // Hide details
                    productItem.querySelector('.product-details').style.display = 'none';
                    
                    // Update header title
                    productItem.querySelector('.product-header h3').textContent = title;
                    
                    showNotification('Product updated successfully');
                    
                    // Update the img src
                    productItem.querySelector('.product-image-preview img').src = e.target.result;
                };
                reader.readAsDataURL(imageFile);
            } else {
                // Update product with existing image
                products[index] = {
                    image: currentImage,
                    title: title,
                    description: description
                };
                
                // Save updated products
                localStorage.setItem('products', JSON.stringify(products));
                
                // Hide details
                productItem.querySelector('.product-details').style.display = 'none';
                
                // Update header title
                productItem.querySelector('.product-header h3').textContent = title;
                
                showNotification('Product updated successfully');
            }
        });
    });
    
    // Image upload preview
    document.querySelectorAll('.product-image-upload').forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                const img = this.closest('.product-image-preview').querySelector('img');
                
                reader.onload = function(e) {
                    img.src = e.target.result;
                };
                
                reader.readAsDataURL(file);
            }
        });
    });
}

function addNewProduct() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Add new empty product
    products.push({
        image: 'images/placeholder.jpg',
        title: 'New Product',
        description: 'Product description here.'
    });
    
    // Save updated products
    localStorage.setItem('products', JSON.stringify(products));
    
    // Reload products
    loadProducts();
    
    // Show edit form for the new product
    const productItems = document.querySelectorAll('.product-item');
    const newProductItem = productItems[productItems.length - 1];
    newProductItem.querySelector('.product-details').style.display = 'block';
    
    showNotification('New product added');
}

// Google Maps Settings
function initializeMapSettings() {
    const mapSettingsForm = document.getElementById('mapSettingsForm');
    const mapPreviewContainer = document.getElementById('mapPreviewContainer');
    
    if (mapSettingsForm && mapPreviewContainer) {
        // Load saved map settings
        loadMapSettings();
        
        // Save map settings on form submit
        mapSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMapSettings();
            updateMapPreview();
            showNotification('Map settings saved successfully');
        });
        
        // Update preview on input change
        document.getElementById('mapEmbedUrl').addEventListener('input', updateMapPreview);
        document.getElementById('mapHeight').addEventListener('input', updateMapPreview);
        
        // Initial preview
        updateMapPreview();
    }
}

function loadMapSettings() {
    const mapSettings = JSON.parse(localStorage.getItem('mapSettings')) || {
        embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUwJzE0LjQiTiA4NMKwMjknMjMuMiJX!5e0!3m2!1sen!2sus!4v1623308321015!5m2!1sen!2sus',
        directionsUrl: 'https://goo.gl/maps/3uveM77SnX4DXZNK9',
        height: 250
    };
    
    document.getElementById('mapEmbedUrl').value = mapSettings.embedUrl;
    document.getElementById('mapDirectionsUrl').value = mapSettings.directionsUrl;
    document.getElementById('mapHeight').value = mapSettings.height;
}

function saveMapSettings() {
    const mapSettings = {
        embedUrl: document.getElementById('mapEmbedUrl').value,
        directionsUrl: document.getElementById('mapDirectionsUrl').value,
        height: document.getElementById('mapHeight').value
    };
    
    localStorage.setItem('mapSettings', JSON.stringify(mapSettings));
}

function updateMapPreview() {
    const mapPreviewContainer = document.getElementById('mapPreviewContainer');
    const embedUrl = document.getElementById('mapEmbedUrl').value;
    const height = document.getElementById('mapHeight').value || 250;
    
    if (embedUrl) {
        mapPreviewContainer.innerHTML = `
            <iframe 
                src="${embedUrl}" 
                width="100%" 
                height="${height}" 
                style="border:0; border-radius:10px;" 
                allowfullscreen="" 
                loading="lazy">
            </iframe>
        `;
    } else {
        mapPreviewContainer.innerHTML = `<p>Enter a Google Maps Embed URL to see the preview.</p>`;
    }
}

// Helper function to show notifications
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.admin-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'admin-notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Function to update admin password
function updateAdminPassword(oldPassword, newPassword) {
    // Get stored password or use default
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123';
    
    if (oldPassword === storedPassword) {
        localStorage.setItem('adminPassword', newPassword);
        return true;
    }
    return false;
} 