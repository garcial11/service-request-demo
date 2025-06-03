// Storage Service Module
const StorageService = {
    // Upload images to Firebase Storage
    async uploadImages(requestId, uploadedImages) {
        const imageUrls = [];
        
        for (let i = 0; i < uploadedImages.length; i++) {
            const imageData = uploadedImages[i];
            const fileName = `requests/${requestId}/image_${i}_${Date.now()}`;
            const storageRef = FirebaseService.storage.ref().child(fileName);
            
            try {
                const snapshot = await storageRef.put(imageData.file);
                const downloadURL = await snapshot.ref.getDownloadURL();
                imageUrls.push(downloadURL);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
        
        return imageUrls;
    }
};