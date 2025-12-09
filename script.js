// Loading Screen Animation
(function () {
  const loadingScreen = document.getElementById("loading-screen");
  const loadingCounter = document.getElementById("loading-counter");
  const loadingProgress = document.getElementById("loading-progress");

  if (!loadingScreen || !loadingCounter || !loadingProgress) return;

  let currentValue = 0;
  const targetValue = 100;
  const duration = 2000; // 2 seconds
  const startTime = performance.now();

  // Easing function for smooth animation dahlah
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    currentValue = Math.floor(easedProgress * targetValue);
    loadingCounter.textContent = currentValue + "%";
    loadingProgress.style.width = currentValue + "%";

    if (progress < 1) {
      requestAnimationFrame(animateCounter);
    } else {
      // Ensure we hit 100
      loadingCounter.textContent = targetValue + "%";
      loadingProgress.style.width = targetValue + "%";
      // Hide loading screen after a brief pause
      setTimeout(() => {
        loadingScreen.classList.add("hidden");
        // Remove from DOM after animation completes
        setTimeout(() => {
          loadingScreen.remove();
        }, 600);
      }, 300);
    }
  }

  // Start animation
  requestAnimationFrame(animateCounter);
})();

// Set default theme to light
(function () {
  const root = document.documentElement;
  root.setAttribute("data-theme", "light");
})();

// Entrance animation
(function () {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const run = () => {
    if (reduceMotion) {
      document.body.classList.add("animate-in");
      return;
    }
    const nodes = Array.from(document.querySelectorAll("[data-animate]"));
    const base = 90,
      step = 55;
    nodes.forEach((el, i) => {
      el.style.transitionDelay = base + i * step + "ms";
    });
    document.body.classList.remove("animate-in");
    void document.body.offsetHeight; // reflow
    document.body.classList.add("animate-in");
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) run();
  });
})();

// Education spine reveal
(function () {
  const edu = document.getElementById("education");
  if (!edu) return;
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) edu.classList.add("inview");
      });
    },
    { rootMargin: "0px 0px -20% 0px", threshold: 0.25 }
  );
  sectionObserver.observe(edu);
})();

// Project Modal
(function () {
  const modal = document.getElementById("project-modal");
  const modalOverlay = modal?.querySelector(".modal-overlay");
  const modalClose = modal?.querySelector(".modal-close");
  const projectCards = document.querySelectorAll(".row.project");

  if (!modal) return;

  // Function to open modal with project data
  function openModal(projectData) {
    // Populate modal content
    document.getElementById("modal-title").textContent = projectData.title;
    document.getElementById("modal-period").textContent = projectData.period;
    document.getElementById("modal-description").textContent =
      projectData.description;
    document.getElementById("modal-image").src = projectData.image;
    document.getElementById("modal-image").alt = projectData.title;

    // Populate tech chips
    const techContainer = document.getElementById("modal-tech");
    techContainer.innerHTML = "";
    projectData.tech.forEach((tech) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = tech;
      techContainer.appendChild(chip);
    });

    // Handle project link if exists
    const linkContainer = document.getElementById("modal-link-container");
    const linkBtn = document.getElementById("modal-link");
    if (projectData.link) {
      linkBtn.href = projectData.link;
      linkContainer.style.display = "block";
    } else {
      linkContainer.style.display = "none";
    }

    // Show modal
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  // Function to close modal
  function closeModal() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  // Add click event to each project card
  projectCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Prevent opening modal if clicking on external link
      if (e.target.closest("a.row-link")) {
        return;
      }

      const projectData = {
        title: card.dataset.projectTitle,
        period: card.dataset.projectPeriod,
        image: card.dataset.projectImage,
        description: card.dataset.projectDescription,
        tech: card.dataset.projectTech.split(","),
        link: card.dataset.projectLink || null,
      };

      openModal(projectData);
    });
  });

  // Close modal on overlay click
  modalOverlay?.addEventListener("click", closeModal);

  // Close modal on close button click
  modalClose?.addEventListener("click", closeModal);

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
})();
