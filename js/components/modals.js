// Modals Module
const Modals = {
    // Image modal functions
    openModal(imageSrc) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        modal.style.display = 'block';
        modalImg.src = imageSrc;
    },

    closeModal() {
        document.getElementById('imageModal').style.display = 'none';
    }
};

// Close modal when clicking outside the image
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        Modals.closeModal();
    }
};