// --- TELEMETRY SERVICE (WITH BACKEND INTEGRATION) ---
const TelemetryService = {
  logEvent: (eventName, attributes = {}) => {
    // Log to backend API
    if (typeof portfolioApi !== "undefined") {
      portfolioApi.logEvent(eventName, attributes);
    }

    // Also log to console for debugging
    const payload = {
      eventName,
      attributes,
      timestamp: new Date().toISOString(),
    };
    // Reduced console noise for production
    // console.log(`[TELEMETRY] ${eventName}`, payload);
  },

  measurePerformance: () => {
    // Measure page load performance
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry) {
      TelemetryService.logEvent("page_performance_metrics", {
        load_time_ms: navEntry.loadEventEnd - navEntry.startTime,
        dom_content_loaded_ms:
          navEntry.domContentLoadedEventEnd - navEntry.startTime,
        user_agent: navigator.userAgent,
      });
    }
  },
};

// --- PORTFOLIO DATA LOADING ---
const PortfolioData = {
  projects: [],
  heroContent: null,
  aboutContent: null,

  async loadAll() {
    try {
      // Load projects
      if (typeof portfolioApi !== "undefined") {
        const projectsData = await portfolioApi.getProjects();
        // Ensure projects is always an array
        this.projects = Array.isArray(projectsData) ? projectsData : [];
        
        const heroData = await portfolioApi.getContent("hero");
        this.heroContent = heroData || {};
        
        const aboutData = await portfolioApi.getContent("about");
        this.aboutContent = aboutData || {};
      }
    } catch (error) {
      console.error("Error loading portfolio data:", error);
      // Fallback to empty array to prevent crashes
      this.projects = [];
      this.heroContent = {};
      this.aboutContent = {};
    }
  },

  getProjects() {
    return this.projects;
  },

  getHeroContent() {
    return this.heroContent || {};
  },

  getAboutContent() {
    return this.aboutContent || {};
  },
};

// --- RENDERING FUNCTIONS FOR DYNAMIC CONTENT ---
function renderProjects() {
  const container = document.getElementById('projects-container')
  if (!container) return

  const projects = PortfolioData.getProjects()

  // Clear existing content
  container.innerHTML = ''

  if (!projects || projects.length === 0) {
    // Show loading message if no projects yet
    container.innerHTML = `
      <div class="col-span-full text-center text-gray-500">
        <p>Layihələr yüklənir və ya əlavə olunmamışdır...</p>
      </div>
    `
    return
  }

  // Render projects from API
  projects.forEach((project) => {
    const projectCard = document.createElement('div')
    projectCard.className =
      'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300'
    projectCard.innerHTML = `
      <div class="h-48 w-full ${project.previewColor || 'bg-blue-500'} flex items-center justify-center relative group">
        <span class="text-white font-bold text-xl opacity-50 group-hover:opacity-100 transition-opacity">Önizləmə</span>
        <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title || 'Unnamed Project'}</h3>
        <p class="text-gray-600 mb-4 h-12">${project.description || ''}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          ${(project.technologies || [])
            .map(
              (tech) =>
                `<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">${tech}</span>`
            )
            .join('')}
        </div>
        <button onclick="trackProjectView('${project.title}')" class="w-full flex items-center justify-center space-x-2 text-blue-600 font-medium hover:bg-blue-50 py-2 rounded-lg transition">
          <span>Ətraflı Bax</span>
          <i data-lucide="external-link" class="w-4 h-4"></i>
        </button>
      </div>
    `
    container.appendChild(projectCard)
  })

  // Re-render Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons()
  }
}

function updateHeroSection() {
  const heroContent = PortfolioData.getHeroContent()
  if (!heroContent.heroTitle) return

  const titleEl = document.getElementById('hero-title')
  if (titleEl && heroContent.heroTitle) {
    // Update just the text content, preserve the span structure for blue color
    const parts = heroContent.heroTitle.split('Kamran')
    titleEl.innerHTML = `${parts[0]}<span class="text-blue-600">Kamran</span>${parts[1] || ''}`
  }

  const taglineEl = document.getElementById('hero-tagline')
  if (taglineEl) {
    taglineEl.textContent = heroContent.heroTagline || 'Frontend Mühəndisi, Google Cloud həvəskarı'
  }
}

function updateAboutSection() {
  const aboutContent = PortfolioData.getAboutContent()

  // Update about description
  const descriptionEl = document.getElementById('about-description')
  if (descriptionEl && aboutContent.aboutDescription) {
    descriptionEl.textContent = aboutContent.aboutDescription
  }

  // Update about image if provided
  const imageEl = document.getElementById('about-image')
  if (imageEl && aboutContent.aboutImage) {
    imageEl.src = aboutContent.aboutImage
  }

  // Update skills
  const skillsContainer = document.getElementById('skills-container')
  if (skillsContainer && aboutContent.skills && aboutContent.skills.length > 0) {
    skillsContainer.innerHTML = aboutContent.skills
      .map(
        (skill) => `
      <div>
        <h4 class="font-bold text-gray-900">${skill.category}</h4>
        <p class="text-gray-600 text-sm">${skill.items.join(', ')}</p>
      </div>
    `
      )
      .join('')
  }
}

// --- UI FUNCTIONS (Keep existing) ---

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  if (!menu) return;

  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
  } else {
    menu.classList.add("hidden");
  }
}

function openModal() {
  const modal = document.getElementById("contact-modal");
  if (!modal) return;
  
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  TelemetryService.logEvent("contact_button_clicked", {
    location: "contact_section",
  });
}

function closeModal() {
  const modal = document.getElementById("contact-modal");
  if (!modal) return;
  
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function trackProjectView(title) {
  TelemetryService.logEvent("project_viewed", { project_title: title });
  console.log("Navigating to project details...");
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById("form-name");
  const emailInput = document.getElementById("form-email");
  const messageInput = document.getElementById("form-message");

  if (!nameInput || !emailInput || !messageInput) return;

  const name = nameInput.value;
  const email = emailInput.value;
  const message = messageInput.value;

  TelemetryService.logEvent("contact_form_submitted", {
    user_email: email,
  });

  // Submit to backend
  if (typeof portfolioApi !== "undefined") {
    const result = await portfolioApi.submitMessage(name, email, message);
    if (result.success) {
      alert("Mesajınız göndərildi! Təşəkkürlər.");
    } else {
      alert("Xəta baş verdi: " + result.error);
    }
  } else {
    alert("Mesajınız göndərildi! Təşəkkürlər.");
  }

  event.target.reset();
  closeModal();
}

// --- INIT LOGIC ---
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Update year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Load portfolio data from backend
  await PortfolioData.loadAll();

  // Render dynamic content
  renderProjects();
  updateHeroSection();
  updateAboutSection();

  // Log page view
  TelemetryService.logEvent("page_view", {
    path: window.location.pathname,
    referrer: document.referrer,
  });

  // Log active users (mock)
  // Only log if necessary to avoid DB spam
  // const activeUsers = Math.floor(Math.random() * 50) + 10;
  // TelemetryService.logEvent("active_users_last_hour", {
  //   count: activeUsers,
  //   timestamp: new Date().toISOString(),
  // });

  // Measure performance after page load
  window.onload = () => {
    setTimeout(() => {
      TelemetryService.measurePerformance();
    }, 1000);
  };
});
