const Pastes = {
    currentPage: 1,
    itemsPerPage: 15,
    totalPastes: 0,
    totalPages: 0,
    allPastesCache: [],
    currentPasteId: null,

    loadPaginationData: async function() {
        try {
            console.log('Loading pagination data...');
            // Simple query without complex ordering to avoid index issues
            const snapshot = await db.collection('pastes')
                .where('isRemoved', '==', false)
                .get();

            this.allPastesCache = [];
            const processedIds = new Set();

            for (const doc of snapshot.docs) {
                const pasteId = doc.id;
                if (processedIds.has(pasteId)) continue;
                processedIds.add(pasteId);
                
                const paste = doc.data();

                // Get comment count
                let commentCount = 0;
                try {
                    const commentsSnapshot = await db.collection('comments')
                        .where('pasteId', '==', pasteId)
                        .where('isRemoved', '==', false)
                        .get();
                    commentCount = commentsSnapshot.size;
                } catch (error) {
                    commentCount = 0;
                }

                this.allPastesCache.push({
                    id: pasteId,
                    ...paste,
                    commentCount: commentCount
                });
            }

            // Sort in memory by timestamp (newest first)
            this.allPastesCache.sort((a, b) => {
                const timeA = a.timestamp?.toDate?.() || new Date(0);
                const timeB = b.timestamp?.toDate?.() || new Date(0);
                return timeB - timeA;
            });

            this.totalPastes = this.allPastesCache.length;
            this.totalPages = Math.ceil(this.totalPastes / this.itemsPerPage);
            this.currentPage = 1;

            await this.displayPaginationPastes();
            this.updatePaginationUI();
            
            console.log(`Loaded ${this.totalPastes} pastes`);
        } catch (error) {
            console.error('Error loading pagination data:', error);
            document.getElementById('all-pastes-body').innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">Error loading pastes</td></tr>';
        }
    },

    loadPinnedPastes: async function() {
        try {
            console.log('Loading pinned pastes...');
            // Get all non-removed pastes
            const allPastes = await db.collection('pastes')
                .where('isRemoved', '==', false)
                .get();
            
            // Filter pinned ones in memory
            const pinnedPastes = [];
            
            for (const doc of allPastes.docs) {
                const paste = doc.data();
                if (paste.isPinned) {
                    // Get user role for each paste
                    const userDoc = await db.collection('users').doc(paste.userId).get();
                    let userRole = 'user';
                    
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        if (userData.isOwner) userRole = 'owner';
                        else if (userData.isAdmin) userRole = 'admin';
                        else if (userData.isManager) userRole = 'manager';
                        else if (userData.isVIP) userRole = 'vip';
                    }

                    // Get comment count
                    let commentCount = 0;
                    try {
                        const commentsSnapshot = await db.collection('comments')
                            .where('pasteId', '==', doc.id)
                            .where('isRemoved', '==', false)
                            .get();
                        commentCount = commentsSnapshot.size;
                    } catch (error) {
                        commentCount = 0;
                    }

                    pinnedPastes.push({
                        id: doc.id,
                        ...paste,
                        userRole: userRole,
                        commentCount: commentCount
                    });
                }
            }
            
            // Sort by timestamp (newest first)
            pinnedPastes.sort((a, b) => {
                const timeA = a.timestamp?.toDate?.() || new Date(0);
                const timeB = b.timestamp?.toDate?.() || new Date(0);
                return timeB - timeA;
            });

            this.displayPinnedPastes(pinnedPastes);
            console.log(`Loaded ${pinnedPastes.length} pinned pastes`);
        } catch (error) {
            console.error('Error loading pinned pastes:', error);
            document.getElementById('pinned-pastes-body').innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">Error loading pinned pastes</td></tr>';
        }
    },

    displayPinnedPastes: function(pinnedPastes) {
        const container = document.getElementById('pinned-pastes-body');
        container.innerHTML = '';

        if (pinnedPastes.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">No pinned pastes yet.</td></tr>';
            return;
        }

        pinnedPastes.forEach(paste => {
            const row = document.createElement('tr');
            
            // Title cell
            const titleCell = document.createElement('td');
            const titleLink = document.createElement('a');
            titleLink.href = '#';
            titleLink.className = 'paste-title-link';
            titleLink.textContent = Utils.sanitizeHTML(paste.title || 'Untitled');
            titleLink.onclick = function(e) { 
                e.preventDefault(); 
                Pastes.showPasteDetail(paste.id); 
            };
            titleCell.appendChild(titleLink);
            
            const pinnedBadge = document.createElement('span');
            pinnedBadge.className = 'badge badge-pinned';
            pinnedBadge.textContent = 'PINNED';
            titleCell.appendChild(pinnedBadge);

            // Comments cell
            const commentsCell = document.createElement('td');
            const commentsSpan = document.createElement('span');
            commentsSpan.className = 'comments-count';
            commentsSpan.textContent = paste.commentCount || 0;
            commentsSpan.onclick = function(e) { 
                e.preventDefault(); 
                Pastes.showPasteDetail(paste.id); 
            };
            commentsCell.appendChild(commentsSpan);

            // Views cell
            const viewsCell = document.createElement('td');
            const viewsSpan = document.createElement('span');
            viewsSpan.className = 'views-count';
            viewsSpan.textContent = paste.views || 0;
            viewsSpan.onclick = function(e) { 
                e.preventDefault(); 
                Pastes.showPasteDetail(paste.id); 
            };
            viewsCell.appendChild(viewsSpan);

            // User cell
            const userCell = document.createElement('td');
            const userLink = document.createElement('a');
            userLink.href = '#';
            userLink.className = 'paste-link';
            userLink.textContent = Utils.sanitizeHTML(paste.username || 'Anonymous');
            userLink.onclick = function(e) { 
                e.preventDefault(); 
                if (window.Profile) {
                    Profile.showUserProfile(paste.userId); 
                }
            };
            userCell.appendChild(userLink);

            // Role badges
            if (paste.userRole === 'manager') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-manager';
                badge.textContent = 'Manager';
                userCell.appendChild(badge);
            } else if (paste.userRole === 'admin') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-admin';
                badge.textContent = 'Admin';
                userCell.appendChild(badge);
            } else if (paste.userRole === 'vip') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-vip';
                badge.textContent = 'VIP';
                userCell.appendChild(badge);
            } else if (paste.userRole === 'owner') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-owner';
                badge.textContent = 'Owner';
                userCell.appendChild(badge);
            }

            // Date cell
            const dateCell = document.createElement('td');
            dateCell.textContent = Utils.formatTime(paste.timestamp?.toDate());

            row.appendChild(titleCell);
            row.appendChild(commentsCell);
            row.appendChild(viewsCell);
            row.appendChild(userCell);
            row.appendChild(dateCell);
            container.appendChild(row);
        });
    },

    displayPaginationPastes: async function() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pagePastes = this.allPastesCache.slice(startIndex, endIndex);

        const container = document.getElementById('all-pastes-body');
        container.innerHTML = '';

        if (pagePastes.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">No pastes found.</td></tr>';
            return;
        }

        for (const paste of pagePastes) {
            // Get user role
            let userRole = 'user';
            try {
                const userDoc = await db.collection('users').doc(paste.userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.isOwner) userRole = 'owner';
                    else if (userData.isAdmin) userRole = 'admin';
                    else if (userData.isManager) userRole = 'manager';
                    else if (userData.isVIP) userRole = 'vip';
                }
            } catch (error) {
                console.error('Error getting user role:', error);
            }

            const row = document.createElement('tr');
            
            // Title cell
            const titleCell = document.createElement('td');
            const titleLink = document.createElement('a');
            titleLink.href = '#';
            titleLink.className = 'paste-title-link';
            titleLink.textContent = Utils.sanitizeHTML(paste.title || 'Untitled');
            titleLink.onclick = function(e) { 
                e.preventDefault(); 
                Pastes.showPasteDetail(paste.id); 
            };
            titleCell.appendChild(titleLink);
            
            if (paste.isPinned) {
                const pinnedBadge = document.createElement('span');
                pinnedBadge.className = 'badge badge-pinned';
                pinnedBadge.textContent = 'PINNED';
                titleCell.appendChild(pinnedBadge);
            }

            // Comments cell
            const commentsCell = document.createElement('td');
            const commentsSpan = document.createElement('span');
            commentsSpan.className = 'comments-count';
            commentsSpan.textContent = paste.commentCount || 0;
            commentsSpan.onclick = function(e) { 
                e.preventDefault(); 
                Pastes.showPasteDetail(paste.id); 
            };
            commentsCell.appendChild(commentsSpan);

            // Views cell
            const viewsCell = document.createElement('td');
            const viewsSpan = document.createElement('span');
            viewsSpan.className = 'views-count';
            viewsSpan.textContent = paste.views || 0;
            viewsSpan.onclick = function(e) { 
                e.preventDefault(); 
                Pastes.showPasteDetail(paste.id); 
            };
            viewsCell.appendChild(viewsSpan);

            // User cell
            const userCell = document.createElement('td');
            const userLink = document.createElement('a');
            userLink.href = '#';
            userLink.className = 'paste-link';
            userLink.textContent = Utils.sanitizeHTML(paste.username || 'Anonymous');
            userLink.onclick = function(e) { 
                e.preventDefault(); 
                if (window.Profile) {
                    Profile.showUserProfile(paste.userId); 
                }
            };
            userCell.appendChild(userLink);

            // Role badges
            if (userRole === 'manager') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-manager';
                badge.textContent = 'Manager';
                userCell.appendChild(badge);
            } else if (userRole === 'admin') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-admin';
                badge.textContent = 'Admin';
                userCell.appendChild(badge);
            } else if (userRole === 'vip') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-vip';
                badge.textContent = 'VIP';
                userCell.appendChild(badge);
            } else if (userRole === 'owner') {
                const badge = document.createElement('span');
                badge.className = 'badge badge-owner';
                badge.textContent = 'Owner';
                userCell.appendChild(badge);
            }

            // Date cell
            const dateCell = document.createElement('td');
            dateCell.textContent = Utils.formatTime(paste.timestamp?.toDate());

            row.appendChild(titleCell);
            row.appendChild(commentsCell);
            row.appendChild(viewsCell);
            row.appendChild(userCell);
            row.appendChild(dateCell);
            container.appendChild(row);
        }
    },

    updatePaginationUI: function() {
        const paginationContainer = document.getElementById('pagination-container');
        const pageNumbersContainer = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        const paginationInfo = document.getElementById('pagination-info');

        if (!paginationContainer || !pageNumbersContainer) return;

        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
        pageNumbersContainer.innerHTML = '';

        if (this.totalPages > 0) {
            const createPageNumber = (pageNum) => {
                const btn = document.createElement('button');
                btn.className = `page-number ${pageNum === this.currentPage ? 'active' : ''}`;
                btn.textContent = pageNum;
                btn.onclick = (e) => {
                    e.preventDefault();
                    this.changePage(pageNum);
                };
                pageNumbersContainer.appendChild(btn);
            };

            createPageNumber(1);

            let startPage = Math.max(2, this.currentPage - 1);
            let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }

            for (let i = startPage; i <= endPage; i++) {
                createPageNumber(i);
            }

            if (endPage < this.totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }

            if (this.totalPages > 1) {
                createPageNumber(this.totalPages);
            }

            const startItem = ((this.currentPage - 1) * this.itemsPerPage) + 1;
            const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalPastes);
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.totalPastes} pastes`;
            paginationContainer.classList.remove('hidden');
        } else {
            paginationContainer.classList.add('hidden');
        }
    },

    changePage: function(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPage) return;
        this.currentPage = pageNum;
        this.displayPaginationPastes();
        this.updatePaginationUI();
        document.getElementById('pastes-container').scrollIntoView({ behavior: 'smooth' });
    },

    publishPaste: async function() {
        const user = Auth.getCurrentUser();
        const userData = Auth.getCurrentUserData();

        if (!user) {
            Utils.showAlert('Please sign in', 'error');
            Utils.showPage('auth');
            return;
        }

        const verifyCheckbox = document.getElementById('verify-human');
        if (!verifyCheckbox || !verifyCheckbox.checked) {
            Utils.showAlert('Please verify you are human', 'error');
            return;
        }

        const title = document.getElementById('paste-title').value.trim();
        const content = document.getElementById('paste-content').value.trim();

        if (!title || !content) {
            Utils.showAlert('Fill all fields', 'error');
            return;
        }

        if (title.length > 100) {
            Utils.showAlert('Title too long', 'error');
            return;
        }

        if (content.length > 50000) {
            Utils.showAlert('Content too long', 'error');
            return;
        }

        try {
            await db.collection('pastes').add({
                title: Utils.sanitizeHTML(title),
                content: Utils.sanitizeHTML(content),
                username: userData?.displayName || userData?.username || user.email.split('@')[0],
                userId: user.uid,
                views: 0,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                isPinned: false,
                isRemoved: false
            });

            await db.collection('users').doc(user.uid).update({
                pasteCount: firebase.firestore.FieldValue.increment(1)
            });

            Utils.showAlert('Paste created', 'success');
            document.getElementById('paste-title').value = '';
            document.getElementById('paste-content').value = '';
            document.getElementById('verify-human').checked = false;
            Utils.showPage('home');
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    showPasteDetail: async function(pasteId) {
        try {
            console.log('Showing paste detail:', pasteId);
            
            // Increment view count
            await db.collection('pastes').doc(pasteId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });

            const doc = await db.collection('pastes').doc(pasteId).get();
            if (!doc.exists) {
                Utils.showAlert('Paste not found', 'error');
                return;
            }

            const paste = doc.data();
            const container = document.getElementById('paste-detail-content');
            const actionsContainer = document.getElementById('paste-detail-actions');

            // Check admin status for controls (doesn't block viewing)
            const isAdmin = Auth.getCurrentUser() ? await Auth.checkRole('admin') : false;
            const isManager = Auth.getCurrentUser() ? await Auth.checkRole('manager') : false;
            const isOwner = Auth.getCurrentUser() ? await Auth.checkRole('owner') : false;

            let adminControls = '';
            if (isAdmin || isManager || isOwner) {
                adminControls = `
                    <div class="btn-group">
                        <button class="btn btn-success" onclick="Admin.pinPaste('${pasteId}', true)">Pin</button>
                        ${paste.isPinned ? `<button class="btn btn-warning" onclick="Admin.pinPaste('${pasteId}', false)">Unpin</button>` : ''}
                        <button class="btn btn-danger" onclick="Admin.removePaste('${pasteId}')">Remove</button>
                        <button class="btn btn-danger" onclick="Admin.banUser('${paste.userId}')">Ban User</button>
                        <button class="btn btn-danger" onclick="Admin.showTimeoutForm('${paste.userId}')">Timeout</button>
                    </div>
                `;
            }

            actionsContainer.innerHTML = adminControls;

            const baseUrl = window.location.origin + window.location.pathname;
            const shareLink = `${baseUrl}?paste=${pasteId}`;

            // Get user role for badge
            const userDoc = await db.collection('users').doc(paste.userId).get();
            let userRole = 'user';
            let userRoleBadge = '';

            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.isOwner) userRole = 'owner';
                else if (userData.isAdmin) userRole = 'admin';
                else if (userData.isManager) userRole = 'manager';
                else if (userData.isVIP) userRole = 'vip';
            }

            if (userRole === 'owner') userRoleBadge = '<span class="badge badge-owner">Owner</span>';
            else if (userRole === 'admin') userRoleBadge = '<span class="badge badge-admin">Admin</span>';
            else if (userRole === 'manager') userRoleBadge = '<span class="badge badge-manager">Manager</span>';
            else if (userRole === 'vip') userRoleBadge = '<span class="badge badge-vip">VIP</span>';

            // Get comment count
            let commentCount = 0;
            try {
                const commentsSnapshot = await db.collection('comments')
                    .where('pasteId', '==', pasteId)
                    .where('isRemoved', '==', false)
                    .get();
                commentCount = commentsSnapshot.size;
            } catch (error) {
                commentCount = 0;
            }

            // Show the paste - THIS IS VISIBLE TO EVERYONE
            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <a href="#" class="paste-link" onclick="Profile.showUserProfile('${paste.userId}'); return false;">
                        ${Utils.sanitizeHTML(paste.username || 'Anonymous')}
                    </a>
                    ${userRoleBadge}
                    ${paste.isPinned ? '<span class="badge badge-pinned">PINNED</span>' : ''}
                </div>
                <h1 style="color: var(--accent-color); margin-bottom: 1rem; font-size: 1.8rem;">
                    ${Utils.sanitizeHTML(paste.title || 'Untitled')}
                </h1>
                <div style="color: #888; margin-bottom: 1.5rem; font-size: 0.9rem;">
                    <span style="margin-right: 1rem;" class="views-count" onclick="Pastes.showPasteDetail('${pasteId}'); return false;">${paste.views || 0} views</span>
                    <span style="margin-right: 1rem;" class="comments-count" onclick="Comments.scrollToComments(); return false;">${commentCount} comments</span>
                    <span style="margin-right: 1rem;">${Utils.formatTime(paste.timestamp?.toDate())}</span>
                </div>
                <div class="btn-group mb-3">
                    <button class="btn btn-primary" onclick="Pastes.showRawPaste('${pasteId}'); return false;">View Raw</button>
                    <button class="btn btn-secondary" onclick="Comments.scrollToComments(); return false;">View Comments</button>
                </div>
                <div class="share-section">
                    <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--accent-color);">Share this paste:</h3>
                    <div class="share-link-container">
                        <input type="text" class="share-link" value="${Utils.sanitizeHTML(shareLink)}" readonly id="share-link-${pasteId}">
                        <button class="copy-btn" onclick="Pastes.copyShareLink('${pasteId}'); return false;">Copy Link</button>
                    </div>
                </div>
                <div class="paste-content" data-paste-id="${pasteId}">${Utils.sanitizeHTML(paste.content || 'No content')}</div>
                <div id="comments-section" class="comments-section">
                    <h3 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--accent-color);">Comments (${commentCount})</h3>
                    ${Auth.getCurrentUser() ? `
                        <div class="comment-form">
                            <textarea id="comment-input" placeholder="Add a comment..." maxlength="1000"></textarea>
                            <button class="btn btn-primary" onclick="Comments.postComment('${pasteId}'); return false;">Post Comment</button>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 1rem; background: var(--table-row-alt); border-radius: 2px;">
                            <a href="#" onclick="Utils.showPage('auth'); return false;" style="color: var(--link-color); text-decoration: none;">Sign in to comment</a>
                        </div>
                    `}
                    <div id="comments-list" class="comments-list"></div>
                </div>
            `;

            if (window.Comments) {
                Comments.loadComments(pasteId);
            }
            
            document.getElementById('paste-detail-container').classList.add('active');
            document.body.style.overflow = 'hidden';
            this.currentPasteId = pasteId;
            
            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('paste', pasteId);
            window.history.pushState({}, '', url);
            
            console.log('Paste displayed successfully');
        } catch (error) {
            console.error('Error showing paste:', error);
            Utils.showAlert('Error loading paste: ' + error.message, 'error');
        }
    },

    closePasteDetail: function() {
        document.getElementById('paste-detail-container').classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentPasteId = null;
        
        // Remove from URL
        const url = new URL(window.location);
        url.searchParams.delete('paste');
        window.history.pushState({}, '', url);
    },

    showRawPaste: function(pasteId) {
        document.getElementById('raw-paste-container').classList.add('active');
        document.body.style.overflow = 'hidden';
        this.loadRawContent(pasteId);
    },

    closeRawPaste: function() {
        document.getElementById('raw-paste-container').classList.remove('active');
        document.body.style.overflow = 'auto';
    },

    loadRawContent: async function(pasteId) {
        try {
            const doc = await db.collection('pastes').doc(pasteId).get();
            if (doc.exists) {
                const paste = doc.data();
                document.getElementById('raw-paste-content').innerHTML = `<div class="raw-paste-view">${Utils.sanitizeHTML(paste.content || 'No content')}</div>`;
            }
        } catch (error) {
            console.error('Error loading raw paste:', error);
        }
    },

    copyRawPaste: function() {
        const rawContent = document.querySelector('.raw-paste-view');
        if (rawContent) {
            const textArea = document.createElement('textarea');
            textArea.value = rawContent.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            Utils.showAlert('Raw paste copied!', 'success');
        }
    },

    copyShareLink: function(linkId) {
        const shareLinkInput = document.getElementById(`share-link-${linkId}`);
        if (shareLinkInput) {
            shareLinkInput.select();
            document.execCommand('copy');
            Utils.showAlert('Link copied!', 'success');
        }
    },

    performSearch: function() {
        const searchTerm = document.getElementById('searchBar').value.trim();
        if (searchTerm) {
            Utils.showAlert('Search feature coming soon', 'info');
        } else {
            this.loadPaginationData();
        }
    }
};

window.Pastes = Pastes;
console.log('Pastes.js loaded - ALL users can see pastes');
