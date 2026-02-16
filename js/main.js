document.addEventListener('DOMContentLoaded', () => {
    const app = firebase.initializeApp(window.FIREBASE_CONFIG);
    const chatApp = firebase.initializeApp(window.CHAT_CONFIG, "chat");

    window.db = app.firestore();
    window.chatDb = chatApp.firestore();

    Auth.init();

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
    document.getElementById('mostMentionedBtn').addEventListener('click', () => Utils.showPage('most-mentioned'));
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

    document.getElementById('sendChatBtn').addEventListener('click', () => {
        Utils.showAlert('Chat coming soon', 'info');
    });

    document.getElementById('signInBtn').addEventListener('click', () => Auth.signIn());
    document.getElementById('signUpBtn').addEventListener('click', () => Auth.signUp());

    document.getElementById('updateDisplayNameBtn').addEventListener('click', () => {
        Utils.showAlert('Profile features coming soon', 'info');
    });

    document.getElementById('updateBannerBtn').addEventListener('click', () => {
        Utils.showAlert('Profile features coming soon', 'info');
    });

    document.getElementById('updateProfileBtn').addEventListener('click', () => {
        Utils.showAlert('Profile features coming soon', 'info');
    });

    document.getElementById('updateColorBtn').addEventListener('click', () => {
        Utils.showAlert('VIP features coming soon', 'info');
    });

    document.getElementById('createTagBtn').addEventListener('click', () => {
        Utils.showAlert('Tag features coming soon', 'info');
    });

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

    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('paste');
    if (pasteId && /^[a-zA-Z0-9]{20,}$/.test(pasteId)) {
        Pastes.showPasteDetail(pasteId);
    }

    Utils.showPage('home');
});

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
window.updateDisplayName = () => Utils.showAlert('Profile features coming soon', 'info');
window.updateBanner = () => Utils.showAlert('Profile features coming soon', 'info');
window.updateProfilePicture = () => Utils.showAlert('Profile features coming soon', 'info');
window.updateUsernameColor = () => Utils.showAlert('VIP features coming soon', 'info');
window.createTag = () => Utils.showAlert('Tag features coming soon', 'info');
window.viewAllUsers = () => Admin.viewAllUsers();
window.viewAllPastes = () => Admin.viewAllPastes();
window.clearChat = () => Admin.clearChat();
window.backupData = () => Admin.backupData();
window.showTimeoutForm = () => Admin.showTimeoutForm();
window.manageRoles = () => Admin.manageRoles();
window.timeoutUser = () => Admin.timeoutUser();
window.hideTimeoutForm = () => Admin.hideTimeoutForm();
// Add these with your other event listeners
document.getElementById('updateColorBtn').addEventListener('click', () => VIP.updateUsernameColor());

// Update the showPage function to handle VIP page
const originalShowPage = Utils.showPage;
Utils.showPage = function(pageId) {
    originalShowPage(pageId);
    if (pageId === 'vip') {
        VIP.loadFeatures();
    }
};
