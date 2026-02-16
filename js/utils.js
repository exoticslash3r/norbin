const Utils = {
    showAlert: function(message, type = 'info') {
        const container = document.getElementById('alert-container');
        if (!container) {
            console.error('Alert container not found');
            return;
        }
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        container.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    },

    sanitizeHTML: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatTime: function(date) {
        if (!date) return 'Unknown';
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },

    toggleMenu: function() {
        const menu = document.getElementById('slideDownMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    },

    hideMenu: function() {
        const menu = document.getElementById('slideDownMenu');
        if (menu) {
            menu.classList.remove('active');
        }
    },

    checkAdminAccess: async function() {
        const user = Auth.getCurrentUser();
        if (!user) return false;
        
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');
        
        return isAdmin || isManager || isOwner;
    },

    checkVIPAccess: async function() {
        const user = Auth.getCurrentUser();
        if (!user) return false;
        
        const isVip = await Auth.checkRole('vip');
        const isOwner = await Auth.checkRole('owner');
        
        return isVip || isOwner;
    },

    checkTagMakerAccess: async function() {
        const user = Auth.getCurrentUser();
        if (!user) return false;
        
        const isTagMaker = await Auth.checkRole('tagmaker');
        const isManager = await Auth.checkRole('manager');
        const isAdmin = await Auth.checkRole('admin');
        const isOwner = await Auth.checkRole('owner');
        
        return isTagMaker || isManager || isAdmin || isOwner;
    },

    showPage: async function(pageId) {
        console.log('Showing page:', pageId);
        this.hideMenu();
        
        // Special permission checks for protected pages
        if (pageId === 'admin') {
            const hasAccess = await this.checkAdminAccess();
            if (!hasAccess) {
                this.showAlert('Access denied: Admin privileges required', 'error');
                pageId = 'home';
            }
        }
        
        if (pageId === 'vip') {
            const hasAccess = await this.checkVIPAccess();
            if (!hasAccess) {
                this.showAlert('Access denied: VIP privileges required', 'error');
                pageId = 'home';
            }
        }
        
        if (pageId === 'tagMaker') {
            const hasAccess = await this.checkTagMakerAccess();
            if (!hasAccess) {
                this.showAlert('Access denied: Tag Maker privileges required', 'error');
                pageId = 'home';
            }
        }
        
        // Hide all pages
        document.querySelectorAll('[id$="-page"]').forEach(page => {
            page.classList.add('hidden');
        });
        
        // Show selected page
        const page = document.getElementById(pageId + '-page');
        if (page) {
            page.classList.remove('hidden');
            
            // Load page-specific data
            if (pageId === 'home') {
                if (window.Pastes) {
                    console.log('Loading home data');
                    Pastes.loadPaginationData();
                    Pastes.loadPinnedPastes();
                } else {
                    console.error('Pastes not loaded');
                }
            }
            else if (pageId === 'chat') {
                if (window.Chat) {
                    console.log('Loading chat');
                    Chat.loadMessages();
                } else {
                    console.error('Chat not loaded');
                }
            }
            else if (pageId === 'hall') {
                if (window.Hall) {
                    console.log('Loading hall of autism');
                    Hall.initialize();
                } else {
                    console.error('Hall not loaded');
                }
            }
            else if (pageId === 'admin') {
                if (window.Admin) {
                    console.log('Loading admin panel');
                    Admin.loadAdminStats();
                }
            }
            else if (pageId === 'vip') {
                if (window.VIP) {
                    console.log('Loading VIP features');
                    VIP.loadFeatures();
                }
            }
            else if (pageId === 'tagMaker') {
                if (window.Tags) {
                    console.log('Loading tag manager');
                    Tags.loadTags();
                }
            }
            else if (pageId === 'myaccount') {
                if (window.Profile) {
                    console.log('Loading my account');
                    Profile.loadUserProfileData();
                }
            }
        } else {
            console.error('Page not found:', pageId);
        }
    },

    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Make Utils globally available
window.Utils = Utils;
console.log('Utils loaded with security checks');
