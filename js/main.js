/* =========================================================
   main.js — small interactions for the portfolio
   ========================================================= */

/* ---------- 1. Shadow under the nav when the page scrolls ---------- */

// Find the header in the page
const header = document.getElementById("site-header");

// Every time the user scrolls, check how far down they are
window.addEventListener("scroll", () => {
  // If scrolled more than 10px, add the class "is-scrolled" (styled in CSS)
  // Otherwise, remove it
  header.classList.toggle("is-scrolled", window.scrollY > 10);
});


/* ---------- 2. Mobile menu (burger button) ---------- */

const toggle = document.getElementById("nav-toggle");
const menu = document.getElementById("nav-menu");

// When the burger is clicked, open or close the menu
toggle.addEventListener("click", () => {
  // Is the menu currently open? (true / false)
  const isOpen = toggle.getAttribute("aria-expanded") === "true";

  // Switch to the opposite state
  toggle.setAttribute("aria-expanded", !isOpen);
  menu.classList.toggle("is-open", !isOpen);
});

// Close the menu when a link inside it is clicked
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  });
});


/* ---------- 3. Parallax on the pattern backgrounds ---------- */

// Every section with the lilac pattern (footer + banners)
const patterns = document.querySelectorAll(".site-footer, .banner");

// How much slower the pattern moves than the page (0 = no effect)
const SPEED = 0.15;
// Must match the extra height of the pattern layer in CSS (inset: -100px 0)
const MAX_SHIFT = 100;

// Skip the effect for users who prefer less motion
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let ticking = false;

function updateParallax() {
  const viewportCenter = window.innerHeight / 2;

  patterns.forEach((section) => {
    const rect = section.getBoundingClientRect();

    // Only move the pattern while the section is on screen
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    // Distance between the section's center and the screen's center
    const distance = rect.top + rect.height / 2 - viewportCenter;
    const shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, -distance * SPEED));

    section.style.setProperty("--parallax-y", `${shift}px`);
  });

  ticking = false;
}

if (!reduceMotion && patterns.length) {
  // requestAnimationFrame keeps it smooth: at most one update per frame
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateParallax();
}
