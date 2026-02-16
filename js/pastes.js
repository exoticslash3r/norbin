showPasteDetail: async function(pasteId) {
    try {
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

        // This checks if current user is admin - ONLY for showing admin controls
        // It does NOT block viewing the paste
        const isAdmin = await Auth.checkRole('admin');
        const isManager = await Auth.checkRole('manager');
        const isOwner = await Auth.checkRole('owner');

        let adminControls = '';
        if (isAdmin || isManager || isOwner) {
            adminControls = `
                <div class="btn-group">
                    <button class="btn btn-success" onclick="Admin.pinPaste('${pasteId}', true)">Pin</button>
                    ${paste.isPinned ? `<button class="btn btn-warning" onclick="Admin.pinPaste('${pasteId}', false)">Unpin</button>` : ''}
                    <button class="btn btn-danger" onclick="Admin.removePaste('${pasteId}')">Remove</button>
                    ${(isAdmin || isManager || isOwner) ? `<button class="btn btn-danger" onclick="Admin.banUser('${paste.userId}')">Ban User</button>` : ''}
                    ${(isAdmin || isOwner) ? `<button class="btn btn-danger" onclick="Admin.showTimeoutForm('${paste.userId}')">Timeout</button>` : ''}
                </div>
            `;
        }

        actionsContainer.innerHTML = adminControls;

        // Rest of the function - this shows the paste to EVERYONE
        // ... (keep all the existing code for displaying the paste)
        
    } catch (error) {
        Utils.showAlert(error.message, 'error');
    }
},
