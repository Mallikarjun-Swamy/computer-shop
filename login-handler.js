// Admin login handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login handler script loaded');
    
    // Get the login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminLoginForm) {
        console.log('Login form found by handler');
        
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted to handler');
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            console.log('Login attempt with username:', username);
            
            // Show notification element if it exists
            const notification = document.getElementById('notification');
            
            // Simple validation
            if (!username || !password) {
                console.log('Empty username or password');
                if (notification) {
                    notification.textContent = 'Please enter both username and password';
                    notification.className = 'notification error';
                    notification.style.display = 'block';
                    
                    // Auto-hide after 3 seconds
                    setTimeout(() => {
                        notification.style.display = 'none';
                    }, 3000);
                } else {
                    alert('Please enter both username and password');
                }
                return;
            }
            
            // Default admin credentials
            if (username === 'admin' && password === 'admin@123') {
                console.log('Login successful');
                
                // Set logged in status
                sessionStorage.setItem('adminLoggedIn', 'true');
                
                // Also set in localStorage as a backup
                try {
                    localStorage.setItem('adminLoggedIn', 'true');
                } catch (error) {
                    console.warn('Could not set localStorage item:', error);
                }
                
                // Show success message before redirect
                if (notification) {
                    notification.textContent = 'Login successful! Redirecting...';
                    notification.className = 'notification success';
                    notification.style.display = 'block';
                }
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                console.log('Invalid credentials');
                
                // Show error message
                if (notification) {
                    notification.textContent = 'Invalid username or password';
                    notification.className = 'notification error';
                    notification.style.display = 'block';
                    
                    // Auto-hide after 3 seconds
                    setTimeout(() => {
                        notification.style.display = 'none';
                    }, 3000);
                } else {
                    alert('Invalid username or password');
                }
            }
        });
    } else {
        console.error('Admin login form not found');
    }
}); 