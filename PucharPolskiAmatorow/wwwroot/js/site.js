/**
 * Puchar Polski Amatorów w Szachach
 * Main JavaScript
 */

(function() {
    'use strict';

    // ============================================
    // SMOOTH SCROLLING
    // ============================================
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 0;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (!animatedElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered delay for grid items
                    const delay = entry.target.closest('.tournaments-grid, .organizers-grid, .sponsors-grid') 
                        ? index * 100 
                        : 0;
                    
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // VIDEO OPTIMIZATION
    // ============================================
    function initVideoOptimization() {
        const video = document.querySelector('.hero-video');
        
        if (!video) return;

        // Pause video when not visible
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {
                        // Video autoplay might be blocked
                        console.log('Video autoplay prevented by browser');
                    });
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.1 });

        videoObserver.observe(video);

        // Reduce quality on low performance devices
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                video.pause();
                video.style.display = 'none';
                document.querySelector('.hero').style.background = 'linear-gradient(135deg, #1d1d1d 0%, #2d2d2d 100%)';
            }
        }
    }

    // ============================================
    // PARALLAX EFFECT (subtle)
    // ============================================
    function initParallax() {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        if (!hero || !heroContent) return;

        // Only on desktop
        if (window.innerWidth < 768) return;

        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;
            const heroHeight = hero.offsetHeight;
            
            if (scrolled < heroHeight) {
                const opacity = 1 - (scrolled / heroHeight) * 0.5;
                const translateY = scrolled * 0.3;
                
                heroContent.style.opacity = Math.max(0, opacity);
                heroContent.style.transform = `translateY(${translateY}px)`;
            }
            
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // SCROLL INDICATOR CLICK
    // ============================================
    function initScrollIndicator() {
        const indicator = document.querySelector('.scroll-indicator');
        
        if (!indicator) return;

        indicator.addEventListener('click', () => {
            const nextSection = document.querySelector('.info-section');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ============================================
    // LAZY LOADING IMAGES (Native + Fallback)
    // ============================================
    function initLazyLoading() {
        // Check for native lazy loading support
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading is supported
            return;
        }

        // Fallback for older browsers
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if (!lazyImages.length) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ============================================
    // ACCESSIBILITY: FOCUS MANAGEMENT
    // ============================================
    function initAccessibility() {
        // Add focus visible polyfill behavior
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('user-is-tabbing');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('user-is-tabbing');
        });

        // Skip link functionality (if added)
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        }
    }

    // ============================================
    // HERO MEDIA - Dynamic video/image based on date
    // ============================================
    function initHeroMedia() {
        const video = document.getElementById('hero-video');
        const videoSource = document.getElementById('hero-video-source');
        const image = document.getElementById('hero-image');
        
        if (!video || !videoSource || !image) return;
        
        // Aktualna data
        const today = new Date();
        
        // Daty końca turniejów
        const dates = {
            czestochowa: new Date('2026-02-22'),
            krynica: new Date('2026-04-19'),
            gdansk: new Date('2026-10-18'),
            znin: new Date('2026-11-15')
        };
        
        // Media files
        const media = {
            czestochowa: { type: 'video', src: '/sources/film_arche.mp4' },
            krynica: { type: 'video', src: '/sources/film_krynica_zdroj.mp4' },
            warszawa: { type: 'video', src: '/sources/arche_warszawa.mp4' },
            znin: { type: 'image', src: '/sources/arche_znin.jpg' }
        };
        
        let selectedMedia;
        
        // Logika wyboru mediów
        if (today <= dates.czestochowa) {
            // Przed Częstochową - film Częstochowa
            selectedMedia = media.czestochowa;
        } else if (today <= dates.krynica) {
            // Po Częstochowie, przed Krynicą - film Krynica
            selectedMedia = media.krynica;
        } else if (today <= dates.gdansk) {
            // Po Krynicy, przed Gdańskiem - film Warszawa
            selectedMedia = media.warszawa;
        } else {
            // Po Gdańsku (przed Żninem i po) - zdjęcie Żnin
            selectedMedia = media.znin;
        }
        
        // Zastosuj wybrane media
        if (selectedMedia.type === 'video') {
            video.style.display = '';
            image.style.display = 'none';
            videoSource.src = selectedMedia.src;
            video.load();
        } else {
            video.style.display = 'none';
            image.style.display = '';
            image.src = selectedMedia.src;
        }
    }

    // ============================================
    // GALLERY STRIP (Crossfade Slideshow)
    // ============================================
    function initGalleryStrip() {
        var SLIDE_COUNT = 8;
        var INTERVAL = 3000;

        var strip = document.querySelector('.gallery-strip');
        if (!strip) return;

        var allImages;
        try { allImages = JSON.parse(strip.dataset.images || '[]'); } catch (e) { return; }
        if (allImages.length < 2) return;

        for (var i = allImages.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = allImages[i]; allImages[i] = allImages[j]; allImages[j] = tmp;
        }
        var picked = allImages.slice(0, Math.min(SLIDE_COUNT, allImages.length));

        var viewport = strip.querySelector('.gallery-strip__viewport');
        var overlay = viewport.querySelector('.gallery-strip__overlay');

        picked.forEach(function(src, idx) {
            var slide = document.createElement('div');
            slide.className = 'gallery-strip__slide' + (idx === 0 ? ' gallery-strip__slide--active' : '');

            var img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.className = 'gallery-strip__img';
            if (idx > 0) img.loading = 'lazy';

            slide.appendChild(img);
            viewport.insertBefore(slide, overlay);
        });

        var slides = viewport.querySelectorAll('.gallery-strip__slide');
        var current = 0;
        var timer = null;

        function goTo(index) {
            slides[current].classList.remove('gallery-strip__slide--active');
            current = ((index % slides.length) + slides.length) % slides.length;
            slides[current].classList.add('gallery-strip__slide--active');
        }

        function startAutoplay() {
            stopAutoplay();
            timer = setInterval(function() { goTo(current + 1); }, INTERVAL);
        }

        function stopAutoplay() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        var prevBtn = strip.querySelector('.gallery-strip__arrow--prev');
        var nextBtn = strip.querySelector('.gallery-strip__arrow--next');

        if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); startAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); startAutoplay(); });

        if (window.innerWidth >= 768) {
            strip.addEventListener('mouseenter', stopAutoplay);
            strip.addEventListener('mouseleave', startAutoplay);
        }

        startAutoplay();
    }

    // ============================================
    // TOURNAMENT CARD INTERACTIONS
    // ============================================
    function initTournamentCards() {
        const cards = document.querySelectorAll('.tournament-card');
        
        // Aktualna data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let finishedCount = 0;
        
        cards.forEach(card => {
            // Add keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'article');
            
            // Check if tournament has ended
            const endDateStr = card.dataset.endDate;
            if (endDateStr) {
                const endDate = new Date(endDateStr + 'T00:00:00');
                
                if (today >= endDate) {
                    card.classList.add('tournament-card--finished');
                    const tournamentCount = parseInt(card.dataset.tournamentCount) || 1;
                    finishedCount += tournamentCount;
                    
                    // Add "Zakończony" label at the bottom of tournament-info
                    const info = card.querySelector('.tournament-info');
                    if (info && !card.querySelector('.tournament-finished-label')) {
                        const label = document.createElement('div');
                        label.className = 'tournament-finished-label';
                        label.textContent = 'Zakończony';
                        info.appendChild(label);
                    }
                }
            }
            
            // Hover effect enhancement
            card.addEventListener('mouseenter', function() {
                this.style.zIndex = '10';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.zIndex = '';
            });
        });
        
        // Update finished count in leaderboard
        const countEl = document.getElementById('finished-count');
        if (countEl) {
            countEl.textContent = finishedCount;
        }
        
        // Show/hide leaderboard based on finished tournaments
        const leaderboardPlaceholder = document.getElementById('leaderboard-placeholder');
        const leaderboardContent = document.getElementById('leaderboard-content');
        const leaderboardDownloads = document.getElementById('leaderboard-downloads');
        
        if (finishedCount === 0) {
            if (leaderboardPlaceholder) leaderboardPlaceholder.classList.remove('hidden');
            if (leaderboardContent) leaderboardContent.classList.add('hidden');
            if (leaderboardDownloads) leaderboardDownloads.classList.add('hidden');
        } else {
            if (leaderboardPlaceholder) leaderboardPlaceholder.classList.add('hidden');
            if (leaderboardContent) leaderboardContent.classList.remove('hidden');
            if (leaderboardDownloads) leaderboardDownloads.classList.remove('hidden');
        }
    }

    // ============================================
    // SCORING TABS
    // ============================================
    function initScoringTabs() {
        const tabs = document.querySelectorAll('.scoring-tab');
        const panels = document.querySelectorAll('.scoring-panel');
        
        if (!tabs.length) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;
                
                // Update tabs
                tabs.forEach(t => t.classList.remove('scoring-tab--active'));
                tab.classList.add('scoring-tab--active');
                
                // Update panels
                panels.forEach(panel => {
                    if (panel.dataset.panel === targetPanel) {
                        panel.classList.add('scoring-panel--active');
                    } else {
                        panel.classList.remove('scoring-panel--active');
                    }
                });
            });
        });
        
        // Expand buttons
        const expandButtons = document.querySelectorAll('.scoring-expand');
        
        expandButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const panel = btn.closest('.scoring-panel');
                const extendedList = panel.querySelector('.scoring-list-extended');
                
                if (extendedList.style.display === 'none') {
                    extendedList.style.display = 'flex';
                    btn.textContent = 'Zwiń punktację';
                } else {
                    extendedList.style.display = 'none';
                    btn.textContent = 'Pokaż pełną punktację (1–20)';
                }
            });
        });
        
        // Leaderboard tabs
        const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
        const leaderboardPanels = document.querySelectorAll('.leaderboard-panel');
        
        leaderboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.group;
                
                // Update tabs
                leaderboardTabs.forEach(t => t.classList.remove('leaderboard-tab--active'));
                tab.classList.add('leaderboard-tab--active');
                
                // Update panels
                leaderboardPanels.forEach(panel => {
                    if (panel.dataset.panel === targetPanel) {
                        panel.classList.add('leaderboard-panel--active');
                    } else {
                        panel.classList.remove('leaderboard-panel--active');
                    }
                });
            });
        });
    }

    // ============================================
    // PREFERS REDUCED MOTION
    // ============================================
    function checkReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Disable animations
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-medium', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
            
            // Make all animated elements visible immediately
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                el.classList.add('is-visible');
            });
        }
    }

    // ============================================
    // FAQ ACCORDION
    // ============================================
    function initFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (!faqItems.length) return;
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) return;
            
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('faq-item--open');
                
                // Close all other items (optional - remove for multi-open)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('faq-item--open');
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                        if (otherAnswer) otherAnswer.hidden = true;
                    }
                });
                
                // Toggle current item
                if (isOpen) {
                    item.classList.remove('faq-item--open');
                    question.setAttribute('aria-expanded', 'false');
                    answer.hidden = true;
                } else {
                    item.classList.add('faq-item--open');
                    question.setAttribute('aria-expanded', 'true');
                    answer.hidden = false;
                }
            });
            
            // Keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
        
        // Open first item on desktop by default
        if (window.innerWidth > 768 && faqItems.length > 0) {
            const firstItem = faqItems[0];
            const firstQuestion = firstItem.querySelector('.faq-question');
            const firstAnswer = firstItem.querySelector('.faq-answer');
            
            firstItem.classList.add('faq-item--open');
            if (firstQuestion) firstQuestion.setAttribute('aria-expanded', 'true');
            if (firstAnswer) firstAnswer.hidden = false;
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        checkReducedMotion();
        initSmoothScrolling();
        initScrollAnimations();
        initHeroMedia();
        initVideoOptimization();
        initParallax();
        initScrollIndicator();
        initLazyLoading();
        initAccessibility();
        initGalleryStrip();
        initTournamentCards();
        initScoringTabs();
        initFaqAccordion();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
