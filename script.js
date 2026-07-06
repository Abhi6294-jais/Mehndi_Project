/**
 * ============================================================
 *  Khushi Mehndi Artist — Main JavaScript
 *  Pure Vanilla JS · ES6+ · No Dependencies
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================
  //  LANGUAGE TOGGLE (EN / HI)
  // ==========================================================
  const langToggle = document.getElementById('langToggle');
  const langText = langToggle?.querySelector('.lang-text');
  
  // Get saved language or default to English
  let currentLang = localStorage.getItem('khushi_lang') || 'en';

  const triggerGoogleTranslate = (langCode) => {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  };

  const updateLanguageUI = () => {
    if (langText) {
      langText.textContent = currentLang === 'en' ? 'EN' : 'HI';
    }
    // Give the Google Translate script a moment to load if it hasn't
    setTimeout(() => {
      if (currentLang !== 'en') {
        triggerGoogleTranslate(currentLang);
      } else {
        // To switch back to English, Google Translate usually requires triggering the 'Show original' iframe button
        // Or simply reloading the page without the googtrans cookie
        const iframe = document.querySelector('.goog-te-banner-frame');
        if (iframe) {
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          const restoreBtn = innerDoc.querySelector('.goog-te-button button');
          if (restoreBtn) restoreBtn.click();
        }
      }
    }, 1000);
  };

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'hi' : 'en';
      localStorage.setItem('khushi_lang', currentLang);
      
      // The most reliable way to reset Google Translate to default English is to reload the page
      // with a specific cookie, or just rely on the script. 
      // Setting cookie helps auto-translate on next load.
      document.cookie = `googtrans=/en/${currentLang}; path=/`;
      window.location.reload();
    });

    // Check if we have a cookie set from previous session, update our state
    if (document.cookie.includes('googtrans=/en/hi')) {
      currentLang = 'hi';
    }
    
    updateLanguageUI();
  }

  // ==========================================================
  //  0. HELPER / UTILITY FUNCTIONS
  // ==========================================================

  const formatPrice = (num) => '₹' + Number(num).toLocaleString('en-IN');

  const generateWhatsAppLink = (message) => {
    return `https://wa.me/918116821602?text=${encodeURIComponent(message)}`;
  };

  const showNotification = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
  };

  const courseModalOverlay = document.getElementById('courseEnrollOverlay');
  const courseModalClose = document.getElementById('courseModalClose');
  const courseModalTitle = document.getElementById('selectedCourseName');
  const courseEnrollForm = document.getElementById('courseEnrollForm');
  const courseSteps = Array.from(document.querySelectorAll('.modal-step'));
  const courseNameInput = document.getElementById('courseUserName');
  const courseMonthSelect = document.getElementById('courseMonth');
  const courseAddressInput = document.getElementById('courseAddress');
  const coursePincodeInput = document.getElementById('coursePincode');

  let currentCourse = '';
  let currentPrice = '';
  let currentHomePrice = '';

  const setCourseStep = (stepIndex) => {
    courseSteps.forEach((step, index) => {
      step.classList.toggle('active', index === stepIndex);
    });
  };

  const openCourseModal = (courseName, price, homePrice) => {
    currentCourse = courseName;
    currentPrice = price;
    currentHomePrice = homePrice;
    courseModalTitle.textContent = `Enroll in ${courseName}`;
    courseNameInput.value = '';
    courseMonthSelect.value = '';
    courseAddressInput.value = '';
    coursePincodeInput.value = '';
    courseEnrollForm.querySelector('input[name="courseLocation"][value="Non-home visit"]').checked = true;
    setCourseStep(0);
    courseModalOverlay.classList.add('active');
  };

  const closeCourseModal = () => {
    courseModalOverlay.classList.remove('active');
  };

  document.querySelectorAll('.course-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openCourseModal(button.dataset.course || 'Mehndi Course', button.dataset.price || '3000', button.dataset.homePrice || '6000');
    });
  });

  courseModalClose.addEventListener('click', closeCourseModal);
  courseModalOverlay.addEventListener('click', (event) => {
    if (event.target === courseModalOverlay) closeCourseModal();
  });

  courseEnrollForm.querySelectorAll('.modal-next').forEach((button) => {
    button.addEventListener('click', () => {
      const activeIndex = courseSteps.findIndex((step) => step.classList.contains('active'));
      if (activeIndex === 0) {
        setCourseStep(1);
      } else if (activeIndex === 1) {
        if (!courseNameInput.value.trim()) {
          showNotification('Please enter your name.', 'error');
          courseNameInput.focus();
          return;
        }
        if (!courseMonthSelect.value) {
          showNotification('Please select your preferred month.', 'error');
          courseMonthSelect.focus();
          return;
        }
        setCourseStep(2);
      }
    });
  });

  courseEnrollForm.querySelectorAll('.modal-back').forEach((button) => {
    button.addEventListener('click', () => {
      const activeIndex = courseSteps.findIndex((step) => step.classList.contains('active'));
      if (activeIndex > 0) setCourseStep(activeIndex - 1);
    });
  });

  courseEnrollForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const locationType = courseEnrollForm.querySelector('input[name="courseLocation"]:checked')?.value || 'Non-home visit';
    const userName = courseNameInput.value.trim();
    const selectedMonth = courseMonthSelect.value;
    const address = courseAddressInput.value.trim();
    const pincode = coursePincodeInput.value.trim();

    if (!userName) {
      showNotification('Please enter your name.', 'error');
      setCourseStep(1);
      courseNameInput.focus();
      return;
    }

    if (!selectedMonth) {
      showNotification('Please select your preferred month.', 'error');
      setCourseStep(1);
      courseMonthSelect.focus();
      return;
    }

    if (!pincode) {
      showNotification('Please enter your city pincode.', 'error');
      setCourseStep(2);
      coursePincodeInput.focus();
      return;
    }

    if (locationType === 'Home visit' && !address) {
      showNotification('Please provide your address for home service.', 'error');
      setCourseStep(2);
      courseAddressInput.focus();
      return;
    }

    const selectedFee = locationType === 'Home visit' ? currentHomePrice : currentPrice;
    const messageLines = [
      `Hi Khushi! I want to enroll in ${currentCourse}.`,
      `Service type: ${locationType}.`,
      `Preferred month: ${selectedMonth}.`,
      `Name: ${userName}.`,
      `Pincode: ${pincode}.`,
    ];

    if (locationType === 'Home visit') {
      messageLines.push(`Address: ${address}.`);
    }

    messageLines.push(`Course fee: ₹${selectedFee}.`);
    messageLines.push('Please confirm availability and next steps.');

    const message = messageLines.join('\n');
    window.open(generateWhatsAppLink(message), '_blank');
    showNotification(`${currentCourse} enrollment details sent! ✅`);
    closeCourseModal();
  });

  // ==========================================================
  //  1. NAVIGATION
  // ==========================================================

  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Scroll effects
  const navLinkItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 50);

    let currentSection = '';
    sections.forEach((section) => {
      const navHeight = navbar ? navbar.offsetHeight : 0;
      if (scrollY >= section.offsetTop - navHeight - 100) {
        currentSection = section.getAttribute('id');
      }
    });
    navLinkItems.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ==========================================================
  //  2. SCROLL ANIMATIONS (IntersectionObserver)
  // ==========================================================

  // Auto-add animate-on-scroll to elements for a massive reveal effect
  const autoAnimateElements = document.querySelectorAll(
    'section h2, section h3, section h4, section p:not(.hero-subtitle):not(.hero-description), .service-features li, .footer-col, .form-group'
  );
  
  autoAnimateElements.forEach((el, index) => {
    if (!el.classList.contains('animate-on-scroll')) {
      el.classList.add('animate-on-scroll');
      // Distribute animation variants
      if (index % 3 === 0) el.classList.add('slide-left');
      else if (index % 3 === 1) el.classList.add('slide-right');
      else el.classList.add('zoom-in');
    }
  });

  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  if (animatedElements.length) {
    // Use IntersectionObserver when available; otherwise reveal immediately
    if ('IntersectionObserver' in window) {
      const scrollObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              // Add slight random delay for organic feel
              const randomDelay = Math.random() * 0.2;
              el.style.transitionDelay = `${randomDelay}s`;
              
              el.classList.add('visible');
              if (el.classList.contains('stagger-children')) {
                Array.from(el.children).forEach((child, i) => {
                  child.style.transitionDelay = `${i * 0.15 + randomDelay}s`;
                  child.classList.add('visible');
                });
              }
              scrollObserver.unobserve(el);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
      );
      animatedElements.forEach((el) => scrollObserver.observe(el));
    } else {
      // Fallback: reveal all elements immediately so animations don't block page
      animatedElements.forEach((el) => {
        el.classList.add('visible');
        if (el.classList.contains('stagger-children')) {
          Array.from(el.children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.08}s`;
            child.classList.add('visible');
          });
        }
      });
    }
  }

  // ==========================================================
  //  3. PARALLAX & TEXT ANIMATIONS
  // ==========================================================

  // Hero parallax on scroll
  const heroContent = document.querySelector('.hero-content');
  const heroOverlay = document.querySelector('.hero-overlay');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - (scrollY / window.innerHeight) * 1.5;
    }
    if (heroOverlay && scrollY < window.innerHeight) {
      heroOverlay.style.opacity = 0.6 + (scrollY / window.innerHeight) * 0.4;
    }
  }, { passive: true });

  // Counter animation for stats
  const animateCounter = (el, target) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString('en-IN');
    }, 30);
  };

  // ==========================================================
  //  4. GALLERY FILTER & PAGINATION
  // ==========================================================

  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const galleryCollapseBtn = document.getElementById('galleryCollapseBtn');
  let galleryVisibleCount = 3;
  let lightboxImages = [];
  let lightboxIndex = 0;

  function updateGallery(resetCount = false) {
    if (resetCount) galleryVisibleCount = 3;
    
    const activeBtn = document.querySelector('.filter-btn.active');
    const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    
    let matchCount = 0;
    galleryItems.forEach((item) => {
      const match = filter === 'all' || item.getAttribute('data-category') === filter;
      if (match) {
        if (matchCount < galleryVisibleCount) {
          item.classList.remove('hidden');
          item.style.animationDelay = `${(matchCount % 3) * 0.08}s`;
          item.style.animation = 'fadeInUp 0.6s ease forwards';
        } else {
          item.classList.add('hidden');
          item.style.animation = '';
        }
        matchCount++;
      } else {
        item.classList.add('hidden');
        item.style.animation = '';
      }
    });
    
     const allGalleryVisible = galleryVisibleCount >= matchCount;
    if (loadMoreBtn) {
       loadMoreBtn.style.display = matchCount > galleryVisibleCount ? 'inline-block' : 'none';
    }
    if (galleryCollapseBtn) {
       galleryCollapseBtn.style.display = galleryVisibleCount > 3 ? 'inline-flex' : 'none';
    }
    
    // Update lightbox images so it only cycles through currently visible ones
    lightboxImages = Array.from(document.querySelectorAll('.gallery-item:not(.hidden) img'));
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      updateGallery(true);
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      galleryVisibleCount += 3;
      updateGallery(false);
    });
  }

  if (galleryCollapseBtn) {
    galleryCollapseBtn.addEventListener('click', () => {
      galleryVisibleCount = Math.max(3, galleryVisibleCount - 3);
      updateGallery(false);
      
      // If we are back to the minimum, scroll up to the top of the gallery
      if (galleryVisibleCount <= 3) {
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
          gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Otherwise just scroll up slightly so the button stays near the mouse
        window.scrollBy({ top: -300, behavior: 'smooth' });
      }
    });
  }

  // Initialize gallery on load
  updateGallery(true);

  // ==========================================================
  //  5. LIGHTBOX
  // ==========================================================

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const refreshLightboxImages = () => {
    lightboxImages = Array.from(document.querySelectorAll('.gallery-item:not(.hidden) img'));
  };

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImg) return;
    refreshLightboxImages();
    if (index < 0 || index >= lightboxImages.length) return;
    lightboxIndex = index;
    lightboxImg.src = lightboxImages[lightboxIndex].src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const navigateLightbox = (dir) => {
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    if (lightboxImg) {
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.9)';
      setTimeout(() => {
        lightboxImg.src = lightboxImages[lightboxIndex].src;
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      }, 200);
    }
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        refreshLightboxImages();
        const idx = lightboxImages.indexOf(img);
        openLightbox(idx !== -1 ? idx : 0);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext?.addEventListener('click', () => navigateLightbox(1));
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // ==========================================================
  //  6. VIDEO SLIDER
  // ==========================================================

  const videoSlider = document.getElementById('videoSlider');
  const videoSliderPrev = document.getElementById('videoSliderPrev');
  const videoSliderNext = document.getElementById('videoSliderNext');
  const videoSliderDots = document.getElementById('videoSliderDots');

  if (videoSlider) {
    const slides = videoSlider.querySelectorAll('.video-slide');
    const totalSlides = slides.length;
    let currentVideoSlide = 0;
    let slidesPerView = 3;

    const updateSlidesPerView = () => {
      if (window.innerWidth <= 480) slidesPerView = 1;
      else if (window.innerWidth <= 768) slidesPerView = 2;
      else slidesPerView = 3;
    };

    updateSlidesPerView();
    window.addEventListener('resize', () => {
      updateSlidesPerView();
      goToVideoSlide(Math.min(currentVideoSlide, totalSlides - slidesPerView));
    });

    const maxSlide = () => Math.max(0, totalSlides - slidesPerView);

    const goToVideoSlide = (index) => {
      currentVideoSlide = Math.max(0, Math.min(index, maxSlide()));
      const slideWidth = 100 / slidesPerView;
      videoSlider.style.transform = `translateX(-${currentVideoSlide * slideWidth}%)`;

      // Update dots
      if (videoSliderDots) {
        videoSliderDots.querySelectorAll('.dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === currentVideoSlide);
        });
      }

      // Play visible videos, pause others
      slides.forEach((slide, i) => {
        const video = slide.querySelector('video');
        if (video) {
          if (i >= currentVideoSlide && i < currentVideoSlide + slidesPerView) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      });
    };

    // Fullscreen and Unmute on Click
    slides.forEach(slide => {
      const video = slide.querySelector('video');
      if (video) {
        // Prevent click from dragging/swiping
        video.style.cursor = 'pointer';
        video.title = 'Click to view fullscreen';
        
        video.addEventListener('click', (e) => {
          // Open fullscreen
          if (video.requestFullscreen) {
            video.requestFullscreen();
          } else if (video.webkitRequestFullscreen) { /* Safari */
            video.webkitRequestFullscreen();
          } else if (video.msRequestFullscreen) { /* IE11 */
            video.msRequestFullscreen();
          }
          
          // Unmute video when in fullscreen
          video.muted = false;
          
          // Listen for exiting fullscreen to mute again
          const exitFullscreenHandler = () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
              video.muted = true;
            }
          };
          
          document.addEventListener('fullscreenchange', exitFullscreenHandler);
          document.addEventListener('webkitfullscreenchange', exitFullscreenHandler);
          document.addEventListener('msfullscreenchange', exitFullscreenHandler);
        });
      }
    });

    // Build dots
    if (videoSliderDots) {
      for (let i = 0; i <= maxSlide(); i++) {
        const dot = document.createElement('button');
        dot.className = `dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goToVideoSlide(i));
        videoSliderDots.appendChild(dot);
      }
    }

    videoSliderPrev?.addEventListener('click', () => goToVideoSlide(currentVideoSlide - 1));
    videoSliderNext?.addEventListener('click', () => goToVideoSlide(currentVideoSlide + 1));

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Auto-advance slider (faster: every 3s)
    let videoAutoPlay;
    let isVideoSliderPaused = false;
    
    const autoAdvance = () => {
      if (isVideoSliderPaused) return;
      if (currentVideoSlide >= maxSlide()) goToVideoSlide(0);
      else goToVideoSlide(currentVideoSlide + 1);
      
      startAutoPlay();
    };

    const startAutoPlay = () => {
      clearTimeout(videoAutoPlay);
      isVideoSliderPaused = false;
      videoAutoPlay = setTimeout(autoAdvance, 3000);
    };
    
    const stopAutoPlay = () => {
      isVideoSliderPaused = true;
      clearTimeout(videoAutoPlay);
    };

    videoSlider.addEventListener('touchstart', (e) => { 
      touchStartX = e.changedTouches[0].screenX; 
      stopAutoPlay();
    }, { passive: true });
    
    videoSlider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToVideoSlide(currentVideoSlide + 1);
        else goToVideoSlide(currentVideoSlide - 1);
      }
      startAutoPlay();
    }, { passive: true });

    videoSlider.addEventListener('touchcancel', startAutoPlay, { passive: true });

    const sliderWrapper = videoSlider.closest('.video-slider-wrapper');
    if (sliderWrapper) {
      sliderWrapper.addEventListener('mouseenter', stopAutoPlay);
      sliderWrapper.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Start initial timer
    startAutoPlay();

    // Initialize
    goToVideoSlide(0);
  }

  // ==========================================================
  //  7. PRODUCTS & SHOPPING CART
  // ==========================================================

  const CART_KEY = 'khushi_mehndi_cart';
  let cart = [];

  const loadCart = () => { try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; } };
  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const getCartCount = () => cart.reduce((s, i) => s + i.quantity, 0);
  const getCartTotal = () => cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const updateCartBadge = () => {
    const badge = document.getElementById('cartBadge');
    if (badge) { const c = getCartCount(); badge.textContent = c; badge.style.display = c > 0 ? 'flex' : 'none'; }
  };

  const renderCart = () => {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    if (!container) return;

    container.querySelectorAll('.cart-item').forEach(i => i.remove());

    if (cart.length === 0) {
      if (empty) empty.style.display = 'flex';
      if (footer) footer.style.display = 'none';
    } else {
      if (empty) empty.style.display = 'none';
      if (footer) footer.style.display = 'block';
      cart.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"/></div>
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
            <div class="cart-item-quantity">
              <button class="qty-btn minus" data-id="${item.id}">−</button>
              <span>${item.quantity}</span>
              <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">✕</button>
        `;
        container.appendChild(div);
      });

      container.querySelectorAll('.qty-btn.minus').forEach(b => b.addEventListener('click', () => updateQuantity(b.dataset.id, -1)));
      container.querySelectorAll('.qty-btn.plus').forEach(b => b.addEventListener('click', () => updateQuantity(b.dataset.id, 1)));
      container.querySelectorAll('.cart-item-remove').forEach(b => b.addEventListener('click', () => removeFromCart(b.dataset.id)));
    }
    if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
    updateCartBadge();
  };

  const addToCart = (id, name, price, image) => {
    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++; else cart.push({ id, name, price: Number(price), image, quantity: 1 });
    saveCart(); renderCart(); 
    showNotification(`${name} added to cart!`);
    openCart(); // Automatically open cart to show the selected products
  };

  const updateQuantity = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(); renderCart();
  };

  const removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart(); renderCart(); showNotification('Item removed from cart.');
  };

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const { id, name, price, image } = btn.dataset;
      if (id && name && price) addToCart(id, name, Number(price), image || '');
    });
  });

  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const openCart = () => { cartSidebar?.classList.add('open'); cartOverlay?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeCart = () => { cartSidebar?.classList.remove('open'); cartOverlay?.classList.remove('open'); document.body.style.overflow = ''; };

  document.getElementById('cartToggle')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  document.getElementById('shopNowBtn')?.addEventListener('click', closeCart);

  document.getElementById('cartCheckout')?.addEventListener('click', () => {
    if (cart.length === 0) { showNotification('Your cart is empty!', 'error'); return; }
    openCheckout();
  });

  loadCart(); renderCart();

  // ==========================================================
  //  7B. CHECKOUT MODAL & PAYMENT
  // ==========================================================

  const OWNER_PHONE = '8116821602'; // WhatsApp number for order confirmation
  const UPI_ID = '8116821602@axl';
  const UPI_NAME = 'Miss Khushi Jaiswal';
  let checkoutData = { name: '', phone: '', email: '', address: '', paymentMethod: 'cod' };
  let currentCheckoutStep = 1;

  const openCheckout = () => {
    closeCart(); // Close the cart sidebar first to prevent overlay issues on mobile
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    if (modal && overlay) {
      modal.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      currentCheckoutStep = 1;
      showCheckoutStep(1);
    }
  };

  const closeCheckout = () => {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    if (modal && overlay) {
      modal.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  const showCheckoutStep = (step) => {
    // Update step indicators
    document.querySelectorAll('.checkout-step').forEach((el, i) => {
      el.classList.remove('active', 'completed');
      const stepNum = parseInt(el.dataset.step);
      if (stepNum === step) el.classList.add('active');
      else if (stepNum < step) el.classList.add('completed');
    });

    // Hide all step contents
    document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));

    // Show current step
    const stepContent = document.getElementById(`checkoutStep${step}`);
    if (stepContent) stepContent.classList.add('active');

    currentCheckoutStep = step;
  };

  // Step 1: Details validation and next
  document.getElementById('checkoutNext1')?.addEventListener('click', () => {
    const name = document.getElementById('checkoutName')?.value.trim();
    const phone = document.getElementById('checkoutPhone')?.value.trim();
    const address = document.getElementById('checkoutAddress')?.value.trim();

    if (!name || !phone || !address) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    checkoutData = {
      name,
      phone,
      email: document.getElementById('checkoutEmail')?.value.trim() || '',
      address,
      paymentMethod: 'cod'
    };

    showCheckoutStep(2);
  });

  // Step 2: Payment method selection
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      checkoutData.paymentMethod = e.target.value;
      const upiQrSection = document.getElementById('upiQrSection');
      if (e.target.value === 'upi') {
        if (upiQrSection) {
          upiQrSection.classList.add('show');
          generateUpiQr();
        }
      } else {
        if (upiQrSection) upiQrSection.classList.remove('show');
      }
    });
  });

  // Generate UPI QR Code
  const generateUpiQr = () => {
    const qrElement = document.getElementById('upiQrCode');
    if (!qrElement) return;
    
    // Create UPI string
    const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&tn=${encodeURIComponent('Khushi Mehndi - Order Payment')}&am=${getCartTotal()}`;
    
    // Generate QR code using qrcode.js library (fallback to simple text if lib not available)
    if (typeof QRCode !== 'undefined') {
      qrElement.innerHTML = '';
      new QRCode(qrElement, {
        text: upiString,
        width: 200,
        height: 200,
        colorDark: '#1A1A1A',
        colorLight: '#FFFFFF'
      });
    } else {
      qrElement.innerHTML = `<div style="padding: 20px; text-align: center; font-size: 0.9rem; color: #666;">QR Code Library not loaded. Please scan manually or use the UPI ID below.</div>`;
    }
  };

  // Step 2: Next to review
  document.getElementById('checkoutNext2')?.addEventListener('click', () => {
    if (!checkoutData.paymentMethod) {
      showNotification('Please select a payment method', 'error');
      return;
    }
    renderOrderSummary();
    showCheckoutStep(3);
  });

  // Render order summary
  const renderOrderSummary = () => {
    const summaryEl = document.getElementById('orderSummary');
    if (!summaryEl) return;

    let html = '';
    cart.forEach(item => {
      html += `
        <div class="summary-item">
          <div class="summary-item-name">
            <span>${item.name}</span>
            <span class="summary-item-qty">Qty: ${item.quantity}</span>
          </div>
          <span class="summary-item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
      `;
    });

    const subtotal = getCartTotal();
    const deliveryFee = 49;
    const total = subtotal + deliveryFee;
    
    html += `
      <div class="summary-item" style="margin-top: 10px;">
        <div class="summary-item-name">
          <span>Delivery</span>
        </div>
        <span class="summary-item-price">${formatPrice(deliveryFee)}</span>
      </div>
      <div class="summary-total">
        <span>Total</span>
        <span class="summary-total-amount">${formatPrice(total)}</span>
      </div>
      <div class="summary-payment-method">
        <strong>Payment Method:</strong> ${checkoutData.paymentMethod === 'upi' ? 'UPI / Google Pay / PhonePe' : 'Cash on Delivery (COD)'}
      </div>
    `;

    summaryEl.innerHTML = html;
  };

  // Step 3: Confirm order
  document.getElementById('checkoutConfirm')?.addEventListener('click', () => {
    let msg = `📦 *New Order - Khushi Mehndi Artist*\n\n`;
    msg += `👤 *Customer Details*\n`;
    msg += `Name: ${checkoutData.name}\n`;
    msg += `Phone: ${checkoutData.phone}\n`;
    if (checkoutData.email) msg += `Email: ${checkoutData.email}\n`;
    msg += `Address: ${checkoutData.address}\n\n`;

    msg += `🛒 *Items*\n`;
    cart.forEach((item, i) => {
      msg += `${i + 1}. ${item.name}\n`;
      msg += `   Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n`;
    });

    const subtotal = getCartTotal();
    const deliveryFee = 49;
    const total = subtotal + deliveryFee;
    
    msg += `\n🚚 *Delivery Fee:* ${formatPrice(deliveryFee)}\n`;
    msg += `💰 *Total Amount:* ${formatPrice(total)}\n`;
    msg += `💳 *Payment Method:* ${checkoutData.paymentMethod === 'upi' ? 'UPI / Google Pay / PhonePe' : 'Cash on Delivery (COD)'}\n`;
    
    if (checkoutData.paymentMethod === 'upi') {
      msg += `\n🏦 *UPI Details*\n`;
      msg += `UPI ID: ${UPI_ID}\n`;
      msg += `Name: ${UPI_NAME}\n`;
    }

    msg += `\nPlease confirm this order. Thank you! 🙏`;

    window.open(generateWhatsAppLink(msg), '_blank');
    
    // Clear cart
    cart = [];
    saveCart();
    renderCart();
    closeCheckout();
    showNotification('Order sent! Please wait for confirmation.', 'success');
  });

  // Location detect button for checkout
  document.getElementById('checkoutLocDetect')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'error');
      return;
    }

    const addressField = document.getElementById('checkoutAddress');
    if (addressField) {
      addressField.value = "Detecting location...";
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              addressField.value = data.display_name;
              showNotification('📍 Location detected! Address filled automatically.');
            } else {
              addressField.value = '';
              showNotification('Could not get address. Please fill manually.', 'error');
            }
          } catch (err) {
            addressField.value = '';
            showNotification('Could not connect to location service.', 'error');
          }
        },
        () => {
          addressField.value = '';
          showNotification('Location access denied or unavailable.', 'error');
        }
      );
    }
  });

  // Back buttons
  document.getElementById('checkoutBack2')?.addEventListener('click', () => showCheckoutStep(1));
  document.getElementById('checkoutBack3')?.addEventListener('click', () => showCheckoutStep(2));
  document.getElementById('checkoutCancel1')?.addEventListener('click', closeCheckout);

  // Close modal
  document.getElementById('checkoutClose')?.addEventListener('click', closeCheckout);
  document.getElementById('checkoutOverlay')?.addEventListener('click', closeCheckout);

  // Update cart checkout button to open modal instead
  const cartCheckout = document.getElementById('cartCheckout');
  if (cartCheckout) {
    cartCheckout.textContent = '';
    cartCheckout.innerHTML = '<i class="fas fa-credit-card"></i> Proceed to Checkout';
  }


  // ==========================================================
  //  8. PRECISE LOCATION (Geolocation API + Reverse Geocoding)
  // ==========================================================

  const preciseLocationBtn = document.getElementById('preciseLocationBtn');
  const locationStatus = document.getElementById('locationStatus');
  const locationStatusText = document.getElementById('locationStatusText');

  if (preciseLocationBtn) {
    preciseLocationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser.', 'error');
        return;
      }

      // Show loading state
      preciseLocationBtn.classList.add('loading');
      const btnIcon = preciseLocationBtn.querySelector('i');
      if (btnIcon) { btnIcon.className = 'fas fa-spinner fa-spin'; }
      if (locationStatus) {
        locationStatus.style.display = 'flex';
        locationStatus.className = 'location-status';
        locationStatus.querySelector('i').className = 'fas fa-spinner fa-spin';
        if (locationStatusText) locationStatusText.textContent = 'Detecting your location...';
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocoding using OpenStreetMap Nominatim (free, no API key)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
              { headers: { 'User-Agent': 'KhushiMehndiArtist/1.0' } }
            );
            const data = await response.json();

            if (data && data.address) {
              const addr = data.address;

              // Fill address fields
              const addressField = document.getElementById('address');
              const cityField = document.getElementById('city');
              const pincodeField = document.getElementById('pincode');
              const landmarkField = document.getElementById('landmark');

              // Build full address
              const parts = [
                addr.house_number,
                addr.road,
                addr.neighbourhood || addr.suburb,
                addr.village || addr.town || addr.city_district
              ].filter(Boolean);

              if (addressField) {
                addressField.value = parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || '';
                addressField.classList.remove('error');
              }
              if (cityField) {
                cityField.value = addr.city || addr.town || addr.village || addr.state_district || '';
                cityField.classList.remove('error');
              }
              if (pincodeField) {
                pincodeField.value = addr.postcode || '';
                pincodeField.classList.remove('error');
              }
              if (landmarkField) {
                landmarkField.value = addr.neighbourhood || addr.suburb || '';
              }

              // Success state
              preciseLocationBtn.classList.remove('loading');
              preciseLocationBtn.classList.add('success');
              if (btnIcon) { btnIcon.className = 'fas fa-check'; }

              if (locationStatus) {
                locationStatus.className = 'location-status success';
                locationStatus.querySelector('i').className = 'fas fa-check-circle';
                if (locationStatusText) locationStatusText.textContent = 'Address detected successfully!';
              }

              showNotification('📍 Location detected! Address filled automatically.');

              // Reset button after 3s
              setTimeout(() => {
                preciseLocationBtn.classList.remove('success');
                if (btnIcon) btnIcon.className = 'fas fa-crosshairs';
              }, 3000);

            } else {
              throw new Error('No address data found');
            }
          } catch (error) {
            // Geocoding failed
            preciseLocationBtn.classList.remove('loading');
            if (btnIcon) { btnIcon.className = 'fas fa-crosshairs'; }

            if (locationStatus) {
              locationStatus.className = 'location-status error';
              locationStatus.querySelector('i').className = 'fas fa-exclamation-triangle';
              if (locationStatusText) locationStatusText.textContent = 'Could not detect address. Please fill manually.';
            }

            showNotification('Could not get address. Please fill manually.', 'error');
          }
        },
        (error) => {
          // Geolocation error
          preciseLocationBtn.classList.remove('loading');
          if (btnIcon) { btnIcon.className = 'fas fa-crosshairs'; }

          let errorMsg = 'Location access denied. Please fill manually.';
          if (error.code === 1) errorMsg = 'Location permission denied. Please allow location access and try again.';
          else if (error.code === 2) errorMsg = 'Location unavailable. Please fill address manually.';
          else if (error.code === 3) errorMsg = 'Location request timed out. Please try again.';

          if (locationStatus) {
            locationStatus.style.display = 'flex';
            locationStatus.className = 'location-status error';
            locationStatus.querySelector('i').className = 'fas fa-exclamation-triangle';
            if (locationStatusText) locationStatusText.textContent = errorMsg;
          }

          showNotification(errorMsg, 'error');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  // ==========================================================
  //  9. MULTI-STEP BOOKING FORM
  // ==========================================================

  const bookingForm = document.getElementById('bookingForm');

  if (bookingForm) {
    const steps = bookingForm.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const prevBtn = document.getElementById('formPrev');
    const nextBtn = document.getElementById('formNext');
    const submitBtn = document.getElementById('formSubmit');
    const addressForm = document.getElementById('addressForm');
    const summaryDetails = document.getElementById('summaryDetails');
    let currentStep = 1;
    const totalSteps = steps.length;

    const goToStep = (stepNum) => {
      steps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === stepNum));
      stepIndicators.forEach(ind => {
        const n = parseInt(ind.dataset.step);
        ind.classList.toggle('active', n === stepNum);
        ind.classList.toggle('completed', n < stepNum);
      });
      currentStep = stepNum;
      if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
      if (nextBtn) nextBtn.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
      if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
      if (currentStep === totalSteps) buildSummary();
    };

    const validateStep = (stepNum) => {
      let valid = true;

      if (stepNum === 1) {
        if (!bookingForm.querySelector('input[name="service"]:checked')) {
          showNotification('Please select a service.', 'error'); return false;
        }
      }

      if (stepNum === 2) {
        const loc = bookingForm.querySelector('input[name="location"]:checked');
        if (!loc) { showNotification('Please select a location preference.', 'error'); return false; }
        if (loc.value === 'home_service') {
          ['address', 'city', 'pincode'].forEach(id => {
            const f = document.getElementById(id);
            if (f && !f.value.trim()) { f.classList.add('error'); valid = false; }
            else if (f) f.classList.remove('error');
          });
          if (!valid) showNotification('Please fill in your address.', 'error');
        }
      }

      if (stepNum === 3) {
        const d = document.getElementById('bookingDate');
        const t = bookingForm.querySelector('input[name="timeSlot"]:checked');
        if (d && !d.value) { d.classList.add('error'); valid = false; }
        if (!t) valid = false;
        if (!valid) showNotification('Please select date and time.', 'error');
      }

      if (stepNum === 4) {
        const name = document.getElementById('customerName');
        const phone = document.getElementById('customerPhone');
        if (name && !name.value.trim()) { name.classList.add('error'); valid = false; }
        if (phone && !phone.value.trim()) { phone.classList.add('error'); valid = false; }
        else if (phone && !/^[6-9]\d{9}$/.test(phone.value.trim())) {
          phone.classList.add('error'); showNotification('Enter a valid 10-digit phone number.', 'error'); return false;
        }
        if (!valid) showNotification('Please fill required fields.', 'error');
      }

      return valid;
    };

    nextBtn?.addEventListener('click', () => { if (validateStep(currentStep)) goToStep(currentStep + 1); });
    prevBtn?.addEventListener('click', () => goToStep(currentStep - 1));

    // Location toggle
    bookingForm.querySelectorAll('input[name="location"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (addressForm) addressForm.style.display = radio.value === 'home_service' ? 'block' : 'none';
      });
    });

    // Date min
    const datePicker = document.getElementById('bookingDate');
    if (datePicker) datePicker.setAttribute('min', new Date().toISOString().split('T')[0]);

    const buildSummary = () => {
      if (!summaryDetails) return;
      const service = bookingForm.querySelector('input[name="service"]:checked');
      const location = bookingForm.querySelector('input[name="location"]:checked');
      const date = document.getElementById('bookingDate');
      const time = bookingForm.querySelector('input[name="timeSlot"]:checked');
      const name = document.getElementById('customerName');
      const phone = document.getElementById('customerPhone');
      const email = document.getElementById('customerEmail');
      const guests = document.getElementById('guestCount');
      const reqs = document.getElementById('specialRequests');

      let locText = location ? (location.value === 'home_service' ? '🏠 Home Service' : '🏪 Visit Artist') : '—';
      if (location?.value === 'home_service') {
        const a = document.getElementById('address')?.value || '';
        const c = document.getElementById('city')?.value || '';
        const p = document.getElementById('pincode')?.value || '';
        const l = document.getElementById('landmark')?.value || '';
        locText += `<br><small>${a}, ${c} - ${p}${l ? ' (Near ' + l + ')' : ''}</small>`;
      }

      const fmtDate = date?.value ? new Date(date.value + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';

      summaryDetails.innerHTML = `
        <div class="summary-row"><span>🎨 Service</span><strong>${service?.value || '—'}</strong></div>
        <div class="summary-row"><span>📍 Location</span><strong>${locText}</strong></div>
        <div class="summary-row"><span>📅 Date</span><strong>${fmtDate}</strong></div>
        <div class="summary-row"><span>🕐 Time</span><strong>${time?.value || '—'}</strong></div>
        <div class="summary-row"><span>👤 Name</span><strong>${name?.value || '—'}</strong></div>
        <div class="summary-row"><span>📱 Phone</span><strong>${phone?.value || '—'}</strong></div>
        ${email?.value ? `<div class="summary-row"><span>📧 Email</span><strong>${email.value}</strong></div>` : ''}
        ${guests?.value > 1 ? `<div class="summary-row"><span>👥 Guests</span><strong>${guests.value}</strong></div>` : ''}
        ${reqs?.value ? `<div class="summary-row"><span>📝 Requests</span><strong>${reqs.value}</strong></div>` : ''}
      `;
    };

    submitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const service = bookingForm.querySelector('input[name="service"]:checked');
      const location = bookingForm.querySelector('input[name="location"]:checked');
      const date = document.getElementById('bookingDate');
      const time = bookingForm.querySelector('input[name="timeSlot"]:checked');
      const name = document.getElementById('customerName');
      const phone = document.getElementById('customerPhone');
      const email = document.getElementById('customerEmail');
      const guests = document.getElementById('guestCount');
      const reqs = document.getElementById('specialRequests');

      let locLine = location?.value === 'home_service' ? 'Home Service' : 'Visit Studio';
      if (location?.value === 'home_service') {
        const a = document.getElementById('address')?.value || '';
        const c = document.getElementById('city')?.value || '';
        const p = document.getElementById('pincode')?.value || '';
        const l = document.getElementById('landmark')?.value || '';
        locLine += ` — ${a}, ${c} - ${p}${l ? ' (Near ' + l + ')' : ''}`;
      }

      const fmtDate = date?.value ? new Date(date.value + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

      let msg = `📋 *New Booking — Khushi Mehndi Artist*\n\n`;
      msg += `🎨 *Service:* ${service?.value || ''}\n📍 *Location:* ${locLine}\n📅 *Date:* ${fmtDate}\n🕐 *Time:* ${time?.value || ''}\n👤 *Name:* ${name?.value || ''}\n📱 *Phone:* ${phone?.value || ''}\n`;
      if (email?.value) msg += `📧 *Email:* ${email.value}\n`;
      if (guests?.value > 1) msg += `👥 *Guests:* ${guests.value}\n`;
      if (reqs?.value) msg += `\n📝 *Special Requests:*\n${reqs.value}\n`;
      msg += `\nPlease confirm this booking. Thank you! 🙏`;

      window.open(generateWhatsAppLink(msg), '_blank');
      showNotification('Booking sent via WhatsApp! ✅');
    });

    goToStep(1);
  }

  // ==========================================================
  //  10. CUSTOMER REVIEW FORM
  // ==========================================================

  const reviewForm = document.getElementById('reviewForm');
  const reviewGrid = document.getElementById('reviewsGrid');
  const reviewRatingInput = document.getElementById('reviewRating');
  const starButtons = document.querySelectorAll('.star-btn');
  const reviewCountEl = document.querySelector('.rating-count');
  const reviewFilterButtons = document.querySelectorAll('.review-filter-btn');
  const reviewLoadMoreBtn = document.getElementById('reviewLoadMore');
  const reviewCollapseBtn = document.getElementById('reviewCollapse');
  const REVIEW_STORAGE_KEY = 'khushi_mehndi_reviews';
  const REVIEWS_PER_PAGE = 2;

  let allReviews = [];
  let activeFilter = 'all';
  let visibleCount = 0;

  const getReviewBadgeLabel = (review) => {
    const type = review.type || 'Service';
    const item = (review.item || '').toLowerCase();

    if (type === 'Course') {
      return item.includes('starter') || item.includes('beginner') ? 'Course Starter' : 'Course Journey';
    }

    if (type === 'Product') {
      return item.includes('kit') ? 'Mehndi Kit' : 'Product Bundle';
    }

    if (item.includes('bridal')) return 'Bridal Experience';
    if (item.includes('engagement')) return 'Engagement Styling';
    if (item.includes('baby')) return 'Baby Shower Charm';
    if (item.includes('festival')) return 'Festival Glow';

    return 'Custom Service';
  };

  const createReviewCard = (review, index = 0) => {
    const card = document.createElement('article');
    card.className = 'review-card animate-on-scroll';
    card.classList.add(index % 2 === 0 ? 'slide-left' : 'slide-right');
    card.innerHTML = `
      <div class="review-card-top">
        <div class="reviewer-meta">
          <div class="author-avatar">${(review.name || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <h5>${review.name}</h5>
            <span class="reviewer-role">${review.type || 'Verified Client'}</span>
          </div>
        </div>
        <div>
          <span class="review-badge">${getReviewBadgeLabel(review)}</span>
          ${review.item ? `<div class="review-item-tag">${review.item}</div>` : ''}
        </div>
      </div>
      <div class="review-stars">
        ${'<i class="fas fa-star"></i>'.repeat(review.rating || 5)}
      </div>
      <h4 class="review-title">${review.title || 'Loved the experience'}</h4>
      <p class="review-text">${review.text}</p>
      <div class="review-footer">
        <span>${review.date || 'Just now'}</span>
        <button class="review-helpful" type="button">Helpful · <span class="helpful-count">${review.helpful || 1}</span></button>
      </div>
    `;

    // Helpful button logic
    const helpfulBtn = card.querySelector('.review-helpful');
    const helpfulCountSpan = card.querySelector('.helpful-count');
    let isLiked = false;
    let currentCount = review.helpful || 1;

    helpfulBtn.addEventListener('click', () => {
      if (!isLiked) {
        isLiked = true;
        currentCount++;
        helpfulCountSpan.textContent = currentCount;
        helpfulBtn.classList.add('liked');
      } else {
        isLiked = false;
        currentCount--;
        helpfulCountSpan.textContent = currentCount;
        helpfulBtn.classList.remove('liked');
      }
    });

    return card;
  };

  const updateReviewSummary = () => {
    if (!reviewGrid || !reviewCountEl) return;
    const totalReviews = allReviews.length;
    reviewCountEl.textContent = `Based on ${totalReviews}+ customer experiences`;
  };

  const renderReviews = () => {
    if (!reviewGrid) return;
    const filtered = allReviews.filter((review) => activeFilter === 'all' || review.type === activeFilter);
    const visibleReviews = filtered.slice(0, visibleCount);
    reviewGrid.innerHTML = '';
    visibleReviews.forEach((review, index) => {
      const card = createReviewCard(review, index);
      card.style.transitionDelay = `${index * 0.08}s`;
      reviewGrid.appendChild(card);
      requestAnimationFrame(() => card.classList.add('visible'));
    });

    if (reviewLoadMoreBtn) {
      reviewLoadMoreBtn.style.display = visibleCount >= filtered.length ? 'none' : 'inline-flex';
    }
    if (reviewCollapseBtn) {
      reviewCollapseBtn.style.display = visibleCount > REVIEWS_PER_PAGE ? 'inline-flex' : 'none';
    }
  };

  const loadReviews = () => {
    if (!reviewGrid) return;
    const storedReviews = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
    const sampleReviews = [
      {
        id: 'sample-1',
        name: 'Priya Sharma',
        type: 'Service',
        item: 'Bridal Mehndi',
        rating: 5,
        text: 'The detailing was incredible and every guest kept asking who did my mehndi. The whole experience felt premium from start to finish.',
        title: 'Absolutely stunning bridal work',
        date: '2 weeks ago',
        helpful: 24
      },
      {
        id: 'sample-2',
        name: 'Anjali Verma',
        type: 'Service',
        item: 'Engagement Mehndi',
        rating: 5,
        text: 'The design looked classy and modern, and the stain came out beautifully. Very professional and easy to communicate with.',
        title: 'Elegant Arabic design with rich color',
        date: '1 month ago',
        helpful: 15
      },
      {
        id: 'sample-3',
        name: 'Sneha Gupta',
        type: 'Service',
        item: 'Baby Shower Mehndi',
        rating: 5,
        text: 'The home service was super convenient and the design was adorable. She made the whole experience comfortable and relaxed.',
        title: 'Cute design and convenient home service',
        date: '2 months ago',
        helpful: 11
      },
      {
        id: 'sample-4',
        name: 'Ritu Pandey',
        type: 'Service',
        item: 'Festival Mehndi',
        rating: 5,
        text: 'I keep booking for every festival because the patterns are always fresh and the stain lasts for weeks. Highly recommended.',
        title: 'Reliable, unique, and always beautiful',
        date: '3 months ago',
        helpful: 19
      }
    ];
    allReviews = [...sampleReviews, ...storedReviews];
    visibleCount = REVIEWS_PER_PAGE;
    renderReviews();
    updateReviewSummary();
  };

  if (reviewForm) {
    starButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const value = Number(button.dataset.value);
        if (reviewRatingInput) reviewRatingInput.value = value;
        starButtons.forEach((star) => {
          star.classList.toggle('active', Number(star.dataset.value) <= value);
        });
      });
    });

    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reviewerName')?.value.trim();
      const type = document.getElementById('reviewType')?.value || 'Service';
      const item = document.getElementById('reviewItem')?.value.trim();
      const title = document.getElementById('reviewTitle')?.value.trim();
      const text = document.getElementById('reviewText')?.value.trim();
      const rating = Number(reviewRatingInput?.value || 5);

      if (!name || !text || !title) return;

      const review = {
        id: `review-${Date.now()}`,
        name,
        type,
        item,
        rating,
        text,
        title,
        date: 'Just now',
        helpful: 1
      };

      const existingReviews = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
      existingReviews.unshift(review);
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(existingReviews));

      allReviews = [review, ...allReviews];
      visibleCount = Math.min(REVIEWS_PER_PAGE, allReviews.length);
      renderReviews();

      reviewForm.reset();
      if (reviewRatingInput) reviewRatingInput.value = '5';
      starButtons.forEach((star) => star.classList.toggle('active', Number(star.dataset.value) <= 5));
      document.getElementById('reviewType').value = 'Product';
      updateReviewSummary();
      showNotification('Thank you! Your review has been added.');
    });
  }

  reviewFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      reviewFilterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      activeFilter = button.dataset.reviewFilter || 'all';
      visibleCount = REVIEWS_PER_PAGE;
      renderReviews();
    });
  });

  if (reviewLoadMoreBtn) {
    reviewLoadMoreBtn.addEventListener('click', () => {
      visibleCount += REVIEWS_PER_PAGE;
      renderReviews();
    });
  }

  if (reviewCollapseBtn) {
    reviewCollapseBtn.addEventListener('click', () => {
      visibleCount = Math.max(REVIEWS_PER_PAGE, visibleCount - REVIEWS_PER_PAGE);
      renderReviews();
      
      if (visibleCount <= REVIEWS_PER_PAGE) {
        const reviewsSection = document.getElementById('reviews');
        if (reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollBy({ top: -300, behavior: 'smooth' });
      }
    });
  }

  loadReviews();

  // ==========================================================
  //  11. UX ENHANCEMENTS
  // ==========================================================

  document.querySelectorAll('input, textarea, select').forEach(f => {
    f.addEventListener('input', () => f.classList.remove('error'));
  });

  // Tilt effect on service cards
  document.querySelectorAll('.service-card, .product-card, .option-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ==========================================================
  //  12. CURSOR GLOW TRAIL
  // ==========================================================

  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  let glowX = 0, glowY = 0, currentGlowX = 0, currentGlowY = 0;

  document.addEventListener('mousemove', (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
  });

  const animateGlow = () => {
    currentGlowX += (glowX - currentGlowX) * 0.08;
    currentGlowY += (glowY - currentGlowY) * 0.08;
    cursorGlow.style.left = currentGlowX + 'px';
    cursorGlow.style.top = currentGlowY + 'px';
    requestAnimationFrame(animateGlow);
  };

  animateGlow();

  // Hide on mobile
  if (window.innerWidth < 768) cursorGlow.style.display = 'none';

  // ==========================================================
  //  13. SCROLL PROGRESS BAR
  // ==========================================================

  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.appendChild(scrollProgress);

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // ==========================================================
  //  14. RIPPLE EFFECT ON BUTTONS
  // ==========================================================

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // ==========================================================
  //  15. MAGNETIC HOVER ON CTA BUTTONS
  // ==========================================================

  document.querySelectorAll('.btn-primary, .btn-lg').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s ease';
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });
  });

  // ==========================================================
  //  16. STAGGER REVEAL FOR GALLERY ITEMS ON LOAD
  // ==========================================================

  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.gallery-item');
        items.forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(40px) scale(0.9)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, i * 100);
        });
        galleryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const galleryGrid = document.querySelector('.gallery-grid');
  if (galleryGrid) galleryObserver.observe(galleryGrid);

  // ==========================================================
  //  17. NUMBER COUNTER ANIMATION
  // ==========================================================

  document.querySelectorAll('.price-amount, .product-price').forEach(el => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.style.opacity = '0';
          el.style.transform = 'scale(0.5)';
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
          }, 200);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  // ==========================================================
  //  15. PREMIUM EFFECTS (Cursor, Gold Dust, 3D Tilt)
  // ==========================================================
  
  // Check if device is mobile (touch device or small screen)
  const isMobile = window.matchMedia("(max-width: 768px)").matches || 
                   window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  if (!isMobile) {
    // --- 1. 3D Tilt Effect ---
    if (typeof VanillaTilt !== 'undefined') {
      VanillaTilt.init(document.querySelectorAll('.service-card, .course-card, .product-card'), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.15,
        scale: 1.02
      });
    }

    // --- 3. Gold Dust Canvas (Hero Section) ---
    const canvas = document.getElementById('goldDust');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let particles = [];
      
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 0.5;
          this.speedY = Math.random() * 0.5 + 0.1;
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
          this.y += this.speedY;
          this.x += this.speedX;
          if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
          }
        }
        draw() {
          ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }

      const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        requestAnimationFrame(animateParticles);
      };
      animateParticles();
    }
  }

  console.log('✨ Khushi Mehndi Artist ✨ website loaded with premium effects');
});
