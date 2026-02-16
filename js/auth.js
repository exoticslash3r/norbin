const Auth = {
    currentUser: null,
    currentUserData: null,

    init: function() {
        firebase.auth().onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                await this.loadUserData();
            } else {
                this.currentUserData = null;
            }
            this.updateUI();
            if (window.Pastes) {
                Pastes.loadPaginationData();
                Pastes.loadPinnedPastes();
            }
        });
    },

    loadUserData: async function() {
        if (!this.currentUser) return;
        try {
            const doc = await db.collection('users').doc(this.currentUser.uid).get();
            if (doc.exists) {
                this.currentUserData = doc.data();
                
                if (this.currentUserData.timeoutUntil) {
                    const timeoutUntil = this.currentUserData.timeoutUntil.toDate();
                    if (timeoutUntil > new Date()) {
                        if (window.Admin) {
                            Admin.showTimeoutNotification(timeoutUntil);
                        }
                    }
                }
                
                if (this.currentUserData.isBanned) {
                    Utils.showAlert('Your account has been banned', 'error');
                    this.signOut();
                }
            } else {
                // Create user document if it doesn't exist
                const ownerEmail = 'exoticslash3r@gmail.com';
                const isOwner = this.currentUser.email === ownerEmail;
                
                const userData = {
                    email: this.currentUser.email,
                    username: this.currentUser.email.split('@')[0],
                    displayName: this.currentUser.email.split('@')[0],
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
                    followers: [],
                    following: [],
                    pasteCount: 0
                };
                
                await db.collection('users').doc(this.currentUser.uid).set(userData);
                this.currentUserData = userData;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    signIn: async function() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (!email || !password) {
            Utils.showAlert('Please enter email and password', 'error');
            return;
        }

        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            this.currentUser = result.user;
            await this.loadUserData();
            Utils.showAlert('Signed in successfully', 'success');
            Utils.showPage('home');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    signUp: async function() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (!email || !password) {
            Utils.showAlert('Please enter email and password', 'error');
            return;
        }

        if (password.length < 6) {
            Utils.showAlert('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            this.currentUser = result.user;

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
                followers: [],
                following: [],
                pasteCount: 0
            };

            await db.collection('users').doc(this.currentUser.uid).set(userData);
            this.currentUserData = userData;
            Utils.showAlert('Account created', 'success');
            Utils.showPage('home');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    signOut: function() {
        firebase.auth().signOut().then(() => {
            this.currentUser = null;
            this.currentUserData = null;
            Utils.showAlert('Signed out', 'success');
            Utils.showPage('home');
        }).catch((error) => {
            Utils.showAlert(error.message, 'error');
        });
    },

    updateUI: function() {
        const authBtn = document.getElementById('authBtn');
        const myAccountBtn = document.getElementById('myAccountBtn');
        const adminBtn = document.getElementById('adminBtn');
        const vipBtn = document.getElementById('vipBtn');
        const tagMakerBtn = document.getElementById('tagMakerBtn');
        const usernameDisplay = document.getElementById('usernameDisplay');

        if (this.currentUser && this.currentUserData) {
            authBtn.textContent = 'Sign Out';
            authBtn.onclick = () => this.signOut();
            myAccountBtn.classList.remove('hidden');

            const displayName = this.currentUserData.displayName || this.currentUserData.username || this.currentUser.email.split('@')[0];
            usernameDisplay.textContent = displayName;
            usernameDisplay.style.color = this.currentUserData.usernameColor || '#ffffff';

            if (this.currentUserData.isOwner) {
                usernameDisplay.className = 'username-display owner-glow';
            } else if (this.currentUserData.isVIP) {
                usernameDisplay.className = 'username-display vip-glow';
            } else {
                usernameDisplay.className = 'username-display';
            }

            if (this.currentUserData.isAdmin || this.currentUserData.isManager || this.currentUserData.isOwner) {
                adminBtn.classList.remove('hidden');
            } else {
                adminBtn.classList.add('hidden');
            }

            if (this.currentUserData.isVIP || this.currentUserData.isOwner) {
                vipBtn.classList.remove('hidden');
            } else {
                vipBtn.classList.add('hidden');
            }

            if (this.currentUserData.isTagMaker || this.currentUserData.isManager || this.currentUserData.isAdmin || this.currentUserData.isOwner) {
                tagMakerBtn.classList.remove('hidden');
            } else {
                tagMakerBtn.classList.add('hidden');
            }
        } else {
            authBtn.textContent = 'Sign In';
            authBtn.onclick = () => Utils.showPage('auth');
            myAccountBtn.classList.add('hidden');
            adminBtn.classList.add('hidden');
            vipBtn.classList.add('hidden');
            tagMakerBtn.classList.add('hidden');
            usernameDisplay.textContent = '';
            usernameDisplay.className = 'username-display';
        }
    },

    checkRole: async function(role) {
        if (!this.currentUser || !this.currentUserData) return false;
        
        switch(role) {
            case 'admin': return this.currentUserData.isAdmin || this.currentUserData.isOwner;
            case 'manager': return this.currentUserData.isManager || this.currentUserData.isAdmin || this.currentUserData.isOwner;
            case 'vip': return this.currentUserData.isVIP || this.currentUserData.isAdmin || this.currentUserData.isOwner;
            case 'tagmaker': return this.currentUserData.isTagMaker || this.currentUserData.isManager || this.currentUserData.isAdmin || this.currentUserData.isOwner;
            case 'owner': return this.currentUserData.isOwner;
            default: return false;
        }
    },

    getCurrentUser: function() {
        return this.currentUser;
    },

    getCurrentUserData: function() {
        return this.currentUserData;
    }
};

window.Auth = Auth;
