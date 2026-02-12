// script.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded"); // debug

  // ========= COUNTERS (for animated numbers) =========
  const counters = document.querySelectorAll("[data-counter]");

  if (!("IntersectionObserver" in window)) {
    counters.forEach((el) => runCounter(el));
  } else if (counters.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  // ========= TABLE / CHART TOGGLE (for statistics.html) =========
  const toggleButtons = document.querySelectorAll(".impact-toggle-btn");
  const panels = document.querySelectorAll("[data-impact-panel]");
  let chartAnimated = false;

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.impactView;
      console.log("switching to view:", view);

      // Active button styling
      toggleButtons.forEach((b) => b.classList.toggle("active", b === btn));

      // Show / hide panels using .hidden class
      panels.forEach((panel) => {
        const isTarget = panel.dataset.impactPanel === view;
        panel.classList.toggle("hidden", !isTarget);
      });

      // Animate chart bars the first time chart is opened
      if (view === "chart" && !chartAnimated) {
        animateImpactChart();
        chartAnimated = true;
      }
    });
  });
});

// ========= FUNCTIONS =========

// Counter animation
function runCounter(el) {
  const target = Number(el.dataset.target) || 0;
  const duration = Number(el.dataset.duration) || 1500;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";

  let start = null;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const value = Math.floor(progress * target);

    el.textContent = prefix + value.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}