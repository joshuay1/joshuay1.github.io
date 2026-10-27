(() => {
  document.querySelectorAll("[data-publication-browser]").forEach((browser) => {
    const list = browser.querySelector(".publication-results ol.bibliography");
    if (!list) return;

    const controls = browser.querySelector(".publication-filters");
    const topicButtons = [...browser.querySelectorAll("[data-publication-topic]")];
    const tagButtons = [...browser.querySelectorAll("[data-publication-tag]")];
    const validTopics = new Set(topicButtons.map((button) => button.dataset.publicationTopic).filter((topic) => topic !== "all"));
    const sortControl = browser.querySelector("[data-publication-sort]");
    const count = browser.querySelector(".publication-filter-count");
    const empty = browser.querySelector(".publication-filter-empty");
    const reset = browser.querySelector(".publication-filter-reset");
    const browseAll = browser.querySelector("[data-publication-browse-all]");
    const selectedOnly = browser.dataset.publicationSelection === "selected";
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const papers = [...list.children].map((item, index) => {
      const entry = item.querySelector("[data-publication-topics]");
      const month = (entry.dataset.publicationMonth || "").toLowerCase();
      const monthNumber = months.indexOf(month.slice(0, 3)) + 1 || Number(month) || 0;
      return {
        item,
        index,
        topics: entry.dataset.publicationTopics.split(" ").filter(Boolean),
        title: entry.dataset.publicationTitle,
        date: Number(entry.dataset.publicationYear) * 100 + monthNumber,
      };
    });
    let activeTopics = new Set();
    let sort = "newest";

    function readURL() {
      const params = new URLSearchParams(window.location.search);
      activeTopics = new Set((params.get("topics") || "").split(",").filter((topic) => validTopics.has(topic)));
      sort = ["newest", "oldest", "title"].includes(params.get("sort")) ? params.get("sort") : "newest";
    }

    function apply(updateURL = true) {
      const sorted = [...papers].sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title, "en") || a.index - b.index;
        return (sort === "oldest" ? a.date - b.date : b.date - a.date) || a.index - b.index;
      });
      let visible = 0;
      sorted.forEach((paper) => {
        paper.item.hidden = activeTopics.size > 0 && !paper.topics.some((topic) => activeTopics.has(topic));
        if (!paper.item.hidden) visible += 1;
        list.append(paper.item);
      });
      topicButtons.forEach((button) => {
        const topic = button.dataset.publicationTopic;
        button.setAttribute("aria-pressed", String(topic === "all" ? activeTopics.size === 0 : activeTopics.has(topic)));
      });
      tagButtons.forEach((button) => button.setAttribute("aria-pressed", String(activeTopics.has(button.dataset.publicationTag))));
      sortControl.value = sort;
      count.textContent = `${visible} of ${papers.length} ${selectedOnly ? "selected " : ""}publications`;
      empty.hidden = visible > 0;
      reset.hidden = activeTopics.size === 0 && sort === "newest";

      const url = new URL(window.location.href);
      if (activeTopics.size) url.searchParams.set("topics", [...activeTopics].sort().join(","));
      else url.searchParams.delete("topics");
      if (sort !== "newest") url.searchParams.set("sort", sort);
      else url.searchParams.delete("sort");
      if (updateURL) window.history.replaceState(null, "", url);
      if (browseAll) {
        const destination = new URL(browseAll.href);
        destination.search = "";
        ["topics", "sort"].forEach((key) => {
          if (url.searchParams.has(key)) destination.searchParams.set(key, url.searchParams.get(key));
        });
        browseAll.href = destination.href;
      }
    }

    topicButtons.forEach((button) =>
      button.addEventListener("click", () => {
        const topic = button.dataset.publicationTopic;
        if (topic === "all") activeTopics.clear();
        else if (activeTopics.has(topic)) activeTopics.delete(topic);
        else activeTopics.add(topic);
        apply();
      })
    );
    tagButtons.forEach((button) =>
      button.addEventListener("click", () => {
        activeTopics = new Set([button.dataset.publicationTag]);
        apply();
        topicButtons.find((topic) => topic.dataset.publicationTopic === button.dataset.publicationTag).focus();
      })
    );
    sortControl.addEventListener("change", () => {
      sort = sortControl.value;
      apply();
    });
    reset.addEventListener("click", () => {
      activeTopics.clear();
      sort = "newest";
      apply();
      topicButtons[0].focus();
    });
    window.addEventListener("popstate", () => {
      readURL();
      apply(false);
    });
    readURL();
    apply(false);
    controls.hidden = false;
  });
})();
