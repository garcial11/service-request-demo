// Debug check - add this at the very top of app.js
console.log('🔍 Checking what is available:');
console.log('firebase:', typeof firebase);
console.log('FirebaseService:', typeof FirebaseService);
console.log('firebaseConfig:', typeof firebaseConfig);

// Main Application Module - Fixed Version
const App = {
    // Global variables
    currentUser: null,

    // Initialize app when page loads
    async init() {
        console.log('🚀 Initializing Service Request System...');
        
        // Wait a moment for all scripts to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            // Check if FirebaseService exists
            if (typeof FirebaseService === 'undefined') {
                console.error('❌ FirebaseService not found. Check that firebase-service.js is loaded.');
                return;
            }
            
            // Initialize Firebase - FIXED: Use FirebaseService instead of Object
            console.log('🔥 Starting Firebase initialization...');
            const success = await FirebaseService.initializeFirebase();
            
            if (success) {
                console.log('✅ Application initialized successfully!');
            } else {
                console.log('⚠️ Application running with Firebase errors');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            FirebaseService.updateFirebaseStatus('error', '❌ App Error');
        }
    },

    // Clean up when page unloads
    cleanup() {
        if (typeof FirebaseService !== 'undefined') {
            FirebaseService.cleanup();
        }
    }
};

// Make currentUser globally accessible
window.currentUser = null;

// Initialize app when page loads
window.addEventListener('load', () => {
    console.log('📄 Page loaded, starting app...');
    App.init();
});

// Clean up listeners when page unloads
window.addEventListener('beforeunload', () => {
    App.cleanup();
});

// Add error handler for uncaught errors
window.addEventListener('error', (event) => {
    console.error('❌ Uncaught error:', event.error);
});

// Add handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});