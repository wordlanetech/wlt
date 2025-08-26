// DOM Elements
const profileButton = document.getElementById('profileButton');
const profileDropdown = document.getElementById('profileDropdown');

// Toggle dropdown visibility
profileButton.addEventListener('click', (event) => {
    event.stopPropagation();
    profileDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!profileDropdown.contains(event.target) && !profileButton.contains(event.target)) {
        profileDropdown.classList.remove('show');
    }
});

// Set active navigation link based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}); 