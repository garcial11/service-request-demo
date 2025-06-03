// Complete Firebase Service - Working Version
const FirebaseService = {
    db: null,
    storage: null,
    unsubscribeRequests: null,
    firebaseInitialized: false,

    // Firebase connection status
    updateFirebaseStatus(status, message) {
        const statusEl = document.getElementById('firebaseStatus');
        if (statusEl) {
            statusEl.className = `firebase-status ${status}`;
            statusEl.textContent = message;
        }
        console.log(`🔥 Firebase Status: ${status} - ${message}`);
    },

    // Initialize Firebase with proper error handling
    async initializeFirebase() {
        try {
            console.log('🚀 Starting Firebase initialization...');
            this.updateFirebaseStatus('connecting', 'Connecting...');
            
            // Check if Firebase SDK is loaded
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded. Check your script tags in index.html');
            }
            console.log('✅ Firebase SDK found');

            // Check if config exists
            if (typeof firebaseConfig === 'undefined') {
                throw new Error('Firebase config not found. Check firebase-config.js');
            }
            console.log('✅ Firebase config found');

            // Initialize Firebase app (only if not already initialized)
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase app initialized');
            } else {
                console.log('✅ Firebase app already initialized');
            }
            
            // Get database references
            this.db = firebase.firestore();
            this.storage = firebase.storage();
            console.log('✅ Firestore and Storage references obtained');
            
            // Test connection with a simple query
            console.log('🔍 Testing Firestore connection...');
            await this.db.collection('test').limit(1).get();
            console.log('✅ Firestore connection successful');
            
            // Mark as initialized
            this.firebaseInitialized = true;
            this.updateFirebaseStatus('connected', '🔥 Firebase Ready');
            
            // Add sample data and setup listeners
            await this.addSampleDataToFirebase();
            this.setupRealtimeListeners();
            
            console.log('🎉 Firebase initialization complete!');
            return true;
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.updateFirebaseStatus('error', `❌ ${error.message}`);
            
            // Show specific error guidance
            if (error.code === 'permission-denied') {
                console.log('🔧 Fix: Update Firebase security rules');
                console.log('   Go to Firebase Console → Firestore → Rules');
                console.log('   Set rules to: allow read, write: if true;');
            } else if (error.message.includes('SDK not loaded')) {
                console.log('🔧 Fix: Check that Firebase scripts are loaded in index.html');
            } else if (error.message.includes('config not found')) {
                console.log('🔧 Fix: Check that firebase-config.js is loaded');
            }
            
            return false;
        }
    },

    // Add sample data to Firebase
    async addSampleDataToFirebase() {
        try {
            console.log('📋 Checking for existing data...');
            
            // Check if we already have data
            const existingData = await this.db.collection('requests').limit(1).get();
            if (!existingData.empty) {
                console.log('✅ Sample data already exists');
                return;
            }

            console.log('📝 Adding sample data...');
            
            const sampleRequests = [
                {
                    serviceType: 'contractor',
                    projectName: 'Office Renovation',
                    description: 'Complete renovation of the main office space including flooring, painting, and electrical work.',
                    priority: 'high',
                    deadline: '2025-06-15',
                    images: [],
                    status: 'pending',
                    submittedAt: firebase.firestore.Timestamp.now(),
                    submittedBy: 'manager',
                    quotedBy: null,
                    quotedAt: null,
                    quoteAmount: null,
                    estimatedTime: null,
                    quoteNotes: null,
                    approvedAt: null,
                    completedAt: null
                },
                {
                    serviceType: 'handyman',
                    projectName: 'Fix Leaky Faucets',
                    description: 'Multiple faucets in the building need repair or replacement.',
                    priority: 'medium',
                    deadline: '2025-06-10',
                    images: [],
                    status: 'approved',
                    submittedAt: firebase.firestore.Timestamp.fromDate(new Date('2025-05-28')),
                    submittedBy: 'manager',
                    quotedBy: 'contractor',
                    quotedAt: firebase.firestore.Timestamp.fromDate(new Date('2025-05-29')),
                    quoteAmount: 350,
                    estimatedTime: '2-3 days',
                    quoteNotes: 'Will include new faucet parts if needed',
                    approvedAt: firebase.firestore.Timestamp.fromDate(new Date('2025-05-30')),
                    completedAt: null
                },
                {
                    serviceType: 'cleaning',
                    projectName: 'Deep Clean Conference Rooms',
                    description: 'Deep cleaning service needed for all conference rooms before important client meetings.',
                    priority: 'high',
                    deadline: '2025-06-05',
                    images: [],
                    status: 'pending',
                    submittedAt: firebase.firestore.Timestamp.fromDate(new Date('2025-05-27')),
                    submittedBy: 'manager',
                    quotedBy: null,
                    quotedAt: null,
                    quoteAmount: null,
                    estimatedTime: null,
                    quoteNotes: null,
                    approvedAt: null,
                    completedAt: null
                }
            ];

            // Add each sample request
            for (const requestData of sampleRequests) {
                await this.db.collection('requests').add(requestData);
                console.log('✅ Added:', requestData.projectName);
            }

            console.log('🎉 Sample data added successfully!');
            
        } catch (error) {
            console.error('❌ Error adding sample data:', error);
            // Don't throw error - app can still work without sample data
        }
    },

    // Setup real-time listeners
    setupRealtimeListeners() {
        if (!this.firebaseInitialized || !this.db) {
            console.log('❌ Cannot setup listeners - Firebase not ready');
            return;
        }
        
        try {
            console.log('🔗 Setting up real-time listeners...');
            
            this.unsubscribeRequests = this.db.collection('requests')
                .onSnapshot(
                    (snapshot) => {
                        console.log('📡 Real-time update received:', snapshot.size, 'documents');
                        this.updateCounters();
                        this.refreshCurrentView();
                    },
                    (error) => {
                        console.error('❌ Real-time listener error:', error);
                        if (error.code === 'permission-denied') {
                            this.updateFirebaseStatus('error', '❌ Permission denied');
                        }
                    }
                );
                
            console.log('✅ Real-time listeners active');
        } catch (error) {
            console.error('❌ Error setting up listeners:', error);
        }
    },

    // Refresh current view when data changes
    refreshCurrentView() {
        // Only refresh if not on login screen
        if (!document.getElementById('loginScreen').classList.contains('hidden')) {
            return;
        }
        
        if (window.currentUser === 'contractor') {
            const activeTab = document.querySelector('.contractor-nav .nav-btn.active');
            if (activeTab) {
                const tabId = activeTab.id;
                if (tabId === 'openRequestsBtn') Dashboard.displayRequests();
                else if (tabId === 'quotedJobsBtn') Dashboard.displayQuotedJobs();
                else if (tabId === 'myJobsBtn') Dashboard.displayMyJobs();
                else if (tabId === 'completedJobsBtn') Dashboard.displayCompletedJobs();
            }
        } else if (window.currentUser === 'manager') {
            const activeTab = document.querySelector('#managerDashboard .nav-btn.active');
            if (activeTab) {
                const tabId = activeTab.id;
                if (tabId === 'pendingQuotesBtn') Dashboard.displayPendingQuotes();
                else if (tabId === 'approvedJobsBtn') Dashboard.displayApprovedJobs();
                else if (tabId === 'completedJobsPMBtn') Dashboard.displayCompletedJobsPM();
            }
        }
    },

    // Update counters
    async updateCounters() {
        if (!this.firebaseInitialized || !this.db) {
            console.log('❌ Cannot update counters - Firebase not ready');
            return;
        }
        
        try {
            // Get all requests and count them
            const snapshot = await this.db.collection('requests').get();
            
            let pendingQuotes = 0;
            let approvedJobs = 0;
            let completedJobs = 0;
            let quotedJobs = 0;
            let myJobs = 0;
            let completedContractor = 0;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                switch (data.status) {
                    case 'quoted':
                        pendingQuotes++;
                        if (data.quotedBy === 'contractor') quotedJobs++;
                        break;
                    case 'approved':
                        approvedJobs++;
                        if (data.quotedBy === 'contractor') myJobs++;
                        break;
                    case 'completed':
                        completedJobs++;
                        if (data.quotedBy === 'contractor') completedContractor++;
                        break;
                }
            });

            // Update all counters
            this.updateCounter('pendingQuotesCount', pendingQuotes);
            this.updateCounter('approvedJobsCount', approvedJobs);
            this.updateCounter('completedJobsPMCount', completedJobs);
            this.updateCounter('quotedJobsCount', quotedJobs);
            this.updateCounter('myJobsCount', myJobs);
            this.updateCounter('completedJobsCount', completedContractor);
            
            console.log('✅ Counters updated');
            
        } catch (error) {
            console.error('❌ Error updating counters:', error);
        }
    },

    // Helper to update individual counter
    updateCounter(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
        }
    },

    // Clean up listeners
    cleanup() {
        console.log('🧹 Cleaning up Firebase listeners...');
        if (this.unsubscribeRequests) {
            this.unsubscribeRequests();
            this.unsubscribeRequests = null;
        }
    }
};