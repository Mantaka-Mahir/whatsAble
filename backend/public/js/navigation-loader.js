// WhatsAble Navigation Loader System
// Provides smooth transitions and loading animations between pages

class NavigationLoader {
    constructor(options = {}) {
        this.options = {
            loaderSelector: '#pageLoader',
            contentSelector: '.page-content',
            loadingDelay: 200,
            fadeDelay: 300,
            ...options
        };

        this.loader = document.querySelector(this.options.loaderSelector);
        this.pageContent = document.querySelector(this.options.contentSelector);
        this.init();
    }

    init() {
        // Hide loader when page is loaded
        window.addEventListener('load', () => {
            this.hideLoader();
        });

        // Add navigation handlers
        this.attachNavigationHandlers();

        // Show page content with animation
        setTimeout(() => {
            if (this.pageContent) {
                this.pageContent.classList.add('loaded');
            }
        }, 100);

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.showLoader('Loading...');
        });
    }

    showLoader(text = 'Loading WhatsAble...') {
        if (!this.loader) return;

        const loaderText = this.loader.querySelector('.loader-text');
        if (loaderText) {
            loaderText.textContent = text;
        }

        this.loader.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideLoader() {
        if (!this.loader) return;

        setTimeout(() => {
            this.loader.classList.add('hidden');
            document.body.style.overflow = '';
        }, this.options.fadeDelay);
    }

    attachNavigationHandlers() {
        // Handle sidebar navigation
        this.attachLinkHandlers('.sidebar .nav-link[href^="/dashboard"]');

        // Handle navbar brand click
        this.attachLinkHandlers('.navbar-brand[href="/dashboard"]');

        // Handle quick action buttons and other dashboard links
        this.attachLinkHandlers('a[href^="/dashboard"]:not(.sidebar .nav-link):not(.navbar-brand)');
    }

    attachLinkHandlers(selector) {
        document.querySelectorAll(selector).forEach(link => {
            link.addEventListener('click', (e) => {
                // Skip if it's the same page
                if (this.isSamePage(link.href)) return;

                // Skip if it's an external link or has target="_blank"
                if (link.target === '_blank' || !link.href.includes(window.location.origin)) return;

                // Skip if it's a hash link
                if (link.href.includes('#')) return;

                e.preventDefault();
                this.navigateWithAnimation(link.href, this.getPageName(link.href));
            });
        });
    }

    isSamePage(url) {
        const currentPath = window.location.pathname;
        const newPath = new URL(url, window.location.origin).pathname;
        return currentPath === newPath;
    }

    getPageName(url) {
        const path = new URL(url, window.location.origin).pathname;

        if (path.includes('/users')) return 'Loading Customer Management...';
        if (path.includes('/messages')) return 'Loading Message Center...';
        if (path.includes('/send-message')) return 'Loading Send Message...';
        if (path.includes('/conversation')) return 'Loading Conversation...';
        if (path === '/dashboard' || path === '/dashboard/') return 'Loading Dashboard...';

        return 'Loading...';
    }

    navigateWithAnimation(url, loadingText) {
        // Show loading overlay
        this.showLoader(loadingText);

        // Add fade out effect to current content
        if (this.pageContent) {
            this.pageContent.style.opacity = '0.7';
            this.pageContent.style.transform = 'translateY(-10px)';
        }

        // Navigate after short delay for smooth animation
        setTimeout(() => {
            window.location.href = url;
        }, this.options.loadingDelay);
    }

    // Method to set button loading state
    setButtonLoading(button, loading = true) {
        if (!button) return;

        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;

            // Store original content
            if (!button.dataset.originalContent) {
                button.dataset.originalContent = button.innerHTML;
            }
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;

            // Restore original content
            if (button.dataset.originalContent) {
                button.innerHTML = button.dataset.originalContent;
            }
        }
    }

    // Method to handle form submissions with loading
    handleFormSubmission(form, loadingText = 'Processing...') {
        if (!form) return;

        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                this.setButtonLoading(submitBtn, true);
            }
            this.showLoader(loadingText);
        });
    }

    // Enhanced error handling
    showError(message, hideLoader = true) {
        if (hideLoader) {
            this.hideLoader();
        }

        // Create or update error toast
        this.showToast(message, 'error');
    }

    showSuccess(message, hideLoader = true) {
        if (hideLoader) {
            this.hideLoader();
        }

        // Create or update success toast
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white border-0 ${type === 'error' ? 'bg-danger' :
                type === 'success' ? 'bg-success' :
                    'bg-primary'
            }`;
        toast.setAttribute('role', 'alert');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Initialize and show toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: type === 'error' ? 5000 : 3000
        });
        bsToast.show();

        // Remove toast element after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we have the required elements
    if (document.querySelector('#pageLoader') && document.querySelector('.page-content')) {
        window.navLoader = new NavigationLoader();

        // Enhance existing window.alert and window.confirm
        const originalAlert = window.alert;
        window.alert = function (message) {
            if (window.navLoader) {
                window.navLoader.showError(message);
            } else {
                originalAlert(message);
            }
        };
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationLoader;
}
