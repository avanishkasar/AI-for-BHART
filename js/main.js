/* =============================================
   CodeRescue AI — Main JavaScript
   Landing page interactions & animations
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initStatBars();
    initTerminalAnimation();
});

/* ── Twinkling Stars Background ── */
function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const starCount = 180;
    const twinkleClasses = ['twinkle-1', 'twinkle-2', 'twinkle-3', 'twinkle-4', 'twinkle-5'];

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random position across the whole viewport
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        // Vary star sizes: most are tiny (1-2px), a few are bigger (up to 3px)
        const size = Math.random() < 0.85 ? (1 + Math.random()) : (2 + Math.random() * 1.5);
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        // Slight color tint — most white, some have faint blue/warm hue
        const rand = Math.random();
        if (rand > 0.92) {
            star.style.background = '#c8d8ff'; // faint blue
        } else if (rand > 0.85) {
            star.style.background = '#fff5e0'; // faint warm
        }

        // Pick a random twinkle animation and random delay
        const twinkleClass = twinkleClasses[Math.floor(Math.random() * twinkleClasses.length)];
        star.classList.add(twinkleClass);
        star.style.animationDelay = (Math.random() * 8).toFixed(2) + 's';

        // Base opacity — dimmer stars far away, brighter closer
        star.style.opacity = (0.1 + Math.random() * 0.5).toFixed(2);

        container.appendChild(star);
    }
}

/* ── Navbar Scroll Effect ── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* ── Mobile Menu ── */
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        links.classList.toggle('active');
        toggle.classList.toggle('active');
    });

    // Close menu on link click
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('active');
            toggle.classList.remove('active');
        });
    });
}

/* ── Scroll Animations ── */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay based on position within grid
                const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
                let siblingIndex = 0;
                siblings.forEach((sib, i) => {
                    if (sib === entry.target) siblingIndex = i;
                });
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, siblingIndex * 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ── Stat Bars Animation ── */
function initStatBars() {
    const bars = document.querySelectorAll('.stat-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.dataset.width;
                setTimeout(() => {
                    entry.target.style.width = width + '%';
                }, 300);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    bars.forEach(bar => observer.observe(bar));
}

/* ── Terminal Typing Animation ── */
function initTerminalAnimation() {
    const line1 = document.getElementById('typeLine1');
    if (!line1) return;

    const typeText = line1.querySelector('.terminal-text');
    const fullText = typeText?.dataset.text || 'coderescue --panic';
    
    let charIndex = 0;
    
    function typeChar() {
        if (charIndex < fullText.length) {
            typeText.textContent = fullText.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(typeChar, 80 + Math.random() * 40);
        } else {
            // Remove cursor from typed text
            typeText.classList.remove('typing');
            // Show output lines sequentially
            showOutputLines();
        }
    }

    function showOutputLines() {
        const lines = [
            'typeLine2', 'typeLine3', 'typeLine4', 'typeLine5', 'typeLine6'
        ];
        
        lines.forEach((lineId, i) => {
            setTimeout(() => {
                const el = document.getElementById(lineId);
                if (el) {
                    el.classList.remove('hidden');
                }
            }, 600 + i * 800);
        });
    }

    // Start after a brief delay
    setTimeout(typeChar, 1000);
}

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
