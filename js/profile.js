// Profile Module
const Profile = (function() {
    async function showUserProfile(userId) {
        Utils.showPage('userProfile');

        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                document.getElementById('user-profile-page').innerHTML = `
                    <button class="back-btn" onclick="Utils.showPage('home'); return false;">← Back</button>
                    <div style="text-align: center; padding: 3rem;"><h2>User not found</h2></div>
                `;
                return;
            }

            const userData = userDoc.data();

            const banner = document.getElementById('profile-banner');
            banner.style.backgroundImage = userData.bannerUrl ? `url('${Utils.sanitizeHTML(userData.bannerUrl)}')` : '';
            banner.style.backgroundColor = 'var(--bg-color)';

            const avatar = document.getElementById('profile-avatar');
            avatar.style.backgroundImage = userData.profileUrl ? `url('${Utils.sanitizeHTML(userData.profileUrl)}')` : '';
            avatar.style.backgroundColor = 'var(--bg-color)';

            const username = document.getElementById('profile-username');
            username.textContent = userData.displayName || userData.username || 'Anonymous';
            username.style.color = userData.usernameColor || '#ffffff';

            if (userData.isOwner) username.className = 'profile-username owner-glow';
            else if (userData.isVIP) username.className = 'profile-username vip-glow';
            else username.className = 'profile-username';

            const badges = document.getElementById('profile-badges');
            badges.innerHTML = '';
            if (userData.isBanned) badges.innerHTML += '<span class="badge badge-admin">BANNED</span>';
            if (userData.isOwner) badges.innerHTML += '<span class="badge badge-owner">Owner</span>';
            if (userData.isAdmin) badges.innerHTML += '<span class="badge badge-admin">Admin</span>';
            if (userData.isManager) badges.innerHTML += '<span class="badge badge-manager">Manager</span>';
            if (userData.isVIP) badges.innerHTML += '<span class="badge badge-vip">VIP</span>';
            if (userData.isTagMaker) badges.innerHTML += '<span class="badge badge-tagmaker">Tag Maker</span>';

            document.getElementById('profile-paste-count').textContent = userData.pasteCount || 0;
            document.getElementById('profile-follows-count').textContent = userData.followers?.length || 0;
            document.getElementById('profile-following-count').textContent = userData.following?.length || 0;

            await loadUserPastes(userId);
        } catch (error) {
            console.error('Error loading user profile:', error);
            Utils.showAlert('Error loading profile', 'error');
        }
    }

    async function loadUserPastes(userId) {
        try {
            const snapshot = await db.collection('pastes')
                .where('userId', '==', userId)
                .where('isRemoved', '==', false)
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();

            const container = document.getElementById('user-pastes-container');
            container.innerHTML = '';

            if (snapshot.empty) {
                container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #888;">No pastes yet</div>';
                return;
            }

            const processedIds = new Set();

            snapshot.forEach(doc => {
                const pasteId = doc.id;
                if (processedIds.has(pasteId)) return;
                processedIds.add(pasteId);
                
                const paste = doc.data();
                const pasteCard = document.createElement('div');
                pasteCard.className = 'user-paste-card';
                pasteCard.onclick = function() { Pastes.showPasteDetail(pasteId); };
                pasteCard.innerHTML = `
                    <div class="user-paste-title">${Utils.sanitizeHTML(paste.title)}</div>
                    <div style="color: #888; font-size: 0.9rem; margin: 0.5rem 0; max-height: 60px; overflow: hidden;">
                        ${Utils.sanitizeHTML(paste.content.substring(0, 100))}${paste.content.length > 100 ? '...' : ''}
                    </div>
                    <div class="user-paste-meta">
                        <span>${paste.views || 0} views</span>
                        <span>${Utils.formatTime(paste.timestamp?.toDate())}</span>
                    </div>
                `;
                container.appendChild(pasteCard);
            });
        } catch (error) {
            console.error('Error loading user pastes:', error);
        }
    }

    async function loadUserProfileData() {
        const currentUser = Auth.getCurrentUser();
        const currentUserData = Auth.getCurrentUserData();

        if (!currentUser) return;

        try {
            document.getElementById('display-name').value = currentUserData?.displayName || '';
            document.getElementById('banner-url').value = currentUserData?.bannerUrl || '';
            document.getElementById('profile-url').value = currentUserData?.profileUrl || '';

            if (currentUserData?.bannerUrl) {
                document.getElementById('profile-banner-img').style.backgroundImage = `url('${Utils.sanitizeHTML(currentUserData.bannerUrl)}')`;
            }
            if (currentUserData?.profileUrl) {
                document.getElementById('profile-picture-img').style.backgroundImage = `url('${Utils.sanitizeHTML(currentUserData.profileUrl)}')`;
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }

    async function updateDisplayName() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        const displayName = document.getElementById('display-name').value.trim();
        if (!displayName) {
            Utils.showAlert('Enter a display name', 'error');
            return;
        }

        try {
            await db.collection('users').doc(currentUser.uid).update({
                displayName: Utils.sanitizeHTML(displayName)
            });
            Utils.showAlert('Display name updated', 'success');
            Auth.updateUI();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    async function updateBanner() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        const bannerUrl = document.getElementById('banner-url').value.trim();
        if (!bannerUrl) {
            Utils.showAlert('Enter a banner URL', 'error');
            return;
        }

        try {
            await db.collection('users').doc(currentUser.uid).update({
                bannerUrl: Utils.sanitizeHTML(bannerUrl)
            });
            Utils.showAlert('Banner updated', 'success');
            document.getElementById('profile-banner-img').style.backgroundImage = `url('${Utils.sanitizeHTML(bannerUrl)}')`;
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    async function updateProfilePicture() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        const profileUrl = document.getElementById('profile-url').value.trim();
        if (!profileUrl) {
            Utils.showAlert('Enter a profile picture URL', 'error');
            return;
        }

        try {
            await db.collection('users').doc(currentUser.uid).update({
                profileUrl: Utils.sanitizeHTML(profileUrl)
            });
            Utils.showAlert('Profile picture updated', 'success');
            document.getElementById('profile-picture-img').style.backgroundImage = `url('${Utils.sanitizeHTML(profileUrl)}')`;
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    async function updateUsernameColor() {
        const currentUser = Auth.getCurrentUser();
        const isVip = await Auth.checkRole('vip');
        const isOwner = await Auth.checkRole('owner');

        if (!currentUser || (!isVip && !isOwner)) return;

        const color = document.getElementById('username-color').value;

        try {
            await db.collection('users').doc(currentUser.uid).update({
                usernameColor: color
            });
            Utils.showAlert('Color updated', 'success');
            Auth.updateUI();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    return {
        showUserProfile,
        loadUserProfileData,
        updateDisplayName,
        updateBanner,
        updateProfilePicture,
        updateUsernameColor
    };
})();
