document.addEventListener("click", async (event) => {
  const copy = event.target.closest("[data-copy-target]");
  const download = event.target.closest("[data-download-bibtex]");
  if (!copy && !download) return;
  const section = (copy || download).closest(".paper-citation");
  const status = section.querySelector(".paper-copy-status");
  if (copy) {
    const target = document.getElementById(copy.dataset.copyTarget);
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      status.textContent = copy.dataset.copyTarget === "paper-bibtex-text" ? "BibTeX copied." : "Citation copied.";
    } catch (error) {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Text selected. Press Ctrl+C or Command+C to copy.";
    }
  } else {
    const text = document.getElementById("paper-bibtex-text").textContent.trim();
    const url = URL.createObjectURL(new Blob([text + "\n"], { type: "application/x-bibtex;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = download.dataset.downloadBibtex + ".bib";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "BibTeX download started.";
  }
});
