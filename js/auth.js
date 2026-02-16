makeUserVIP: async function(userId) {
    if (!this.currentUser) return false;
    const isAdmin = await this.checkRole('admin');
    const isOwner = await this.checkRole('owner');
    const isManager = await this.checkRole('manager');
    
    if (!isAdmin && !isOwner && !isManager) {
        Utils.showAlert('Access denied', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isVIP: true
        });
        Utils.showAlert('User is now VIP', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
},

removeUserVIP: async function(userId) {
    if (!this.currentUser) return false;
    const isAdmin = await this.checkRole('admin');
    const isOwner = await this.checkRole('owner');
    const isManager = await this.checkRole('manager');
    
    if (!isAdmin && !isOwner && !isManager) {
        Utils.showAlert('Access denied', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isVIP: false
        });
        Utils.showAlert('VIP status removed', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
},

makeUserManager: async function(userId) {
    if (!this.currentUser) return false;
    const isAdmin = await this.checkRole('admin');
    const isOwner = await this.checkRole('owner');
    
    if (!isAdmin && !isOwner) {
        Utils.showAlert('Access denied', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isManager: true
        });
        Utils.showAlert('User is now Manager', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
},

removeUserManager: async function(userId) {
    if (!this.currentUser) return false;
    const isAdmin = await this.checkRole('admin');
    const isOwner = await this.checkRole('owner');
    
    if (!isAdmin && !isOwner) {
        Utils.showAlert('Access denied', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isManager: false
        });
        Utils.showAlert('Manager status removed', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
},

makeUserAdmin: async function(userId) {
    if (!this.currentUser) return false;
    const isOwner = await this.checkRole('owner');
    
    if (!isOwner) {
        Utils.showAlert('Only owner can grant admin', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isAdmin: true
        });
        Utils.showAlert('User is now Admin', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
},

removeUserAdmin: async function(userId) {
    if (!this.currentUser) return false;
    const isOwner = await this.checkRole('owner');
    
    if (!isOwner) {
        Utils.showAlert('Only owner can remove admin', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isAdmin: false
        });
        Utils.showAlert('Admin status removed', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
},

makeUserTagMaker: async function(userId) {
    if (!this.currentUser) return false;
    const isAdmin = await this.checkRole('admin');
    const isOwner = await this.checkRole('owner');
    const isManager = await this.checkRole('manager');
    
    if (!isAdmin && !isOwner && !isManager) {
        Utils.showAlert('Access denied', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isTagMaker: true
        });
        Utils.showAlert('User is now Tag Maker', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
},

removeUserTagMaker: async function(userId) {
    if (!this.currentUser) return false;
    const isAdmin = await this.checkRole('admin');
    const isOwner = await this.checkRole('owner');
    const isManager = await this.checkRole('manager');
    
    if (!isAdmin && !isOwner && !isManager) {
        Utils.showAlert('Access denied', 'error');
        return false;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            isTagMaker: false
        });
        Utils.showAlert('Tag Maker status removed', 'success');
        return true;
    } catch (error) {
        Utils.showAlert(error.message, 'error');
        return false;
    }
}
