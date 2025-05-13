// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded - Checking auth status...');
    
    // Check if user is logged in using both sessionStorage and localStorage as fallback
    const isLoggedInSession = sessionStorage.getItem('adminLoggedIn');
    const isLoggedInLocal = localStorage.getItem('adminLoggedIn');
    const isLoggedIn = isLoggedInSession || isLoggedInLocal;
    
    console.log('Auth status:', { 
        sessionStorage: isLoggedInSession ? 'logged in' : 'not logged in', 
        localStorage: isLoggedInLocal ? 'logged in' : 'not logged in' 
    });
    
    if (!isLoggedIn) {
        console.log('Not logged in - redirecting to login page');
        window.location.href = 'login.html';
        return; // Stop execution
    }
    
    console.log('Authentication successful - loading admin panel');
    
    // Ensure we set both storage mechanisms for robustness
    sessionStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminLoggedIn', 'true');
    
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
            localStorage.removeItem('adminLoggedIn');
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
                showNotification('Please fill in all password fields', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showNotification('New password and confirmation do not match', 'error');
                return;
            }
            
            // Check for minimum password strength
            if (newPassword.length < 6) {
                showNotification('New password must be at least 6 characters long', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = adminPasswordForm.querySelector('button[type="submit"]');
            setLoadingState(submitBtn, true, 'Changing Password...');
            
            // First try API endpoint
            apiRequest('/api/settings', 'POST', {
                currentPassword: currentPassword,
                password: newPassword
            })
            .then(data => {
                // Also update in localStorage as fallback
                localStorage.setItem('adminPassword', newPassword);
                showNotification('Password changed successfully');
                adminPasswordForm.reset();
            })
            .catch(error => {
                console.error('Error updating password via API:', error);
                
                // Fall back to local storage method if API fails
                if (updateAdminPassword(currentPassword, newPassword)) {
                    showNotification('Password changed successfully (local only)');
                    adminPasswordForm.reset();
                } else {
                    showNotification('Current password is incorrect', 'error');
                }
            })
            .finally(() => {
                // Reset button state
                setLoadingState(submitBtn, false);
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

// API Request Utilities
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(endpoint, options);
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || `API request failed with status ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error);
        throw error;
    }
}

// UI Utility Functions
function setLoadingState(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;
    
    if (!button._originalText) {
        button._originalText = button.textContent;
    }
    
    if (isLoading) {
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        button.textContent = button._originalText;
        button.disabled = false;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Data Storage Utilities
async function fetchWithFallback(apiEndpoint, localStorageKey, defaultValue = {}) {
    try {
        const data = await apiRequest(apiEndpoint);
        return data;
    } catch (error) {
        console.warn(`API request failed, falling back to localStorage for ${localStorageKey}`);
        return JSON.parse(localStorage.getItem(localStorageKey)) || defaultValue;
    }
}

async function saveWithFallback(apiEndpoint, localStorageKey, data) {
    try {
        await apiRequest(apiEndpoint, 'POST', data);
        // Also save to localStorage as fallback
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        showNotification('Changes saved successfully');
        return true;
    } catch (error) {
        console.warn(`API save failed, saving to localStorage only for ${localStorageKey}`);
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        showNotification('Changes saved locally only', 'warning');
        return false;
    }
}

// Business Information Functions
async function loadBusinessInfo() {
    try {
        const data = await fetchWithFallback('/api/settings', 'businessInfo', {});
        const businessInfo = data.businessInfo || {};
        
        // Fill in form fields
        document.getElementById('businessName').value = businessInfo.name || '';
        document.getElementById('businessAddress').value = businessInfo.address || '';
        document.getElementById('businessPhone').value = businessInfo.phone || '';
        document.getElementById('businessEmail').value = businessInfo.email || '';
        document.getElementById('businessHours').value = businessInfo.hours || '';
    } catch (error) {
        console.error('Failed to load business info:', error);
        showNotification('Failed to load business information', 'error');
    }
}

async function saveBusinessInfo() {
    const submitBtn = document.querySelector('#businessInfoForm button[type="submit"]');
    setLoadingState(submitBtn, true, 'Saving...');
    
    const businessInfo = {
        name: document.getElementById('businessName').value,
        address: document.getElementById('businessAddress').value,
        phone: document.getElementById('businessPhone').value,
        email: document.getElementById('businessEmail').value,
        hours: document.getElementById('businessHours').value
    };
    
    try {
        await saveWithFallback('/api/settings', 'businessInfo', { businessInfo });
    } catch (error) {
        console.error('Failed to save business info:', error);
        showNotification('Failed to save business information', 'error');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Social Media Functions
async function loadSocialMedia() {
    try {
        const data = await fetchWithFallback('/api/settings', 'socialMedia', {});
        const socialMedia = data.socialMedia || {};
        
        // Fill in form fields
        document.getElementById('facebookLink').value = socialMedia.facebook || '';
        document.getElementById('twitterLink').value = socialMedia.twitter || '';
        document.getElementById('instagramLink').value = socialMedia.instagram || '';
        document.getElementById('linkedinLink').value = socialMedia.linkedin || '';
    } catch (error) {
        console.error('Failed to load social media links:', error);
        showNotification('Failed to load social media links', 'error');
    }
}

async function saveSocialMedia() {
    const submitBtn = document.querySelector('#socialMediaForm button[type="submit"]');
    setLoadingState(submitBtn, true, 'Saving...');
    
    const socialMedia = {
        facebook: document.getElementById('facebookLink').value,
        twitter: document.getElementById('twitterLink').value,
        instagram: document.getElementById('instagramLink').value,
        linkedin: document.getElementById('linkedinLink').value
    };
    
    try {
        await saveWithFallback('/api/settings', 'socialMedia', { socialMedia });
    } catch (error) {
        console.error('Failed to save social media links:', error);
        showNotification('Failed to save social media links', 'error');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Services Management Functions
function initializeServicesManagement() {
    const servicesTab = document.getElementById('servicesTab');
    if (!servicesTab) return;
    
    // Load saved services
        loadServices();
        
    // Add service button event listener
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', addNewService);
    }
}

async function loadServices() {
    const servicesContainer = document.getElementById('servicesContainer');
    if (!servicesContainer) return;
    
    // Show loading indicator
    servicesContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const data = await fetchWithFallback('/api/content', 'services', { services: [] });
        const services = data.services || [];
        
        if (services.length === 0) {
            servicesContainer.innerHTML = '<p>No services found. Add your first service.</p>';
            return;
        }
        
        // Display services
        servicesContainer.innerHTML = '';
    services.forEach((service, index) => {
        const serviceItem = createServiceItem(service, index);
            servicesContainer.appendChild(serviceItem);
    });
    
        // Add event listeners
    addServiceEventListeners();
    } catch (error) {
        console.error('Failed to load services:', error);
        servicesContainer.innerHTML = '<p>Failed to load services. Please try again.</p>';
        showNotification('Failed to load services', 'error');
    }
}

function createServiceItem(service, index) {
    const serviceElement = document.createElement('div');
    serviceElement.className = 'service-item';
    serviceElement.dataset.index = index;
    
    serviceElement.innerHTML = `
        <div class="service-header">
            <h3>${service.title || 'Untitled Service'}</h3>
            <div class="service-actions">
                <button class="edit-service-btn"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-service-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
        <div class="service-details">
            <p><strong>Icon:</strong> <i class="${service.icon || 'fas fa-question'}"></i> (${service.icon || 'None'})</p>
            <p><strong>Description:</strong> ${service.description || 'No description'}</p>
        </div>
        <div class="service-edit-form" style="display: none;">
            <div class="form-group">
                <label for="serviceTitle${index}">Title:</label>
                <input type="text" id="serviceTitle${index}" value="${service.title || ''}" required>
            </div>
            <div class="form-group">
                <label for="serviceIcon${index}">Icon (Font Awesome class):</label>
                <input type="text" id="serviceIcon${index}" value="${service.icon || ''}">
                <small>E.g., fas fa-laptop, fas fa-desktop, etc.</small>
            </div>
            <div class="form-group">
                <label for="serviceDesc${index}">Description:</label>
                <textarea id="serviceDesc${index}" rows="3" required>${service.description || ''}</textarea>
            </div>
            <div class="form-buttons">
                <button class="save-service-btn">Save Changes</button>
                <button class="cancel-service-btn">Cancel</button>
            </div>
        </div>
    `;
    
    return serviceElement;
}

function addServiceEventListeners() {
    // Edit service buttons
    document.querySelectorAll('.edit-service-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceItem = this.closest('.service-item');
            serviceItem.querySelector('.service-details').style.display = 'none';
            serviceItem.querySelector('.service-edit-form').style.display = 'block';
            this.style.display = 'none';
        });
    });
    
    // Cancel edit buttons
    document.querySelectorAll('.cancel-service-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceItem = this.closest('.service-item');
            serviceItem.querySelector('.service-details').style.display = 'block';
            serviceItem.querySelector('.service-edit-form').style.display = 'none';
            serviceItem.querySelector('.edit-service-btn').style.display = 'inline-block';
        });
    });
    
    // Save service buttons
    document.querySelectorAll('.save-service-btn').forEach(button => {
        button.addEventListener('click', async function() {
                const serviceItem = this.closest('.service-item');
            const index = parseInt(serviceItem.dataset.index);
            
            // Show loading state
            setLoadingState(this, true, 'Saving...');
            
            // Get all current services
            let services = [];
            try {
                const data = await fetchWithFallback('/api/content', 'services', { services: [] });
                services = data.services || [];
            } catch (error) {
                console.error('Error fetching services:', error);
                services = JSON.parse(localStorage.getItem('services')) || [];
            }
            
            // Update the service at this index
            services[index] = {
                title: document.getElementById(`serviceTitle${index}`).value,
                icon: document.getElementById(`serviceIcon${index}`).value,
                description: document.getElementById(`serviceDesc${index}`).value
            };
            
            try {
                await saveWithFallback('/api/content', 'services', { services });
                
                // Update the UI
                serviceItem.querySelector('h3').textContent = services[index].title || 'Untitled Service';
                serviceItem.querySelector('.service-details').innerHTML = `
                    <p><strong>Icon:</strong> <i class="${services[index].icon || 'fas fa-question'}"></i> (${services[index].icon || 'None'})</p>
                    <p><strong>Description:</strong> ${services[index].description || 'No description'}</p>
                `;
                
                // Hide edit form
                serviceItem.querySelector('.service-details').style.display = 'block';
                serviceItem.querySelector('.service-edit-form').style.display = 'none';
                serviceItem.querySelector('.edit-service-btn').style.display = 'inline-block';
            } catch (error) {
                console.error('Failed to save service:', error);
                showNotification('Failed to save service', 'error');
            } finally {
                setLoadingState(button, false);
            }
        });
    });
    
    // Delete service buttons
    document.querySelectorAll('.delete-service-btn').forEach(button => {
        button.addEventListener('click', async function() {
            if (!confirm('Are you sure you want to delete this service?')) {
                return;
            }
            
            const serviceItem = this.closest('.service-item');
            const index = parseInt(serviceItem.dataset.index);
            
            // Show loading state
            setLoadingState(this, true, 'Deleting...');
            
            // Get all current services
            let services = [];
            try {
                const data = await fetchWithFallback('/api/content', 'services', { services: [] });
                services = data.services || [];
            } catch (error) {
                console.error('Error fetching services:', error);
                services = JSON.parse(localStorage.getItem('services')) || [];
            }
            
            // Remove the service at this index
            services.splice(index, 1);
            
            try {
                await saveWithFallback('/api/content', 'services', { services });
                
                // Reload services to update indexes
                loadServices();
            } catch (error) {
                console.error('Failed to delete service:', error);
                showNotification('Failed to delete service', 'error');
                setLoadingState(button, false);
            }
        });
    });
}

async function addNewService() {
    const newServiceModal = document.getElementById('newServiceModal');
    const newServiceForm = document.getElementById('newServiceForm');
    
    if (!newServiceModal || !newServiceForm) return;
    
    // Show modal
    newServiceModal.style.display = 'block';
    
    // Clear form
    newServiceForm.reset();
    
    // Form submit handler
    const handleSubmit = async function(e) {
        e.preventDefault();
        
        const submitBtn = newServiceForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true, 'Adding Service...');
        
        const newService = {
            title: document.getElementById('newServiceTitle').value,
            icon: document.getElementById('newServiceIcon').value,
            description: document.getElementById('newServiceDesc').value
        };
        
        // Get all current services
        let services = [];
        try {
            const data = await fetchWithFallback('/api/content', 'services', { services: [] });
            services = data.services || [];
        } catch (error) {
            console.error('Error fetching services:', error);
            services = JSON.parse(localStorage.getItem('services')) || [];
        }
        
        // Add the new service
        services.push(newService);
        
        try {
            await saveWithFallback('/api/content', 'services', { services });
            
            // Hide modal and reload services
            newServiceModal.style.display = 'none';
    loadServices();
        } catch (error) {
            console.error('Failed to add new service:', error);
            showNotification('Failed to add new service', 'error');
        } finally {
            setLoadingState(submitBtn, false);
        }
        
        // Remove event listener to prevent multiple submissions
        newServiceForm.removeEventListener('submit', handleSubmit);
    };
    
    // Add submit event listener
    newServiceForm.addEventListener('submit', handleSubmit);
    
    // Close modal button
    const closeBtn = newServiceModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            newServiceModal.style.display = 'none';
            // Remove event listener when closing
            newServiceForm.removeEventListener('submit', handleSubmit);
        });
    }
    
    // Close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === newServiceModal) {
            newServiceModal.style.display = 'none';
            // Remove event listener when closing
            newServiceForm.removeEventListener('submit', handleSubmit);
        }
    });
}

// Products Management Functions
function initializeProductsManagement() {
    const productsTab = document.getElementById('productsTab');
    if (!productsTab) return;
    
    // Load saved products
        loadProducts();
        
    // Add product button event listener
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addNewProduct);
    }
}

async function loadProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;
    
    // Show loading indicator
    productsContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const data = await fetchWithFallback('/api/content', 'products', { products: [] });
        const products = data.products || [];
        
        if (products.length === 0) {
            productsContainer.innerHTML = '<p>No products found. Add your first product.</p>';
            return;
        }
        
        // Display products
        productsContainer.innerHTML = '';
    products.forEach((product, index) => {
        const productItem = createProductItem(product, index);
            productsContainer.appendChild(productItem);
    });
    
        // Add event listeners
    addProductEventListeners();
    } catch (error) {
        console.error('Failed to load products:', error);
        productsContainer.innerHTML = '<p>Failed to load products. Please try again.</p>';
        showNotification('Failed to load products', 'error');
    }
}

function createProductItem(product, index) {
    const productElement = document.createElement('div');
    productElement.className = 'product-item';
    productElement.dataset.index = index;
    
    productElement.innerHTML = `
        <div class="product-header">
            <h3>${product.title || 'Untitled Product'}</h3>
            <div class="product-actions">
                <button class="edit-product-btn"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-product-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
        <div class="product-details">
            <div class="product-image">
                <img src="${product.image || 'images/placeholder.jpg'}" alt="${product.title || 'Product'}">
            </div>
            <p><strong>Description:</strong> ${product.description || 'No description'}</p>
        </div>
        <div class="product-edit-form" style="display: none;">
            <div class="form-group">
                <label for="productTitle${index}">Title:</label>
                <input type="text" id="productTitle${index}" value="${product.title || ''}" required>
            </div>
            <div class="form-group">
                <label for="productImage${index}">Image URL:</label>
                <input type="text" id="productImage${index}" value="${product.image || ''}">
                <small>Path to image file (e.g., images/product.jpg)</small>
            </div>
            <div class="form-group">
                <label for="productDesc${index}">Description:</label>
                <textarea id="productDesc${index}" rows="3" required>${product.description || ''}</textarea>
            </div>
            <div class="form-buttons">
                <button class="save-product-btn">Save Changes</button>
                <button class="cancel-product-btn">Cancel</button>
            </div>
        </div>
    `;
    
    return productElement;
}

function addProductEventListeners() {
    // Edit product buttons
    document.querySelectorAll('.edit-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            productItem.querySelector('.product-details').style.display = 'none';
            productItem.querySelector('.product-edit-form').style.display = 'block';
            this.style.display = 'none';
        });
    });
    
    // Cancel edit buttons
    document.querySelectorAll('.cancel-product-btn').forEach(button => {
        button.addEventListener('click', function() {
                const productItem = this.closest('.product-item');
            productItem.querySelector('.product-details').style.display = 'block';
            productItem.querySelector('.product-edit-form').style.display = 'none';
            productItem.querySelector('.edit-product-btn').style.display = 'inline-block';
        });
    });
    
    // Save product buttons
    document.querySelectorAll('.save-product-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const productItem = this.closest('.product-item');
            const index = parseInt(productItem.dataset.index);
            
            // Show loading state
            setLoadingState(this, true, 'Saving...');
            
            // Get all current products
            let products = [];
            try {
                const data = await fetchWithFallback('/api/content', 'products', { products: [] });
                products = data.products || [];
            } catch (error) {
                console.error('Error fetching products:', error);
                products = JSON.parse(localStorage.getItem('products')) || [];
            }
            
            // Update the product at this index
                    products[index] = {
                title: document.getElementById(`productTitle${index}`).value,
                image: document.getElementById(`productImage${index}`).value,
                description: document.getElementById(`productDesc${index}`).value
            };
            
            try {
                await saveWithFallback('/api/content', 'products', { products });
                
                // Update the UI
                productItem.querySelector('h3').textContent = products[index].title || 'Untitled Product';
                productItem.querySelector('.product-details').innerHTML = `
                    <div class="product-image">
                        <img src="${products[index].image || 'images/placeholder.jpg'}" alt="${products[index].title || 'Product'}">
                    </div>
                    <p><strong>Description:</strong> ${products[index].description || 'No description'}</p>
                `;
                
                // Hide edit form
                productItem.querySelector('.product-details').style.display = 'block';
                productItem.querySelector('.product-edit-form').style.display = 'none';
                productItem.querySelector('.edit-product-btn').style.display = 'inline-block';
            } catch (error) {
                console.error('Failed to save product:', error);
                showNotification('Failed to save product', 'error');
            } finally {
                setLoadingState(button, false);
            }
        });
    });
    
    // Delete product buttons
    document.querySelectorAll('.delete-product-btn').forEach(button => {
        button.addEventListener('click', async function() {
            if (!confirm('Are you sure you want to delete this product?')) {
                return;
            }
            
            const productItem = this.closest('.product-item');
            const index = parseInt(productItem.dataset.index);
            
            // Show loading state
            setLoadingState(this, true, 'Deleting...');
            
            // Get all current products
            let products = [];
            try {
                const data = await fetchWithFallback('/api/content', 'products', { products: [] });
                products = data.products || [];
            } catch (error) {
                console.error('Error fetching products:', error);
                products = JSON.parse(localStorage.getItem('products')) || [];
            }
            
            // Remove the product at this index
            products.splice(index, 1);
            
            try {
                await saveWithFallback('/api/content', 'products', { products });
                
                // Reload products to update indexes
                loadProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
                showNotification('Failed to delete product', 'error');
                setLoadingState(button, false);
            }
        });
    });
}

async function addNewProduct() {
    const newProductModal = document.getElementById('newProductModal');
    const newProductForm = document.getElementById('newProductForm');
    
    if (!newProductModal || !newProductForm) return;
    
    // Show modal
    newProductModal.style.display = 'block';
    
    // Clear form
    newProductForm.reset();
    
    // Form submit handler
    const handleSubmit = async function(e) {
        e.preventDefault();
        
        const submitBtn = newProductForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true, 'Adding Product...');
        
        const newProduct = {
            title: document.getElementById('newProductTitle').value,
            image: document.getElementById('newProductImage').value,
            description: document.getElementById('newProductDesc').value
        };
        
        // Get all current products
        let products = [];
        try {
            const data = await fetchWithFallback('/api/content', 'products', { products: [] });
            products = data.products || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            products = JSON.parse(localStorage.getItem('products')) || [];
        }
        
        // Add the new product
        products.push(newProduct);
        
        try {
            await saveWithFallback('/api/content', 'products', { products });
            
            // Hide modal and reload products
            newProductModal.style.display = 'none';
    loadProducts();
        } catch (error) {
            console.error('Failed to add new product:', error);
            showNotification('Failed to add new product', 'error');
        } finally {
            setLoadingState(submitBtn, false);
        }
        
        // Remove event listener to prevent multiple submissions
        newProductForm.removeEventListener('submit', handleSubmit);
    };
    
    // Add submit event listener
    newProductForm.addEventListener('submit', handleSubmit);
    
    // Close modal button
    const closeBtn = newProductModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            newProductModal.style.display = 'none';
            // Remove event listener when closing
            newProductForm.removeEventListener('submit', handleSubmit);
        });
    }
    
    // Close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === newProductModal) {
            newProductModal.style.display = 'none';
            // Remove event listener when closing
            newProductForm.removeEventListener('submit', handleSubmit);
        }
    });
}

// Google Maps Settings
function initializeMapSettings() {
    const mapSettingsTab = document.getElementById('mapTab');
    if (!mapSettingsTab) return;
    
    // Load map settings
        loadMapSettings();
        
    // Update preview when iframe code changes
    const iframeCodeInput = document.getElementById('mapIframe');
    if (iframeCodeInput) {
        iframeCodeInput.addEventListener('input', updateMapPreview);
    }
    
    // Save map settings
    const mapSettingsForm = document.getElementById('mapSettingsForm');
    if (mapSettingsForm) {
        mapSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMapSettings();
        });
    }
}

async function loadMapSettings() {
    try {
        const data = await fetchWithFallback('/api/map', 'mapSettings', { 
            iframeCode: '',
            directionsUrl: '',
            height: '220'
        });
        
        document.getElementById('mapIframe').value = data.iframeCode || '';
        document.getElementById('mapDirectionsUrl').value = data.directionsUrl || '';
        document.getElementById('mapHeight').value = data.height || '220';
        
        // Update the preview
        updateMapPreview();
    } catch (error) {
        console.error('Failed to load map settings:', error);
        showNotification('Failed to load map settings', 'error');
    }
}

async function saveMapSettings() {
    const submitBtn = document.querySelector('#mapSettingsForm button[type="submit"]');
    setLoadingState(submitBtn, true, 'Saving...');
    
    const mapSettings = {
        iframeCode: document.getElementById('mapIframe').value,
        directionsUrl: document.getElementById('mapDirectionsUrl').value,
        height: document.getElementById('mapHeight').value
    };
    
    try {
        await saveWithFallback('/api/map', 'mapSettings', mapSettings);
        // Update the preview after saving
        updateMapPreview();
    } catch (error) {
        console.error('Failed to save map settings:', error);
        showNotification('Failed to save map settings', 'error');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

function updateMapPreview() {
    const previewContainer = document.getElementById('mapPreview');
    if (!previewContainer) return;
    
    const iframeCode = document.getElementById('mapIframe').value;
    
    if (iframeCode.trim()) {
        previewContainer.innerHTML = iframeCode;
    } else {
        previewContainer.innerHTML = '<div class="placeholder">Map preview will appear here</div>';
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
    // This is only used as a fallback when the API is not available
    const savedPassword = localStorage.getItem('adminPassword') || 'admin@123';
    
    if (oldPassword === savedPassword) {
        localStorage.setItem('adminPassword', newPassword);
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