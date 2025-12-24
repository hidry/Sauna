/**
 * Sauna Controller - Custom UI Enhancements
 * Adds visual improvements and interactive features
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('🔥 Sauna UI Enhancement loaded');

    // Apply enhancements
    enhanceGroups();
    enhanceTemperatureDisplays();
    enhanceButtons();
    enhanceAlerts();
    addLoadingStates();
    addTouchOptimizations();
    addVisualFeedback();

    // Re-enhance on dynamic updates
    observeDOMChanges();
  }

  /**
   * Enhance group cards with better structure
   */
  function enhanceGroups() {
    // ESPHome v3 uses web components, let's enhance them
    const groups = {
      'sauna': 'Sauna',
      'verdampfer': 'Verdampfer',
      'infrarot': 'Infrarot',
      'beleuchtung': 'Beleuchtung',
      'statistik': 'Statistik',
      'system': 'System'
    };

    // Try to find and enhance group containers
    Object.entries(groups).forEach(([groupId, groupName]) => {
      const elements = document.querySelectorAll(`[id*="${groupId}"], [class*="${groupId}"]`);
      elements.forEach(el => {
        if (!el.classList.contains('enhanced')) {
          el.classList.add('card', 'enhanced');
          el.setAttribute('data-group', groupId);
        }
      });
    });
  }

  /**
   * Enhance temperature displays with visual effects
   */
  function enhanceTemperatureDisplays() {
    // Find all sensor values that might be temperatures
    const tempSelectors = [
      '[id*="temperatur"]',
      '[class*="temperature"]',
      '[data-type="sensor"]'
    ];

    tempSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent || '';

        // Check if it contains temperature (°C)
        if (text.includes('°C') || text.includes('°')) {
          const valueSpan = el.querySelector('.value') || el;
          if (valueSpan) {
            valueSpan.setAttribute('data-type', 'temperature');

            // Add temperature indicator icon
            if (!el.querySelector('.temp-icon')) {
              const icon = document.createElement('span');
              icon.className = 'temp-icon';
              icon.innerHTML = '🌡️';
              icon.style.marginRight = '8px';
              valueSpan.insertBefore(icon, valueSpan.firstChild);
            }
          }

          // Add visual temperature gradient based on value
          const tempMatch = text.match(/(\d+\.?\d*)/);
          if (tempMatch) {
            const temp = parseFloat(tempMatch[1]);
            applyTemperatureGradient(el, temp);
          }
        }

        // Check for humidity (%)
        if (text.includes('%') && (text.includes('ucht') || text.includes('umidity'))) {
          const valueSpan = el.querySelector('.value') || el;
          if (valueSpan) {
            valueSpan.setAttribute('data-type', 'humidity');

            // Add humidity indicator icon
            if (!el.querySelector('.humid-icon')) {
              const icon = document.createElement('span');
              icon.className = 'humid-icon';
              icon.innerHTML = '💧';
              icon.style.marginRight = '8px';
              valueSpan.insertBefore(icon, valueSpan.firstChild);
            }
          }
        }
      });
    });
  }

  /**
   * Apply temperature-based color gradient
   */
  function applyTemperatureGradient(element, temp) {
    let color = '#B8B8B8'; // default

    if (temp < 20) {
      color = '#4A90E2'; // cold - blue
    } else if (temp < 40) {
      color = '#27AE60'; // moderate - green
    } else if (temp < 60) {
      color = '#FFC857'; // warm - yellow
    } else if (temp < 80) {
      color = '#FFB84D'; // hot - orange
    } else {
      color = '#FF6B35'; // very hot - red
    }

    const valueEl = element.querySelector('[data-type="temperature"]');
    if (valueEl && !valueEl.style.color) {
      valueEl.style.color = color;
      valueEl.style.textShadow = `0 0 10px ${color}40`;
    }
  }

  /**
   * Enhance buttons with state classes
   */
  function enhanceButtons() {
    const buttons = document.querySelectorAll('button, [role="button"]');

    buttons.forEach(button => {
      // Add touch-friendly class
      if (!button.classList.contains('enhanced-btn')) {
        button.classList.add('enhanced-btn');

        // Add ripple effect on click
        button.addEventListener('click', createRipple);
      }

      // Detect ON/OFF state from text or class
      const text = button.textContent.toLowerCase();
      const isOn = text.includes('on') || text.includes('ein') || button.classList.contains('active');
      const isOff = text.includes('off') || text.includes('aus');

      if (isOn) {
        button.classList.add('state-on');
        button.classList.remove('state-off');
      } else if (isOff) {
        button.classList.add('state-off');
        button.classList.remove('state-on');
      }
    });
  }

  /**
   * Create ripple effect on button click
   */
  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple-animation 0.6s ease-out';

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  // Add ripple animation to stylesheet
  if (!document.getElementById('ripple-animation-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation-style';
    style.textContent = `
      @keyframes ripple-animation {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Enhance alert/warning displays
   */
  function enhanceAlerts() {
    // Look for binary sensors that might be warnings
    const warningKeywords = ['übertemperatur', 'notabschaltung', 'ausfall', 'alert', 'warning', 'danger'];

    document.querySelectorAll('[id], [class]').forEach(el => {
      const id = (el.id || '').toLowerCase();
      const className = (el.className || '').toLowerCase();
      const text = (el.textContent || '').toLowerCase();

      warningKeywords.forEach(keyword => {
        if (id.includes(keyword) || className.includes(keyword) || text.includes(keyword)) {
          // Check if it's showing "ON" or "true" state (alert active)
          const isActive = text.includes('on') || text.includes('true') || text.includes('aktiv');

          if (isActive) {
            if (!el.classList.contains('alert')) {
              const alertDiv = document.createElement('div');
              alertDiv.className = 'alert alert-danger';
              alertDiv.innerHTML = `⚠️ ${el.textContent}`;
              el.appendChild(alertDiv);
            }
          }
        }
      });
    });
  }

  /**
   * Add loading states to interactive elements
   */
  function addLoadingStates() {
    // Intercept form submissions and button clicks to show loading
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function(e) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
          submitBtn.classList.add('loading');
          setTimeout(() => submitBtn.classList.remove('loading'), 2000);
        }
      });
    });
  }

  /**
   * Add touch optimizations for mobile
   */
  function addTouchOptimizations() {
    // Ensure all interactive elements are touch-friendly (44x44px minimum)
    const interactive = document.querySelectorAll('button, a, input, select, [role="button"]');

    interactive.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        el.style.minWidth = '44px';
        el.style.minHeight = '44px';
        el.style.display = 'inline-flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
      }
    });

    // Add touch-specific event handlers
    if ('ontouchstart' in window) {
      document.body.classList.add('touch-device');

      // Disable hover effects on touch devices (prevent sticky hover)
      document.querySelectorAll('[hover]').forEach(el => {
        el.addEventListener('touchstart', function() {
          this.classList.add('touching');
        });
        el.addEventListener('touchend', function() {
          setTimeout(() => this.classList.remove('touching'), 300);
        });
      });
    }
  }

  /**
   * Add visual feedback for state changes
   */
  function addVisualFeedback() {
    // Monitor switches and show feedback
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
      input.addEventListener('change', function() {
        // Flash animation on change
        const parent = this.closest('.entity-row, .card');
        if (parent) {
          parent.style.animation = 'flash 0.3s ease';
          setTimeout(() => {
            parent.style.animation = '';
          }, 300);
        }
      });
    });

    // Add flash animation
    if (!document.getElementById('flash-animation-style')) {
      const style = document.createElement('style');
      style.id = 'flash-animation-style';
      style.textContent = `
        @keyframes flash {
          0%, 100% {
            background-color: inherit;
          }
          50% {
            background-color: rgba(255, 184, 77, 0.2);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Observe DOM changes to re-apply enhancements
   */
  function observeDOMChanges() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          // Re-enhance new nodes
          setTimeout(() => {
            enhanceTemperatureDisplays();
            enhanceButtons();
            enhanceAlerts();
          }, 100);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Add custom visualizations (could be expanded)
   */
  function addCustomVisualizations() {
    // Find temperature values and create gauges
    // This is a placeholder for future enhancements
    // Could add circular gauges, progress bars, etc.
  }

  /**
   * Format time displays (e.g., "Restzeit")
   */
  function formatTimers() {
    document.querySelectorAll('[id*="restzeit"], [class*="timer"]').forEach(el => {
      const text = el.textContent;
      const minutes = parseInt(text);

      if (!isNaN(minutes)) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
          el.innerHTML = `⏱️ ${hours}h ${mins}min`;
        } else {
          el.innerHTML = `⏱️ ${mins}min`;
        }
      }
    });
  }

  /**
   * Add connection status indicator
   */
  function addConnectionStatus() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'connection-status';
    statusDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      background: rgba(39, 174, 96, 0.9);
      color: white;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      z-index: 9999;
      display: none;
    `;
    statusDiv.textContent = '● Connected';
    document.body.appendChild(statusDiv);

    // Show/hide based on connection
    window.addEventListener('online', () => {
      statusDiv.style.background = 'rgba(39, 174, 96, 0.9)';
      statusDiv.textContent = '● Connected';
      statusDiv.style.display = 'block';
      setTimeout(() => statusDiv.style.display = 'none', 2000);
    });

    window.addEventListener('offline', () => {
      statusDiv.style.background = 'rgba(231, 76, 60, 0.9)';
      statusDiv.textContent = '● Disconnected';
      statusDiv.style.display = 'block';
    });
  }

  // Initialize connection status
  addConnectionStatus();
  formatTimers();

  // Periodically refresh enhancements (for real-time updates)
  setInterval(() => {
    enhanceTemperatureDisplays();
    formatTimers();
  }, 5000);

  console.log('✅ Sauna UI Enhancement complete');
})();
