(() => {
  document.querySelectorAll("[data-open-evidence]").forEach((button) => {
    button.addEventListener("click", () => document.getElementById(button.dataset.openEvidence).showModal());
  });
  document.querySelectorAll("[data-close-evidence]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  // An evidence modal owns navigation until it closes, including Escape natively.
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        document.querySelector(".evidence-dialog[open]") &&
        ["ArrowRight", "ArrowLeft", "PageDown", "PageUp", " ", "Home", "End"].includes(event.key)
      )
        event.stopImmediatePropagation();
    },
    true
  );
})();
