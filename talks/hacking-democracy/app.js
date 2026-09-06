(() => {
  "use strict";
  const slides = [...document.querySelectorAll(".slide")];
  const params = new URLSearchParams(location.search);
  let reading = params.get("view") === "read";
  const initialHash = location.hash.slice(1) === "begin" ? "your-intervention" : location.hash.slice(1);
  let index = Math.max(
    0,
    slides.findIndex((slide) => slide.id === initialHash)
  );
  let speakerWindow = null;
  const $ = (selector) => document.querySelector(selector);
  function fit() {
    document.documentElement.style.setProperty("--scale", Math.min(innerWidth / 1600, (innerHeight - 68) / 900));
  }
  function sendNotes() {
    if (speakerWindow && !speakerWindow.closed)
      speakerWindow.postMessage(
        {
          type: "talk-state",
          index,
          total: slides.length,
          title: slides[index].dataset.title,
          time: slides[index].dataset.time,
          notes: [...slides[index].querySelectorAll(".notes p")].map((p) => p.textContent).join("\n\n"),
          next: slides[index + 1] ? slides[index + 1].dataset.title : "End of talk",
        },
        "*"
      );
  }
  function show(next, { hash = true } = {}) {
    const previousIndex = index;
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, i) => (slide.hidden = !reading && i !== index));
    $("#position").textContent = String(index + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    $("#scene-name").textContent = slides[index].dataset.title;
    $("[data-action=previous]").disabled = index === 0;
    $("[data-action=next]").disabled = index === slides.length - 1;
    if (hash) history.replaceState(null, "", "#" + slides[index].id);
    sendNotes();
    document.dispatchEvent(new CustomEvent("talk:scene", { detail: { index, previousIndex, reading } }));
    if (reading && hash) slides[index].scrollIntoView({ block: "start" });
  }
  function setReading(value) {
    reading = value;
    document.body.classList.toggle("read-view", reading);
    const url = new URL(location.href);
    url.searchParams.set("view", reading ? "read" : "present");
    history.replaceState(null, "", url);
    show(index);
    fit();
    if (reading) slides[index].scrollIntoView({ block: "start" });
  }
  function action(name) {
    if (name === "next") show(index + 1);
    if (name === "previous") show(index - 1);
    if (name === "overview") $("#overview").showModal();
    if (name === "close-overview") $("#overview").close();
    if (name === "reading") setReading(!reading);
    if (name === "fullscreen") {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    }
    if (name === "speaker") {
      speakerWindow = window.open("presenter.html", "hacking-democracy-notes", "width=950,height=750");
      sendNotes();
    }
  }
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => action(button.dataset.action)));
  slides.forEach((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(i + 1).padStart(2, "0") + "  " + slide.dataset.title;
    button.addEventListener("click", () => {
      show(i);
      $("#overview").close();
      if (reading) slide.scrollIntoView();
    });
    $(".scene-list").append(button);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.altKey ||
      event.metaKey ||
      event.ctrlKey ||
      event.target.closest("input,textarea,select,button,a,[contenteditable=true]") ||
      $("#overview").open
    )
      return;
    if (reading) return;
    if (["ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      show(index + 1);
    } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      show(0);
    } else if (event.key === "End") {
      event.preventDefault();
      show(slides.length - 1);
    } else if (event.key.toLowerCase() === "o") action("overview");
  });
  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", () => {
    const found = slides.findIndex((s) => s.id === location.hash.slice(1));
    if (found >= 0) show(found, { hash: false });
  });
  window.addEventListener("message", (event) => {
    if (event.source !== speakerWindow) return;
    if (event.data && event.data.type === "notes-ready") sendNotes();
    if (event.data && event.data.type === "notes-nav") show(index + (event.data.direction === -1 ? -1 : 1));
  });
  const ballots = [
    { n: 4, ranking: [0, 1, 2] },
    { n: 3, ranking: [1, 2, 0] },
    { n: 2, ranking: [2, 1, 0] },
  ];
  function calculate(rule) {
    const scores = [0, 0, 0];
    ballots.forEach((ballot) =>
      ballot.ranking.forEach((candidate, rank) => (scores[candidate] += ballot.n * (rule === "plurality" ? (rank === 0 ? 1 : 0) : 2 - rank)))
    );
    return scores;
  }
  function setRule(rule) {
    const scores = calculate(rule);
    const max = Math.max(...scores);
    document.querySelectorAll("[data-rule]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rule === rule)));
    scores.forEach((score, i) => {
      $('[data-score="' + i + '"]').textContent = score + (rule === "plurality" ? " votes" : " points");
      $('[data-bar="' + i + '"]').style.width = (score / max) * 100 + "%";
    });
    $(".rule-note").textContent = rule === "plurality" ? "Only first choices count." : "First choice gets 2 points, second gets 1, third gets 0.";
    $(".winner").textContent = ["Garden", "Music", "Workshop"][scores.indexOf(max)] + " wins.";
  }
  document.querySelectorAll("[data-rule]").forEach((b) => b.addEventListener("click", () => setRule(b.dataset.rule)));
  const murmiSteps = [
    ["People share experiences and concerns.", "Their comments provide the material for a group summary."],
    ["Comments are grouped into themes.", "People can see where they agree, disagree or still have questions."],
    ["People check the summary and request corrections.", "They can link a missing concern to the original comment."],
  ];
  document.querySelectorAll("[data-murmi-step]").forEach((button) =>
    button.addEventListener("click", () => {
      const step = Number(button.dataset.murmiStep);
      $("#murmi-step-title").textContent = murmiSteps[step][0];
      $("#murmi-step-copy").textContent = murmiSteps[step][1];
      document.querySelectorAll("[data-murmi-step]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    })
  );
  $(".reveal-concern").addEventListener("click", (event) => {
    const reveal = event.currentTarget.getAttribute("aria-expanded") !== "true";
    event.currentTarget.setAttribute("aria-expanded", String(reveal));
    event.currentTarget.textContent = reveal ? "Return to draft" : "What was missed?";
    $(".summary-addition").hidden = !reveal;
    $(".source-trace").hidden = !reveal;
    $("#access-concern").classList.toggle("highlight", reveal);
  });
  const receipt = window.KK26_RECEIPT;
  const money = (amount) =>
    "CHF " +
    amount
      .toLocaleString("en-CH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replaceAll("’", ",");
  function selectReceipt(itemIndex) {
    if (!receipt) return;
    const item = receipt.receipt.items[itemIndex];
    const project = receipt.projects.find((p) => p.project_id === item.project_id);
    document.querySelectorAll("[data-receipt-item]").forEach((row, i) => row.classList.toggle("selected", i === itemIndex));
    document.querySelectorAll("[data-receipt-choice]").forEach((button, i) => button.setAttribute("aria-pressed", String(i === itemIndex)));
    $("#receipt-project").textContent = item.title;
    $("#receipt-explanation").textContent = "This share → " + money(item.amount);
    $("#receipt-total").textContent = "Project cost: " + money(project.total_cost) + " · " + project.supporter_count + " supporters";
  }
  if (receipt) {
    const r = receipt.receipt;
    $(".receipt-person").textContent = "Participant " + r.voter_id + " / group " + r.group;
    r.items.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "receipt-item";
      row.dataset.receiptItem = i;
      const label = document.createElement("span");
      label.textContent = item.title;
      const vote = document.createElement("small");
      vote.textContent = "Vote: " + (item.vote === "EherJa" ? "Leaning yes" : "Yes");
      label.append(vote);
      const amount = document.createElement("span");
      amount.textContent = money(item.amount).replace("CHF ", "");
      row.append(label, amount);
      $("#receipt-items").append(row);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.receiptChoice = i;
      button.textContent = String(i + 1).padStart(2, "0");
      button.setAttribute("aria-label", "Inspect " + item.title);
      button.setAttribute("aria-pressed", String(i === 0));
      button.addEventListener("click", () => selectReceipt(i));
      $(".receipt-picker").append(button);
    });
    $(".receipt-spent strong").textContent = money(r.total_spent);
    selectReceipt(0);
  }
  window.DemocracyTalk = {
    show,
    calculate,
    setRule,
    selectReceipt,

    get index() {
      return index;
    },
    get count() {
      return slides.length;
    },
  };
  setReading(reading);
  fit();
  show(index);
  if (reading && initialHash === "resources") {
    history.replaceState(null, "", "#resources");
    requestAnimationFrame(() => $("#resources").scrollIntoView());
  }
})();
