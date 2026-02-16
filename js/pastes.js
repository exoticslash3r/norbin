const Pastes = {
    currentPage: 1,
    itemsPerPage: 15,
    totalPastes: 0,
    totalPages: 0,
    allPastesCache: [],
    currentPasteId: null,

    // Initialize and load pastes
    init: async function() {
        console.log('Initializing Pastes...');
        await this.loadPaginationData();
        await this.loadPinnedPastes();
    },

    loadPaginationData: async function() {
        try {
            console.log('Loading all pastes...');
            const snapshot = await db.collection('pastes')
                .where('isRemoved', '==', false)
                .get();

            if (snapshot.empty) {
                console.log('No pastes found');
                document.getElementById('all-pastes-body').innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">No pastes yet. Be the first to create one!</td></tr>';
                return;
            }

            this.allPastesCache = [];
            
            for (const doc of snapshot.docs) {
                const paste = doc.data();
                this.allPastesCache.push({
                    id: doc.id,
                    ...paste
                });
            }

            // Sort by timestamp
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
            console.error('Error loading pastes:', error);
            document.getElementById('all-pastes-body').innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">Error loading pastes. Please check console.</td></tr>';
        }
    },

    loadPinnedPastes: async function() {
        try {
            console.log('Loading pinned pastes...');
            const snapshot = await db.collection('pastes')
                .where('isRemoved', '==', false)
                .where('isPinned', '==', true)
                .get();

            const container = document.getElementById('pinned-pastes-body');
            container.innerHTML = '';

            if (snapshot.empty) {
                container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">No pinned pastes yet.</td></tr>';
                return;
            }

            const pinnedPastes = [];
            
            for (const doc of snapshot.docs) {
                const paste = doc.data();
                pinnedPastes.push({
                    id: doc.id,
                    ...paste
                });
            }

            // Sort by timestamp
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

        pinnedPastes.forEach(paste => {
            const row = document.createElement('tr');
            
            // Title
            const titleCell = document.createElement('td');
            const titleLink = document.createElement('a');
            titleLink.href = '#';
            titleLink.className = 'paste-title-link';
            titleLink.textContent = paste.title || 'Untitled';
            titleLink.onclick = (e) => {
                e.preventDefault();
                this.showPasteDetail(paste.id);
            };
            titleCell.appendChild(titleLink);
            
            const pinnedBadge = document.createElement('span');
            pinnedBadge.className = 'badge badge-pinned';
            pinnedBadge.textContent = 'PINNED';
            titleCell.appendChild(pinnedBadge);

            // Comments
            const commentsCell = document.createElement('td');
            commentsCell.textContent = paste.commentCount || 0;

            // Views
            const viewsCell = document.createElement('td');
            viewsCell.textContent = paste.views || 0;

            // User
            const userCell = document.createElement('td');
            const userLink = document.createElement('a');
            userLink.href = '#';
            userLink.className = 'paste-link';
            userLink.textContent = paste.username || 'Anonymous';
            userLink.onclick = (e) => {
                e.preventDefault();
                if (window.Profile) {
                    Profile.showUserProfile(paste.userId);
                }
            };
            userCell.appendChild(userLink);

            // Date
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

        pagePastes.forEach(paste => {
            const row = document.createElement('tr');
            
            // Title
            const titleCell = document.createElement('td');
            const titleLink = document.createElement('a');
            titleLink.href = '#';
            titleLink.className = 'paste-title-link';
            titleLink.textContent = paste.title || 'Untitled';
            titleLink.onclick = (e) => {
                e.preventDefault();
                this.showPasteDetail(paste.id);
            };
            titleCell.appendChild(titleLink);
            
            if (paste.isPinned) {
                const pinnedBadge = document.createElement('span');
                pinnedBadge.className = 'badge badge-pinned';
                pinnedBadge.textContent = 'PINNED';
                titleCell.appendChild(pinnedBadge);
            }

            // Comments
            const commentsCell = document.createElement('td');
            commentsCell.textContent = paste.commentCount || 0;

            // Views
            const viewsCell = document.createElement('td');
            viewsCell.textContent = paste.views || 0;

            // User
            const userCell = document.createElement('td');
            const userLink = document.createElement('a');
            userLink.href = '#';
            userLink.className = 'paste-link';
            userLink.textContent = paste.username || 'Anonymous';
            userLink.onclick = (e) => {
                e.preventDefault();
                if (window.Profile) {
                    Profile.showUserProfile(paste.userId);
                }
            };
            userCell.appendChild(userLink);

            // Date
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

    updatePaginationUI: function() {
        const paginationContainer = document.getElementById('pagination-container');
        const pageNumbersContainer = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        const paginationInfo = document.getElementById('pagination-info');

        if (!paginationContainer) return;

        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
        pageNumbersContainer.innerHTML = '';

        if (this.totalPages > 0) {
            for (let i = 1; i <= this.totalPages; i++) {
                if (i === 1 || i === this.totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                    const btn = document.createElement('button');
                    btn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
                    btn.textContent = i;
                    btn.onclick = () => this.changePage(i);
                    pageNumbersContainer.appendChild(btn);
                } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                    const span = document.createElement('span');
                    span.className = 'page-ellipsis';
                    span.textContent = '...';
                    pageNumbersContainer.appendChild(span);
                }
            }

            const startItem = ((this.currentPage - 1) * this.itemsPerPage) + 1;
            const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalPastes);
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.totalPastes} pastes`;
            paginationContainer.classList.remove('hidden');
        }
    },

    changePage: function(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPage) return;
        this.currentPage = pageNum;
        this.displayPaginationPastes();
        this.updatePaginationUI();
    },

    showPasteDetail: async function(pasteId) {
        try {
            const doc = await db.collection('pastes').doc(pasteId).get();
            if (!doc.exists) {
                Utils.showAlert('Paste not found', 'error');
                return;
            }

            const paste = doc.data();
            const container = document.getElementById('paste-detail-content');
            
            const baseUrl = window.location.origin + window.location.pathname;
            const shareLink = `${baseUrl}?paste=${pasteId}`;

            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <span class="paste-link">${Utils.sanitizeHTML(paste.username || 'Anonymous')}</span>
                    ${paste.isPinned ? '<span class="badge badge-pinned">PINNED</span>' : ''}
                </div>
                <h1 style="color: var(--accent-color); margin-bottom: 1rem; font-size: 1.8rem;">
                    ${Utils.sanitizeHTML(paste.title || 'Untitled')}
                </h1>
                <div style="color: #888; margin-bottom: 1.5rem; font-size: 0.9rem;">
                    <span style="margin-right: 1rem;">${paste.views || 0} views</span>
                    <span style="margin-right: 1rem;">${Utils.formatTime(paste.timestamp?.toDate())}</span>
                </div>
                <div class="share-section">
                    <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--accent-color);">Share this paste:</h3>
                    <div class="share-link-container">
                        <input type="text" class="share-link" value="${Utils.sanitizeHTML(shareLink)}" readonly id="share-link-${pasteId}">
                        <button class="copy-btn" onclick="Pastes.copyShareLink('${pasteId}')">Copy Link</button>
                    </div>
                </div>
                <div class="paste-content">${Utils.sanitizeHTML(paste.content || 'No content')}</div>
            `;

            document.getElementById('paste-detail-container').classList.add('active');
            document.body.style.overflow = 'hidden';
            this.currentPasteId = pasteId;
            
            // Update view count
            await db.collection('pastes').doc(pasteId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
            
        } catch (error) {
            console.error('Error showing paste:', error);
            Utils.showAlert('Error loading paste', 'error');
        }
    },

    closePasteDetail: function() {
        document.getElementById('paste-detail-container').classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentPasteId = null;
    },

    copyShareLink: function(linkId) {
        const input = document.getElementById(`share-link-${linkId}`);
        if (input) {
            input.select();
            document.execCommand('copy');
            Utils.showAlert('Link copied!', 'success');
        }
    },

    publishPaste: async function() {
        const user = Auth.getCurrentUser();
        if (!user) {
            Utils.showAlert('Please sign in', 'error');
            Utils.showPage('auth');
            return;
        }

        const title = document.getElementById('paste-title').value.trim();
        const content = document.getElementById('paste-content').value.trim();

        if (!title || !content) {
            Utils.showAlert('Fill all fields', 'error');
            return;
        }

        try {
            await db.collection('pastes').add({
                title: title,
                content: content,
                username: user.email.split('@')[0],
                userId: user.uid,
                views: 0,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                isPinned: false,
                isRemoved: false
            });

            Utils.showAlert('Paste created', 'success');
            document.getElementById('paste-title').value = '';
            document.getElementById('paste-content').value = '';
            Utils.showPage('home');
            this.init();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }
};

window.Pastes = Pastes;
