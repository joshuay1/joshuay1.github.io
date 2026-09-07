/* Budget sensitivity for the printed handout, not a general MES implementation. */
(() => {
  const data = window.KK_AGGREGATION;
  function calculate(total) {
    const balances = data.people.map(() => total / data.people.length);
    const projects = data.projects.map(project => {
      const points = project.points.reduce((a, b) => a + b, 0);
      const contributions = project.points.map(p => project.cost * p / points);
      const funded = contributions.every((cost, i) => cost <= balances[i] + 1e-8);
      if (funded) contributions.forEach((cost, i) => balances[i] -= cost);
      return { ...project, funded, contributions };
    });
    return { projects, balances, spent: projects.reduce((sum, p) => sum + (p.funded ? p.cost : 0), 0) };
  }
  window.KKFundingScenario = calculate;
  const slider = document.querySelector('#funding-budget');
  if (!slider) return;
  const money = n => 'CHF ' + Math.round(n).toLocaleString('en-GB');
  const grid = document.querySelector('#funding-projects');
  const colors = ['#b96742','#a7a574','#d6a23d','#b96742','#a7a574','#d6a23d'];
  const tiles = data.projects.map((p, i) => {
    const tile = document.createElement('article');
    tile.className = 'funding-project';
    tile.style.setProperty('--project-color', colors[i]);
    tile.innerHTML = `<span class="funding-project-order">${i + 1}</span><h3></h3><p class="funding-cost"></p><strong class="funding-state"></strong>`;
    tile.querySelector('h3').textContent = p.name;
    tile.querySelector('.funding-cost').textContent = money(p.cost);
    grid.append(tile);
    return tile;
  });
  let previous;
  function update() {
    const total = Number(slider.value);
    const result = calculate(total);
    document.querySelector('#funding-budget-value').textContent = money(total);
    slider.setAttribute('aria-valuetext', money(total));
    const progress = (total - Number(slider.min)) / (Number(slider.max) - Number(slider.min));
    slider.style.setProperty('--funding-progress', (progress * 100) + '%');
    result.projects.forEach((p, i) => {
      tiles[i].dataset.funded = String(p.funded);
      tiles[i].querySelector('.funding-state').textContent = p.funded ? '✓ Funded' : 'Not funded';
    });
    document.querySelector('#funding-summary').textContent = `${result.projects.filter(p => p.funded).length} of 6 projects funded · ${money(result.spent)} spent`;
    const changed = result.projects.filter((p,i) => previous && p.funded !== previous.projects[i].funded);
    if (changed.length) document.querySelector('#funding-change').textContent = changed.map(p => `${p.name}: ${p.funded ? 'now funded' : 'loses funding'}`).join(' · ');
    else if (previous) document.querySelector('#funding-change').textContent = 'Same projects funded at this budget.';
    previous = result;
  }
  slider.addEventListener('input', update);
  document.querySelector('#funding-reset').addEventListener('click', () => { slider.value = '3000'; update(); });
  update();
})();
