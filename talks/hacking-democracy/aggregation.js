/* Arithmetic and navigation for the simplified example printed in the handout. */
(() => {
  "use strict";
  const data = window.KK_AGGREGATION;
  let balances = data.people.map(() => data.budget_per_person);
  const trace = data.projects.map((project) => {
    const totalPoints = project.points.reduce((sum, points) => sum + points, 0);
    const contributions = project.points.map((points) => (project.cost * points) / totalPoints);
    const before = balances.slice();
    const funded = contributions.every((amount, i) => amount <= before[i]);
    if (funded) balances = before.map((amount, i) => amount - contributions[i]);
    return { ...project, totalPoints, contributions, funded, before, after: balances.slice() };
  });
  const number = (amount) => amount.toLocaleString("en-GB");
  function cell(row, text, header) {
    const element = document.createElement(header ? "th" : "td");
    element.textContent = text;
    if (header) element.scope = "row";
    row.append(element);
  }
  trace.forEach((project) => {
    const voteRow = document.createElement("tr");
    cell(voteRow, project.name, true);
    cell(voteRow, number(project.cost));
    project.points.forEach((points) => cell(voteRow, points));
    cell(voteRow, project.totalPoints);
    document.querySelector("#aggregation-vote-rows").append(voteRow);
    const resultRow = document.createElement("tr");
    resultRow.dataset.project = project.id;
    resultRow.dataset.funded = String(project.funded);
    cell(resultRow, project.name, true);
    cell(resultRow, project.totalPoints);
    cell(resultRow, project.funded ? number(project.cost) : "Skipped");
    document.querySelector("#aggregation-result-rows").append(resultRow);
  });
  const first = trace[0];
  data.people.forEach((person, i) => {
    const column = document.createElement("div");
    column.className = "aggregation-person";
    const name = document.createElement("h4");
    name.textContent = person;
    const points = document.createElement("p");
    points.textContent = first.points[i] + (first.points[i] === 1 ? " point" : " points");
    const bar = document.createElement("div");
    bar.className = "aggregation-budget-bar";
    bar.setAttribute("aria-hidden", "true");
    const remainder = document.createElement("span");
    remainder.style.width = (first.after[i] / data.budget_per_person) * 100 + "%";
    bar.append(remainder);
    const paid = document.createElement("p");
    paid.textContent = "CHF " + number(first.contributions[i]) + " paid";
    const left = document.createElement("strong");
    left.textContent = "CHF " + number(first.after[i]) + " left";
    column.append(name, points, bar, left, paid);
    document.querySelector("#aggregation-first-balances").append(column);
  });
  function select(view) {
    document.querySelectorAll(".aggregation-panel").forEach((panel) => (panel.hidden = panel.id !== "aggregation-" + view));
    document.querySelectorAll("[data-aggregation-view]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.aggregationView === view));
    });
  }
  document.querySelectorAll("[data-aggregation-view]").forEach((button) => {
    button.addEventListener("click", () => select(button.dataset.aggregationView));
  });
  window.KomiteeHandout = { trace, select };
})();
