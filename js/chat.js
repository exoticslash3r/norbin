// Chat Module
const Chat = (function() {
    function loadChatMessages() {
        chatDb.collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const container = document.getElementById('chat-messages');
                container.innerHTML = '';

                const messages = [];
                const processedIds = new Set();
                
                snapshot.forEach(doc => {
                    const msgId = doc.id;
                    if (processedIds.has(msgId)) return;
                    processedIds.add(msgId);
                    messages.push({ id: msgId, ...doc.data() });
                });
                
                messages.sort((a, b) => a.timestamp - b.timestamp);

                if (messages.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #888;">No messages yet</div>';
                    return;
                }

                messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message';
                    messageDiv.innerHTML = `
                        <div class="message-header">
                            <div class="message-sender">${Utils.sanitizeHTML(msg.username || 'Unknown')}:</div>
                            <div class="message-time">${Utils.formatTime(msg.timestamp?.toDate())}</div>
                        </div>
                        <div>${Utils.sanitizeHTML(msg.message)}</div>
                    `;
                    container.appendChild(messageDiv);
                });

                container.scrollTop = container.scrollHeight;
            });
    }

    async function sendChatMessage() {
        const currentUser = Auth.getCurrentUser();
        const currentUserData = Auth.getCurrentUserData();

        if (!currentUser) {
            Utils.showAlert('Please sign in', 'error');
            Utils.showPage('auth');
            return;
        }

        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;
        if (message.length > 500) {
            Utils.showAlert('Message too long', 'error');
            return;
        }

        try {
            await chatDb.collection('messages').add({
                message: Utils.sanitizeHTML(message),
                username: currentUserData?.displayName || currentUserData?.username || currentUser.email.split('@')[0],
                userId: currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            input.value = '';
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }

    return {
        loadChatMessages,
        sendChatMessage
    };
})();
