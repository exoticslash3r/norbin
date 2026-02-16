const Utils = {
    showAlert: function(message, type = 'info') {
        const container = document.getElementById('alert-container');
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
        document.getElementById('slideDownMenu').classList.toggle('active');
    },

    hideMenu: function() {
        document.getElementById('slideDownMenu').classList.remove('active');
    },

    showPage: function(pageId) {
        this.hideMenu();
        document.querySelectorAll('[id$="-page"]').forEach(page => page.classList.add('hidden'));
        document.getElementById(pageId + '-page').classList.remove('hidden');
        
        if (pageId === 'chat' && window.Chat) {
            Chat.loadMessages();
        }
        if (pageId === 'hall' && window.Hall) {
            Hall.initialize();
        }
        if (pageId === 'admin' && window.Admin && Auth.getCurrentUser()) {
            Admin.loadAdminStats();
        }
        if (pageId === 'vip' && window.VIP) {
            VIP.loadFeatures();
        }
        if (pageId === 'tagMaker' && window.Tags) {
            Tags.loadTags();
        }
        if (pageId === 'myaccount' && window.Profile) {
            Profile.loadUserProfileData();
        }
    },

    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.Utils = Utils;
