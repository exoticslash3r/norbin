document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const app = firebase.initializeApp(window.FIREBASE_CONFIG);
    const chatApp = firebase.initializeApp(window.CHAT_CONFIG, "chat");

    window.db = app.firestore();
    window.chatDb = chatApp.firestore();

    // Initialize Auth
    Auth.init();

    // Event Listeners
    document.getElementById('hamburgerBtn').addEventListener('click', Utils.toggleMenu);
    document.getElementById('backFromPasteBtn').addEventListener('click', () => Pastes.closePasteDetail());
    document.getElementById('backFromRawBtn').addEventListener('click', () => Pastes.closeRawPaste());
    document.getElementById('backFromProfileBtn').addEventListener('click', () => Utils.showPage('home'));
    document.getElementById('copyRawBtn').addEventListener('click', () => Pastes.copyRawPaste());

    document.getElementById('authBtn').addEventListener('click', () => {
        if (Auth.getCurrentUser()) Auth.signOut();
        else Utils.showPage('auth');
    });

    document.getElementById('homeBtn').addEventListener('click', () => Utils.showPage('home'));
    document.getElementById('createPasteBtn').addEventListener('click', () => Utils.showPage('paste'));
    document.getElementById('chatBtn').addEventListener('click', () => Utils.showPage('chat'));
    document.getElementById('hallBtn').addEventListener('click', () => Utils.showPage('hall'));
    document.getElementById('myAccountBtn').addEventListener('click', () => Utils.showPage('myaccount'));
    document.getElementById('adminBtn').addEventListener('click', () => Utils.showPage('admin'));
    document.getElementById('tagMakerBtn').addEventListener('click', () => Utils.showPage('tagMaker'));
    document.getElementById('vipBtn').addEventListener('click', () => Utils.showPage('vip'));

    document.getElementById('searchBtn').addEventListener('click', () => Pastes.performSearch());
    document.getElementById('searchBar').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') Pastes.performSearch();
    });

    document.getElementById('publishPasteBtn').addEventListener('click', () => Pastes.publishPaste());
    document.getElementById('clearPasteBtn').addEventListener('click', () => {
        document.getElementById('paste-title').value = '';
        document.getElementById('paste-content').value = '';
        document.getElementById('verify-human').checked = false;
    });

    document.getElementById('sendChatBtn').addEventListener('click', () => Chat.sendMessage());
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') Chat.sendMessage();
    });

    document.getElementById('signInBtn').addEventListener('click', () => Auth.signIn());
    document.getElementById('signUpBtn').addEventListener('click', () => Auth.signUp());

    document.getElementById('updateDisplayNameBtn').addEventListener('click', () => Profile.updateDisplayName());
    document.getElementById('updateBannerBtn').addEventListener('click', () => Profile.updateBanner());
    document.getElementById('updateProfileBtn').addEventListener('click', () => Profile.updateProfilePicture());
    document.getElementById('updateColorBtn').addEventListener('click', () => VIP.updateUsernameColor());

    document.getElementById('createTagBtn').addEventListener('click', () => Tags.createTag());

    document.getElementById('viewAllUsersBtn').addEventListener('click', () => Admin.viewAllUsers());
    document.getElementById('viewAllPastesBtn').addEventListener('click', () => Admin.viewAllPastes());
    document.getElementById('clearChatBtn').addEventListener('click', () => Admin.clearChat());
    document.getElementById('backupDataBtn').addEventListener('click', () => Admin.backupData());
    document.getElementById('showTimeoutFormBtn').addEventListener('click', () => Admin.showTimeoutForm());
    document.getElementById('manageRolesBtn').addEventListener('click', () => Admin.manageRoles());
    document.getElementById('timeoutUserBtn').addEventListener('click', () => Admin.timeoutUser());
    document.getElementById('cancelTimeoutBtn').addEventListener('click', () => Admin.hideTimeoutForm());

    document.getElementById('prev-page-btn').addEventListener('click', () => Pastes.changePage(Pastes.currentPage - 1));
    document.getElementById('next-page-btn').addEventListener('click', () => Pastes.changePage(Pastes.currentPage + 1));

    document.addEventListener('click', (event) => {
        const menu = document.getElementById('slideDownMenu');
        const hamburger = document.getElementById('hamburgerBtn');
        if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
            menu.classList.remove('active');
        }
    });

    // Check for paste ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('paste');
    if (pasteId && /^[a-zA-Z0-9]{20,}$/.test(pasteId)) {
        setTimeout(() => {
            Pastes.showPasteDetail(pasteId);
        }, 1000);
    }

    Utils.showPage('home');
});

// Global functions for onclick events
window.toggleMenu = () => Utils.toggleMenu();
window.showPage = (pageId) => Utils.showPage(pageId);
window.publishPaste = () => Pastes.publishPaste();
window.clearPasteForm = () => {
    document.getElementById('paste-title').value = '';
    document.getElementById('paste-content').value = '';
    document.getElementById('verify-human').checked = false;
};
window.signIn = () => Auth.signIn();
window.signUp = () => Auth.signUp();
window.closePasteDetail = () => Pastes.closePasteDetail();
window.closeRawPaste = () => Pastes.closeRawPaste();
window.copyRawPaste = () => Pastes.copyRawPaste();
window.showPasteDetail = (pasteId) => Pastes.showPasteDetail(pasteId);
window.performSearch = () => Pastes.performSearch();
window.changePage = (page) => Pastes.changePage(page);
window.sendChatMessage = () => Chat.sendMessage();
window.updateDisplayName = () => Profile.updateDisplayName();
window.updateBanner = () => Profile.updateBanner();
window.updateProfilePicture = () => Profile.updateProfilePicture();
window.updateUsernameColor = () => VIP.updateUsernameColor();
window.createTag = () => Tags.createTag();
window.viewAllUsers = () => Admin.viewAllUsers();
window.viewAllPastes = () => Admin.viewAllPastes();
window.clearChat = () => Admin.clearChat();
window.backupData = () => Admin.backupData();
window.showTimeoutForm = () => Admin.showTimeoutForm();
window.manageRoles = () => Admin.manageRoles();
window.timeoutUser = () => Admin.timeoutUser();
window.hideTimeoutForm = () => Admin.hideTimeoutForm();
