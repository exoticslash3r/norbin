// Comments Module
const Comments = (function() {
    async function loadComments(pasteId) {
        try {
            const commentsList = document.getElementById('comments-list');
            if (!commentsList) return;

            commentsList.innerHTML = '<div style="text-align: center; padding: 1rem; color: #888;">Loading comments...</div>';

            const snapshot = await db.collection('comments')
                .where('pasteId', '==', pasteId)
                .where('isRemoved', '==', false)
                .orderBy('timestamp', 'desc')
                .get();

            commentsList.innerHTML = '';

            if (snapshot.empty) {
                commentsList.innerHTML = '<div style="text-align: center; padding: 1rem; color: #888;">No comments yet.</div>';
                return;
            }

            for (const doc of snapshot.docs) {
                const comment = doc.data();
                const commentId = doc.id;

                let username = 'Anonymous';
                let userRole = 'user';
                let userColor = '#ffffff';

                try {
                    const userDoc = await db.collection('users').doc(comment.userId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        username = userData.displayName || userData.username || 'Anonymous';
                        userColor = userData.usernameColor || '#ffffff';
                        if (userData.isOwner) userRole = 'owner';
                        else if (userData.isAdmin) userRole = 'admin';
                        else if (userData.isManager) userRole = 'manager';
                        else if (userData.isVIP) userRole = 'vip';
                    }
                } catch (error) {
                    console.error('Error getting user data:', error);
                }

                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                commentElement.id = `comment-${commentId}`;

                let roleBadge = '';
                if (userRole === 'owner') roleBadge = '<span class="badge badge-owner">Owner</span>';
                else if (userRole === 'admin') roleBadge = '<span class="badge badge-admin">Admin</span>';
                else if (userRole === 'manager') roleBadge = '<span class="badge badge-manager">Manager</span>';
                else if (userRole === 'vip') roleBadge = '<span class="badge badge-vip">VIP</span>';

                let deleteButton = '';
                const currentUser = Auth.getCurrentUser();
                
                if (currentUser) {
                    const isAdmin = await Auth.checkRole('admin');
                    const isManager = await Auth.checkRole('manager');
                    const isOwner = await Auth.checkRole('owner');
                    if (currentUser.uid === comment.userId || isAdmin || isManager || isOwner) {
                        deleteButton = `<button class="btn btn-danger btn-small" onclick="Comments.deleteComment('${commentId}'); return false;">Delete</button>`;
                    }
                }

                commentElement.innerHTML = `
                    <div class="comment-header">
                        <div class="comment-author" style="color: ${userColor}">
                            ${Utils.sanitizeHTML(username)}
                            ${roleBadge}
                        </div>
                        <div class="comment-time">${Utils.formatTime(comment.timestamp?.toDate())}</div>
                    </div>
                    <div class="comment-content">${Utils.sanitizeHTML(comment.content)}</div>
                    <div class="comment-actions">${deleteButton}</div>
                `;

                commentsList.appendChild(commentElement);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    async function postComment(pasteId) {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) {
            Utils.showAlert('Please sign in', 'error');
            Utils.showPage('auth');
            return;
        }

        const commentInput = document.getElementById('comment-input');
        const content = commentInput.value.trim();

        if (!content) {
            Utils.showAlert('Enter a comment', 'error');
            return;
        }

        if (content.length > 1000) {
            Utils.showAlert('Comment too long', 'error');
            return;
        }

        try {
            await db.collection('comments').add({
                pasteId: pasteId,
                userId: currentUser.uid,
                content: Utils.sanitizeHTML(content),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                isRemoved: false
            });

            commentInput.value = '';
            Utils.showAlert('Comment posted', 'success');
            loadComments(pasteId);
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    async function deleteComment(commentId) {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        if (!confirm('Delete this comment?')) return;

        try {
            const commentDoc = await db.collection('comments').doc(commentId).get();
            const comment = commentDoc.data();

            const isAdmin = await Auth.checkRole('admin');
            const isManager = await Auth.checkRole('manager');
            const isOwner = await Auth.checkRole('owner');

            if (currentUser.uid !== comment.userId && !isAdmin && !isManager && !isOwner) {
                Utils.showAlert('Permission denied', 'error');
                return;
            }

            await db.collection('comments').doc(commentId).update({ isRemoved: true });
            Utils.showAlert('Comment deleted', 'success');
            document.getElementById(`comment-${commentId}`)?.remove();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    function scrollToComments() {
        document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    return {
        loadComments,
        postComment,
        deleteComment,
        scrollToComments
    };
})();
