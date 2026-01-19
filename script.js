// ==================== ENVELOPE ANIMATION ====================
let scrollProgress = 0;
let isEnvelopeOpened = false;
let canCloseEnvelope = false;

const envelopeWrapper = document.getElementById('envelopeWrapper');
const flap = document.getElementById('flap');
const envelopeFront = document.querySelector('.envelope-front');

// Touch and scroll handling for envelope opening
let touchStartY = 0;
let touchEndY = 0;

envelopeWrapper.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

envelopeWrapper.addEventListener('touchmove', (e) => {
    touchEndY = e.touches[0].clientY;
    handleSwipe();
});

envelopeWrapper.addEventListener('wheel', (e) => {
    // Scroll down to open the envelope
    if (!isEnvelopeOpened && e.deltaY > 0) {
        openEnvelope();
    }
});

envelopeWrapper.addEventListener('click', () => {
    if (!isEnvelopeOpened) {
        openEnvelope();
    }
});

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;

    if (swipeDistance > 50 && !isEnvelopeOpened) {
        openEnvelope();
    }
}

function openEnvelope() {
    isEnvelopeOpened = true;

    // Animate both flaps opening
    setTimeout(() => {
        flap.classList.add('open');
        envelopeFront.classList.add('open');
    }, 200);

    // Hide entire envelope wrapper
    setTimeout(() => {
        envelopeWrapper.classList.add('opened');
    }, 1200);

    // Enable scroll on body and scroll to main content
    setTimeout(() => {
        document.body.style.overflow = 'auto';
        // Smooth scroll to the main content
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
        // Allow envelope to be closed after a short delay
        setTimeout(() => {
            canCloseEnvelope = true;
        }, 1000);
    }, 2000);
}

function closeEnvelope() {
    if (!canCloseEnvelope || !isEnvelopeOpened) return;

    isEnvelopeOpened = false;
    canCloseEnvelope = false;

    // Show envelope wrapper
    envelopeWrapper.classList.remove('opened');

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Reverse animations
    setTimeout(() => {
        flap.classList.remove('open');
        envelopeFront.classList.remove('open');
    }, 200);

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in-up class
document.querySelectorAll('.fade-in-up').forEach(el => {
    fadeInObserver.observe(el);
});

// Observe timeline items
document.querySelectorAll('.timeline-item').forEach(el => {
    fadeInObserver.observe(el);
});

// Observe detail cards
document.querySelectorAll('.detail-card').forEach(el => {
    fadeInObserver.observe(el);
});

// Observe gallery items
document.querySelectorAll('.gallery-item').forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.1}s`;
    fadeInObserver.observe(el);
});

// ==================== COUNTDOWN TIMER ====================
function updateCountdown() {
    const weddingDate = new Date('2026-05-09T09:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = '<h3 style="color: var(--gold); font-size: 36px;">We\'re Married! 💕</h3>';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();

// ==================== RSVP FORM HANDLING ====================
const rsvpForm = document.getElementById('rsvpForm');

// Prefill RSVP form from URL query parameters (e.g. ?name=Chanula&guest=5)
function prefillRsvpFromUrl() {
    if (!rsvpForm) return;

    const params = new URLSearchParams(window.location.search);
    const nameFromUrl = params.get('name');
    const guestCountFromUrl = params.get('guest');

    const nameInput = rsvpForm.querySelector('input[name="guest_name"]');
    const guestCountInput = rsvpForm.querySelector('input[name="guest_count"]');

    if (nameFromUrl && nameInput) {
        nameInput.value = nameFromUrl;
        nameInput.readOnly = true;
    }

    if (guestCountFromUrl && guestCountInput) {
        const parsedGuestCount = parseInt(guestCountFromUrl, 10);
        if (!Number.isNaN(parsedGuestCount)) {
            guestCountInput.value = String(parsedGuestCount);
            guestCountInput.readOnly = true;
        }
    }
}

prefillRsvpFromUrl();

if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Show loading state
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // If EmailJS is available, send an email
        if (window.emailjs) {
            try {
                emailjs.init('XFYsAHq7VkAYVs0rY'); // Public Key

                emailjs.sendForm('service_w5t1ovr', 'template_4kv25hj', rsvpForm)
                    .then(() => {
                        const formContainer = document.querySelector('.rsvp-form-container');

                        // Animate form out
                        rsvpForm.style.transform = 'scale(0.95)';
                        rsvpForm.style.opacity = '0';

                        setTimeout(() => {
                            formContainer.innerHTML = `
                                <div style="text-align: center; padding: 60px 20px; animation: scaleIn 0.6s ease-out;">
                                    <div style="font-size: 64px; margin-bottom: 20px;">✓</div>
                                    <h3 style="font-size: 32px; color: var(--gold); margin-bottom: 15px; font-family: 'Great Vibes', cursive;">Thank You!</h3>
                                    <p style="font-size: 18px; color: var(--text-light); line-height: 1.8;">
                                        We've received your RSVP and can't wait to celebrate with you!<br>
                                        We'll be in touch soon.
                                    </p>
                                    <div style="margin-top: 30px;">
                                        <span style="font-size: 48px;">💕</span>
                                    </div>
                                </div>
                            `;

                            // Trigger confetti
                            createConfetti();
                        }, 300);
                    })
                    .catch((error) => {
                        console.error('EmailJS Error:', error);
                        alert('Sorry, there was an error sending your RSVP. Please try again or contact us directly.');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    });
            } catch (error) {
                console.error('EmailJS not available:', error);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } else {
            // Fallback: just show the success message without sending email
            const formContainer = document.querySelector('.rsvp-form-container');

            rsvpForm.style.transform = 'scale(0.95)';
            rsvpForm.style.opacity = '0';

            setTimeout(() => {
                formContainer.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; animation: scaleIn 0.6s ease-out;">
                        <div style="font-size: 64px; margin-bottom: 20px;">✓</div>
                        <h3 style="font-size: 32px; color: var(--gold); margin-bottom: 15px; font-family: 'Great Vibes', cursive;">Thank You!</h3>
                        <p style="font-size: 18px; color: var(--text-light); line-height: 1.8;">
                            We've received your RSVP and can't wait to celebrate with you!<br>
                            (Email sending is not configured yet.)
                        </p>
                        <div style="margin-top: 30px;">
                            <span style="font-size: 48px;">💕</span>
                        </div>
                    </div>
                `;

                createConfetti();
            }, 300);
        }
    });
}

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== RESPONSIVE NAVIGATION FOR MOBILE ====================
function createSparkle(e) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: var(--gold);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        animation: sparkleAnimation 1s ease-out forwards;
    `;

    document.body.appendChild(sparkle);

    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Add sparkle effect CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleAnimation {
        0% {
            transform: scale(0) translateY(0);
            opacity: 1;
        }
        100% {
            transform: scale(1.5) translateY(-30px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add sparkles on interactive elements
document.querySelectorAll('.submit-btn, .detail-card, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createSparkle({
                    clientX: e.clientX + (Math.random() - 0.5) * 40,
                    clientY: e.clientY + (Math.random() - 0.5) * 40
                });
            }, i * 100);
        }
    });
});

// ==================== LOADING ANIMATION ====================
window.addEventListener('load', () => {
    document.body.style.overflow = 'hidden'; // Prevent scrolling until envelope is opened
});

// ==================== HERO SECTION ANIMATION ====================
const heroContent = document.querySelector('.hero-content');
if (heroContent) {
    setTimeout(() => {
        heroContent.style.animation = 'fadeInUp 1.2s ease-out';
    }, 100);
}

// ==================== ADD ELEGANT CURSOR TRAIL ====================
let cursorTrail = [];
const trailLength = 10;

document.addEventListener('mousemove', (e) => {
    cursorTrail.push({ x: e.clientX, y: e.clientY });

    if (cursorTrail.length > trailLength) {
        cursorTrail.shift();
    }
});

// ==================== RESPONSIVE NAVIGATION FOR MOBILE ====================
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // If user reaches the very top, always show the closed envelope again
    if (scrollTop <= 0) {
        envelopeWrapper.classList.remove('opened');
        document.body.style.overflow = 'hidden';
        flap.classList.remove('open');
        envelopeFront.classList.remove('open');
        isEnvelopeOpened = false;
        canCloseEnvelope = false;
        lastScrollTop = scrollTop;
        return;
    }

    // Check if user scrolled back near the top to close envelope with animation
    if (scrollTop < 100 && canCloseEnvelope && isEnvelopeOpened) {
        closeEnvelope();
    }

    // Parallax effect for floating flowers
    const flowers = document.querySelectorAll('.floating-flower');
    flowers.forEach((flower, index) => {
        const speed = 0.5 + (index * 0.1);
        flower.style.transform = `translateY(${scrollTop * speed}px) rotate(${scrollTop * 0.1}deg)`;
    });

    // Add subtle animations based on scroll direction
    if (scrollTop > lastScrollTop) {
        // Scrolling down
        document.body.style.setProperty('--scroll-direction', '1');
    } else {
        // Scrolling up
        document.body.style.setProperty('--scroll-direction', '-1');
    }

    lastScrollTop = scrollTop;
}, false);

// ==================== ADD SPARKLE EFFECT ON HOVER ====================

// ==================== CONFETTI EFFECT FOR RSVP SUCCESS ====================
function createConfetti() {
    const colors = ['#D4AF37', '#F0E68C', '#B76E79', '#F5E6D3'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            opacity: ${Math.random()};
            transform: rotate(${Math.random() * 360}deg);
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        `;

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Add confetti animation CSS
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Trigger confetti on RSVP form submit
rsvpForm.addEventListener('submit', () => {
    setTimeout(createConfetti, 500);
});

// ==================== IMAGE LAZY LOADING ====================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==================== TYPING EFFECT FOR NAMES (Optional Enhancement) ====================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ==================== ACCESSIBILITY ENHANCEMENTS ====================
// Ensure keyboard navigation works smoothly
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === envelopeWrapper) {
        if (!isEnvelopeOpened) {
            openEnvelope();
        }
    }
});

// Add focus styles for better accessibility
const focusableElements = document.querySelectorAll('a, button, input, select, textarea');
focusableElements.forEach(el => {
    el.addEventListener('focus', function () {
        this.style.outline = '3px solid var(--gold)';
        this.style.outlineOffset = '2px';
    });

    el.addEventListener('blur', function () {
        this.style.outline = '';
        this.style.outlineOffset = '';
    });
});

// ==================== PERFORMANCE OPTIMIZATION ====================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('🎊 Wedding Invitation Website Loaded Successfully! 💕');
