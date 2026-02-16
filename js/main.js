// Main initialization file
document.addEventListener('DOMContentLoaded', () => {
    console.log('Norbin starting...');
    
    try {
        // Initialize Firebase
        const app = firebase.initializeApp(window.FIREBASE_CONFIG);
        const chatApp = firebase.initializeApp(window.CHAT_CONFIG, "chat");

        window.db = app.firestore();
        window.chatDb = chatApp.firestore();
        
        console.log('Firebase initialized');

        // Initialize Auth
        if (window.Auth) {
            Auth.init();
            console.log('Auth initialized');
        } else {
            console.error('Auth not loaded');
        }

        // Set up all event listeners
        setupEventListeners();

        // Check for paste ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const pasteId = urlParams.get('paste');
        if (pasteId) {
            console.log('Found paste in URL:', pasteId);
            setTimeout(() => {
                if (window.Pastes) {
                    Pastes.showPasteDetail(pasteId);
                } else {
                    console.error('Pastes not loaded');
                }
            }, 2000);
        }

        // Show home page by default
        if (window.Utils) {
            Utils.showPage('home');
        }
        
        console.log('Norbin ready');
        
    } catch (error) {
        console.error('Initialization error:', error);
        if (window.Utils) {
            Utils.showAlert('Failed to initialize: ' + error.message, 'error');
        }
    }
});

async function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Navigation
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Utils) {
                Utils.toggleMenu();
            }
        });
    }

    const backFromPasteBtn = document.getElementById('backFromPasteBtn');
    if (backFromPasteBtn) {
        backFromPasteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Pastes) {
                Pastes.closePasteDetail();
            }
        });
    }

    const backFromRawBtn = document.getElementById('backFromRawBtn');
    if (backFromRawBtn) {
        backFromRawBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Pastes) {
                Pastes.closeRawPaste();
            }
        });
    }

    const backFromProfileBtn = document.getElementById('backFromProfileBtn');
    if (backFromProfileBtn) {
        backFromProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Utils) {
                Utils.showPage('home');
            }
        });
    }

    const copyRawBtn = document.getElementById('copyRawBtn');
    if (copyRawBtn) {
        copyRawBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Pastes) {
                Pastes.copyRawPaste();
            }
        });
    }

    // Auth button
    const authBtn = document.getElementById('authBtn');
    if (authBtn) {
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Auth) {
                if (Auth.getCurrentUser()) {
                    Auth.signOut();
                } else {
                    if (window.Utils) {
                        Utils.showPage('auth');
                    }
                }
            }
        });
    }

    // Menu buttons with permission checks
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Utils) {
                Utils.showPage('home');
            }
        });
    }

    const createPasteBtn = document.getElementById('createPasteBtn');
    if (createPasteBtn) {
        createPasteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Utils) {
                Utils.showPage('paste');
            }
        });
    }

    const chatBtn = document.getElementById('chatBtn');
    if (chatBtn) {
        chatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Utils) {
                Utils.showPage('chat');
            }
        });
    }

    const hallBtn = document.getElementById('hallBtn');
    if (hallBtn) {
        hallBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Utils) {
                Utils.showPage('hall');
            }
        });
    }

    const myAccountBtn = document.getElementById('myAccountBtn');
    if (myAccountBtn) {
        myAccountBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Utils) {
                Utils.showPage('myaccount');
            }
        });
    }

    // Protected pages with permission checks
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.Utils) {
                const hasAccess = await Utils.checkAdminAccess();
                if (hasAccess) {
                    Utils.showPage('admin');
                } else {
                    Utils.showAlert('Access denied: Admin privileges required', 'error');
                }
            }
        });
    }

    const vipBtn = document.getElementById('vipBtn');
    if (vipBtn) {
        vipBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.Utils) {
                const hasAccess = await Utils.checkVIPAccess();
                if (hasAccess) {
                    Utils.showPage('vip');
                } else {
                    Utils.showAlert('Access denied: VIP privileges required', 'error');
                }
            }
        });
    }

    const tagMakerBtn = document.getElementById('tagMakerBtn');
    if (tagMakerBtn) {
        tagMakerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.Utils) {
                const hasAccess = await Utils.checkTagMakerAccess();
                if (hasAccess) {
                    Utils.showPage('tagMaker');
                } else {
                    Utils.showAlert('Access denied: Tag Maker privileges required', 'error');
                }
            }
        });
    }

    // Search
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Pastes) {
                Pastes.performSearch();
            }
        });
    }

    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (window.Pastes) {
                    Pastes.performSearch();
                }
            }
        });
    }

    // Paste creation
    const publishPasteBtn = document.getElementById('publishPasteBtn');
    if (publishPasteBtn) {
        publishPasteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Pastes) {
                Pastes.publishPaste();
            }
        });
    }

    const clearPasteBtn = document.getElementById('clearPasteBtn');
    if (clearPasteBtn) {
        clearPasteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('paste-title').value = '';
            document.getElementById('paste-content').value = '';
            document.getElementById('verify-human').checked = false;
        });
    }

    // Chat
    const sendChatBtn = document.getElementById('sendChatBtn');
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Chat) {
                Chat.sendMessage();
            }
        });
    }

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (window.Chat) {
                    Chat.sendMessage();
                }
            }
        });
    }

    // Auth
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
        signInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Auth) {
                Auth.signIn();
            }
        });
    }

    const signUpBtn = document.getElementById('signUpBtn');
    if (signUpBtn) {
        signUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Auth) {
                Auth.signUp();
            }
        });
    }

    // Profile
    const updateDisplayNameBtn = document.getElementById('updateDisplayNameBtn');
    if (updateDisplayNameBtn) {
        updateDisplayNameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Profile) {
                Profile.updateDisplayName();
            }
        });
    }

    const updateBannerBtn = document.getElementById('updateBannerBtn');
    if (updateBannerBtn) {
        updateBannerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Profile) {
                Profile.updateBanner();
            }
        });
    }

    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Profile) {
                Profile.updateProfilePicture();
            }
        });
    }

    // VIP
    const updateColorBtn = document.getElementById('updateColorBtn');
    if (updateColorBtn) {
        updateColorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.VIP) {
                VIP.updateUsernameColor();
            }
        });
    }

    // Tags
    const createTagBtn = document.getElementById('createTagBtn');
    if (createTagBtn) {
        createTagBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Tags) {
                Tags.createTag();
            }
        });
    }

    // Admin
    const viewAllUsersBtn = document.getElementById('viewAllUsersBtn');
    if (viewAllUsersBtn) {
        viewAllUsersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.viewAllUsers();
            }
        });
    }

    const viewAllPastesBtn = document.getElementById('viewAllPastesBtn');
    if (viewAllPastesBtn) {
        viewAllPastesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.viewAllPastes();
            }
        });
    }

    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.clearChat();
            }
        });
    }

    const backupDataBtn = document.getElementById('backupDataBtn');
    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.backupData();
            }
        });
    }

    const showTimeoutFormBtn = document.getElementById('showTimeoutFormBtn');
    if (showTimeoutFormBtn) {
        showTimeoutFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.showTimeoutForm();
            }
        });
    }

    const manageRolesBtn = document.getElementById('manageRolesBtn');
    if (manageRolesBtn) {
        manageRolesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.manageRoles();
            }
        });
    }

    const timeoutUserBtn = document.getElementById('timeoutUserBtn');
    if (timeoutUserBtn) {
        timeoutUserBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.timeoutUser();
            }
        });
    }

    const cancelTimeoutBtn = document.getElementById('cancelTimeoutBtn');
    if (cancelTimeoutBtn) {
        cancelTimeoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Admin) {
                Admin.hideTimeoutForm();
            }
        });
    }

    // Pagination
    const prevPageBtn = document.getElementById('prev-page-btn');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Pastes) {
                Pastes.changePage(Pastes.currentPage - 1);
            }
        });
    }

    const nextPageBtn = document.getElementById('next-page-btn');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Pastes) {
                Pastes.changePage(Pastes.currentPage + 1);
            }
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const menu = document.getElementById('slideDownMenu');
        const hamburger = document.getElementById('hamburgerBtn');
        if (menu && hamburger && !menu.contains(event.target) && !hamburger.contains(event.target)) {
            menu.classList.remove('active');
        }
    });

    console.log('Event listeners setup complete');
}

// Global functions for onclick events (backup for inline handlers)
window.toggleMenu = () => {
    if (window.Utils) {
        Utils.toggleMenu();
    }
};

window.showPage = async (pageId) => {
    if (window.Utils) {
        await Utils.showPage(pageId);
    }
};

window.publishPaste = () => {
    if (window.Pastes) {
        Pastes.publishPaste();
    }
};

window.clearPasteForm = () => {
    document.getElementById('paste-title').value = '';
    document.getElementById('paste-content').value = '';
    document.getElementById('verify-human').checked = false;
};

window.signIn = () => {
    if (window.Auth) {
        Auth.signIn();
    }
};

window.signUp = () => {
    if (window.Auth) {
        Auth.signUp();
    }
};

window.closePasteDetail = () => {
    if (window.Pastes) {
        Pastes.closePasteDetail();
    }
};

window.closeRawPaste = () => {
    if (window.Pastes) {
        Pastes.closeRawPaste();
    }
};

window.copyRawPaste = () => {
    if (window.Pastes) {
        Pastes.copyRawPaste();
    }
};

window.showPasteDetail = (pasteId) => {
    if (window.Pastes) {
        Pastes.showPasteDetail(pasteId);
    }
};

window.performSearch = () => {
    if (window.Pastes) {
        Pastes.performSearch();
    }
};

window.changePage = (page) => {
    if (window.Pastes) {
        Pastes.changePage(page);
    }
};

window.sendChatMessage = () => {
    if (window.Chat) {
        Chat.sendMessage();
    }
};

window.updateDisplayName = () => {
    if (window.Profile) {
        Profile.updateDisplayName();
    }
};

window.updateBanner = () => {
    if (window.Profile) {
        Profile.updateBanner();
    }
};

window.updateProfilePicture = () => {
    if (window.Profile) {
        Profile.updateProfilePicture();
    }
};

window.updateUsernameColor = () => {
    if (window.VIP) {
        VIP.updateUsernameColor();
    }
};

window.createTag = () => {
    if (window.Tags) {
        Tags.createTag();
    }
};

window.viewAllUsers = () => {
    if (window.Admin) {
        Admin.viewAllUsers();
    }
};

window.viewAllPastes = () => {
    if (window.Admin) {
        Admin.viewAllPastes();
    }
};

window.clearChat = () => {
    if (window.Admin) {
        Admin.clearChat();
    }
};

window.backupData = () => {
    if (window.Admin) {
        Admin.backupData();
    }
};

window.showTimeoutForm = () => {
    if (window.Admin) {
        Admin.showTimeoutForm();
    }
};

window.manageRoles = () => {
    if (window.Admin) {
        Admin.manageRoles();
    }
};

window.timeoutUser = () => {
    if (window.Admin) {
        Admin.timeoutUser();
    }
};

window.hideTimeoutForm = () => {
    if (window.Admin) {
        Admin.hideTimeoutForm();
    }
};

console.log('Main.js loaded with security');
