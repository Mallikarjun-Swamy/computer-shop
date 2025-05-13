// Google Maps Settings Module for Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    initializeMapSettings();
});

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
        document.getElementById('mapIframeCode').addEventListener('input', updateMapPreview);
        
        // Initial preview
        updateMapPreview();
    }
}

function loadMapSettings() {
    const mapSettings = JSON.parse(localStorage.getItem('mapSettings')) || {
        iframeCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3703.493925964318!2d73.719295!3d21.8384759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39601d55e43af21f%3A0xb8e23c01a1f6eb18!2sStatue%20Of%20Unity!5e0!3m2!1sen!2sin!4v1747137082051!5m2!1sen!2sin" width="80%" height="220" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
        directionsUrl: 'https://goo.gl/maps/Pof8eHp1tpyZmPAt8'
    };
    
    document.getElementById('mapIframeCode').value = mapSettings.iframeCode;
    document.getElementById('mapDirectionsUrl').value = mapSettings.directionsUrl;
}

function saveMapSettings() {
    const mapSettings = {
        iframeCode: document.getElementById('mapIframeCode').value,
        directionsUrl: document.getElementById('mapDirectionsUrl').value
    };
    
    localStorage.setItem('mapSettings', JSON.stringify(mapSettings));
    
    // Update map on the main website
    updateMainWebsiteMap();
}

function updateMapPreview() {
    const mapPreviewContainer = document.getElementById('mapPreviewContainer');
    const iframeCode = document.getElementById('mapIframeCode').value;
    
    if (iframeCode && iframeCode.trim() !== '') {
        // Insert the iframe code directly
        mapPreviewContainer.innerHTML = iframeCode;
    } else {
        mapPreviewContainer.innerHTML = `<p>Enter an iframe code to see the preview.</p>`;
    }
}

function updateMainWebsiteMap() {
    // This function would update the map on the main website
    // For the current implementation, the main website will read the localStorage values
    console.log('Map settings updated for main website');
}

// Helper function to show notifications (copy from admin.js)
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