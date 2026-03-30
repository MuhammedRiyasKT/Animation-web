document.addEventListener('DOMContentLoaded', () => {
    // Gallery switching logic
    const mainImg = document.querySelector('.gallery-main img');
    const thumbs = document.querySelectorAll('.thumb');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            // Remove active class from all
            thumbs.forEach(t => t.classList.remove('active'));
            // Add to current
            thumb.classList.add('active');
            // Swap image src
            const newSrc = thumb.querySelector('img').src;
            mainImg.src = newSrc;
        });
    });

    // Simple sticky header class on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = 'var(--shadow-soft)';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            header.style.boxShadow = 'none';
            header.style.background = 'rgba(255, 255, 255, 0.8)';
        }
    });

    // Pincode check simulation
    const pincodeBtn = document.querySelector('.input-group button');
    const pincodeInput = document.querySelector('.input-group input');
    const deliveryStatus = document.querySelector('.delivery-status');

    if (pincodeBtn) {
        pincodeBtn.addEventListener('click', () => {
            const val = pincodeInput.value;
            if (val.length === 6 && !isNaN(val)) {
                deliveryStatus.textContent = `Express delivery available for ${val}`;
                deliveryStatus.style.color = '#004D40';
            } else {
                deliveryStatus.textContent = 'Please enter a valid 6-digit pincode';
                deliveryStatus.style.color = '#C62828';
            }
        });
    }
});
