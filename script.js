// ==================== ENVELOPE ANIMATION WITH GSAP ====================
let scrollProgress = 0;
let isEnvelopeOpened = false;
let canCloseEnvelope = false;

// ==================== DOM READY INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Apply guest-specific customizations
    customizeInvitationForGuest();

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
const flapLeft = document.getElementById('flapLeft');
const flapRight = document.getElementById('flapRight');
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
// Hover effects disabled for full-screen envelope

// ==================== OPENING ANIMATION ====================
function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    const mainContent = document.getElementById('mainContent');

    // DON'T move envelope to background yet - keep it visible during flap opening!
    // envelopeWrapper.classList.add('opened'); // MOVED TO AFTER FLAPS OPEN

    // Hide scroll indicator
    gsap.to(scrollIndicator, {
        duration: 0.3,
        opacity: 0,
        y: 20
    });

    // First: Pulse and fade the wax seal COMPLETELY
    setTimeout(() => {
        gsap.to(waxSeal, {
            duration: 0.6,
            scale: 1.2,
            opacity: 0,
            ease: "power2.in"
        });
    }, 100);

    // Then: Open the vertical flaps (start right as wax seal finishes)
    setTimeout(() => {
        if (flapLeft) flapLeft.classList.add('open');
        if (flapRight) flapRight.classList.add('open');

        // Animate left flap opening with a smooth swing (slower for visibility)
        gsap.fromTo(flapLeft,
            {
                rotateY: 0
            },
            {
                duration: 1.8,
                rotateY: -120,
                ease: "power1.inOut",
                transformOrigin: "left center"
            }
        );

        // Animate right flap opening with a smooth swing (slower for visibility)
        gsap.fromTo(flapRight,
            {
                rotateY: 0
            },
            {
                duration: 1.8,
                rotateY: 120,
                ease: "power1.inOut",
                transformOrigin: "right center"
            }
        );
    }, 700); // Start flaps opening right as wax seal finishes (100ms + 600ms)

    // AFTER flaps are open, move envelope to background and show content
    setTimeout(() => {
        // NOW move envelope wrapper to background (after flaps are fully open)
        envelopeWrapper.classList.add('opened');

        // Make main content visible and position it inside the envelope
        mainContent.classList.add('visible');
        mainContent.style.display = 'block';
        mainContent.style.position = 'fixed';
        mainContent.style.top = '0';
        mainContent.style.left = '0';
        mainContent.style.width = '100vw';
        mainContent.style.height = '100vh';
        mainContent.style.overflow = 'auto';
        mainContent.style.zIndex = '2';
        mainContent.style.pointerEvents = 'auto';
        mainContent.style.background = '#FFF8F0';

        // Scroll to the invitation card section first (before animation)
        const invitationSection = document.querySelector('.formal-invitation-section');
        if (invitationSection) {
            mainContent.scrollTop = 0;
        }

        gsap.set(mainContent, {
            opacity: 0,
            scale: 1
        });

        // Fade in the website content
        gsap.to(mainContent, {
            duration: 1,
            opacity: 1,
            scale: 1,
            ease: "power2.out",
            onComplete: () => {
                // Keep envelope visible in background
                envelopeWrapper.style.pointerEvents = 'none';
                canCloseEnvelope = true;

                // Ensure we're showing the invitation card at the top
                mainContent.scrollTop = 0;
            }
        });
    }, 2700); // Wait for flaps to finish opening (700ms delay + 1800ms animation + 200ms buffer)
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

    // On mobile, use viewport width directly for precise scrolling
    let gap, slideWidth;
    if (window.innerWidth <= 480) {
        slideWidth = window.innerWidth;
        gap = 0;
    } else if (window.innerWidth <= 768) {
        slideWidth = itemWidth;
        gap = 15;
    } else {
        slideWidth = itemWidth;
        gap = 20;
    }

    const offset = currentSlide * imagesPerSlide * (slideWidth + gap);

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

// ==================== GUEST CUSTOMIZATION ====================
function customizeInvitationForGuest() {
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get('name');

    if (!guestName) {
        // No guest specified, show everything by default
        return;
    }

    // Get guest data from the database
    const guestData = getGuestData(guestName);

    if (!guestData) {
        console.warn(`Guest "${guestName}" not found in database`);
        return;
    }

    console.log(`Customizing invitation for: ${guestData.name}`, guestData);

    // Get elements
    const invitationChurchEvent = document.getElementById('invitationChurchEvent');
    const invitationReceptionEvent = document.getElementById('invitationReceptionEvent');
    const invitationEventDivider = document.getElementById('invitationEventDivider');
    const detailChurchCard = document.getElementById('detailChurchCard');
    const detailReceptionCard = document.getElementById('detailReceptionCard');

    // Hide/show based on invitation type
    if (guestData.invitedTo === 'reception') {
        // Reception only - hide church ceremony
        if (invitationChurchEvent) invitationChurchEvent.style.display = 'none';
        if (invitationEventDivider) invitationEventDivider.style.display = 'none';
        if (detailChurchCard) detailChurchCard.style.display = 'none';

        // Update reception text since there's no church ceremony before it
        const receptionTitle = invitationReceptionEvent?.querySelector('.event-title');
        if (receptionTitle) {
            receptionTitle.textContent = 'For the Wedding Reception';
        }

    } else if (guestData.invitedTo === 'church') {
        // Church only - hide reception
        if (invitationReceptionEvent) invitationReceptionEvent.style.display = 'none';
        if (invitationEventDivider) invitationEventDivider.style.display = 'none';
        if (detailReceptionCard) detailReceptionCard.style.display = 'none';

    } else if (guestData.invitedTo === 'both') {
        // Show everything (default behavior)
        // No changes needed
    }
}

// ==================== RSVP FORM HANDLING ====================
const rsvpForm = document.getElementById('rsvpForm');

// Prefill RSVP form from URL query parameters and guest database
function prefillRsvpFromUrl() {
    if (!rsvpForm) return;

    const params = new URLSearchParams(window.location.search);
    const nameFromUrl = params.get('name');
    let guestCountFromUrl = params.get('guest');

    const nameInput = rsvpForm.querySelector('input[name="guest_name"]');
    const guestCountInput = rsvpForm.querySelector('input[name="guest_count"]');

    // Try to get guest data from database
    if (nameFromUrl) {
        const guestData = getGuestData(nameFromUrl);

        if (guestData) {
            // Use database values
            if (nameInput) {
                nameInput.value = guestData.name;
                nameInput.readOnly = true;
            }
            if (guestCountInput && !guestCountFromUrl) {
                // Use guest count from database if not specified in URL
                guestCountInput.value = guestData.guestCount;
                guestCountInput.readOnly = true;
            }
        } else {
            // Guest not in database - block the form
            const formContainer = document.querySelector('.rsvp-form-container');
            if (formContainer) {
                formContainer.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                        <h3 style="font-size: 28px; color: var(--gold); margin-bottom: 15px; font-family: 'Great Vibes', cursive;">Invalid Invitation</h3>
                        <p style="font-size: 18px; color: var(--text-light); line-height: 1.8;">
                            We couldn't find your name in our guest list.<br>
                            Please check your invitation link or contact us directly.
                        </p>
                        <div style="margin-top: 30px;">
                            <span style="font-size: 48px;">💌</span>
                        </div>
                    </div>
                `;
            }
            return;
        }
    }

    // URL guest count parameter overrides database
    if (guestCountFromUrl && guestCountInput) {
        const parsedGuestCount = parseInt(guestCountFromUrl, 10);
        if (!Number.isNaN(parsedGuestCount)) {
            guestCountInput.value = String(parsedGuestCount);
            guestCountInput.readOnly = true;
        }
    }
}

prefillRsvpFromUrl();

// Check if guest has already submitted RSVP
function checkExistingRsvp() {
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get('name');

    if (!guestName || !rsvpForm) return false;

    // Create a unique key based on guest name
    const storageKey = `rsvp_submitted_${guestName.toLowerCase().replace(/\s+/g, '_')}`;
    const submittedData = localStorage.getItem(storageKey);

    if (submittedData) {
        const data = JSON.parse(submittedData);
        const formContainer = document.querySelector('.rsvp-form-container');
        const isAttending = data.attendance === 'Joyfully Accept';

        // Hide the form and show thank you message
        if (formContainer) {
            if (isAttending) {
                formContainer.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; animation: scaleIn 0.6s ease-out;">
                        <div style="font-size: 64px; margin-bottom: 20px;">✓</div>
                        <h3 style="font-size: 32px; color: var(--gold); margin-bottom: 15px; font-family: 'Great Vibes', cursive;">Thank You!</h3>
                        <p style="font-size: 18px; color: var(--text-light); line-height: 1.8;">
                            We've received your RSVP and can't wait to celebrate with you!<br>
                            We'll be in touch soon.
                        </p>
                        <p style="font-size: 14px; color: var(--text-light); margin-top: 20px; opacity: 0.7;">
                            Submitted on ${new Date(data.timestamp).toLocaleDateString()}
                        </p>
                        <div style="margin-top: 30px;">
                            <span style="font-size: 48px;">💕</span>
                        </div>
                    </div>
                `;
            } else {
                formContainer.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; animation: scaleIn 0.6s ease-out;">
                        <div style="font-size: 64px; margin-bottom: 20px;">✓</div>
                        <h3 style="font-size: 32px; color: var(--gold); margin-bottom: 15px; font-family: 'Great Vibes', cursive;">Thank You!</h3>
                        <p style="font-size: 18px; color: var(--text-light); line-height: 1.8;">
                            We've received your response and truly understand your regrets.<br>
                            You'll be in our thoughts on our special day.
                        </p>
                        <p style="font-size: 14px; color: var(--text-light); margin-top: 20px; opacity: 0.7;">
                            Submitted on ${new Date(data.timestamp).toLocaleDateString()}
                        </p>
                        <div style="margin-top: 30px;">
                            <span style="font-size: 48px;">🤍</span>
                        </div>
                    </div>
                `;
            }
        }
        return true;
    }
    return false;
}

// Check on page load
checkExistingRsvp();

if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get the guest name from the form
        const nameInput = rsvpForm.querySelector('input[name="guest_name"]');
        const enteredName = nameInput?.value?.trim();

        // Validate that the entered name is in the guest database
        if (enteredName) {
            const guestData = getGuestData(enteredName);
            if (!guestData) {
                alert('We couldn\'t find your name in our guest list. Please check your invitation or contact us directly.');
                return;
            }
        } else {
            alert('Please enter your name.');
            return;
        }

        // Also validate URL parameter if present
        const params = new URLSearchParams(window.location.search);
        const nameFromUrl = params.get('name');

        if (nameFromUrl) {
            const guestData = getGuestData(nameFromUrl);
            if (!guestData) {
                alert('Invalid invitation. Please check your invitation link.');
                return;
            }
        }

        // Show loading state
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(rsvpForm);
        const attendanceValue = rsvpForm.querySelector('input[name="attendance"]:checked')?.value;
        const isAttending = attendanceValue === 'Joyfully Accept';
        const guestName = rsvpForm.querySelector('input[name="guest_name"]')?.value;

        try {
            // Send to FormSpark
            const response = await fetch('https://submit-form.com/TcYZdRGLl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    guest_name: formData.get('guest_name'),
                    attendance: formData.get('attendance'),
                    guest_count: formData.get('guest_count'),
                    dietary_restrictions: formData.get('dietary_restrictions')
                })
            });

            console.log('FormSpark response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('FormSpark error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('FormSpark success:', result);

            // Save to localStorage so it persists on page reload
            if (guestName) {
                const storageKey = `rsvp_submitted_${guestName.toLowerCase().replace(/\s+/g, '_')}`;
                localStorage.setItem(storageKey, JSON.stringify({
                    name: guestName,
                    attendance: attendanceValue,
                    timestamp: new Date().toISOString()
                }));
            }

            // Animate form out
            rsvpForm.style.transform = 'scale(0.95)';
            rsvpForm.style.opacity = '0';

            const formContainer = document.querySelector('.rsvp-form-container');

            setTimeout(() => {
                if (isAttending) {
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
                    // Trigger confetti for attending guests
                    createConfetti();
                } else {
                    formContainer.innerHTML = `
                        <div style="text-align: center; padding: 60px 20px; animation: scaleIn 0.6s ease-out;">
                            <div style="font-size: 64px; margin-bottom: 20px;">✓</div>
                            <h3 style="font-size: 32px; color: var(--gold); margin-bottom: 15px; font-family: 'Great Vibes', cursive;">Thank You!</h3>
                            <p style="font-size: 18px; color: var(--text-light); line-height: 1.8;">
                                We've received your response and truly understand your regrets.<br>
                                You'll be in our thoughts on our special day.
                            </p>
                            <div style="margin-top: 30px;">
                                <span style="font-size: 48px;">🤍</span>
                            </div>
                        </div>
                    `;
                }
            }, 300);
        } catch (error) {
            console.error('FormSpark Error details:', error);
            alert('Sorry, there was an error sending your RSVP. Please try again or contact us directly.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
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

// Listen to main content scroll to close envelope when at top
const mainContent = document.getElementById('mainContent');
if (mainContent) {
    mainContent.addEventListener('scroll', () => {
        const scrollTop = mainContent.scrollTop;

        // If user scrolls back to the very top, close the envelope
        if (scrollTop <= 0 && isEnvelopeOpened && canCloseEnvelope) {
            closeEnvelope();
        }
    });
}

function closeEnvelope() {
    if (!canCloseEnvelope) return;

    isEnvelopeOpened = false;
    canCloseEnvelope = false;

    const mainContent = document.getElementById('mainContent');

    // Hide particles during closing animation
    if (canvas) {
        gsap.to(canvas, {
            duration: 0.3,
            opacity: 0
        });
    }

    // First: Fade out main content
    gsap.to(mainContent, {
        duration: 0.6,
        opacity: 0,
        scale: 0.95,
        ease: "power2.in",
        onComplete: () => {
            mainContent.style.display = 'none';
            mainContent.classList.remove('visible');
        }
    });

    // Then: Close the flaps first
    setTimeout(() => {
        // Close the flaps - rotate back closed
        gsap.to(flapLeft, {
            duration: 1,
            rotateY: 0,
            ease: "power2.inOut",
            transformOrigin: "left center",
            onComplete: () => {
                if (flapLeft) flapLeft.classList.remove('open');
            }
        });

        gsap.to(flapRight, {
            duration: 1,
            rotateY: 0,
            ease: "power2.inOut",
            transformOrigin: "right center",
            onComplete: () => {
                if (flapRight) flapRight.classList.remove('open');
            }
        });

        // Move envelope wrapper back to front
        envelopeWrapper.classList.remove('opened');

        // Re-enable envelope interactions
        envelopeWrapper.style.pointerEvents = 'auto';
    }, 400);

    // Finally: Show wax seal AFTER flaps are closed
    setTimeout(() => {
        gsap.to(waxSeal, {
            duration: 0.6,
            scale: 1,
            opacity: 1,
            ease: "power2.out"
        });

        // Show scroll indicator again
        gsap.to(scrollIndicator, {
            duration: 0.5,
            opacity: 1,
            y: 0
        });

        // Show particles again
        if (canvas) {
            gsap.to(canvas, {
                duration: 0.5,
                opacity: 1
            });
        }

        setTimeout(() => {
            canCloseEnvelope = true;
        }, 500);
    }, 1600);
}

// Listen to main content scroll to close envelope when at top
const mainContentEl = document.getElementById('mainContent');
if (mainContentEl) {
    mainContentEl.addEventListener('scroll', () => {
        const scrollTop = mainContentEl.scrollTop;

        // If user scrolls back to the very top, close the envelope
        if (scrollTop <= 0 && isEnvelopeOpened && canCloseEnvelope) {
            closeEnvelope();
        }
    });
}

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
