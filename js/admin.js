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
            this.viewAllUsers();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    makeVIP: async function(userId, makeVIP) {
        const isAdmin = await Auth.checkRole('admin');
        const isOwner = await Auth.checkRole('owner');
        const isManager = await Auth.checkRole('manager');

        if (!isAdmin && !isOwner && !isManager) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        if (!confirm(`${makeVIP ? 'Grant' : 'Remove'} VIP status?`)) return;

        try {
            await db.collection('users').doc(userId).update({ isVIP: makeVIP });
            Utils.showAlert(`VIP ${makeVIP ? 'granted' : 'removed'}`, 'success');
            this.viewAllUsers();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    makeManager: async function(userId, makeManager) {
        const isAdmin = await Auth.checkRole('admin');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        if (!confirm(`${makeManager ? 'Grant' : 'Remove'} manager status?`)) return;

        try {
            await db.collection('users').doc(userId).update({ isManager: makeManager });
            Utils.showAlert(`Manager ${makeManager ? 'granted' : 'removed'}`, 'success');
            this.viewAllUsers();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    makeAdmin: async function(userId, makeAdmin) {
        const isOwner = await Auth.checkRole('owner');

        if (!isOwner) {
            Utils.showAlert('Only owner can grant admin', 'error');
            return;
        }

        if (!confirm(`${makeAdmin ? 'Grant' : 'Remove'} admin status?`)) return;

        try {
            await db.collection('users').doc(userId).update({ isAdmin: makeAdmin });
            Utils.showAlert(`Admin ${makeAdmin ? 'granted' : 'removed'}`, 'success');
            this.viewAllUsers();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    makeTagMaker: async function(userId, makeTagMaker) {
        const isAdmin = await Auth.checkRole('admin');
        const isOwner = await Auth.checkRole('owner');
        const isManager = await Auth.checkRole('manager');

        if (!isAdmin && !isOwner && !isManager) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        if (!confirm(`${makeTagMaker ? 'Grant' : 'Remove'} tag maker status?`)) return;

        try {
            await db.collection('users').doc(userId).update({ isTagMaker: makeTagMaker });
            Utils.showAlert(`Tag Maker ${makeTagMaker ? 'granted' : 'removed'}`, 'success');
            this.viewAllUsers();
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

    untimeoutUser: async function(userId) {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) return;

        if (!confirm('Remove timeout?')) return;

        try {
            await db.collection('users').doc(userId).update({ timeoutUntil: null });
            Utils.showAlert('Timeout removed', 'success');
            this.viewAllUsers();
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

            let html = '<h3 style="font-size: 1.2rem; margin-bottom: 1rem;">All Users:</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">';

            for (const doc of snapshot.docs) {
                const user = doc.data();
                const isCurrentUserAdmin = await Auth.checkRole('admin');
                const isCurrentUserOwner = await Auth.checkRole('owner');
                const isCurrentUserManager = await Auth.checkRole('manager');

                html += `
                    <div style="background: var(--table-row-alt); border: 1px solid var(--table-border); border-radius: 2px; padding: 1rem;">
                        <div style="font-weight: bold; margin-bottom: 0.5rem; cursor: pointer;" onclick="Profile.showUserProfile('${doc.id}'); return false;">
                            ${Utils.sanitizeHTML(user.displayName || user.username || user.email?.split('@')[0] || 'Unknown')}
                            ${user.isBanned ? '<span class="badge badge-admin">BANNED</span>' : ''}
                            ${user.isAdmin ? '<span class="badge badge-admin">ADMIN</span>' : ''}
                            ${user.isManager ? '<span class="badge badge-manager">MANAGER</span>' : ''}
                            ${user.isVIP ? '<span class="badge badge-vip">VIP</span>' : ''}
                            ${user.isTagMaker ? '<span class="badge badge-tagmaker">TAG MAKER</span>' : ''}
                            ${user.isOwner ? '<span class="badge badge-owner">OWNER</span>' : ''}
                        </div>
                        <div style="color: #888; font-size: 0.9rem; margin-bottom: 0.5rem;">${Utils.sanitizeHTML(user.email || 'No email')}</div>
                        <div style="color: #888; font-size: 0.8rem; margin-bottom: 1rem;">
                            Joined: ${Utils.formatTime(user.createdAt?.toDate())}
                            ${user.timeoutUntil ? `<br>Timeout until: ${Utils.formatTime(user.timeoutUntil?.toDate())}` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-danger btn-small" onclick="Admin.banUser('${doc.id}'); return false;">
                                ${user.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            ${(isCurrentUserAdmin || isCurrentUserOwner || isCurrentUserManager) ? `
                                <button class="btn btn-gold btn-small" onclick="Admin.makeVIP('${doc.id}', ${!user.isVIP}); return false;">
                                    ${user.isVIP ? 'Remove VIP' : 'Make VIP'}
                                </button>
                            ` : ''}
                            ${(isCurrentUserAdmin || isCurrentUserOwner) ? `
                                <button class="btn btn-warning btn-small" onclick="Admin.makeManager('${doc.id}', ${!user.isManager}); return false;">
                                    ${user.isManager ? 'Remove Manager' : 'Make Manager'}
                                </button>
                            ` : ''}
                            ${isCurrentUserOwner ? `
                                <button class="btn btn-danger btn-small" onclick="Admin.makeAdmin('${doc.id}', ${!user.isAdmin}); return false;">
                                    ${user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </button>
                            ` : ''}
                            ${(isCurrentUserAdmin || isCurrentUserOwner || isCurrentUserManager) ? `
                                <button class="btn btn-primary btn-small" onclick="Admin.makeTagMaker('${doc.id}', ${!user.isTagMaker}); return false;">
                                    ${user.isTagMaker ? 'Remove Tag Maker' : 'Make Tag Maker'}
                                </button>
                            ` : ''}
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
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        try {
            const snapshot = await db.collection('pastes').orderBy('timestamp', 'desc').limit(100).get();
            const container = document.getElementById('admin-content');

            let html = '<h3 style="font-size: 1.2rem; margin-bottom: 1rem;">All Pastes:</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">';

            snapshot.forEach(doc => {
                const paste = doc.data();
                html += `
                    <div style="background: var(--table-row-alt); border: 1px solid var(--table-border); border-radius: 2px; padding: 1rem;">
                        <div style="font-weight: bold; margin-bottom: 0.5rem; cursor: pointer;" onclick="Profile.showUserProfile('${paste.userId}'); return false;">
                            ${Utils.sanitizeHTML(paste.username || 'Unknown User')}
                            ${paste.isPinned ? '<span class="badge badge-pinned">PINNED</span>' : ''}
                            ${paste.isRemoved ? '<span class="badge badge-admin">REMOVED</span>' : ''}
                        </div>
                        <div style="font-size: 1.1rem; margin-bottom: 0.5rem; cursor: pointer;" onclick="Pastes.showPasteDetail('${doc.id}'); return false;">
                            ${Utils.sanitizeHTML(paste.title)}
                        </div>
                        <div style="color: #888; font-size: 0.8rem; margin-bottom: 1rem;">
                            ${paste.views || 0} views • ${Utils.formatTime(paste.timestamp?.toDate())}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-success btn-small" onclick="Admin.pinPaste('${doc.id}', true); return false;">Pin</button>
                            ${paste.isPinned ? `<button class="btn btn-warning btn-small" onclick="Admin.pinPaste('${doc.id}', false); return false;">Unpin</button>` : ''}
                            <button class="btn btn-danger btn-small" onclick="Admin.removePaste('${doc.id}'); return false;">Remove</button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    clearChat: async function() {
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        if (!isAdmin && !isManager && !isOwner) {
            Utils.showAlert('Access denied', 'error');
            return;
        }

        if (!confirm('Clear all chat messages?')) return;

        try {
            const snapshot = await chatDb.collection('messages').get();
            const batch = chatDb.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            Utils.showAlert('Chat cleared', 'success');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    backupData: function() {
        Utils.showAlert('Backup feature coming soon', 'info');
    },

    manageRoles: function() {
        this.viewAllUsers();
    }
};

window.Admin = Admin;
