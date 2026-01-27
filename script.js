// ==================== ENVELOPE ANIMATION WITH GSAP ====================
let scrollProgress = 0;
let isEnvelopeOpened = false;
let canCloseEnvelope = false;

// ==================== DOM READY INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // RSVP Scroll Button
    const rsvpBtn = document.getElementById('rsvpScrollBtn');
    if (rsvpBtn) {
        rsvpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const rsvpSection = document.getElementById('rsvpSection');
            if (rsvpSection) {
                rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Initialize Gallery Carousel
    initializeGalleryCarousel();
    startAutoSlide();

    // Event listeners for gallery navigation
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
});

const envelopeWrapper = document.getElementById('envelopeWrapper');
const envelopeContainer = document.getElementById('envelopeContainer');
const flap = document.getElementById('flap');
const letter = document.getElementById('letter');
const waxSeal = document.getElementById('waxSeal');
const scrollIndicator = document.getElementById('scrollIndicator');

// ==================== PARTICLE SYSTEM ====================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = ['#D4AF37', '#F0E68C', '#B76E79', '#FFF8F0'][Math.floor(Math.random() * 4)];
    }

    update() {
        this.x += this.speedX;
        this.y -= this.speedY;

        if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
            this.reset();
            this.y = canvas.height;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

const particles = [];
for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==================== GSAP ENTRANCE ANIMATION ====================
gsap.from(envelopeContainer, {
    duration: 1.5,
    scale: 0.5,
    opacity: 0,
    rotationY: -180,
    ease: "back.out(1.7)",
    delay: 0.3
});

gsap.from(scrollIndicator, {
    duration: 1,
    opacity: 0,
    y: 50,
    ease: "power2.out",
    delay: 1.5
});

// ==================== INTERACTIVE HOVER EFFECTS ====================
envelopeContainer.addEventListener('mousemove', (e) => {
    const rect = envelopeContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    gsap.to(envelopeContainer, {
        duration: 0.3,
        rotationX: rotateX,
        rotationY: rotateY,
        ease: "power2.out"
    });
});

envelopeContainer.addEventListener('mouseleave', () => {
    gsap.to(envelopeContainer, {
        duration: 0.5,
        rotationX: 0,
        rotationY: 0,
        ease: "power2.out"
    });
});

// ==================== OPENING ANIMATION ====================
function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    const mainContent = document.getElementById('mainContent');
    const invitationCard = document.querySelector('.invitation-card');

    // Make main content visible but keep it hidden initially
    mainContent.style.display = 'block';
    mainContent.style.opacity = '0';

    // Hide scroll indicator
    gsap.to(scrollIndicator, {
        duration: 0.3,
        opacity: 0,
        y: 20
    });

    // Open flap with elegant animation
    setTimeout(() => {
        flap.classList.add('open');

        gsap.to(flap, {
            duration: 1,
            rotationX: -180,
            transformOrigin: "top center",
            ease: "power2.inOut",
            force3D: true
        });
    }, 200);

    // Create sparkle burst as envelope opens
    setTimeout(() => {
        createSparkles(30);
    }, 800);

    // Animate the actual invitation card to appear from envelope position
    setTimeout(() => {
        // Position the invitation card at envelope location
        const envelopeRect = envelopeContainer.getBoundingClientRect();

        gsap.set(invitationCard, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            xPercent: -50,
            yPercent: -50,
            width: '540px',
            scale: 0.7,
            opacity: 1,
            zIndex: 9999
        });

        // Animate card emerging and growing
        gsap.to(invitationCard, {
            duration: 1.2,
            scale: 1,
            ease: "power2.out"
        });

        // Fade out envelope wrapper
        gsap.to(envelopeWrapper, {
            duration: 0.8,
            opacity: 0,
            delay: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                envelopeWrapper.style.display = 'none';

                // Reset invitation card to normal position
                gsap.to(invitationCard, {
                    duration: 0.6,
                    position: 'relative',
                    top: 'auto',
                    left: 'auto',
                    xPercent: 0,
                    yPercent: 0,
                    width: '',
                    clearProps: 'all',
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Show full page content
                        document.body.style.overflow = 'auto';

                        // Scroll to the invitation card section
                        const invitationSection = document.querySelector('.formal-invitation-section');
                        if (invitationSection) {
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        }

                        gsap.to(mainContent, {
                            duration: 0.5,
                            opacity: 1,
                            ease: "power2.out"
                        });

                        setTimeout(() => {
                            canCloseEnvelope = true;
                        }, 300);
                    }
                });
            }
        });
    }, 1400);
}

// ==================== SPARKLE EFFECTS ====================
function createSparkles(count) {
    const colors = ['#D4AF37', '#F0E68C', '#FFD700'];

    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-burst';
        sparkle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: 50%;
            top: 50%;
            box-shadow: 0 0 10px currentColor;
        `;

        document.body.appendChild(sparkle);

        const angle = (Math.PI * 2 * i) / count;
        const velocity = Math.random() * 300 + 200;

        gsap.to(sparkle, {
            duration: Math.random() * 1 + 0.8,
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            opacity: 0,
            scale: 0,
            ease: "power2.out",
            onComplete: () => sparkle.remove()
        });
    }
}

// ==================== EVENT LISTENERS ====================
envelopeWrapper.addEventListener('wheel', (e) => {
    if (!isEnvelopeOpened && e.deltaY > 0) {
        openEnvelope();
    }
});

envelopeContainer.addEventListener('click', () => {
    if (!isEnvelopeOpened) {
        // Pulse animation before opening
        gsap.to(envelopeContainer, {
            duration: 0.2,
            scale: 1.05,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
            onComplete: openEnvelope
        });
    }
});

// Touch handling
let touchStartY = 0;
envelopeWrapper.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

envelopeWrapper.addEventListener('touchmove', (e) => {
    const touchEndY = e.touches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;

    if (swipeDistance > 50 && !isEnvelopeOpened) {
        openEnvelope();
    }
});

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

// ==================== GALLERY CAROUSEL ====================
const galleryImages = [
    'images/638376c8-52e2-4316-8166-5b2d21d78c47.jpeg',
    'images/88c3b0f9-37ef-4180-b4c7-0f19d606930f.JPG',
    'images/9ec63b3b-97f6-48a9-a98a-e2b5c0c1805a.JPG',
    'images/fqs 2025-10-25 192141.725.JPG',
    'images/fqs 2025-10-25 204651.064.JPG',
    'images/fqs 2026-01-18 122520.258.JPG',
    'images/IMG_0795.jpeg',
    'images/IMG_0876.JPG',
    'images/IMG_0945.JPG',
    'images/IMG_1092.JPG',
    'images/IMG_1105.JPG',
    'images/IMG_1294.jpeg',
    'images/IMG_4366.jpeg',
    'images/IMG_4540.JPG',
    'images/IMG_4843.jpeg',
    'images/IMG_4848.JPG',
    'images/IMG_4893.jpeg',
    'images/IMG_5044.JPG',
    'images/IMG_5928.JPG',
    'images/IMG_9461.JPG'
];

let currentSlide = 0;
let imagesPerSlide = 3;
let autoSlideInterval;

function getImagesPerSlide() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
}

function createImageItem(imgSrc, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item fade-in-up visible';

    const img = document.createElement('img');
    img.className = 'gallery-image';
    img.alt = `Wedding moment ${index + 1}`;
    img.style.backgroundColor = '#f0f0f0';
    img.src = imgSrc;

    img.onerror = function () {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #faf3e8 0%, #e8d5c4 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8B7F72;
            font-size: 18px;
            letter-spacing: 2px;
        `;
        placeholder.textContent = `Photo ${index + 1}`;
        item.innerHTML = '';
        item.appendChild(placeholder);
    };

    img.onload = function () {
        img.style.backgroundColor = 'transparent';
    };

    item.appendChild(img);
    return item;
}

function initializeGalleryCarousel() {
    const track = document.getElementById('galleryTrack');
    const dotsContainer = document.getElementById('galleryDots');

    if (!track || !dotsContainer) {
        console.error('Gallery track or dots container not found!');
        return;
    }

    imagesPerSlide = getImagesPerSlide();
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Add all original images
    galleryImages.forEach((imgSrc, index) => {
        track.appendChild(createImageItem(imgSrc, index));
    });

    // Duplicate images for infinite loop effect
    galleryImages.forEach((imgSrc, index) => {
        track.appendChild(createImageItem(imgSrc, index));
    });

    // Create dots (only for original slides)
    const totalSlides = Math.ceil(galleryImages.length / imagesPerSlide);
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'gallery-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    updateCarousel();
}

function updateCarousel(instant = false) {
    const track = document.getElementById('galleryTrack');
    const dots = document.querySelectorAll('.gallery-dot');

    if (!track) return;

    imagesPerSlide = getImagesPerSlide();
    const totalSlides = Math.ceil(galleryImages.length / imagesPerSlide);

    // Get the actual width of one item plus gap
    const items = track.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    const firstItem = items[0];
    const itemWidth = firstItem.offsetWidth;
    const gap = window.innerWidth <= 480 ? 15 : (window.innerWidth <= 768 ? 15 : 20);
    const offset = currentSlide * imagesPerSlide * (itemWidth + gap);

    if (instant) {
        track.style.transition = 'none';
        track.style.transform = `translateX(-${offset}px)`;
        // Force reflow
        track.offsetHeight;
        track.style.transition = 'transform 0.6s ease-in-out';
    } else {
        track.style.transform = `translateX(-${offset}px)`;
    }

    // Update dots (loop for infinite effect)
    const dotIndex = currentSlide % totalSlides;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === dotIndex);
    });
}

function goToSlide(slideIndex) {
    const totalSlides = Math.ceil(galleryImages.length / imagesPerSlide);
    currentSlide = (slideIndex + totalSlides) % totalSlides;
    updateCarousel();
    resetAutoSlide();
}

function nextSlide() {
    const totalSlides = Math.ceil(galleryImages.length / imagesPerSlide);
    currentSlide++;
    updateCarousel();

    // When we reach the duplicated slides, instantly reset to the beginning
    if (currentSlide >= totalSlides) {
        setTimeout(() => {
            currentSlide = 0;
            updateCarousel(true);
        }, 600); // Wait for transition to complete
    }

    resetAutoSlide();
}

function prevSlide() {
    const totalSlides = Math.ceil(galleryImages.length / imagesPerSlide);

    if (currentSlide === 0) {
        // Jump to the end (duplicated section) instantly, then animate back
        currentSlide = totalSlides;
        updateCarousel(true);
        setTimeout(() => {
            currentSlide = totalSlides - 1;
            updateCarousel();
        }, 50);
    } else {
        currentSlide--;
        updateCarousel();
    }

    resetAutoSlide();
}

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}



// Update on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newImagesPerSlide = getImagesPerSlide();
        if (newImagesPerSlide !== imagesPerSlide) {
            initializeGalleryCarousel();
        }
    }, 250);
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

// Prefill RSVP form from URL query parameters (e.g. ?name=Theeksha%20Gunasingha&guest=1)
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
