// Request Form Module
const RequestForm = {
    currentServiceType: '',
    uploadedImages: [],

    // Show service form
    showServiceForm(serviceType) {
        Helpers.hideAllScreens();
        this.currentServiceType = serviceType;
        document.getElementById('serviceForm').classList.remove('hidden');
        document.getElementById('formTitle').textContent = `Request ${Helpers.capitalize(serviceType)} Services`;
        document.getElementById('successMessage').classList.add('hidden');
        document.getElementById('errorMessage').classList.add('hidden');
        this.clearForm();
    },

    // Handle image upload
    handleImageUpload(event) {
        const files = Array.from(event.target.files);
        this.uploadedImages = [];
        const preview = document.getElementById('imagePreview');
        const label = document.getElementById('imageLabel');
        
        preview.innerHTML = '';
        
        if (files.length === 0) {
            label.textContent = '📷 Click to upload images or drag and drop';
            label.classList.remove('has-files');
            return;
        }

        label.textContent = `📷 ${files.length} image(s) selected`;
        label.classList.add('has-files');

        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadedImages.push({
                        file: file,
                        dataUrl: e.target.result
                    });
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `Preview ${index + 1}`;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    },

    // Submit request to Firebase
    async submitRequest() {
        const projectName = document.getElementById('projectName').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;
        const deadline = document.getElementById('deadline').value;

        if (!projectName || !description || !priority || !deadline) {
            alert('Please fill in all required fields');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Create request document
            const requestRef = FirebaseService.db.collection('requests').doc();
            const requestId = requestRef.id;

            // Upload images if any
            const imageUrls = await StorageService.uploadImages(requestId, this.uploadedImages);

            const request = {
                id: requestId,
                serviceType: this.currentServiceType,
                projectName: projectName,
                description: description,
                priority: priority,
                deadline: deadline,
                images: imageUrls,
                status: 'pending',
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                submittedBy: 'manager',
                quotedBy: null,
                quotedAt: null,
                quoteAmount: null,
                estimatedTime: null,
                quoteNotes: null,
                approvedAt: null,
                completedAt: null
            };

            await requestRef.set(request);

            document.getElementById('successMessage').classList.remove('hidden');
            this.clearForm();
            
        } catch (error) {
            console.error('Error submitting request:', error);
            document.getElementById('errorMessage').classList.remove('hidden');
        } finally {
            submitBtn.textContent = 'Submit Request';
            submitBtn.disabled = false;
        }
    },

    // Clear form
    clearForm() {
        document.getElementById('projectName').value = '';
        document.getElementById('description').value = '';
        document.getElementById('priority').value = '';
        document.getElementById('deadline').value = '';
        document.getElementById('jobImages').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('imageLabel').textContent = '📷 Click to upload images or drag and drop';
        document.getElementById('imageLabel').classList.remove('has-files');
        this.uploadedImages = [];
    }
};