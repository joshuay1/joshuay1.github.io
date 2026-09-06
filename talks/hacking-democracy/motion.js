/* Choreography follows the argument; no blanket entrance or ambient motion. */
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const print = matchMedia('print');
  let animations = [];
  const clear = () => { animations.forEach(a => a.cancel()); animations = []; };
  function play(el, frames, duration, delay = 0) {
    animations.push(el.animate(frames, {duration, delay, easing: 'ease-in-out', fill: 'backwards'}));
  }
  function enter({index, reading = false}) {
    clear();
    if (reading || reduced.matches || print.matches) return;
    const slide = slides[index];
    if (slide.id === 'democracy-open-source') {
      // Follow the trunk before its branches: institutional influence, not a ranking.
      slide.querySelectorAll('.lineage-paths path').forEach((path, i) => {
        const length = path.getTotalLength();
        play(path, [{strokeDasharray: `${length}`, strokeDashoffset: length},
                    {strokeDasharray: `${length}`, strokeDashoffset: 0}], 1000, [0, 500, 1100, 1100][i]);
      });
    }
    if (slide.id === 'process-overview') {
      // Read the process left to right; the full framework stays legible throughout.
      slide.querySelectorAll('.process-numeral').forEach((number, i) => {
        play(number, [{scale: '1', opacity: .65}, {scale: '1.16', opacity: 1, offset: .45},
                      {scale: '1', opacity: 1}], 650, i * 360);
      });
    }
    if (slide.id === 'kk-remit') {
      // Emphasize the two design choices in the question, in speaking order.
      slide.querySelectorAll('.remit-fact strong').forEach((fact, i) => {
        play(fact, [{backgroundSize: '0% 28%'}, {backgroundSize: '100% 28%'}], 650, i * 850);
      });
    }
  }
  // Revealing an omitted concern should draw attention back to its source.
  document.querySelector('.reveal-concern').addEventListener('click', event => {
    if (reduced.matches || print.matches || event.currentTarget.getAttribute('aria-expanded') !== 'true') return;
    play(document.querySelector('#access-concern'),
      [{outline: '4px solid transparent'}, {outline: '4px solid #aa443c', offset: .35}, {outline: '4px solid transparent'}], 1000);
  });
  document.addEventListener('talk:scene', event => enter(event.detail));
  reduced.addEventListener('change', clear);
  print.addEventListener('change', clear);
  window.addEventListener('beforeprint', clear);
  window.addEventListener('pagehide', clear);
  enter({index: window.DemocracyTalk.index, reading: document.body.classList.contains('read-view')});
})();
