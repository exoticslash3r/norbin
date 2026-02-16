const Chat = {
    loadMessages: function() {
        if (!window.chatDb) {
            console.error('Chat database not initialized');
            return;
        }

        chatDb.collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const container = document.getElementById('chat-messages');
                if (!container) return;
                
                container.innerHTML = '';

                const messages = [];
                const processedIds = new Set();
                
                snapshot.forEach(doc => {
                    const msgId = doc.id;
                    if (processedIds.has(msgId)) return;
                    processedIds.add(msgId);
                    messages.push({ id: msgId, ...doc.data() });
                });
                
                messages.sort((a, b) => {
                    const timeA = a.timestamp?.toDate?.() || new Date(0);
                    const timeB = b.timestamp?.toDate?.() || new Date(0);
                    return timeA - timeB;
                });

                if (messages.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #888;">No messages yet. Be the first to chat!</div>';
                    return;
                }

                messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message';
                    
                    const headerDiv = document.createElement('div');
                    headerDiv.className = 'message-header';
                    
                    const senderSpan = document.createElement('span');
                    senderSpan.className = 'message-sender';
                    senderSpan.style.cursor = 'pointer';
                    senderSpan.onclick = () => {
                        if (window.Profile) {
                            Profile.showUserProfile(msg.userId);
                        }
                    };
                    senderSpan.textContent = Utils.sanitizeHTML(msg.username || 'Unknown');
                    
                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'message-time';
                    timeSpan.textContent = Utils.formatTime(msg.timestamp?.toDate());
                    
                    headerDiv.appendChild(senderSpan);
                    headerDiv.appendChild(timeSpan);
                    
                    const contentDiv = document.createElement('div');
                    contentDiv.textContent = Utils.sanitizeHTML(msg.message);
                    
                    messageDiv.appendChild(headerDiv);
                    messageDiv.appendChild(contentDiv);
                    
                    container.appendChild(messageDiv);
                });

                container.scrollTop = container.scrollHeight;
                
                // Update online count (simple version)
                document.getElementById('onlineCount').textContent = '1';
            }, error => {
                console.error('Chat error:', error);
                const container = document.getElementById('chat-messages');
                if (container) {
                    container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #ff0000;">Error loading chat</div>';
                }
            });
    },

    sendMessage: async function() {
        const user = Auth.getCurrentUser();
        const userData = Auth.getCurrentUserData();

        if (!user) {
            Utils.showAlert('Please sign in to chat', 'error');
            Utils.showPage('auth');
            return;
        }

        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;
        if (message.length > 500) {
            Utils.showAlert('Message too long (max 500 characters)', 'error');
            return;
        }

        try {
            await chatDb.collection('messages').add({
                message: Utils.sanitizeHTML(message),
                username: userData?.displayName || userData?.username || user.email.split('@')[0],
                userId: user.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            input.value = '';
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    }
};

window.Chat = Chat;
