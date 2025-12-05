// Sticky Header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-navigation');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
    });
}

// Sliding Indicator for Navigation
const initNavigationIndicator = () => {
    const navContainer = document.querySelector('.main-navigation');
    const navList = document.getElementById('primary-menu');

    if (!navContainer || !navList) return;

    const navLinks = Array.from(navList.querySelectorAll('li:not(.nav-cta) > a'));
    if (!navLinks.length) return;

    const indicator = document.createElement('span');
    indicator.className = 'nav-link-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    navList.appendChild(indicator);

    let activeLink = navList.querySelector('a.active') || navLinks[0];
    activeLink.classList.add('active');

    const setIndicatorPosition = (target, instant = false) => {
        if (!target || window.innerWidth <= 900) {
            indicator.style.opacity = 0;
            return;
        }

        const targetRect = target.getBoundingClientRect();
        const listRect = navList.getBoundingClientRect();

        if (instant) {
            indicator.classList.add('no-transition');
        }

        indicator.style.opacity = 1;
        indicator.style.width = `${targetRect.width}px`;
        indicator.style.height = `${targetRect.height}px`;
        indicator.style.transform = `translate3d(${targetRect.left - listRect.left}px, ${targetRect.top - listRect.top}px, 0)`;

        if (instant) {
            requestAnimationFrame(() => indicator.classList.remove('no-transition'));
        }
    };

    const updateActiveLink = (target, instant = false) => {
        navLinks.forEach(link => link.classList.remove('active'));
        target.classList.add('active');
        activeLink = target;
        setIndicatorPosition(target, instant);
    };

    setIndicatorPosition(activeLink, true);

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => setIndicatorPosition(link));
        link.addEventListener('focus', () => setIndicatorPosition(link));
        link.addEventListener('click', () => updateActiveLink(link));
    });

    navContainer.addEventListener('mouseleave', () => setIndicatorPosition(activeLink));
    window.addEventListener('resize', () => setIndicatorPosition(activeLink, true));

    const mq = window.matchMedia('(max-width: 900px)');
    const mqListener = event => {
        if (event.matches) {
            indicator.style.opacity = 0;
        } else {
            updateActiveLink(activeLink, true);
        }
    };

    if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', mqListener);
    } else if (typeof mq.addListener === 'function') {
        mq.addListener(mqListener);
    }
};

document.addEventListener('DOMContentLoaded', initNavigationIndicator);

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', function() {
        const item = this.parentElement;
        item.classList.toggle('active');
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu after clicking
            if (mainNav) {
                mainNav.classList.remove('active');
            }
        }
    });
});

// Contact Form Handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        formData.append('action', 'iptv_contact');
        formData.append('nonce', iptvData.nonce);
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        fetch(iptvData.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Message sent successfully! We\'ll get back to you soon.');
                contactForm.reset();
            } else {
                alert('Failed to send message. Please try again or contact us directly.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card, .faq-item');
    animateElements.forEach(el => observer.observe(el));
});

// Add animation class to CSS
const style = document.createElement('style');
style.textContent = `
    .feature-card, .pricing-card, .testimonial-card, .faq-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Pricing Card Tracking (for analytics)
document.querySelectorAll('.pricing-card .btn').forEach(button => {
    button.addEventListener('click', function() {
        const planName = this.closest('.pricing-card').querySelector('h3').textContent;
        console.log('User clicked on plan:', planName);
        // You can add Google Analytics tracking here
        if (typeof gtag !== 'undefined') {
            gtag('event', 'plan_click', {
                'event_category': 'engagement',
                'event_label': planName
            });
        }
    });
});

// Loading indicator for external links
document.querySelectorAll('a[href*="shopify"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 14, 39, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-size: 1.5rem;
        `;
        overlay.innerHTML = '<div>Redirecting to secure checkout...</div>';
        document.body.appendChild(overlay);
    });
});
