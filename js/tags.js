// Tags Module
const Tags = (function() {
    async function loadTags() {
        const isTagMaker = await Auth.checkRole('tagmaker');
        const isManager = await Auth.checkRole('manager');
        const isAdmin = await Auth.checkRole('admin');
        const isOwner = await Auth.checkRole('owner');

        if (!isTagMaker && !isManager && !isAdmin && !isOwner) {
            Utils.showPage('home');
            return;
        }

        try {
            const snapshot = await db.collection('tags').orderBy('createdAt', 'desc').get();
            const container = document.getElementById('tags-container');
            container.innerHTML = '';

            if (snapshot.empty) {
                container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #888;">No tags yet</div>';
                return;
            }

            snapshot.forEach(doc => {
                const tag = doc.data();
                const tagElement = document.createElement('div');
                tagElement.className = 'tag-item';
                tagElement.innerHTML = `
                    <div>
                        <span class="tag-name" style="background-color: ${tag.color}; color: ${getContrastColor(tag.color)}">
                            ${Utils.sanitizeHTML(tag.name)}
                        </span>
                        <div style="color: #888; font-size: 0.8rem; margin-top: 0.4rem;">
                            Created by: ${Utils.sanitizeHTML(tag.createdBy || 'Unknown')}
                        </div>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-danger btn-small" onclick="Tags.deleteTag('${doc.id}'); return false;">Delete</button>
                    </div>
                `;
                container.appendChild(tagElement);
            });
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }

    function getContrastColor(hexcolor) {
        hexcolor = hexcolor.replace("#", "");
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    async function createTag() {
        const currentUser = Auth.getCurrentUser();
        const currentUserData = Auth.getCurrentUserData();

        const isTagMaker = await Auth.checkRole('tagmaker');
        const isManager = await Auth.checkRole('manager');
        const isAdmin = await Auth.checkRole('admin');
        const isOwner = await Auth.checkRole('owner');

        if (!isTagMaker && !isManager && !isAdmin && !isOwner) return;

        const name = document.getElementById('tag-name').value.trim();
        const color = document.getElementById('tag-color').value;

        if (!name) {
            Utils.showAlert('Enter a tag name', 'error');
            return;
        }

        try {
            await db.collection('tags').add({
                name: Utils.sanitizeHTML(name),
                color: color,
                createdBy: currentUserData?.displayName || currentUserData?.username || currentUser.email.split('@')[0],
                createdById: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            Utils.showAlert('Tag created', 'success');
            document.getElementById('tag-name').value = '';
            loadTags();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    async function deleteTag(tagId) {
        const isTagMaker = await Auth.checkRole('tagmaker');
        const isManager = await Auth.checkRole('manager');
        const isAdmin = await Auth.checkRole('admin');
        const isOwner = await Auth.checkRole('owner');

        if (!isTagMaker && !isManager && !isAdmin && !isOwner) return;

        if (!confirm('Delete this tag?')) return;

        try {
            await db.collection('tags').doc(tagId).delete();
            Utils.showAlert('Tag deleted', 'success');
            loadTags();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    return {
        loadTags,
        createTag,
        deleteTag
    };
})();
