showPage: function(pageId) {
    this.hideMenu();
    document.querySelectorAll('[id$="-page"]').forEach(page => page.classList.add('hidden'));
    const page = document.getElementById(pageId + '-page');
    if (page) {
        page.classList.remove('hidden');
        
        // Load page-specific data
        if (pageId === 'home') {
            if (window.Pastes) {
                Pastes.loadPaginationData();
                Pastes.loadPinnedPastes();
            }
        }
        if (pageId === 'chat' && window.Chat) {
            Chat.loadMessages();
        }
        if (pageId === 'hall' && window.Hall) {
            console.log('Showing Hall page');
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
    }
},
