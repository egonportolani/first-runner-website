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

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 3D Parallax effect & Interactive Aesthetic
    const mockupGlass = document.getElementById('mockup');

    document.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to screen center (from -0.5 to 0.5)
        const xCenter = (e.clientX / window.innerWidth) - 0.5;
        const yCenter = (e.clientY / window.innerHeight) - 0.5;

        // Calculate raw percentage (from 0 to 1) for radial gradients
        const xPct = e.clientX / window.innerWidth;
        const yPct = e.clientY / window.innerHeight;

        // Feed coordinates into CSS root variables
        document.documentElement.style.setProperty('--mouse-x', xCenter);
        document.documentElement.style.setProperty('--mouse-y', yCenter);
        document.documentElement.style.setProperty('--mouse-pct-x', xPct);
        document.documentElement.style.setProperty('--mouse-pct-y', yPct);

        // Fallback or specific complex tilt for the Mockup Phone
        if (window.innerWidth > 900 && mockupGlass) {
            if (!mockupGlass.matches(':hover')) {
                // Subtle tilt when NOT hovering directly
                mockupGlass.style.transform = `rotateX(${8 + (yCenter * -10)}deg) rotateY(${xCenter * 15}deg) scale(0.95)`;
            } else {
                // When hovering the container, rotate to face the user perfectly + dynamic glare
                // (Glare handled by CSS radial gradient linked to var(--mouse-pct-))
                mockupGlass.style.transform = `rotateX(${yCenter * -5}deg) rotateY(${xCenter * 5}deg) scale(1)`;
            }
        }
    });
});

// --- Particle Speed Lines Animation ---
// Gerencia as "speed lines" de corrida solicitadas nos prompts
const canvas = document.getElementById('particles-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Particles flow right to left (negative speed)
            this.speed = (Math.random() * 8) + 2;
            // Thin lines representing speed
            this.length = (Math.random() * 80) + 20;
            this.thickness = Math.random() * 1.5 + 0.5;
            // Mixed colors: aqua and magenta
            this.color = Math.random() > 0.5 ? '#00FFFF' : '#FF00FF';
            this.opacity = Math.random() * 0.4 + 0.1;
        }

        update() {
            this.x -= this.speed;
            if (this.x + this.length < 0) {
                this.x = width;
                this.y = Math.random() * height;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.length, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.thickness;
            ctx.globalAlpha = this.opacity;
            ctx.lineCap = 'round';
            // Neon glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.stroke();
        }
    }

    // Initialize particles map
    for (let i = 0; i < 120; i++) {
        particles.push(new Particle());
    }

    function animate() {
        // Create a slight trail effect by partially fading the previous frame
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'lighter'; // Additive blending for neon glow
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        requestAnimationFrame(animate);
    }

    animate();
}
