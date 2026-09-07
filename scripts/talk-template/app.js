(() => {
  const slides = [...document.querySelectorAll(".slide")],
    params = new URLSearchParams(location.search);
  const reading = params.get("view") === "read" || (!params.has("view") && innerWidth <= 900);
  let index = Math.max(
    0,
    slides.findIndex((s) => s.id === location.hash.slice(1))
  );
  document.body.classList.toggle("read-view", reading);
  function fit() {
    document.documentElement.style.setProperty("--scale", Math.min(innerWidth / 1600, (innerHeight - 64) / 900));
  }
  function show(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, n) => (s.hidden = !reading && n !== index));
    document.getElementById("position").textContent = `${index + 1} / ${slides.length}`;
    history.replaceState(null, "", "#" + slides[index].id);
    if (reading) slides[index].scrollIntoView();
  }
  document.getElementById("previous").onclick = () => show(index - 1);
  document.getElementById("next").onclick = () => show(index + 1);
  const dialog = document.getElementById("overview");
  document.getElementById("contents").onclick = () => dialog.showModal();
  document.getElementById("close").onclick = () => dialog.close();
  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.textContent = s.dataset.title;
    b.onclick = () => {
      dialog.close();
      show(i);
    };
    document.getElementById("scenes").append(b);
  });
  document.addEventListener("keydown", (e) => {
    if (reading || dialog.open || e.target.closest("button,a,input,textarea,select")) return;
    if (["ArrowRight", " ", "PageDown"].includes(e.key)) {
      e.preventDefault();
      show(index + 1);
    }
    if (["ArrowLeft", "PageUp"].includes(e.key)) {
      e.preventDefault();
      show(index - 1);
    }
  });
  addEventListener("hashchange", () => {
    const i = slides.findIndex((s) => s.id === location.hash.slice(1));
    if (i >= 0) show(i);
  });
  addEventListener("resize", fit);
  window.Talk = {
    show,
    get index() {
      return index;
    },
  };
  fit();
  show(index);
})();
