/* =========================================================
   case-study.js — interactions for the case study pages
   (loaded after main.js, only on the case study pages)
   ========================================================= */

// Everything is wrapped in a function so the variables here
// never clash with the ones in main.js
(() => {
  const siteHeader = document.getElementById("site-header");
  const prefersLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ---------- 1. The list of case studies that are online ---------- */

  // To publish a new case study, add it here: it will automatically
  // appear in the "Read more of my case studies" section of every case study.
  // Paths start from the root of the website.
  const CASE_STUDIES = [
    {
      id: "murmuration-website",
      title: "Murmuration - Website redesign",
      description: "A full UX redesign of a Greentech company’s website, focused on clarity, structure and storytelling.",
      image: "images/murmuration-website.jpg",
      url: "projects/murmuration-website.html",
    },
    {
      id: "altered-ux-research",
      title: "Altered - UX Research",
      description: "A User Research project exploring player expectations, motivations, pain points and use of a digital and physical card game platform.",
      image: "images/altered-ux-research.jpg",
      url: "projects/altered-ux-research.html",
    },
    {
      id: "murmuration-identity",
      title: "Murmuration - Visual Identity",
      description: "Designing a cohesive and modern brand identity for a Greentech company, blending environmental values with strong technological presence.",
      image: "images/murmuration-identity.jpg",
      url: "projects/murmuration-identity.html",
    },
  ];


  /* ---------- 2. "Read more" cards (every case study except the current one) ---------- */

  const moreList = document.getElementById("more-case-studies");

  if (moreList) {
    const root = moreList.dataset.root || "";   // "../" when the page is in /projects
    const others = CASE_STUDIES.filter((study) => study.id !== moreList.dataset.current);

    others.forEach((study) => {
      const card = document.createElement("article");
      card.className = "slider__slide more-card";
      card.innerHTML = `
        <a href="${root}${study.url}" class="more-card__link">
          <div class="more-card__image"><img src="${root}${study.image}" alt="" loading="lazy"></div>
          <h3 class="more-card__title">${study.title}</h3>
          <p class="more-card__text">${study.description}</p>
        </a>`;
      moreList.append(card);
    });

    // Nothing else to read yet: hide the whole section
    if (!others.length) moreList.closest("section").hidden = true;
  }


  /* ---------- 3. Sliders ---------- */

  // How many slides are visible at once is set in CSS with --per-view.
  // If all the slides fit, the arrows and dots are hidden.
  function initSlider(slider) {
    const track = slider.querySelector(".slider__track");
    const slides = Array.from(track.children);
    const prev = slider.querySelector(".slider__arrow--prev");
    const next = slider.querySelector(".slider__arrow--next");
    const dotsBox = slider.querySelector(".slider__dots");
    let pages = 1;
    let dots = [];

    const perView = () => parseInt(getComputedStyle(slider).getPropertyValue("--per-view"), 10) || 1;

    // Distance between the start of two slides (slide width + gap)
    const stepWidth = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);

    function goTo(index) {
      const target = Math.max(0, Math.min(pages - 1, index));
      track.scrollTo({ left: target * stepWidth(), behavior: prefersLessMotion ? "auto" : "smooth" });
    }

    function currentIndex() {
      return Math.min(pages - 1, Math.round(track.scrollLeft / stepWidth()));
    }

    // Greys out the arrows at the ends and highlights the right dot
    function update() {
      const current = currentIndex();
      prev.disabled = current === 0;
      next.disabled = current === pages - 1;
      dots.forEach((dot, i) => dot.setAttribute("aria-current", i === current ? "true" : "false"));
    }

    // (Re)builds the dots, also when the screen size changes --per-view
    function build() {
      pages = Math.max(1, slides.length - perView() + 1);
      slider.classList.toggle("is-static", pages === 1);

      dotsBox.innerHTML = "";
      dots = [];
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider__dot";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsBox.append(dot);
        dots.push(dot);
      }
      update();
    }

    prev.addEventListener("click", () => goTo(currentIndex() - 1));
    next.addEventListener("click", () => goTo(currentIndex() + 1));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", build);
    build();
  }

  document.querySelectorAll("[data-slider]").forEach(initSlider);


  /* ---------- 4. Images in full screen (lightbox) ---------- */

  const zoomables = document.querySelectorAll("[data-lightbox]");

  if (zoomables.length) {
    // <dialog> handles the Escape key and keeps the keyboard focus inside
    const lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";
    lightbox.innerHTML = `
      <button type="button" class="lightbox__close" aria-label="Close full screen image">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
      <img class="lightbox__image" alt="">`;
    document.body.append(lightbox);

    const lightboxImage = lightbox.querySelector(".lightbox__image");

    zoomables.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const image = trigger.querySelector("img");
        // data-lightbox="path/to/bigger.jpg" can point to a higher resolution file
        lightboxImage.src = trigger.dataset.lightbox || image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightbox.showModal();
      });
    });

    // A click anywhere except on the image closes it
    lightbox.addEventListener("click", (event) => {
      if (event.target !== lightboxImage) lightbox.close();
    });
  }


  /* ---------- 5. Figma prototypes in full screen ---------- */

  // Without the Fullscreen API (e.g. iPhone), the button stays a normal link
  // that opens the prototype in a new tab.
  document.querySelectorAll(".prototype").forEach((box) => {
    const button = box.querySelector(".prototype__fullscreen");
    const label = box.querySelector(".prototype__fullscreen-label");
    const enter = box.requestFullscreen || box.webkitRequestFullscreen;
    if (!button || !enter) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        enter.call(box);
      }
    });

    const onChange = () => {
      const isFull = (document.fullscreenElement || document.webkitFullscreenElement) === box;
      label.textContent = isFull ? "Exit full screen" : "Full screen";
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
  });


  /* ---------- 6. Mockups with zoom + full screen (still scrollable) ---------- */

  const ZOOM_LEVELS = [1, 1.5, 2, 3];   // 1 = the page fits the width of the screen

  document.querySelectorAll("[data-viewer]").forEach((viewer) => {
    const screen = viewer.querySelector(".browser__screen");
    const image = screen.querySelector("img");
    const zoomOut = viewer.querySelector('[data-zoom="out"]');
    const zoomIn = viewer.querySelector('[data-zoom="in"]');
    const zoomLabel = viewer.querySelector(".browser__zoom");
    const fullscreenButton = viewer.querySelector("[data-fullscreen]");
    const enterFullscreen = viewer.requestFullscreen || viewer.webkitRequestFullscreen;
    let level = 0;

    function setZoom(newLevel) {
      // Keeps the same spot of the page in the middle of the screen while zooming
      // (|| 1 avoids dividing by 0 while the image hasn't loaded yet)
      const centerX = (screen.scrollLeft + screen.clientWidth / 2) / (screen.scrollWidth || 1);
      const centerY = (screen.scrollTop + screen.clientHeight / 2) / (screen.scrollHeight || 1);

      level = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, newLevel));
      image.style.width = `${ZOOM_LEVELS[level] * 100}%`;
      viewer.classList.toggle("is-zoomed", level > 0);

      screen.scrollLeft = centerX * screen.scrollWidth - screen.clientWidth / 2;
      screen.scrollTop = centerY * screen.scrollHeight - screen.clientHeight / 2;

      zoomLabel.textContent = `${ZOOM_LEVELS[level] * 100}%`;
      zoomOut.disabled = level === 0;
      zoomIn.disabled = level === ZOOM_LEVELS.length - 1;
    }

    zoomOut.addEventListener("click", () => setZoom(level - 1));
    zoomIn.addEventListener("click", () => setZoom(level + 1));
    setZoom(0);

    // Zoomed in: drag the page with the mouse to move around
    // (touch screens already scroll with the finger)
    let drag = null;
    screen.addEventListener("pointerdown", (event) => {
      if (level === 0 || event.pointerType !== "mouse" || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, left: screen.scrollLeft, top: screen.scrollTop };
      screen.classList.add("is-dragging");
      screen.setPointerCapture(event.pointerId);
      event.preventDefault();   // no image "ghost" drag
    });
    screen.addEventListener("pointermove", (event) => {
      if (!drag) return;
      screen.scrollLeft = drag.left - (event.clientX - drag.x);
      screen.scrollTop = drag.top - (event.clientY - drag.y);
    });
    const endDrag = () => {
      drag = null;
      screen.classList.remove("is-dragging");
    };
    screen.addEventListener("pointerup", endDrag);
    screen.addEventListener("pointercancel", endDrag);

    // Full screen: the real Fullscreen API when the browser has it,
    // otherwise (e.g. iPhone) the mockup simply covers the whole window
    const isFull = () =>
      (document.fullscreenElement || document.webkitFullscreenElement) === viewer ||
      viewer.classList.contains("is-expanded");

    function exitFull() {
      if (viewer.classList.contains("is-expanded")) {
        viewer.classList.remove("is-expanded");
        onFullChange();
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      }
    }

    function onFullChange() {
      const full = isFull();
      fullscreenButton.setAttribute("aria-label", full ? "Exit full screen" : "Full screen");
      fullscreenButton.innerHTML = full
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
      if (full) screen.focus({ preventScroll: true });   // arrow keys scroll the mockup right away
    }

    fullscreenButton.addEventListener("click", () => {
      if (isFull()) {
        exitFull();
      } else if (enterFullscreen) {
        enterFullscreen.call(viewer);
      } else {
        viewer.classList.add("is-expanded");
        onFullChange();
      }
    });

    document.addEventListener("fullscreenchange", onFullChange);
    document.addEventListener("webkitfullscreenchange", onFullChange);
    // Escape closes the window-sized version (the real full screen handles it by itself)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && viewer.classList.contains("is-expanded")) exitFull();
    });
  });


  /* ---------- 7. Sticky stepper that follows the reading ---------- */

  const stepper = document.querySelector(".stepper");

  if (stepper) {
    const items = Array.from(stepper.querySelectorAll(".stepper__item"));
    const links = items.map((item) => item.querySelector(".stepper__link"));
    const sections = links.map((link) => document.querySelector(link.hash));
    let ticking = false;
    let fullHeight = 0;      // stepper height in the page
    let compactHeight = 0;   // smaller stepper height once stuck under the nav

    // Measures both sizes of the stepper (again when the screen size changes)
    function measureStepper() {
      const wasStuck = stepper.classList.contains("is-stuck");
      stepper.style.marginBottom = "";
      stepper.classList.add("is-stuck");
      compactHeight = stepper.offsetHeight;
      stepper.classList.remove("is-stuck");
      fullHeight = stepper.offsetHeight;
      stepper.classList.toggle("is-stuck", wasStuck);

      // Used in CSS so the sections stop right under the (compact) stepper when clicked
      document.documentElement.style.setProperty("--stepper-height", `${compactHeight}px`);
    }

    function updateStepper() {
      const headerHeight = siteHeader.offsetHeight;
      const rect = stepper.getBoundingClientRect();

      // Stuck under the nav: compact stepper, one shadow for both
      const isStuck = rect.top <= headerHeight + 1 && rect.bottom > headerHeight;
      stepper.classList.toggle("is-stuck", isStuck);
      siteHeader.classList.toggle("is-merged", isStuck);

      // An invisible margin makes up for the smaller size,
      // so the page content doesn't jump when the stepper shrinks
      stepper.style.marginBottom = isStuck ? `${fullHeight - compactHeight}px` : "";
      const stepperHeight = isStuck ? compactHeight : fullHeight;

      // The current step is the last section whose top passed a line
      // a third of the way down the visible area
      const line = headerHeight + stepperHeight + (window.innerHeight - headerHeight - stepperHeight) / 3;
      let active = -1;
      sections.forEach((section, i) => {
        if (section && section.getBoundingClientRect().top <= line) active = i;
      });

      items.forEach((item, i) => {
        item.classList.toggle("is-active", i === active);
        item.classList.toggle("is-done", i < active);
        if (i === active) links[i].setAttribute("aria-current", "step");
        else links[i].removeAttribute("aria-current");
      });

      ticking = false;
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateStepper);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measureStepper();
      onScroll();
    });
    // Fonts change the label sizes once loaded
    document.fonts.ready.then(() => {
      measureStepper();
      updateStepper();
    });
    measureStepper();
    updateStepper();
  }
})();
