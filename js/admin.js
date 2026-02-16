const Admin = {
    pinPaste: async function(pasteId, state) {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        try {
            await db.collection('pastes').doc(pasteId).update({ isPinned: state });
            Utils.showAlert(`Paste ${state ? 'pinned' : 'unpinned'}`, 'success');
            Pastes.loadPaginationData();
            Pastes.loadPinnedPastes();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    removePaste: async function(pasteId) {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        if (!confirm('Remove this paste?')) return;

        try {
            await db.collection('pastes').doc(pasteId).update({ isRemoved: true });
            Utils.showAlert('Paste removed', 'success');
            Pastes.closePasteDetail();
            Pastes.loadPaginationData();
            Pastes.loadPinnedPastes();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    banUser: async function(userId) {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        if (!confirm('Ban/unban this user?')) return;

        try {
            const userDoc = await db.collection('users').doc(userId).get();
            const isBanned = userDoc.data().isBanned || false;
            await db.collection('users').doc(userId).update({ isBanned: !isBanned });
            Utils.showAlert(`User ${isBanned ? 'unbanned' : 'banned'}`, 'success');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    timeoutUser: async function() {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        const emailOrId = document.getElementById('timeout-email').value.trim();
        const days = parseInt(document.getElementById('timeout-days').value) || 0;
        const hours = parseInt(document.getElementById('timeout-hours').value) || 0;
        const minutes = parseInt(document.getElementById('timeout-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('timeout-seconds').value) || 0;

        if (!emailOrId) {
            Utils.showAlert('Enter user email or ID', 'error');
            return;
        }

        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
            Utils.showAlert('Enter timeout duration', 'error');
            return;
        }

        try {
            let userId = emailOrId;
            if (emailOrId.includes('@')) {
                const usersSnapshot = await db.collection('users').where('email', '==', emailOrId).get();
                if (usersSnapshot.empty) {
                    Utils.showAlert('User not found', 'error');
                    return;
                }
                userId = usersSnapshot.docs[0].id;
            }

            const totalSeconds = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
            const timeoutUntil = new Date(Date.now() + (totalSeconds * 1000));

            await db.collection('users').doc(userId).update({
                timeoutUntil: firebase.firestore.Timestamp.fromDate(timeoutUntil)
            });

            Utils.showAlert(`User timed out for ${days}d ${hours}h ${minutes}m ${seconds}s`, 'success');
            this.hideTimeoutForm();

            const currentUser = Auth.getCurrentUser();
            if (userId === currentUser?.uid) {
                this.showTimeoutNotification(timeoutUntil);
            }
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    loadAdminStats: async function() {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showPage('home');
            return;
        }

        try {
            const usersSnap = await db.collection('users').get();
            const pastesSnap = await db.collection('pastes').where('isRemoved', '==', false).get();
            
            document.getElementById('totalUsers').textContent = usersSnap.size;
            document.getElementById('totalPastes').textContent = pastesSnap.size;
            document.getElementById('bannedUsers').textContent = usersSnap.docs.filter(d => d.data().isBanned).length;
            document.getElementById('pinnedPastes').textContent = pastesSnap.docs.filter(d => d.data().isPinned).length;
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    },

    viewAllUsers: async function() {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        try {
            const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
            const container = document.getElementById('admin-content');

            let html = '<h3 style="font-size: 1.2rem; margin-bottom: 1rem;">All Users:</h3><div class="pastes-grid">';

            for (const doc of snapshot.docs) {
                const user = doc.data();
                html += `
                    <div class="paste-card">
                        <div class="paste-username" onclick="Profile.showUserProfile('${doc.id}'); return false;">
                            ${Utils.sanitizeHTML(user.displayName || user.username || user.email?.split('@')[0] || 'Unknown')}
                            ${user.isBanned ? '<span class="badge badge-admin">BANNED</span>' : ''}
                            ${user.isAdmin ? '<span class="badge badge-admin">ADMIN</span>' : ''}
                            ${user.isManager ? '<span class="badge badge-manager">MANAGER</span>' : ''}
                            ${user.isVIP ? '<span class="badge badge-vip">VIP</span>' : ''}
                            ${user.isTagMaker ? '<span class="badge badge-tagmaker">TAG MAKER</span>' : ''}
                            ${user.isOwner ? '<span class="badge badge-owner">OWNER</span>' : ''}
                        </div>
                        <div class="paste-title">${Utils.sanitizeHTML(user.email || 'No email')}</div>
                        <div class="paste-views">
                            Joined: ${Utils.formatTime(user.createdAt?.toDate())}
                            ${user.timeoutUntil ? `<br>Timeout until: ${Utils.formatTime(user.timeoutUntil?.toDate())}` : ''}
                        </div>
                        <div class="btn-group mt-2">
                            <button class="btn btn-danger btn-small" onclick="Admin.banUser('${doc.id}'); return false;">
                                ${user.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button class="btn btn-danger btn-small" onclick="Admin.showTimeoutForm('${doc.id}'); return false;">Timeout</button>
                            ${user.timeoutUntil ? `<button class="btn btn-success btn-small" onclick="Admin.untimeoutUser('${doc.id}'); return false;">Un-timeout</button>` : ''}
                        </div>
                    </div>
                `;
            }

            html += '</div>';
            container.innerHTML = html;
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    untimeoutUser: async function(userId) {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) return;

        if (!confirm('Remove timeout?')) return;

        try {
            await db.collection('users').doc(userId).update({ timeoutUntil: null });
            Utils.showAlert('Timeout removed', 'success');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    showTimeoutForm: function(userId) {
        Utils.showPage('admin');
        document.getElementById('timeout-form').classList.remove('hidden');
        if (userId) {
            document.getElementById('timeout-email').value = userId;
        }
    },

    hideTimeoutForm: function() {
        document.getElementById('timeout-form').classList.add('hidden');
        document.getElementById('timeout-email').value = '';
        document.getElementById('timeout-days').value = '';
        document.getElementById('timeout-hours').value = '';
        document.getElementById('timeout-minutes').value = '';
        document.getElementById('timeout-seconds').value = '';
    },

    showTimeoutNotification: function(timeoutUntil) {
        const overlay = document.getElementById('timeout-overlay');
        const details = document.getElementById('timeout-details');

        const updateCountdown = () => {
            const now = new Date();
            const diff = timeoutUntil - now;

            if (diff <= 0) {
                overlay.classList.remove('active');
                clearInterval(window.timeoutInterval);
                location.reload();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            if (hours > 0) timeString += `${hours}h `;
            if (minutes > 0) timeString += `${minutes}m `;
            timeString += `${seconds}s`;

            details.textContent = `Time remaining: ${timeString}`;
            overlay.classList.add('active');
        };

        updateCountdown();
        if (window.timeoutInterval) clearInterval(window.timeoutInterval);
        window.timeoutInterval = setInterval(updateCountdown, 1000);
    },

    viewAllPastes: async function() {
        Utils.showAlert('Feature coming soon', 'info');
    },

    clearChat: async function() {
        if (!confirm('Clear all messages?')) return;
        Utils.showAlert('Feature coming soon', 'info');
    },

    backupData: function() {
        Utils.showAlert('Backup feature', 'info');
    },

    manageRoles: function() {
        this.viewAllUsers();
    }
};

window.Admin = Admin;
