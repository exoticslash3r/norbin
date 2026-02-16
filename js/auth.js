// Authentication Module
const Auth = (function() {
    let currentUser = null;
    let currentUserData = null;

    async function init() {
        firebase.auth().onAuthStateChanged(async (user) => {
            currentUser = user;
            if (user) {
                await loadUserData();
            } else {
                currentUserData = null;
            }
            updateUI();
            Pastes.loadPaginationData();
            Pastes.loadPinnedPastes();
        });
    }

    async function loadUserData() {
        if (!currentUser) return;
        try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists) {
                currentUserData = doc.data();
                
                if (currentUserData.timeoutUntil) {
                    const timeoutUntil = currentUserData.timeoutUntil.toDate();
                    if (timeoutUntil > new Date()) {
                        showTimeoutNotification(timeoutUntil);
                    }
                }
                
                if (currentUserData.isBanned) {
                    Utils.showAlert('Your account has been banned', 'error');
                    signOut();
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async function signIn() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            currentUser = result.user;
            await loadUserData();
            Utils.showAlert('Signed in successfully', 'success');
            Utils.showPage('home');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    async function signUp() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            currentUser = result.user;

            const ownerEmail = 'exoticslash3r@gmail.com';
            const isOwner = email === ownerEmail;

            const userData = {
                email: email,
                username: email.split('@')[0],
                displayName: email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isBanned: false,
                isAdmin: isOwner,
                isManager: false,
                isVIP: false,
                isTagMaker: false,
                isOwner: isOwner,
                usernameColor: '#ffffff',
                bannerUrl: '',
                profileUrl: '',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                timeoutUntil: null,
                pasteCount: 0
            };

            await db.collection('users').doc(currentUser.uid).set(userData);
            currentUserData = userData;
            Utils.showAlert('Account created', 'success');
            Utils.showPage('home');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    function signOut() {
        firebase.auth().signOut();
        currentUser = null;
        currentUserData = null;
        Utils.showAlert('Signed out', 'success');
        Utils.showPage('home');
    }

    function updateUI() {
        const authBtn = document.getElementById('authBtn');
        const myAccountBtn = document.getElementById('myAccountBtn');
        const adminBtn = document.getElementById('adminBtn');
        const vipBtn = document.getElementById('vipBtn');
        const tagMakerBtn = document.getElementById('tagMakerBtn');
        const usernameDisplay = document.getElementById('usernameDisplay');

        if (currentUser && currentUserData) {
            authBtn.textContent = 'Sign Out';
            myAccountBtn.classList.remove('hidden');

            const displayName = currentUserData.displayName || currentUserData.username || currentUser.email.split('@')[0];
            usernameDisplay.textContent = displayName;
            usernameDisplay.style.color = currentUserData.usernameColor || '#ffffff';

            if (currentUserData.isOwner) {
                usernameDisplay.className = 'username-display owner-glow';
            } else if (currentUserData.isVIP) {
                usernameDisplay.className = 'username-display vip-glow';
            } else {
                usernameDisplay.className = 'username-display';
            }

            if (currentUserData.isAdmin || currentUserData.isManager || currentUserData.isOwner) {
                adminBtn.classList.remove('hidden');
            }
            if (currentUserData.isVIP || currentUserData.isOwner) {
                vipBtn.classList.remove('hidden');
            }
            if (currentUserData.isTagMaker || currentUserData.isManager || currentUserData.isAdmin || currentUserData.isOwner) {
                tagMakerBtn.classList.remove('hidden');
            }
        } else {
            authBtn.textContent = 'Sign In';
            myAccountBtn.classList.add('hidden');
            adminBtn.classList.add('hidden');
            vipBtn.classList.add('hidden');
            tagMakerBtn.classList.add('hidden');
            usernameDisplay.textContent = '';
        }
    }

    async function checkRole(role) {
        if (!currentUser || !currentUserData) return false;
        
        switch(role) {
            case 'admin': return currentUserData.isAdmin || currentUserData.isOwner;
            case 'manager': return currentUserData.isManager || currentUserData.isAdmin || currentUserData.isOwner;
            case 'vip': return currentUserData.isVIP || currentUserData.isAdmin || currentUserData.isOwner;
            case 'tagmaker': return currentUserData.isTagMaker || currentUserData.isManager || currentUserData.isAdmin || currentUserData.isOwner;
            case 'owner': return currentUserData.isOwner;
            default: return false;
        }
    }

    function getCurrentUser() {
        return currentUser;
    }

    function getCurrentUserData() {
        return currentUserData;
    }

    return {
        init,
        signIn,
        signUp,
        signOut,
        checkRole,
        getCurrentUser,
        getCurrentUserData
    };
})();
