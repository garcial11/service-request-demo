// Utility Helper Functions
const Helpers = {
    // Utility function to capitalize strings
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Hide all main screens
    hideAllScreens() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('managerDashboard').classList.add('hidden');
        document.getElementById('serviceForm').classList.add('hidden');
        document.getElementById('contractorDashboard').classList.add('hidden');
    },

    // Hide all manager tabs
    hideAllManagerTabs() {
        document.getElementById('createRequestSection').classList.add('hidden');
        document.getElementById('pendingQuotesSection').classList.add('hidden');
        document.getElementById('approvedJobsSection').classList.add('hidden');
        document.getElementById('completedJobsPMSection').classList.add('hidden');
    },

    // Set active manager tab
    setActiveManagerTab(activeId) {
        document.getElementById('createRequestBtn').classList.remove('active');
        document.getElementById('pendingQuotesBtn').classList.remove('active');
        document.getElementById('approvedJobsBtn').classList.remove('active');
        document.getElementById('completedJobsPMBtn').classList.remove('active');
        document.getElementById(activeId).classList.add('active');
    },

    // Hide all contractor tabs
    hideAllTabs() {
        document.getElementById('openRequestsTab').classList.add('hidden');
        document.getElementById('quotedJobsTab').classList.add('hidden');
        document.getElementById('myJobsTab').classList.add('hidden');
        document.getElementById('completedJobsTab').classList.add('hidden');
    },

    // Set active contractor tab
    setActiveTab(activeId) {
        document.getElementById('openRequestsBtn').classList.remove('active');
        document.getElementById('quotedJobsBtn').classList.remove('active');
        document.getElementById('myJobsBtn').classList.remove('active');
        document.getElementById('completedJobsBtn').classList.remove('active');
        document.getElementById(activeId).classList.add('active');
    },

    // Show/hide quote forms
    showQuoteForm(requestId) {
        document.getElementById('quoteForm' + requestId).classList.remove('hidden');
    },

    hideQuoteForm(requestId) {
        document.getElementById('quoteForm' + requestId).classList.add('hidden');
    }
};