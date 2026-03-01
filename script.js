document.addEventListener('DOMContentLoaded', () => {

    // Intersection Observer for sleek fade-up animations on scroll
    const fadeElements = document.querySelectorAll('.fade-up');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // Button interactions
    const btnDemo = document.getElementById('btn-demo');
    if (btnDemo) {
        btnDemo.addEventListener('click', () => {
            btnDemo.innerHTML = 'Connecting...';
            setTimeout(() => {
                btnDemo.innerHTML = 'Demo Scheduled!';
                btnDemo.style.background = '#10B981';
                btnDemo.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.4)';

                setTimeout(() => {
                    btnDemo.innerHTML = 'Schedule Demo';
                    btnDemo.style.background = '';
                    btnDemo.style.boxShadow = '';
                }, 3000);
            }, 1000);
        });
    }

    // 3D Parallax effect fallback if CSS isn't enough
    // We rely strongly on CSS transforms on hover for performance, 
    // but we add slight dynamic tilt based on mouse movement over the whole screen
    const mockupGlass = document.getElementById('mockup');

    if (window.innerWidth > 900 && mockupGlass) {
        document.addEventListener('mousemove', (e) => {
            // Very subtle mouse move effect, doesn't override the hover state completely
            const xAxis = (window.innerWidth / 2 - e.pageX) / 150;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 150;

            // Apply only if the user is not actively hovering the mockup directly 
            // (handled by CSS hover state overrides)
            if (!mockupGlass.matches(':hover')) {
                mockupGlass.style.transform = `rotateX(${8 + yAxis}deg) rotateY(${xAxis}deg) scale(0.95)`;
            } else {
                // When hovering, reset so CSS handles it
                mockupGlass.style.transform = '';
            }
        });
    }
});
