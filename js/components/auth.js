// Authentication and Navigation Module
const Auth = {
    // Show login screen
    showLogin() {
        Helpers.hideAllScreens();
        document.getElementById('loginScreen').classList.remove('hidden');
        window.currentUser = null;
        FirebaseService.cleanup();
    },

    // Show manager dashboard
    showManagerDashboard() {
        Helpers.hideAllScreens();
        document.getElementById('managerDashboard').classList.remove('hidden');
        window.currentUser = 'manager';
        Helpers.hideAllManagerTabs();
        Helpers.setActiveManagerTab('createRequestBtn');
        document.getElementById('createRequestSection').classList.remove('hidden');
        FirebaseService.updateCounters();
        if (!FirebaseService.unsubscribeRequests) FirebaseService.setupRealtimeListeners();
    },

    // Show contractor dashboard
    showContractorDashboard() {
        Helpers.hideAllScreens();
        document.getElementById('contractorDashboard').classList.remove('hidden');
        window.currentUser = 'contractor';
        Dashboard.showOpenRequests();
        FirebaseService.updateCounters();
        if (!FirebaseService.unsubscribeRequests) FirebaseService.setupRealtimeListeners();
    }
};