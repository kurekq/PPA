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
    // TOURNAMENT CARD INTERACTIONS
    // ============================================
    function initTournamentCards() {
        const cards = document.querySelectorAll('.tournament-card');
        
        // Symulujemy datę 1 kwietnia 2025 do testów
        const today = new Date('2025-04-01');
        today.setHours(0, 0, 0, 0);
        
        let finishedCount = 0;
        
        cards.forEach(card => {
            // Add keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'article');
            
            // Check if tournament has ended
            const endDateStr = card.dataset.endDate;
            if (endDateStr) {
                const endDate = new Date(endDateStr);
                endDate.setHours(23, 59, 59, 999);
                
                if (today > endDate) {
                    card.classList.add('tournament-card--finished');
                    finishedCount++;
                    
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
    // INITIALIZATION
    // ============================================
    function init() {
        checkReducedMotion();
        initSmoothScrolling();
        initScrollAnimations();
        initVideoOptimization();
        initParallax();
        initScrollIndicator();
        initLazyLoading();
        initAccessibility();
        initTournamentCards();
        initScoringTabs();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
