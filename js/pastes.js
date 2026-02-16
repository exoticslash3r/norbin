// Pastes Module
const Pastes = (function() {
    let currentPage = 1;
    const itemsPerPage = 15;
    let totalPastes = 0;
    let totalPages = 0;
    let allPastesCache = [];
    let currentPasteId = null;

    async function loadPaginationData() {
        try {
            const snapshot = await db.collection('pastes')
                .where('isRemoved', '==', false)
                .orderBy('timestamp', 'desc')
                .get();

            allPastesCache = [];
            const processedIds = new Set();

            for (const doc of snapshot.docs) {
                const pasteId = doc.id;
                if (processedIds.has(pasteId)) continue;
                processedIds.add(pasteId);
                
                const paste = doc.data();
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

                allPastesCache.push({
                    id: pasteId,
                    ...paste,
                    commentCount: commentCount
                });
            }

            totalPastes = allPastesCache.length;
            totalPages = Math.ceil(totalPastes / itemsPerPage);
            currentPage = 1;

            await displayPaginationPastes();
            updatePaginationUI();
        } catch (error) {
            console.error('Error loading pagination data:', error);
        }
    }

    async function loadPinnedPastes() {
        try {
            const snapshot = await db.collection('pastes')
                .where('isPinned', '==', true)
                .where('isRemoved', '==', false)
                .orderBy('timestamp', 'desc')
                .get();

            const container = document.getElementById('pinned-pastes-body');
            container.innerHTML = '';

            if (snapshot.empty) {
                container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">No pinned pastes yet.</td></tr>';
                return;
            }

            const processedIds = new Set();

            for (const doc of snapshot.docs) {
                const pasteId = doc.id;
                if (processedIds.has(pasteId)) continue;
                processedIds.add(pasteId);
                
                const paste = doc.data();
                const userDoc = await db.collection('users').doc(paste.userId).get();
                let userRole = 'user';
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.isOwner) userRole = 'owner';
                    else if (userData.isAdmin) userRole = 'admin';
                    else if (userData.isManager) userRole = 'manager';
                    else if (userData.isVIP) userRole = 'vip';
                }

                const row = document.createElement('tr');
                
                const titleCell = document.createElement('td');
                const titleLink = document.createElement('a');
                titleLink.href = '#';
                titleLink.className = 'paste-title-link';
                titleLink.textContent = Utils.sanitizeHTML(paste.title);
                titleLink.onclick = function(e) { e.preventDefault(); showPasteDetail(pasteId); };
                titleCell.appendChild(titleLink);
                
                const pinnedBadge = document.createElement('span');
                pinnedBadge.className = 'badge badge-pinned';
                pinnedBadge.textContent = 'PINNED';
                titleCell.appendChild(pinnedBadge);

                const commentsCell = document.createElement('td');
                const commentsSpan = document.createElement('span');
                commentsSpan.className = 'comments-count';
                commentsSpan.textContent = paste.commentCount || 0;
                commentsSpan.onclick = function(e) { e.preventDefault(); showPasteDetail(pasteId); };
                commentsCell.appendChild(commentsSpan);

                const viewsCell = document.createElement('td');
                const viewsSpan = document.createElement('span');
                viewsSpan.className = 'views-count';
                viewsSpan.textContent = paste.views || 0;
                viewsSpan.onclick = function(e) { e.preventDefault(); showPasteDetail(pasteId); };
                viewsCell.appendChild(viewsSpan);

                const userCell = document.createElement('td');
                const userLink = document.createElement('a');
                userLink.href = '#';
                userLink.className = 'paste-link';
                userLink.textContent = Utils.sanitizeHTML(paste.username || 'Anonymous');
                userLink.onclick = function(e) { e.preventDefault(); Profile.showUserProfile(paste.userId); };
                userCell.appendChild(userLink);

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

                const dateCell = document.createElement('td');
                dateCell.textContent = Utils.formatTime(paste.timestamp?.toDate());

                row.appendChild(titleCell);
                row.appendChild(commentsCell);
                row.appendChild(viewsCell);
                row.appendChild(userCell);
                row.appendChild(dateCell);
                container.appendChild(row);
            }
        } catch (error) {
            console.error('Error loading pinned pastes:', error);
        }
    }

    async function displayPaginationPastes() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pagePastes = allPastesCache.slice(startIndex, endIndex);

        const container = document.getElementById('all-pastes-body');
        container.innerHTML = '';

        if (pagePastes.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1.5rem;">No pastes found.</td></tr>';
            return;
        }

        const processedIds = new Set();

        for (const paste of pagePastes) {
            if (processedIds.has(paste.id)) continue;
            processedIds.add(paste.id);
            
            const userDoc = await db.collection('users').doc(paste.userId).get();
            let userRole = 'user';
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.isOwner) userRole = 'owner';
                else if (userData.isAdmin) userRole = 'admin';
                else if (userData.isManager) userRole = 'manager';
                else if (userData.isVIP) userRole = 'vip';
            }

            const row = document.createElement('tr');
            
            const titleCell = document.createElement('td');
            const titleLink = document.createElement('a');
            titleLink.href = '#';
            titleLink.className = 'paste-title-link';
            titleLink.textContent = Utils.sanitizeHTML(paste.title);
            titleLink.onclick = function(e) { e.preventDefault(); showPasteDetail(paste.id); };
            titleCell.appendChild(titleLink);
            
            if (paste.isPinned) {
                const pinnedBadge = document.createElement('span');
                pinnedBadge.className = 'badge badge-pinned';
                pinnedBadge.textContent = 'PINNED';
                titleCell.appendChild(pinnedBadge);
            }

            const commentsCell = document.createElement('td');
            const commentsSpan = document.createElement('span');
            commentsSpan.className = 'comments-count';
            commentsSpan.textContent = paste.commentCount || 0;
            commentsSpan.onclick = function(e) { e.preventDefault(); showPasteDetail(paste.id); };
            commentsCell.appendChild(commentsSpan);

            const viewsCell = document.createElement('td');
            const viewsSpan = document.createElement('span');
            viewsSpan.className = 'views-count';
            viewsSpan.textContent = paste.views || 0;
            viewsSpan.onclick = function(e) { e.preventDefault(); showPasteDetail(paste.id); };
            viewsCell.appendChild(viewsSpan);

            const userCell = document.createElement('td');
            const userLink = document.createElement('a');
            userLink.href = '#';
            userLink.className =
