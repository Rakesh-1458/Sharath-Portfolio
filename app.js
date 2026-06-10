/*
  Sharath Chandra Pabba - Portfolio JS Logic
  Interactivity: Mouse Parallax, Project Hover Cards, Scroll Reveals, Contact Modal, Liquid Blur
*/

// Instant theme application to prevent flash of unstyled content
(function() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // --- PAGE ENTRY TRANSITION TRIGGER ---
  setTimeout(() => {
    document.body.classList.remove('page-loading');
    document.body.classList.add('page-ready');
  }, 50);

  // --- THEME SWITCHER TOGGLE ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector('i');
    
    // Function to update the icon based on current class
    function updateThemeIcon() {
      if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fa-solid fa-sun';
      } else {
        icon.className = 'fa-solid fa-moon';
      }
    }
    
    // Initial icon state on load
    updateThemeIcon();
    
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      
      // Save theme to localStorage
      if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('portfolio-theme', 'dark');
      } else {
        localStorage.setItem('portfolio-theme', 'light');
      }
      
      updateThemeIcon();
    });
  }

  // --- LOCAL LINK INTERCEPTION FOR EXIT TRANSITION ---
  const localLinks = document.querySelectorAll('a');
  localLinks.forEach(link => {
    const href = link.getAttribute('href');
    const target = link.getAttribute('target');
    if (
      href && 
      !href.startsWith('#') && 
      !href.startsWith('mailto:') && 
      !href.startsWith('tel:') && 
      target !== '_blank' &&
      !link.hasAttribute('download')
    ) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('page-ready');
        document.body.classList.add('page-exit');
        setTimeout(() => {
          window.location.href = href;
        }, 550); // Matches the body page-exit CSS transition (0.6s)
      });
    }
  });

  // Helper: check if element is in viewport
  function isInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Linear interpolation for smooth mouse-follow
  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  // --- STICKY NAVBAR ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // --- HERO PARALLAX ON SCROLL & MOUSE MOVE ---
  const heroSection = document.getElementById('hero');
  const parallaxBg = document.getElementById('hero-bg-text');
  const profilePic = document.getElementById('hero-profile-pic');

  if (heroSection && parallaxBg && profilePic) {
    // Parallax on Scroll (shifts text diagonally)
    window.addEventListener('scroll', () => {
      if (isInViewport(heroSection)) {
        const scrollPos = window.scrollY;
        // Move text left and slightly up as we scroll down
        parallaxBg.style.transform = `translate3d(calc(-50% - ${scrollPos * 0.4}px), -${scrollPos * 0.15}px, 0)`;
      }
    });

    // Parallax on Mouse Move (creates flat depth)
    heroSection.addEventListener('mousemove', (e) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Normalize mouse coords around center: [-0.5, 0.5]
      const mouseX = (e.clientX / width) - 0.5;
      const mouseY = (e.clientY / height) - 0.5;

      // Shift text slightly in the opposite direction
      const textMoveX = -mouseX * 40;
      const textMoveY = -mouseY * 15;
      const scrollPos = window.scrollY;
      parallaxBg.style.transform = `translate3d(calc(-50% + ${textMoveX - (scrollPos * 0.4)}px), ${textMoveY - (scrollPos * 0.15)}px, 0)`;
    });

    // Reset positions when mouse leaves
    heroSection.addEventListener('mouseleave', () => {
      const scrollPos = window.scrollY;
      parallaxBg.style.transform = `translate3d(calc(-50% - ${scrollPos * 0.4}px), -${scrollPos * 0.15}px, 0)`;
    });
  }

  // --- ABOUT SECTION GIANT ARROW ROTATE ---
  const aboutSection = document.getElementById('about');
  const aboutArrow = document.getElementById('about-arrow');
  
  if (aboutSection && aboutArrow) {
    window.addEventListener('scroll', () => {
      if (isInViewport(aboutSection)) {
        const bounding = aboutSection.getBoundingClientRect();
        const relativeScroll = bounding.top / window.innerHeight;
        // Rotate arrow from index angle based on scroll entry
        const rotateDeg = 45 - (relativeScroll * 90);
        aboutArrow.style.transform = `rotate(${rotateDeg}deg)`;
      }
    });
  }

  // --- INTERSECTION OBSERVER FOR SCROLL REVEALS ---
  const revealElements = [
    document.querySelector('.hero-left'),
    document.querySelector('.about-content'),
    document.querySelector('.about-visual'),
    document.querySelector('.work-header'),
    document.querySelector('.projects-list'),
    document.querySelector('.footer-top')
  ].filter(el => el !== null);

  if (revealElements.length > 0) {
    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- PROJECT HOVER CARD PREVIEWS ---
  function initHoverCardPreviews() {
    const hoverPreview = document.getElementById('hover-card-preview');
    const projectRows = document.querySelectorAll('.project-row');
    const previewCards = document.querySelectorAll('.preview-card');

    if (hoverPreview && projectRows.length > 0) {
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let isHovering = false;

      function animateHoverCard() {
        if (isHovering) {
          currentX = lerp(currentX, targetX, 0.1);
          currentY = lerp(currentY, targetY, 0.1);
          hoverPreview.style.left = `${currentX}px`;
          hoverPreview.style.top = `${currentY}px`;
          requestAnimationFrame(animateHoverCard);
        }
      }

      projectRows.forEach(row => {
        row.addEventListener('mouseenter', (e) => {
          const projectRef = row.getAttribute('data-project');
          
          let hasPreview = false;
          previewCards.forEach(card => {
            if (card.getAttribute('data-project-ref') === projectRef) {
              card.classList.add('active');
              hasPreview = true;
            } else {
              card.classList.remove('active');
            }
          });

          // Fallback dynamic card preview for any newly uploaded projects
          if (!hasPreview && projectRef) {
            const title = row.querySelector('.proj-title')?.textContent || 'PROJECT';
            const tech = row.querySelector('.proj-tech')?.textContent || '';
            const dynamicCard = document.createElement('div');
            dynamicCard.className = 'preview-card active';
            dynamicCard.setAttribute('data-project-ref', projectRef);
            dynamicCard.innerHTML = `
              <svg class="preview-svg" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad-${projectRef}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#0f172a" />
                  </linearGradient>
                </defs>
                <rect width="300" height="180" rx="12" fill="url(#grad-${projectRef})" />
                <circle cx="150" cy="90" r="45" fill="none" stroke="rgba(37, 99, 235, 0.2)" stroke-width="1" />
                <circle cx="150" cy="90" r="25" fill="none" stroke="rgba(37, 99, 235, 0.4)" stroke-width="1.5" />
                <path d="M 120 90 L 180 90 M 150 60 L 150 120" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
                <text x="20" y="30" fill="#a0aec0" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600" style="text-transform: uppercase;">${title}</text>
                <text x="20" y="155" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" style="text-transform: uppercase;">${tech}</text>
              </svg>
            `;
            hoverPreview.appendChild(dynamicCard);
          }

          targetX = e.clientX;
          targetY = e.clientY;
          if (!isHovering) {
            currentX = targetX;
            currentY = targetY;
            hoverPreview.style.left = `${currentX}px`;
            hoverPreview.style.top = `${currentY}px`;
            hoverPreview.classList.add('active');
            isHovering = true;
            animateHoverCard();
          }
        });

        row.addEventListener('mousemove', (e) => {
          targetX = e.clientX + 20;
          targetY = e.clientY + 20;
        });

        row.addEventListener('mouseleave', () => {
          hoverPreview.classList.remove('active');
          isHovering = false;
          const currentPreviewCards = document.querySelectorAll('.preview-card');
          currentPreviewCards.forEach(card => card.classList.remove('active'));
        });
      });
    }
  }

  // --- DYNAMIC PROJECTS LOADER ---
  const defaultProjects = [
    {
      num: "01",
      title: "Autonomous Rover",
      tech: "Arduino / Sensor Fusion / Obstacle Avoidance",
      link: "projects/autonomous-rover.html",
      projectRef: "rover"
    },
    {
      num: "02",
      title: "Go-Kart Design",
      tech: "SolidWorks / ANSYS / Chassis Optimization",
      link: "projects/go-kart.html",
      projectRef: "gokart"
    },
    {
      num: "03",
      title: "NIDAR Scout & Cargo",
      tech: "Composites / UAV Systems / FPV Delivery",
      link: "projects/nidar-drone.html",
      projectRef: "drone"
    },
    {
      num: "04",
      title: "Stair Climbing Robot",
      tech: "Mechanism Design / Robotics / Bluetooth control",
      link: "projects/stair-climber.html",
      projectRef: "stair"
    }
  ];

  const projectsContainer = document.getElementById('projects-container');
  
  function renderProjects(projects) {
    if (!projectsContainer) return;
    
    // Clear out the loading spinner
    projectsContainer.innerHTML = '';
    
    projects.forEach((proj, idx) => {
      const row = document.createElement('a');
      row.href = proj.link;
      row.className = 'project-row';
      row.setAttribute('data-project', proj.projectRef);
      row.id = `proj-row-${idx + 1}`;
      
      row.innerHTML = `
        <div class="proj-left">
          <span class="proj-num">${proj.num}</span>
          <h3 class="proj-title">${proj.title}</h3>
        </div>
        <div class="proj-right">
          <span class="proj-tech">${proj.tech}</span>
        </div>
      `;
      
      projectsContainer.appendChild(row);
    });

    // Re-bind hover card events to new DOM nodes
    initHoverCardPreviews();
  }

  if (projectsContainer) {
    fetch('https://firestore.googleapis.com/v1/projects/sharath-b8b1d/databases/(default)/documents/projects')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        return response.json();
      })
      .then(data => {
        if (data.documents && data.documents.length > 0) {
          // Map and sort Firestore structures by 'num' field
          const projects = data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
              num: fields.num?.stringValue || "01",
              title: fields.title?.stringValue || "Untitled Project",
              tech: fields.tech?.stringValue || "",
              link: fields.link?.stringValue || "#",
              projectRef: fields.projectRef?.stringValue || ""
            };
          }).sort((a, b) => a.num.localeCompare(b.num));
          
          renderProjects(projects);
        } else {
          console.warn('Projects collection is empty. Falling back to defaults.');
          renderProjects(defaultProjects);
        }
      })
      .catch(error => {
        console.error('Error fetching dynamic projects, falling back to defaults:', error);
        renderProjects(defaultProjects);
      });
  }

  // --- CONTACT MODAL ---
  const contactModal = document.getElementById('contact-modal');
  const openModalBtns = [
    document.getElementById('message-modal-btn'),
    document.getElementById('circular-cta-btn'),
    document.getElementById('nav-hire-btn')
  ].filter(btn => btn !== null);
  const closeModalBtn = document.getElementById('modal-close-btn');
  const contactForm = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success-msg');

  if (contactModal && closeModalBtn && contactForm && successMsg) {
    // Open modal
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close modal
    function closeModal() {
      contactModal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        contactForm.style.display = 'flex';
        successMsg.style.display = 'none';
        contactForm.reset();
      }, 400);
    }

    closeModalBtn.addEventListener('click', closeModal);
    
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contactModal.classList.contains('active')) {
        closeModal();
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submit-form-btn');
      const submitText = submitBtn ? submitBtn.querySelector('span') : null;
      const submitIcon = submitBtn ? submitBtn.querySelector('i') : null;
      
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const message = document.getElementById('form-message').value;
      
      // Set loading state on button
      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.textContent = 'Sending...';
      if (submitIcon) {
        submitIcon.className = 'fa-solid fa-spinner fa-spin';
      }
      
      // Prepare Firestore REST API payload format
      const firestorePayload = {
        fields: {
          name: { stringValue: name },
          email: { stringValue: email },
          message: { stringValue: message },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      };

      console.log(`Submitting contact request directly to Firestore:`, firestorePayload);

      fetch('https://firestore.googleapis.com/v1/projects/sharath-b8b1d/databases/(default)/documents/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(firestorePayload)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { 
            throw new Error(err.error?.message || 'Firestore API error');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Contact message saved directly to Firestore:', data);
        contactForm.style.display = 'none';
        successMsg.style.display = 'flex';
        
        setTimeout(() => {
          closeModal();
        }, 3000);
      })
      .catch(error => {
        console.error('Error submitting contact form:', error);
        alert(`Failed to send message: ${error.message}`);
        
        // Reset button state
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Send Message';
        if (submitIcon) {
          submitIcon.className = 'fa-solid fa-paper-plane';
        }
      });
    });
  }

  // --- LIQUID BLUR INTERACTIVE PARALLAX ---
  const blurContainer = document.querySelector('.liquid-blur-container');
  if (blurContainer) {
    // Inject Tech Grid SVG dynamically
    const gridSvgHtml = `
      <svg id="diagonal-grid-svg" class="diagonal-grid-svg" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <defs>
          <pattern id="diag-pattern" width="160" height="160" patternUnits="userSpaceOnUse">
            <!-- Grid Lines -->
            <line x1="0" y1="0" x2="0" y2="160" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.75" />
            <line x1="0" y1="0" x2="160" y2="0" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.75" />
            
            <!-- Grid Dots at Intersections -->
            <circle cx="0" cy="0" r="1.5" fill="rgba(255, 255, 255, 0.1)" />
            
            <!-- Element 1: Minimalist Gear (Center: 80, 80) -->
            <g transform="translate(80, 80)">
              <circle cx="0" cy="0" r="10" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.75" />
              <circle cx="0" cy="0" r="3.5" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.75" />
              <!-- Teeth -->
              <line x1="0" y1="-12" x2="0" y2="-10" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
              <line x1="0" y1="10" x2="0" y2="12" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
              <line x1="-12" y1="0" x2="-10" y2="0" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
              <line x1="10" y1="0" x2="12" y2="0" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
              <!-- Diagonals -->
              <line x1="-8" y1="-8" x2="-6" y2="-6" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
              <line x1="6" y1="6" x2="8" y2="8" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
              <line x1="6" y1="-8" x2="4" y2="-6" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
              <line x1="-4" y1="6" x2="-6" y2="8" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.25" />
            </g>

            <!-- Element 2: Minimalist Drone (Top-Left: 40, 40) -->
            <g transform="translate(40, 40)">
              <circle cx="0" cy="0" r="2.5" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.75" />
              <!-- Diagonal Arms -->
              <line x1="-9" y1="-9" x2="9" y2="9" stroke="rgba(255, 255, 255, 0.03)" stroke-width="0.75" />
              <line x1="-9" y1="9" x2="9" y2="-9" stroke="rgba(255, 255, 255, 0.03)" stroke-width="0.75" />
              <!-- Rotor Circles -->
              <circle cx="-9" cy="-9" r="2" fill="none" stroke="rgba(37, 99, 235, 0.1)" stroke-width="0.75" />
              <circle cx="9" cy="9" r="2" fill="none" stroke="rgba(37, 99, 235, 0.1)" stroke-width="0.75" />
              <circle cx="-9" cy="9" r="2" fill="none" stroke="rgba(37, 99, 235, 0.1)" stroke-width="0.75" />
              <circle cx="9" cy="-9" r="2" fill="none" stroke="rgba(37, 99, 235, 0.1)" stroke-width="0.75" />
              <!-- Rotor blades -->
              <line x1="-12" y1="-9" x2="-6" y2="-9" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.5" />
              <line x1="6" y1="9" x2="12" y2="9" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.5" />
              <line x1="-12" y1="9" x2="-6" y2="9" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.5" />
              <line x1="6" y1="-9" x2="12" y2="-9" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.5" />
            </g>

            <!-- Element 3: Technical Crosshair (Bottom-Right: 120, 120) -->
            <g transform="translate(120, 120)">
              <line x1="0" y1="-8" x2="0" y2="8" stroke="rgba(255, 255, 255, 0.03)" stroke-width="0.75" />
              <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(255, 255, 255, 0.03)" stroke-width="0.75" />
              <circle cx="0" cy="0" r="4" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="0.75" stroke-dasharray="1.5 1.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag-pattern)" />
      </svg>
    `;
    const gridWrapper = document.createElement('div');
    gridWrapper.id = 'diagonal-grid-wrapper';
    gridWrapper.className = 'diagonal-grid-wrapper';
    gridWrapper.innerHTML = gridSvgHtml;
    blurContainer.insertBefore(gridWrapper, blurContainer.firstChild);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    let targetScrollX = 0;
    let targetScrollY = 0;
    let currentScrollX = 0;
    let currentScrollY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      // Target coordinates for scroll-based diagonal drift
      targetScrollX = scrollPos * -0.22;
      targetScrollY = scrollPos * -0.18;
    });

    function animateLiquidBlur() {
      currentX = lerp(currentX, mouseX, 0.05);
      currentY = lerp(currentY, mouseY, 0.05);

      currentScrollX = lerp(currentScrollX, targetScrollX, 0.08);
      currentScrollY = lerp(currentScrollY, targetScrollY, 0.08);

      // Translate the background blobs (subtle scroll offset + mouse follow)
      blurContainer.style.transform = `translate3d(${currentX * 60 + currentScrollX * 0.3}px, ${currentY * 60 + currentScrollY * 0.3}px, 0)`;
      
      // Translate the diagonal grid wrapper (strong diagonal slide scroll offset)
      gridWrapper.style.transform = `translate3d(${currentScrollX}px, ${currentScrollY}px, 0)`;

      requestAnimationFrame(animateLiquidBlur);
    }
    animateLiquidBlur();
  }

  // --- SITEMAP MODAL ---
  const sitemapModal = document.getElementById('sitemap-modal');
  const openSitemapBtn = document.getElementById('sitemap-modal-btn');
  const closeSitemapBtn = document.getElementById('sitemap-close-btn');

  if (sitemapModal && openSitemapBtn && closeSitemapBtn) {
    // Open sitemap modal
    openSitemapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sitemapModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Close sitemap modal
    function closeSitemap() {
      sitemapModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeSitemapBtn.addEventListener('click', closeSitemap);
    
    sitemapModal.addEventListener('click', (e) => {
      if (e.target === sitemapModal) {
        closeSitemap();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sitemapModal.classList.contains('active')) {
        closeSitemap();
      }
    });

    // Close modal when a sitemap node link is clicked (anchor links)
    const sitemapLinks = sitemapModal.querySelectorAll('.sitemap-node');
    sitemapLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.includes('#')) {
          closeSitemap();
        }
      });
    });
  }

  // --- SITEMAP NODE 3D CARD TILT ---
  const sitemapNodes = document.querySelectorAll('.sitemap-node');
  sitemapNodes.forEach(node => {
    node.addEventListener('mousemove', (e) => {
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      const rotateX = -((y / height) - 0.5) * 15;
      const rotateY = ((x / width) - 0.5) * 15;
      
      node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    node.addEventListener('mouseleave', () => {
      node.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    });
  });
});
