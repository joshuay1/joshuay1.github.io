(() => {
  "use strict";
  const slides = [...document.querySelectorAll(".slide")];
  const forceOffline = new URLSearchParams(location.search).get("demos") === "offline";
  const entries = [...document.querySelectorAll(".project-embed-slide")].map((slide) => ({
    slide,
    live: slide.querySelector(".project-live"),
    backup: slide.querySelector(".project-backup"),
    frame: slide.querySelector("iframe"),
    status: slide.querySelector(".project-loading"),
    buttons: [...slide.querySelectorAll("[data-project-view]")],
    started: false,
    loaded: false,
    anchored: false,
    near: false,
    preferred: "live",
    timer: null,
    anchorTimer: null,
  }));
  const isOffline = () => forceOffline || navigator.onLine === false;
  const isReading = () => document.body.classList.contains("read-view");
  function reveal(entry) {
    entry.status.hidden = true;
    entry.frame.classList.add("project-loaded");
  }
  function anchor(entry) {
    if (!entry.loaded || entry.anchored || entry.anchorTimer || !entry.slide.dataset.projectAnchor || entry.slide.hidden || entry.live.hidden) return;
    // A preloaded SPA may render only after its hidden slide becomes visible.
    // Give that first render time to settle before native fragment navigation.
    // The parent only assigns the URL; it never reads or changes the remote DOM.
    entry.anchorTimer = setTimeout(() => {
      entry.anchorTimer = null;
      if (entry.anchored || entry.slide.hidden || entry.live.hidden || !entry.loaded) return;
      entry.anchored = true;
      entry.frame.src = entry.slide.dataset.projectUrl + entry.slide.dataset.projectAnchor;
      requestAnimationFrame(() => requestAnimationFrame(() => reveal(entry)));
    }, 750);
  }
  function load(entry) {
    if (entry.started || entry.live.hidden || isOffline()) return;
    entry.started = true;
    entry.frame.src = entry.slide.dataset.projectUrl;
    entry.timer = setTimeout(() => {
      if (!entry.loaded) entry.status.textContent = "Taking longer to load. You can use Offline view or open the full page.";
    }, 15000);
  }
  function setView(entry) {
    const live = !isOffline() && entry.preferred === "live";
    entry.live.hidden = !live;
    entry.backup.hidden = live;
    entry.slide.classList.toggle("show-project-live", live);
    entry.buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String((button.dataset.projectView === "live") === live));
      button.disabled = isOffline() && button.dataset.projectView === "live";
    });
  }
  function sync() {
    const current = slides.findIndex((slide) => !slide.hidden);
    entries.forEach((entry) => {
      setView(entry);
      if (isReading() ? entry.near : entry.slide === slides[current] || entry.slide === slides[current + 1]) load(entry);
      anchor(entry);
    });
  }
  entries.forEach((entry) => {
    entry.buttons.forEach((button) =>
      button.addEventListener("click", () => {
        entry.preferred = button.dataset.projectView;
        setView(entry);
        load(entry);
        anchor(entry);
      }),
    );
    entry.frame.addEventListener("load", () => {
      if (!entry.started) return;
      entry.loaded = true;
      clearTimeout(entry.timer);
      if (!entry.slide.dataset.projectAnchor || entry.anchored) reveal(entry);
      anchor(entry);
    });
    entry.frame.addEventListener("error", () => {
      entry.status.hidden = false;
      entry.status.textContent = "This page did not load. Use Offline view or open the full page.";
    });
  });
  const observer = new MutationObserver(sync);
  slides.forEach((slide) => observer.observe(slide, { attributes: true, attributeFilter: ["hidden"] }));
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  const nearby = new IntersectionObserver(
    (changes) => {
      changes.forEach((change) => {
        const entry = entries.find((item) => item.slide === change.target);
        entry.near = change.isIntersecting;
      });
      if (isReading()) sync();
    },
    { rootMargin: "800px 0px" },
  );
  entries.forEach((entry) => nearby.observe(entry.slide));
  window.addEventListener("offline", () => {
    entries.forEach((entry) => {
      clearTimeout(entry.timer);
      clearTimeout(entry.anchorTimer);
      entry.anchorTimer = null;
      entry.started = false;
      entry.loaded = false;
      entry.anchored = false;
      entry.frame.removeAttribute("src");
      entry.frame.classList.remove("project-loaded");
      entry.status.hidden = false;
      entry.status.textContent = "Loading project page…";
    });
    sync();
  });
  window.addEventListener("online", sync);
  sync();
})();
