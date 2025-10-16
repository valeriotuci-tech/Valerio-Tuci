// Main JavaScript file for the application

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all tooltips
  initTooltips();
  
  // Initialize all dropdowns
  initDropdowns();
  
  // Initialize all modals
  initModals();
  
  // Initialize all tabs
  initTabs();
  
  // Initialize form validations
  initFormValidations();
  
  // Initialize mobile menu toggle
  initMobileMenu();
  
  // Initialize file upload previews
  initFileUploads();
  
  // Initialize any maps if needed
  initMaps();
});

// Mobile menu toggle
function initMobileMenu() {
  const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !expanded);
      mobileMenu.classList.toggle('hidden');
      
      // Toggle between menu and close icon
      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }
}

// Dropdown menus
function initDropdowns() {
  const dropdownButtons = document.querySelectorAll('[data-dropdown-toggle]');
  
  dropdownButtons.forEach(button => {
    const dropdownId = button.getAttribute('data-dropdown-toggle');
    const dropdownMenu = document.getElementById(dropdownId);
    
    if (dropdownMenu) {
      // Toggle dropdown on button click
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });
      
      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !button.contains(e.target)) {
          dropdownMenu.classList.add('hidden');
        }
      });
    }
  });
}

// Modal dialogs
function initModals() {
  const modalButtons = document.querySelectorAll('[data-modal-toggle]');
  
  modalButtons.forEach(button => {
    const modalId = button.getAttribute('data-modal-toggle');
    const modal = document.getElementById(modalId);
    const closeButtons = modal ? modal.querySelectorAll('[data-modal-hide]') : [];
    
    if (modal) {
      // Open modal
      button.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      });
      
      // Close modal on X button click
      closeButtons.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
          modal.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        });
      });
      
      // Close modal on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        }
      });
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        }
      });
    }
  });
}

// Tabs
function initTabs() {
  const tabContainers = document.querySelectorAll('[data-tabs]');
  
  tabContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('[data-tab]');
    const tabPanes = container.querySelectorAll('[data-tab-content]');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Update active tab
        tabButtons.forEach(btn => {
          btn.classList.remove('tab-active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('tab-active');
        button.setAttribute('aria-selected', 'true');
        
        // Show corresponding tab content
        tabPanes.forEach(pane => {
          if (pane.getAttribute('data-tab-content') === tabId) {
            pane.classList.remove('hidden');
          } else {
            pane.classList.add('hidden');
          }
        });
      });
    });
  });
}

// Form validations
function initFormValidations() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Validate on blur
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
    });
    
    // Validate on submit
    form.addEventListener('submit', (e) => {
      let isValid = true;
      
      inputs.forEach(input => {
        if (!validateInput(input)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        // Focus on first invalid input
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  });
}

function validateInput(input) {
  const value = input.value.trim();
  const errorElement = input.nextElementSibling;
  let isValid = true;
  
  // Clear previous errors
  input.classList.remove('border-red-500', 'border-green-500');
  
  if (errorElement && errorElement.classList.contains('text-red-500')) {
    errorElement.textContent = '';
  }
  
  // Required validation
  if (input.required && !value) {
    showError(input, 'This field is required');
    return false;
  }
  
  // Email validation
  if (input.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showError(input, 'Please enter a valid email address');
      return false;
    }
  }
  
  // Password confirmation
  if (input.dataset.match) {
    const otherInput = document.getElementById(input.dataset.match);
    if (otherInput && value !== otherInput.value) {
      showError(input, 'Passwords do not match');
      return false;
    }
  }
  
  // Min length
  if (input.minLength && value.length < input.minLength) {
    showError(input, `Must be at least ${input.minLength} characters`);
    return false;
  }
  
  // If all validations pass
  if (isValid) {
    input.classList.add('border-green-500');
  }
  
  return isValid;
}

function showError(input, message) {
  input.classList.add('border-red-500');
  
  let errorElement = input.nextElementSibling;
  
  if (!errorElement || !errorElement.classList.contains('text-red-500')) {
    errorElement = document.createElement('p');
    errorElement.className = 'mt-1 text-sm text-red-500';
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }
  
  errorElement.textContent = message;
  input.focus();
}

// File upload preview
function initFileUploads() {
  const fileInputs = document.querySelectorAll('input[type="file"][data-preview]');
  
  fileInputs.forEach(input => {
    const previewId = input.getAttribute('data-preview');
    const previewElement = document.getElementById(previewId);
    
    if (previewElement) {
      input.addEventListener('change', function(e) {
        const file = this.files[0];
        
        if (file) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            if (file.type.startsWith('image/')) {
              previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" class="max-w-full h-auto">`;
            } else {
              previewElement.textContent = `Selected file: ${file.name}`;
            }
          };
          
          reader.readAsDataURL(file);
        } else {
          previewElement.innerHTML = '';
        }
      });
    }
  });
}

// Tooltips
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(element => {
    const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    const tooltipText = element.getAttribute('data-tooltip');
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = tooltipId;
    tooltip.className = 'invisible absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300';
    tooltip.textContent = tooltipText;
    
    // Position tooltip
    element.style.position = 'relative';
    element.appendChild(tooltip);
    
    // Show/hide tooltip on hover
    element.addEventListener('mouseenter', () => {
      tooltip.classList.remove('invisible', 'opacity-0');
    });
    
    element.addEventListener('mouseleave', () => {
      tooltip.classList.add('invisible', 'opacity-0');
    });
  });
}

// Initialize maps (example with Google Maps)
function initMaps() {
  const mapElements = document.querySelectorAll('[data-map]');
  
  if (window.google && window.google.maps) {
    mapElements.forEach(element => {
      const lat = parseFloat(element.getAttribute('data-lat'));
      const lng = parseFloat(element.getAttribute('data-lng'));
      const zoom = parseInt(element.getAttribute('data-zoom')) || 14;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const map = new google.maps.Map(element, {
          center: { lat, lng },
          zoom: zoom
        });
        
        new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: 'Property Location'
        });
      }
    });
  }
}

// Toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const types = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  toast.className = `fixed right-4 bottom-4 px-6 py-3 rounded-md shadow-lg text-white font-medium z-50 transform transition-all duration-300 translate-x-full ${types[type] || types.info}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Trigger reflow to enable animation
  toast.offsetHeight;
  
  // Slide in
  toast.classList.remove('translate-x-full');
  toast.classList.add('translate-x-0');
  
  // Auto remove after delay
  setTimeout(() => {
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-full');
    
    // Remove from DOM after animation
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000);
}

// Export functions to be used in other files
window.app = {
  showToast,
  validateInput,
  // Add other functions you want to expose
};
