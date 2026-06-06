document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Toggling Overlay Logic
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        });
    }

    // Closing the overlay tracking on select options click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        });
    });

    // 2. High-Performance Intersection Observer for Scroll Triggered Animations
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Active trigger injection
                entry.target.classList.add('active');
                // Unobserve for extreme engine speed scrolling optimization
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,  // Faster reaction time triggers animations early
        rootMargin: "0px 0px -15px 0px"
    });

    revealElements.forEach(element => {
        revealOnScrollObserver.observe(element);
    });

    // 3. Precise Tracking Navigation Link Highlighter
    const sections = document.querySelectorAll('header, section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let currentActiveSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                currentActiveSection = section.getAttribute('id') || '';
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentActiveSection}`) {
                item.classList.add('active');
            }
        });
    });
});