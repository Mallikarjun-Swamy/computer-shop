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
            
            // Show loading state
            const submitBtn = adminPasswordForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Changing Password...';
            submitBtn.disabled = true;
            
            // First try API endpoint
            fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    password: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Also update in localStorage as fallback
                    localStorage.setItem('adminPassword', newPassword);
                    
                    showNotification('Password changed successfully');
                    adminPasswordForm.reset();
                } else {
                    throw new Error(data.error || 'Failed to change password');
                }
            })
            .catch(error => {
                console.error('Error updating password via API:', error);
                
                // Fall back to local storage method if API fails
                if (updateAdminPassword(currentPassword, newPassword)) {
                    showNotification('Password changed successfully (local only)');
                    adminPasswordForm.reset();
                } else {
                    alert('Current password is incorrect');
                }
            })
            .finally(() => {
                // Reset button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
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
    // Try to get data from API first
    fetch('/api/settings')
        .then(response => response.json())
        .then(data => {
            if (data.businessInfo) {
                const businessInfo = data.businessInfo;
                if (businessInfo.name) document.getElementById('businessName').value = businessInfo.name;
                if (businessInfo.address) document.getElementById('businessAddress').value = businessInfo.address;
                if (businessInfo.phone) document.getElementById('businessPhone').value = businessInfo.phone;
                if (businessInfo.email) document.getElementById('businessEmail').value = businessInfo.email;
                if (businessInfo.hours) document.getElementById('businessHours').value = businessInfo.hours;
            }
        })
        .catch(error => {
            console.error('Error loading business info from API:', error);
            
            // Fall back to localStorage if API fails
            const businessInfo = JSON.parse(localStorage.getItem('businessInfo')) || {};
            
            if (businessInfo.name) document.getElementById('businessName').value = businessInfo.name;
            if (businessInfo.address) document.getElementById('businessAddress').value = businessInfo.address;
            if (businessInfo.phone) document.getElementById('businessPhone').value = businessInfo.phone;
            if (businessInfo.email) document.getElementById('businessEmail').value = businessInfo.email;
            if (businessInfo.hours) document.getElementById('businessHours').value = businessInfo.hours;
        });
}

function saveBusinessInfo() {
    const businessInfo = {
        name: document.getElementById('businessName').value,
        address: document.getElementById('businessAddress').value,
        phone: document.getElementById('businessPhone').value,
        email: document.getElementById('businessEmail').value,
        hours: document.getElementById('businessHours').value
    };
    
    // Save to API first
    fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessInfo })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.error || 'Failed to save business info');
        }
    })
    .catch(error => {
        console.error('Error saving business info to API:', error);
        // Show a notification that it was saved locally only
        showNotification('Business information saved locally only. Some server error occurred.');
    })
    .finally(() => {
        // Also save to localStorage as a fallback
        localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    });
}

// Social Media Functions
function loadSocialMedia() {
    // Try to get data from API first
    fetch('/api/settings')
        .then(response => response.json())
        .then(data => {
            if (data.socialMedia) {
                const socialMedia = data.socialMedia;
                if (socialMedia.facebook) document.getElementById('facebookLink').value = socialMedia.facebook;
                if (socialMedia.twitter) document.getElementById('twitterLink').value = socialMedia.twitter;
                if (socialMedia.instagram) document.getElementById('instagramLink').value = socialMedia.instagram;
                if (socialMedia.linkedin) document.getElementById('linkedinLink').value = socialMedia.linkedin;
            }
        })
        .catch(error => {
            console.error('Error loading social media from API:', error);
            
            // Fall back to localStorage if API fails
            const socialMedia = JSON.parse(localStorage.getItem('socialMedia')) || {};
            
            if (socialMedia.facebook) document.getElementById('facebookLink').value = socialMedia.facebook;
            if (socialMedia.twitter) document.getElementById('twitterLink').value = socialMedia.twitter;
            if (socialMedia.instagram) document.getElementById('instagramLink').value = socialMedia.instagram;
            if (socialMedia.linkedin) document.getElementById('linkedinLink').value = socialMedia.linkedin;
        });
}

function saveSocialMedia() {
    const socialMedia = {
        facebook: document.getElementById('facebookLink').value,
        twitter: document.getElementById('twitterLink').value,
        instagram: document.getElementById('instagramLink').value,
        linkedin: document.getElementById('linkedinLink').value
    };
    
    // Save to API first
    fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ socialMedia })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.error || 'Failed to save social media');
        }
    })
    .catch(error => {
        console.error('Error saving social media to API:', error);
        // Show a notification that it was saved locally only
        showNotification('Social media links saved locally only. Some server error occurred.');
    })
    .finally(() => {
        // Also save to localStorage as a fallback
        localStorage.setItem('socialMedia', JSON.stringify(socialMedia));
    });
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
    
    // Try to get data from API first
    fetch('/api/content')
        .then(response => response.json())
        .then(data => {
            if (data.services && Array.isArray(data.services)) {
                // Create service items
                data.services.forEach((service, index) => {
                    const serviceItem = createServiceItem(service, index);
                    servicesList.appendChild(serviceItem);
                });
                
                // Add event listeners for edit and delete buttons
                addServiceEventListeners();
            } else {
                fallbackToLocalStorage();
            }
        })
        .catch(error => {
            console.error('Error loading services from API:', error);
            fallbackToLocalStorage();
        });
    
    function fallbackToLocalStorage() {
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
    // Delete buttons
    document.querySelectorAll('.service-item .delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this service?')) {
                const serviceItem = this.closest('.service-item');
                const index = serviceItem.dataset.index;
                
                // Show loading state
                showNotification('Deleting service...');
                
                // Get current services from API first
                fetch('/api/content')
                    .then(response => response.json())
                    .then(data => {
                        if (data.services && Array.isArray(data.services)) {
                            // Remove the service
                            const services = data.services;
                            services.splice(index, 1);
                            
                            // Save updated services to API
                            return fetch('/api/content', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ services })
                            });
                        } else {
                            throw new Error('Could not retrieve services from API');
                        }
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            // Also update localStorage as fallback
                            const localServices = JSON.parse(localStorage.getItem('services')) || [];
                            localServices.splice(index, 1);
                            localStorage.setItem('services', JSON.stringify(localServices));
                            
                            // Reload services
                            loadServices();
                            showNotification('Service deleted successfully');
                        } else {
                            throw new Error(result.error || 'Failed to delete service');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting service via API:', error);
                        
                        // Fall back to localStorage method
                        const services = JSON.parse(localStorage.getItem('services')) || [];
                        services.splice(index, 1);
                        localStorage.setItem('services', JSON.stringify(services));
                        
                        // Reload services
                        loadServices();
                        showNotification('Service deleted successfully (local only)');
                    });
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
            
            // Show loading state
            showNotification('Saving service...');
            
            // Update service in API
            fetch('/api/content')
                .then(response => response.json())
                .then(data => {
                    if (data.services && Array.isArray(data.services)) {
                        // Update the service
                        const services = data.services;
                        services[index] = { icon, title, description };
                        
                        // Save updated services to API
                        return fetch('/api/content', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ services })
                        });
                    } else {
                        throw new Error('Could not retrieve services from API');
                    }
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        // Also update localStorage as fallback
                        const localServices = JSON.parse(localStorage.getItem('services')) || [];
                        localServices[index] = { icon, title, description };
                        localStorage.setItem('services', JSON.stringify(localServices));
                        
                        // Hide details
                        serviceItem.querySelector('.service-details').style.display = 'none';
                        
                        // Update header title
                        serviceItem.querySelector('.service-header h3').textContent = title;
                        
                        showNotification('Service updated successfully');
                    } else {
                        throw new Error(result.error || 'Failed to update service');
                    }
                })
                .catch(error => {
                    console.error('Error updating service via API:', error);
                    
                    // Fall back to localStorage method
                    const services = JSON.parse(localStorage.getItem('services')) || [];
                    services[index] = { icon, title, description };
                    localStorage.setItem('services', JSON.stringify(services));
                    
                    // Hide details
                    serviceItem.querySelector('.service-details').style.display = 'none';
                    
                    // Update header title
                    serviceItem.querySelector('.service-header h3').textContent = title;
                    
                    showNotification('Service updated successfully (local only)');
                });
        });
    });
    
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
}

function addNewService() {
    // Show loading state
    showNotification('Adding new service...');
    
    // Get services from API first
    fetch('/api/content')
        .then(response => response.json())
        .then(data => {
            const services = data.services && Array.isArray(data.services) 
                ? data.services 
                : JSON.parse(localStorage.getItem('services')) || [];
            
            // Add new empty service
            services.push({
                icon: 'fas fa-laptop',
                title: 'New Service',
                description: 'Service description here.'
            });
            
            // Save updated services to API
            return fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ services })
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Also save to localStorage as a fallback
                const localServices = JSON.parse(localStorage.getItem('services')) || [];
                localServices.push({
                    icon: 'fas fa-laptop',
                    title: 'New Service',
                    description: 'Service description here.'
                });
                localStorage.setItem('services', JSON.stringify(localServices));
                
                // Reload services
                loadServices();
                
                // Show edit form for the new service
                setTimeout(() => {
                    const serviceItems = document.querySelectorAll('.service-item');
                    const newServiceItem = serviceItems[serviceItems.length - 1];
                    newServiceItem.querySelector('.service-details').style.display = 'block';
                }, 100);
                
                showNotification('New service added');
            } else {
                throw new Error(result.error || 'Failed to add service');
            }
        })
        .catch(error => {
            console.error('Error adding service via API:', error);
            
            // Fall back to localStorage method
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
            setTimeout(() => {
                const serviceItems = document.querySelectorAll('.service-item');
                const newServiceItem = serviceItems[serviceItems.length - 1];
                newServiceItem.querySelector('.service-details').style.display = 'block';
            }, 100);
            
            showNotification('New service added (local only)');
        });
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
    
    // Try to get data from API first
    fetch('/api/content')
        .then(response => response.json())
        .then(data => {
            if (data.products && Array.isArray(data.products)) {
                // Create product items
                data.products.forEach((product, index) => {
                    const productItem = createProductItem(product, index);
                    productsList.appendChild(productItem);
                });
                
                // Add event listeners for edit and delete buttons
                addProductEventListeners();
            } else {
                fallbackToLocalStorage();
            }
        })
        .catch(error => {
            console.error('Error loading products from API:', error);
            fallbackToLocalStorage();
        });
    
    function fallbackToLocalStorage() {
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
    // Delete buttons
    document.querySelectorAll('.product-item .delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this product?')) {
                const productItem = this.closest('.product-item');
                const index = productItem.dataset.index;
                
                // Show loading state
                showNotification('Deleting product...');
                
                // Get current products from API first
                fetch('/api/content')
                    .then(response => response.json())
                    .then(data => {
                        if (data.products && Array.isArray(data.products)) {
                            // Remove the product
                            const products = data.products;
                            products.splice(index, 1);
                            
                            // Save updated products to API
                            return fetch('/api/content', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ products })
                            });
                        } else {
                            throw new Error('Could not retrieve products from API');
                        }
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            // Also update localStorage as fallback
                            const localProducts = JSON.parse(localStorage.getItem('products')) || [];
                            localProducts.splice(index, 1);
                            localStorage.setItem('products', JSON.stringify(localProducts));
                            
                            // Reload products
                            loadProducts();
                            showNotification('Product deleted successfully');
                        } else {
                            throw new Error(result.error || 'Failed to delete product');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting product via API:', error);
                        
                        // Fall back to localStorage method
                        const products = JSON.parse(localStorage.getItem('products')) || [];
                        products.splice(index, 1);
                        localStorage.setItem('products', JSON.stringify(products));
                        
                        // Reload products
                        loadProducts();
                        showNotification('Product deleted successfully (local only)');
                    });
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
            
            // Show loading state
            showNotification('Saving product...');
            
            // If there's a new image, handle it
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Get the image data URL
                    const imageData = e.target.result;
                    
                    // Update product with new image in API
                    updateProductInAPI({ 
                        image: imageData,
                        title: title,
                        description: description
                    }, index);
                };
                reader.readAsDataURL(imageFile);
            } else {
                // Update product with existing image in API
                updateProductInAPI({ 
                    image: currentImage,
                    title: title,
                    description: description
                }, index);
            }
        });
    });
    
    // Helper function to update a product in the API
    function updateProductInAPI(productData, index) {
        fetch('/api/content')
            .then(response => response.json())
            .then(data => {
                if (data.products && Array.isArray(data.products)) {
                    // Update the product
                    const products = data.products;
                    products[index] = productData;
                    
                    // Save updated products to API
                    return fetch('/api/content', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ products })
                    });
                } else {
                    throw new Error('Could not retrieve products from API');
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Also update localStorage as fallback
                    const localProducts = JSON.parse(localStorage.getItem('products')) || [];
                    localProducts[index] = productData;
                    localStorage.setItem('products', JSON.stringify(localProducts));
                    
                    // Find the product item that was being edited
                    const productItems = document.querySelectorAll('.product-item');
                    const productItem = productItems[index];
                    
                    // Hide details
                    productItem.querySelector('.product-details').style.display = 'none';
                    
                    // Update header title
                    productItem.querySelector('.product-header h3').textContent = productData.title;
                    
                    // Update image preview if it was updated
                    productItem.querySelector('.product-image-preview img').src = productData.image;
                    
                    showNotification('Product updated successfully');
                } else {
                    throw new Error(result.error || 'Failed to update product');
                }
            })
            .catch(error => {
                console.error('Error updating product via API:', error);
                
                // Fall back to localStorage method
                const products = JSON.parse(localStorage.getItem('products')) || [];
                products[index] = productData;
                localStorage.setItem('products', JSON.stringify(products));
                
                // Find the product item that was being edited
                const productItems = document.querySelectorAll('.product-item');
                const productItem = productItems[index];
                
                // Hide details
                productItem.querySelector('.product-details').style.display = 'none';
                
                // Update header title
                productItem.querySelector('.product-header h3').textContent = productData.title;
                
                // Update image preview if it was updated
                productItem.querySelector('.product-image-preview img').src = productData.image;
                
                showNotification('Product updated successfully (local only)');
            });
    }
    
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
    // Show loading state
    showNotification('Adding new product...');
    
    // Get products from API first
    fetch('/api/content')
        .then(response => response.json())
        .then(data => {
            const products = data.products && Array.isArray(data.products) 
                ? data.products 
                : JSON.parse(localStorage.getItem('products')) || [];
            
            // Add new empty product
            products.push({
                image: 'images/placeholder.jpg',
                title: 'New Product',
                description: 'Product description here.'
            });
            
            // Save updated products to API
            return fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ products })
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Also save to localStorage as a fallback
                const localProducts = JSON.parse(localStorage.getItem('products')) || [];
                localProducts.push({
                    image: 'images/placeholder.jpg',
                    title: 'New Product',
                    description: 'Product description here.'
                });
                localStorage.setItem('products', JSON.stringify(localProducts));
                
                // Reload products
                loadProducts();
                
                // Show edit form for the new product
                setTimeout(() => {
                    const productItems = document.querySelectorAll('.product-item');
                    const newProductItem = productItems[productItems.length - 1];
                    newProductItem.querySelector('.product-details').style.display = 'block';
                }, 100);
                
                showNotification('New product added');
            } else {
                throw new Error(result.error || 'Failed to add product');
            }
        })
        .catch(error => {
            console.error('Error adding product via API:', error);
            
            // Fall back to localStorage method
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
            setTimeout(() => {
                const productItems = document.querySelectorAll('.product-item');
                const newProductItem = productItems[productItems.length - 1];
                newProductItem.querySelector('.product-details').style.display = 'block';
            }, 100);
            
            showNotification('New product added (local only)');
        });
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
        });
        
        // Update preview on input change
        document.getElementById('mapIframeCode').addEventListener('input', updateMapPreview);
        
        // Initial preview
        updateMapPreview();
    }
}

function loadMapSettings() {
    // Try to get data from API first
    fetch('/api/map')
        .then(response => response.json())
        .then(mapSettings => {
            // Update form fields
            document.getElementById('mapIframeCode').value = mapSettings.iframeCode || '';
            document.getElementById('mapDirectionsUrl').value = mapSettings.directionsUrl || '';
            
            // Update map preview with the settings
            updateMapPreview();
        })
        .catch(error => {
            console.error('Error loading map settings from API:', error);
            
            // Fall back to localStorage if API fails
            fallbackToLocalStorage();
        });
    
    function fallbackToLocalStorage() {
        const mapSettings = JSON.parse(localStorage.getItem('mapSettings')) || {
            iframeCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUwJzE0LjQiTiA4NMKwMjknMjMuMiJX!5e0!3m2!1sen!2sus!4v1623308321015!5m2!1sen!2sus',
            directionsUrl: 'https://goo.gl/maps/3uveM77SnX4DXZNK9',
            height: 250
        };
        
        document.getElementById('mapIframeCode').value = mapSettings.iframeCode || '';
        document.getElementById('mapDirectionsUrl').value = mapSettings.directionsUrl || '';
        
        // Update map preview with the settings
        updateMapPreview();
    }
}

function saveMapSettings() {
    // Get values from form
    const mapSettings = {
        iframeCode: document.getElementById('mapIframeCode').value,
        directionsUrl: document.getElementById('mapDirectionsUrl').value
    };
    
    // Show loading state
    showNotification('Saving map settings...');
    
    // Save to API first
    fetch('/api/map', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapSettings)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Also save to localStorage as a fallback
            localStorage.setItem('mapSettings', JSON.stringify(mapSettings));
            
            // Update map preview
            updateMapPreview();
            
            showNotification('Map settings saved successfully');
        } else {
            throw new Error(result.error || 'Failed to save map settings');
        }
    })
    .catch(error => {
        console.error('Error saving map settings to API:', error);
        
        // Fall back to localStorage method
        localStorage.setItem('mapSettings', JSON.stringify(mapSettings));
        
        // Update map preview
        updateMapPreview();
        
        showNotification('Map settings saved locally only. Some server error occurred.');
    });
}

function updateMapPreview() {
    const mapPreviewContainer = document.getElementById('mapPreviewContainer');
    const iframeCode = document.getElementById('mapIframeCode').value;
    
    if (iframeCode) {
        mapPreviewContainer.innerHTML = iframeCode;
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
    const storedPassword = localStorage.getItem('adminPassword') || 'admin@123';
    
    if (oldPassword === storedPassword) {
        localStorage.setItem('adminPassword', newPassword);
        
        // Sync with server
        syncWithServer('password', { password: newPassword });
        return true;
    }
    return false;
}

// Function to sync data with server
function syncWithServer(dataType, data) {
    // Check if we're running on a local environment
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('192.168.');
    
    if (isLocalhost) {
        console.log(`Local development: would sync ${dataType} with server`, data);
        return;
    }
    
    // Create a backup of the data
    const timestamp = new Date().toISOString();
    const backupKey = `${dataType}_backup_${timestamp}`;
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    // In a production environment, this would be where you'd make a fetch call
    // to your backend API to save the data
    /*
    fetch('/api/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: dataType,
            data: data,
            timestamp: timestamp
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server sync failed');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Failed to sync with server. Changes are saved locally only.');
    });
    */
    
    // For now, we'll simulate a server sync with a message
    console.log(`Syncing ${dataType} with server...`);
    alert('IMPORTANT: You need to set up a server backend to store changes globally across devices. Current changes are saved to this device only.');
} 