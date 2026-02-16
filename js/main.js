// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const app = firebase.initializeApp(window.FIREBASE_CONFIG);
    const chatApp = firebase.initializeApp({
        apiKey: window.FIREBASE_CONFIG.chatApiKey,
        authDomain: window.FIREBASE_CONFIG.chatAuthDomain,
        projectId: window.FIREBASE_CONFIG.chatProjectId,
        storageBucket: window.FIREBASE_CONFIG.chatStorageBucket,
        messagingSenderId: window.FIREBASE_CONFIG.chatMessagingSenderId,
        appId: window.FIREBASE_CONFIG.chatAppId
    }, "chat");

    window.db = app.firestore();
    window.chatDb = chatApp.firestore();

    // Initialize Auth
    Auth.init();

    // Event Listeners
    document.getElementById('hamburgerBtn').addEventListener('click', Utils.toggleMenu);
    document.getElementById('backFromPasteBtn').addEventListener('click', Pastes.closePasteDetail);
    document.getElementById('backFromRawBtn').addEventListener('click', Pastes.closeRawPaste);
    document.getElementById('backFromProfileBtn').addEventListener('click', () => Utils.showPage('home'));
    document.getElementById('copyRawBtn').addEventListener('click', Pastes.copyRawPaste);

    document.getElementById('authBtn').addEventListener('click', () => {
        if (Auth.getCurrentUser()) Auth.signOut();
        else Utils.showPage('auth');
    });

    document.getElementById('homeBtn').addEventListener('click', () => Utils.showPage('home'));
    document.getElementById('createPasteBtn').addEventListener('click', () => Utils.showPage('paste'));
    document.getElementById('chatBtn').addEventListener('click', () => Utils.showPage('chat'));
    document.getElementById('mostMentionedBtn').addEventListener('click', () => Utils.showPage('most-mentioned'));
    document.getElementById('hallBtn').addEventListener('click', () => Utils.showPage('hall'));
    document.getElementById('myAccountBtn').addEventListener('click', () => Utils.showPage('myaccount'));
    document.getElementById('adminBtn').addEventListener('click', () => Utils.showPage('admin'));
    document.getElementById('tagMakerBtn').addEventListener('click', () => Utils.showPage('tagMaker'));
    document.getElementById('vipBtn').addEventListener('click', () => Utils.showPage('vip'));

    document.getElementById('searchBtn').addEventListener('click', Pastes.performSearch);
    document.getElementById('searchBar').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') Pastes.performSearch();
    });

    document.getElementById('publishPasteBtn').addEventListener('click', Pastes.publishPaste);
    document.getElementById('clearPasteBtn').addEventListener('click', () => {
        document.getElementById('paste-title').value = '';
        document.getElementById('paste-content').value = '';
        document.getElementById('verify-human').checked = false;
    });

    document.getElementById('sendChatBtn').addEventListener('click', Chat.sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') Chat.sendChatMessage();
    });

    document.getElementById('signInBtn').addEventListener('click', Auth.signIn);
    document.getElementById('signUpBtn').addEventListener('click', Auth.signUp);

    document.getElementById('updateDisplayNameBtn').addEventListener('click', Profile.updateDisplayName);
    document.getElementById('updateBannerBtn').addEventListener('click', Profile.updateBanner);
    document.getElementById('updateProfileBtn').addEventListener('click', Profile.updateProfilePicture);
    document.getElementById('updateColorBtn').addEventListener('click', Profile.updateUsernameColor);

    document.getElementById('createTagBtn').addEventListener('click', Tags.createTag);

    document.getElementById('viewAllUsersBtn').addEventListener('click', Admin.viewAllUsers);
    document.getElementById('viewAllPastesBtn').addEventListener('click', () => {
        // Implement view all pastes
    });
    document.getElementById('clearChatBtn').addEventListener('click', () => {
        // Implement clear chat
    });
    document.getElementById('backupDataBtn').addEventListener('click', () => {
        Utils.showAlert('Backup feature', 'info');
    });
    document.getElementById('showTimeoutFormBtn').addEventListener('click', Admin.showTimeoutForm);
    document.getElementById('manageRolesBtn').addEventListener('click', Admin.viewAllUsers);
    document.getElementById('timeoutUserBtn').addEventListener('click', Admin.timeoutUser);
    document.getElementById('cancelTimeoutBtn').addEventListener('click', Admin.hideTimeoutForm);

    document.getElementById('prev-page-btn').addEventListener('click', () => {
        // Pagination handled in Pastes
    });
    document.getElementById('next-page-btn').addEventListener('click', () => {
        // Pagination handled in Pastes
    });

    document.addEventListener('click', (event) => {
        const menu = document.getElementById('slideDownMenu');
        const hamburger = document.getElementById('hamburgerBtn');
        if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
            menu.classList.remove('active');
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('paste');
    if (pasteId && /^[a-zA-Z0-9]{20,}$/.test(pasteId)) {
        Pastes.showPasteDetail(pasteId);
    }

    Utils.showPage('home');
});
