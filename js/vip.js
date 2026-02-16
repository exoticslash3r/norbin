const VIP = {
    loadFeatures: async function() {
        const user = Auth.getCurrentUser();
        const userData = Auth.getCurrentUserData();

        if (!user) {
            Utils.showPage('home');
            return;
        }

        const isVip = await Auth.checkRole('vip');
        const isOwner = await Auth.checkRole('owner');

        if (!isVip && !isOwner) {
            Utils.showAlert('VIP access required', 'error');
            Utils.showPage('home');
            return;
        }

        document.getElementById('username-color').value = userData?.usernameColor || '#ffffff';
    },

    updateUsernameColor: async function() {
        const user = Auth.getCurrentUser();
        const isVip = await Auth.checkRole('vip');
        const isOwner = await Auth.checkRole('owner');

        if (!user || (!isVip && !isOwner)) return;

        const color = document.getElementById('username-color').value;

        try {
            await db.collection('users').doc(user.uid).update({
                usernameColor: color
            });

            if (Auth.currentUserData) {
                Auth.currentUserData.usernameColor = color;
            }

            Utils.showAlert('Username color updated!', 'success');
            Auth.updateUI();
        } catch (error) {
            Utils.showAlert(error.message, 'error');
        }
    },

    getContrastColor: function(hexcolor) {
        hexcolor = hexcolor.replace("#", "");
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
};

window.VIP = VIP;
