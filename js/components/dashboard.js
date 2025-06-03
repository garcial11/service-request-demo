// Dashboard Module - Fixed with proper Firebase ready checks
const Dashboard = {
    // Helper method to check if Firebase is ready
    async waitForFirebase(maxRetries = 10) {
        console.log('🔍 Checking if Firebase is ready...');
        
        for (let i = 0; i < maxRetries; i++) {
            if (FirebaseService.firebaseInitialized && FirebaseService.db) {
                console.log('✅ Firebase is ready!');
                return true;
            }
            
            console.log(`⏳ Waiting for Firebase... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        }
        
        console.log('❌ Firebase not ready after waiting');
        return false;
    },

    // Helper method to display error messages
    displayError(container, error, context) {
        const errorMessage = error.includes && error.includes('permission-denied')
            ? 'Access denied. Please check your Firebase security rules.'
            : error.includes && error.includes('unavailable')
            ? 'Service temporarily unavailable. Please check your internet connection and try again.'
            : `Error loading ${context}: ${error}`;
            
        container.innerHTML = `
            <div style="text-align: center; color: #f44336; padding: 2rem; background: #ffebee; border-radius: 8px; margin: 1rem 0;">
                <h3>⚠️ Unable to Load Data</h3>
                <p>${errorMessage}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    },

    // Project Manager navigation
    showCreateRequestSection() {
        Helpers.hideAllManagerTabs();
        document.getElementById('createRequestSection').classList.remove('hidden');
        Helpers.setActiveManagerTab('createRequestBtn');
    },

    showPendingQuotes() {
        Helpers.hideAllManagerTabs();
        document.getElementById('pendingQuotesSection').classList.remove('hidden');
        Helpers.setActiveManagerTab('pendingQuotesBtn');
        this.displayPendingQuotes();
    },

    showApprovedJobs() {
        Helpers.hideAllManagerTabs();
        document.getElementById('approvedJobsSection').classList.remove('hidden');
        Helpers.setActiveManagerTab('approvedJobsBtn');
        this.displayApprovedJobs();
    },

    showCompletedJobsPM() {
        Helpers.hideAllManagerTabs();
        document.getElementById('completedJobsPMSection').classList.remove('hidden');
        Helpers.setActiveManagerTab('completedJobsPMBtn');
        this.displayCompletedJobsPM();
    },

    // Contractor navigation
    showOpenRequests() {
        Helpers.hideAllTabs();
        document.getElementById('openRequestsTab').classList.remove('hidden');
        Helpers.setActiveTab('openRequestsBtn');
        this.displayRequests();
    },

    showQuotedJobs() {
        Helpers.hideAllTabs();
        document.getElementById('quotedJobsTab').classList.remove('hidden');
        Helpers.setActiveTab('quotedJobsBtn');
        this.displayQuotedJobs();
    },

    showMyJobs() {
        Helpers.hideAllTabs();
        document.getElementById('myJobsTab').classList.remove('hidden');
        Helpers.setActiveTab('myJobsBtn');
        this.displayMyJobs();
    },

    showCompletedJobs() {
        Helpers.hideAllTabs();
        document.getElementById('completedJobsTab').classList.remove('hidden');
        Helpers.setActiveTab('completedJobsBtn');
        this.displayCompletedJobs();
    },

    // Display requests for contractors
    async displayRequests() {
        const requestList = document.getElementById('requestList');
        if (!requestList) {
            console.error('Request list element not found');
            return;
        }
        
        requestList.innerHTML = '<div class="loading">Loading requests...</div>';
        console.log('📋 Starting to display requests...');
        
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            this.displayError(requestList, 'Firebase not initialized', 'requests');
            return;
        }

        try {
            console.log('🔍 Querying pending requests...');
            const snapshot = await FirebaseService.db
                .collection('requests')
                .where('status', '==', 'pending')
                .get();

            console.log('✅ Query successful! Results:', snapshot.size);

            if (snapshot.empty) {
                requestList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No open requests available at the moment.</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const requestId = doc.id;
                const submittedDate = request.submittedAt ? request.submittedAt.toDate().toLocaleDateString() : 'Unknown';
                
                html += `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="service-type">${Helpers.capitalize(request.serviceType)}</span>
                            <span class="priority ${request.priority}">Priority: ${Helpers.capitalize(request.priority)}</span>
                        </div>
                        <h3>${request.projectName}</h3>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Deadline:</strong> ${request.deadline}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                        ${request.images && request.images.length > 0 ? `
                            <div class="request-images">
                                ${request.images.map((img, index) => `
                                    <img src="${img}" alt="Job image ${index + 1}" onclick="Modals.openModal('${img}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                        <button class="quote-btn" onclick="Dashboard.showQuoteForm('${requestId}')">Submit Quote</button>
                        <div id="quoteForm${requestId}" class="quote-form hidden">
                            <h4>Submit Your Quote</h4>
                            <div class="form-group">
                                <label>Quote Amount ($):</label>
                                <input type="number" id="quoteAmount${requestId}" placeholder="Enter your quote" min="0" step="0.01">
                            </div>
                            <div class="form-group">
                                <label>Estimated Completion Time:</label>
                                <input type="text" id="estimatedTime${requestId}" placeholder="e.g., 3-5 business days">
                            </div>
                            <div class="form-group">
                                <label>Additional Notes:</label>
                                <textarea id="quoteNotes${requestId}" placeholder="Any additional details about your quote..."></textarea>
                            </div>
                            <button class="submit-btn" onclick="Dashboard.submitQuote('${requestId}')">Submit Quote</button>
                            <button class="back-btn" onclick="Dashboard.hideQuoteForm('${requestId}')">Cancel</button>
                        </div>
                    </div>
                `;
            });

            requestList.innerHTML = html;
            console.log('✅ Requests displayed successfully');

        } catch (error) {
            console.error('❌ Error loading requests:', error);
            this.displayError(requestList, error.message, 'requests');
        }
    },

    // Quote form management
    showQuoteForm(requestId) {
        const form = document.getElementById('quoteForm' + requestId);
        if (form) {
            form.classList.remove('hidden');
        }
    },

    hideQuoteForm(requestId) {
        const form = document.getElementById('quoteForm' + requestId);
        if (form) {
            form.classList.add('hidden');
        }
    },

    // Display contractor's quoted jobs
    async displayQuotedJobs() {
        const quotedJobsList = document.getElementById('quotedJobsList');
        if (!quotedJobsList) {
            console.error('Quoted jobs list element not found');
            return;
        }
        
        quotedJobsList.innerHTML = '<div class="loading">Loading quoted jobs...</div>';
        console.log('📋 Starting to display quoted jobs...');
        
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            this.displayError(quotedJobsList, 'Firebase not initialized', 'quoted jobs');
            return;
        }

        try {
            console.log('🔍 Querying quoted jobs...');
            const snapshot = await FirebaseService.db
                .collection('requests')
                .where('status', '==', 'quoted')
                .where('quotedBy', '==', 'contractor')
                .get();

            console.log('✅ Quoted jobs query successful! Results:', snapshot.size);

            if (snapshot.empty) {
                quotedJobsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No quoted jobs yet. Submit quotes for open requests!</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const submittedDate = request.submittedAt ? request.submittedAt.toDate().toLocaleDateString() : 'Unknown';
                const quotedDate = request.quotedAt ? request.quotedAt.toDate().toLocaleDateString() : 'Unknown';
                
                html += `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="service-type">${Helpers.capitalize(request.serviceType)}</span>
                            <span class="status-badge quoted">Quoted - Awaiting Approval</span>
                            <span class="priority ${request.priority}">Priority: ${Helpers.capitalize(request.priority)}</span>
                        </div>
                        <h3>${request.projectName}</h3>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Deadline:</strong> ${request.deadline}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                        <p><strong>Quoted:</strong> ${quotedDate}</p>
                        ${request.images && request.images.length > 0 ? `
                            <div class="request-images">
                                ${request.images.map((img, index) => `
                                    <img src="${img}" alt="Job image ${index + 1}" onclick="Modals.openModal('${img}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="quote-display">
                            <p><strong>Your Quote:</strong> <span class="quote-price">$${request.quoteAmount}</span></p>
                            <p><strong>Estimated Time:</strong> ${request.estimatedTime}</p>
                            ${request.quoteNotes ? `<p><strong>Notes:</strong> ${request.quoteNotes}</p>` : ''}
                        </div>
                    </div>
                `;
            });

            quotedJobsList.innerHTML = html;
            console.log('✅ Quoted jobs displayed successfully');

        } catch (error) {
            console.error('❌ Error loading quoted jobs:', error);
            this.displayError(quotedJobsList, error.message, 'quoted jobs');
        }
    },

    // Display contractor's active jobs
    async displayMyJobs() {
        const myJobsList = document.getElementById('myJobsList');
        if (!myJobsList) {
            console.error('My jobs list element not found');
            return;
        }
        
        myJobsList.innerHTML = '<div class="loading">Loading active jobs...</div>';
        console.log('📋 Starting to display my jobs...');
        
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            this.displayError(myJobsList, 'Firebase not initialized', 'active jobs');
            return;
        }

        try {
            console.log('🔍 Querying my jobs...');
            const snapshot = await FirebaseService.db
                .collection('requests')
                .where('status', '==', 'approved')
                .where('quotedBy', '==', 'contractor')
                .get();

            console.log('✅ My jobs query successful! Results:', snapshot.size);

            if (snapshot.empty) {
                myJobsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No active jobs yet. Submit quotes to get started!</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const requestId = doc.id;
                const submittedDate = request.submittedAt ? request.submittedAt.toDate().toLocaleDateString() : 'Unknown';
                const quotedDate = request.quotedAt ? request.quotedAt.toDate().toLocaleDateString() : 'Unknown';
                const approvedDate = request.approvedAt ? request.approvedAt.toDate().toLocaleDateString() : 'Unknown';
                
                html += `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="service-type">${Helpers.capitalize(request.serviceType)}</span>
                            <span class="status-badge approved">Approved - In Progress</span>
                            <span class="priority ${request.priority}">Priority: ${Helpers.capitalize(request.priority)}</span>
                        </div>
                        <h3>${request.projectName}</h3>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Deadline:</strong> ${request.deadline}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                        <p><strong>Quoted:</strong> ${quotedDate}</p>
                        <p><strong>Approved:</strong> ${approvedDate}</p>
                        ${request.images && request.images.length > 0 ? `
                            <div class="request-images">
                                ${request.images.map((img, index) => `
                                    <img src="${img}" alt="Job image ${index + 1}" onclick="Modals.openModal('${img}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="quote-display">
                            <p><strong>Approved Quote:</strong> <span class="quote-price">$${request.quoteAmount}</span></p>
                            <p><strong>Estimated Time:</strong> ${request.estimatedTime}</p>
                            ${request.quoteNotes ? `<p><strong>Notes:</strong> ${request.quoteNotes}</p>` : ''}
                        </div>
                        <button class="complete-btn" onclick="Dashboard.completeJob('${requestId}')">Mark as Complete</button>
                    </div>
                `;
            });

            myJobsList.innerHTML = html;
            console.log('✅ My jobs displayed successfully');

        } catch (error) {
            console.error('❌ Error loading my jobs:', error);
            this.displayError(myJobsList, error.message, 'active jobs');
        }
    },

    // Display contractor's completed jobs
    async displayCompletedJobs() {
        const completedJobsList = document.getElementById('completedJobsList');
        if (!completedJobsList) {
            console.error('Completed jobs list element not found');
            return;
        }
        
        completedJobsList.innerHTML = '<div class="loading">Loading completed jobs...</div>';
        console.log('📋 Starting to display completed jobs...');
        
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            this.displayError(completedJobsList, 'Firebase not initialized', 'completed jobs');
            return;
        }

        try {
            console.log('🔍 Querying completed jobs...');
            const snapshot = await FirebaseService.db
                .collection('requests')
                .where('status', '==', 'completed')
                .where('quotedBy', '==', 'contractor')
                .get();

            console.log('✅ Completed jobs query successful! Results:', snapshot.size);

            if (snapshot.empty) {
                completedJobsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No completed jobs yet. Keep up the great work!</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const submittedDate = request.submittedAt ? request.submittedAt.toDate().toLocaleDateString() : 'Unknown';
                const quotedDate = request.quotedAt ? request.quotedAt.toDate().toLocaleDateString() : 'Unknown';
                const approvedDate = request.approvedAt ? request.approvedAt.toDate().toLocaleDateString() : 'Unknown';
                const completedDate = request.completedAt ? request.completedAt.toDate().toLocaleDateString() : 'Unknown';
                
                html += `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="service-type">${Helpers.capitalize(request.serviceType)}</span>
                            <span class="status-badge completed">Completed</span>
                            <span class="priority ${request.priority}">Priority: ${Helpers.capitalize(request.priority)}</span>
                        </div>
                        <h3>${request.projectName}</h3>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Original Deadline:</strong> ${request.deadline}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                        <p><strong>Quoted:</strong> ${quotedDate}</p>
                        <p><strong>Approved:</strong> ${approvedDate}</p>
                        <p><strong>Completed:</strong> ${completedDate}</p>
                        ${request.images && request.images.length > 0 ? `
                            <div class="request-images">
                                ${request.images.map((img, index) => `
                                    <img src="${img}" alt="Job image ${index + 1}" onclick="Modals.openModal('${img}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="quote-display">
                            <p><strong>Final Quote:</strong> <span class="quote-price">$${request.quoteAmount}</span></p>
                            <p><strong>Completion Time:</strong> ${request.estimatedTime}</p>
                            ${request.quoteNotes ? `<p><strong>Notes:</strong> ${request.quoteNotes}</p>` : ''}
                        </div>
                    </div>
                `;
            });

            completedJobsList.innerHTML = html;
            console.log('✅ Completed jobs displayed successfully');

        } catch (error) {
            console.error('❌ Error loading completed jobs:', error);
            this.displayError(completedJobsList, error.message, 'completed jobs');
        }
    },

    // Display pending quotes for Project Manager
    async displayPendingQuotes() {
        const pendingQuotesList = document.getElementById('pendingQuotesList');
        if (!pendingQuotesList) {
            console.error('Pending quotes list element not found');
            return;
        }
        
        pendingQuotesList.innerHTML = '<div class="loading">Loading pending quotes...</div>';
        console.log('📋 Starting to display pending quotes...');
        
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            this.displayError(pendingQuotesList, 'Firebase not initialized', 'pending quotes');
            return;
        }

        try {
            console.log('🔍 Querying pending quotes...');
            const snapshot = await FirebaseService.db
                .collection('requests')
                .where('status', '==', 'quoted')
                .get();

            console.log('✅ Pending quotes query successful! Results:', snapshot.size);

            if (snapshot.empty) {
                pendingQuotesList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No pending quotes at the moment.</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const requestId = doc.id;
                const submittedDate = request.submittedAt ? request.submittedAt.toDate().toLocaleDateString() : 'Unknown';
                const quotedDate = request.quotedAt ? request.quotedAt.toDate().toLocaleDateString() : 'Unknown';
                
                html += `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="service-type">${Helpers.capitalize(request.serviceType)}</span>
                            <span class="status-badge quoted">Quote Received</span>
                            <span class="priority ${request.priority}">Priority: ${Helpers.capitalize(request.priority)}</span>
                        </div>
                        <h3>${request.projectName}</h3>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Deadline:</strong> ${request.deadline}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                        <p><strong>Quote Received:</strong> ${quotedDate}</p>
                        ${request.images && request.images.length > 0 ? `
                            <div class="request-images">
                                ${request.images.map((img, index) => `
                                    <img src="${img}" alt="Job image ${index + 1}" onclick="Modals.openModal('${img}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="quote-display">
                            <p><strong>Contractor Quote:</strong> <span class="quote-price">$${request.quoteAmount}</span></p>
                            <p><strong>Estimated Time:</strong> ${request.estimatedTime}</p>
                            ${request.quoteNotes ? `<p><strong>Notes:</strong> ${request.quoteNotes}</p>` : ''}
                        </div>
                        <button class="approve-btn" onclick="Dashboard.approveQuote('${requestId}')">Approve Quote</button>
                        <button class="reject-btn" onclick="Dashboard.rejectQuote('${requestId}')">Reject Quote</button>
                    </div>
                `;
            });

            pendingQuotesList.innerHTML = html;
            console.log('✅ Pending quotes displayed successfully');

        } catch (error) {
            console.error('❌ Error loading pending quotes:', error);
            this.displayError(pendingQuotesList, error.message, 'pending quotes');
        }
    },

    // Display approved jobs for Project Manager
    async displayApprovedJobs() {
        const approvedJobsList = document.getElementById('approvedJobsList');
        if (!approvedJobsList) {
            console.error('Approved jobs list element not found');
            return;
        }
        
        approvedJobsList.innerHTML = '<div class="loading">Loading active jobs...</div>';
        console.log('📋 Starting to display approved jobs...');
        
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            this.displayError(approvedJobsList, 'Firebase not initialized', 'approved jobs');
            return;
        }

        try {
            console.log('🔍 Querying approved jobs...');
            const snapshot = await FirebaseService.db
                .collection('requests')
                .where('status', '==', 'approved')
                .get();

            console.log('✅ Approved jobs query successful! Results:', snapshot.size);

            if (snapshot.empty) {
                approvedJobsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No active jobs at the moment.</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const submittedDate = request.submittedAt ? request.submittedAt.toDate().toLocaleDateString() : 'Unknown';
                const approvedDate = request.approvedAt ? request.approvedAt.toDate().toLocaleDateString() : 'Unknown';
                
                html += `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="service-type">${Helpers.capitalize(request.serviceType)}</span>
                            <span class="status-badge approved">In Progress</span>
                            <span class="priority ${request.priority}">Priority: ${Helpers.capitalize(request.priority)}</span>
                        </div>
                        <h3>${request.projectName}</h3>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Deadline:</strong> ${request.deadline}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                        <p><strong>Approved:</strong> ${approvedDate}</p>
                        ${request.images && request.images.length > 0 ? `
                            <div class="request-images">
                                ${request.images.map((img, index) => `
                                    <img src="${img}" alt="Job image ${index + 1}" onclick="Modals.openModal('${img}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="quote-display">
                            <p><strong>Approved Quote:</strong> <span class="quote-price">$${request.quoteAmount}</span></p>
                            <p><strong>Estimated Time:</strong> ${request.estimatedTime}</p>
                            ${request.quoteNotes ? `<p><strong>Notes:</strong> ${request.quoteNotes}</p>` : ''}
                        </div>
                    </div>
                `;
            });

            approvedJobsList.innerHTML = html;
            console.log('✅ Approved jobs displayed successfully');

        } catch (error) {
            console.error('❌ Error loading approved jobs:', error);
            this.displayError(approvedJobsList, error.message, 'approved jobs');
        }
    },

    // Display completed jobs for Project Manager
    async displayCompletedJobsPM() {
        const completedJobsList = document.getElementById('completedJobsPMList');
        if (!completedJobsList) {
            console.error('Completed jobs PM list element not found');
            return;
        }
        
        completedJobsList.innerHTML = '<div class="loading">Loading completed jobs...</div>';
        console.log('📋 Starting to display completed jobs (PM)...');
        
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            this.displayError(completedJobsList, 'Firebase not initialized', 'completed jobs');
            return;
        }

        try {
            console.log('🔍 Querying completed jobs (PM)...');
            const snapshot = await FirebaseService.db
                .collection('requests')
                .where('status', '==', 'completed')
                .get();

            console.log('✅ Completed jobs (PM) query successful! Results:', snapshot.size);

            if (snapshot.empty) {
                completedJobsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No completed jobs yet.</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const submittedDate = request.submittedAt ? request.submittedAt.toDate().toLocaleDateString() : 'Unknown';
                const approvedDate = request.approvedAt ? request.approvedAt.toDate().toLocaleDateString() : 'Unknown';
                const completedDate = request.completedAt ? request.completedAt.toDate().toLocaleDateString() : 'Unknown';
                
                html += `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="service-type">${Helpers.capitalize(request.serviceType)}</span>
                            <span class="status-badge completed">Completed</span>
                            <span class="priority ${request.priority}">Priority: ${Helpers.capitalize(request.priority)}</span>
                        </div>
                        <h3>${request.projectName}</h3>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Original Deadline:</strong> ${request.deadline}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                        <p><strong>Approved:</strong> ${approvedDate}</p>
                        <p><strong>Completed:</strong> ${completedDate}</p>
                        ${request.images && request.images.length > 0 ? `
                            <div class="request-images">
                                ${request.images.map((img, index) => `
                                    <img src="${img}" alt="Job image ${index + 1}" onclick="Modals.openModal('${img}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="quote-display">
                            <p><strong>Final Quote:</strong> <span class="quote-price">$${request.quoteAmount}</span></p>
                            <p><strong>Completion Time:</strong> ${request.estimatedTime}</p>
                            ${request.quoteNotes ? `<p><strong>Notes:</strong> ${request.quoteNotes}</p>` : ''}
                        </div>
                    </div>
                `;
            });

            completedJobsList.innerHTML = html;
            console.log('✅ Completed jobs (PM) displayed successfully');

        } catch (error) {
            console.error('❌ Error loading completed jobs (PM):', error);
            this.displayError(completedJobsList, error.message, 'completed jobs');
        }
    },

    // Submit quote to Firebase
    async submitQuote(requestId) {
        const quoteAmount = document.getElementById('quoteAmount' + requestId);
        const estimatedTime = document.getElementById('estimatedTime' + requestId);
        const quoteNotes = document.getElementById('quoteNotes' + requestId);

        if (!quoteAmount || !estimatedTime) {
            console.error('Quote form elements not found');
            return;
        }

        if (!quoteAmount.value || !estimatedTime.value) {
            alert('Please fill in the quote amount and estimated time');
            return;
        }

        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            alert('Firebase not ready. Please try again.');
            return;
        }

        try {
            console.log('💾 Submitting quote for request:', requestId);
            await FirebaseService.db.collection('requests').doc(requestId).update({
                status: 'quoted',
                quotedBy: 'contractor',
                quotedAt: firebase.firestore.FieldValue.serverTimestamp(),
                quoteAmount: parseFloat(quoteAmount.value),
                estimatedTime: estimatedTime.value,
                quoteNotes: quoteNotes.value || ''
            });

            console.log('✅ Quote submitted successfully');
            alert('Quote submitted successfully! Waiting for Project Manager approval.');
            this.hideQuoteForm(requestId);
            this.displayRequests(); // Refresh the view
            
        } catch (error) {
            console.error('❌ Error submitting quote:', error);
            alert('Error submitting quote. Please try again.');
        }
    },

    // Approve quote
    async approveQuote(requestId) {
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            alert('Firebase not ready. Please try again.');
            return;
        }

        try {
            console.log('📋 Getting request details for approval:', requestId);
            const doc = await FirebaseService.db.collection('requests').doc(requestId).get();
            const request = doc.data();
            
            if (confirm(`Approve quote of ${request.quoteAmount} for "${request.projectName}"?`)) {
                console.log('✅ Approving quote...');
                await FirebaseService.db.collection('requests').doc(requestId).update({
                    status: 'approved',
                    approvedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log('✅ Quote approved successfully');
                alert('Quote approved! The job is now active.');
                this.displayPendingQuotes(); // Refresh the view
            }
        } catch (error) {
            console.error('❌ Error approving quote:', error);
            alert('Error approving quote. Please try again.');
        }
    },

    // Reject quote
    async rejectQuote(requestId) {
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            alert('Firebase not ready. Please try again.');
            return;
        }

        try {
            console.log('📋 Getting request details for rejection:', requestId);
            const doc = await FirebaseService.db.collection('requests').doc(requestId).get();
            const request = doc.data();
            
            if (confirm(`Reject quote for "${request.projectName}"? This will make it available for new quotes.`)) {
                console.log('❌ Rejecting quote...');
                await FirebaseService.db.collection('requests').doc(requestId).update({
                    status: 'pending',
                    quotedBy: null,
                    quotedAt: null,
                    quoteAmount: null,
                    estimatedTime: null,
                    quoteNotes: null
                });

                console.log('✅ Quote rejected successfully');
                alert('Quote rejected. The job is now open for new quotes.');
                this.displayPendingQuotes(); // Refresh the view
            }
        } catch (error) {
            console.error('❌ Error rejecting quote:', error);
            alert('Error rejecting quote. Please try again.');
        }
    },

    // Complete job
    async completeJob(requestId) {
        // Wait for Firebase to be ready
        const isReady = await this.waitForFirebase();
        if (!isReady) {
            alert('Firebase not ready. Please try again.');
            return;
        }

        try {
            console.log('📋 Getting request details for completion:', requestId);
            const doc = await FirebaseService.db.collection('requests').doc(requestId).get();
            const request = doc.data();
            
            if (confirm(`Mark "${request.projectName}" as complete?`)) {
                console.log('✅ Completing job...');
                await FirebaseService.db.collection('requests').doc(requestId).update({
                    status: 'completed',
                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log('✅ Job completed successfully');
                alert(`Job "${request.projectName}" has been marked as complete!`);
                this.displayMyJobs(); // Refresh the view
            }
        } catch (error) {
            console.error('❌ Error completing job:', error);
            alert('Error completing job. Please try again.');
        }
    }
};