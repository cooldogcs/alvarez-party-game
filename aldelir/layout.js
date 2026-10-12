/* Fit each landscape screen to the available space, including browser bars. */
(() => {
  const main = document.querySelector('main');
  const landscape = window.matchMedia('(orientation: landscape)');
  let pending = false;
  function fit() {
    pending = false;
    const screen = main.querySelector('.screen:not(.hidden)');
    if (!screen) return;
    if (!landscape.matches) {
      screen.style.removeProperty('--stage-scale');
      return;
    }
    const available = main.getBoundingClientRect();
    const scale = Math.min(1, (available.height - 12) / screen.offsetHeight,
      (available.width - 12) / screen.offsetWidth);
    screen.style.setProperty('--stage-scale', String(Math.max(0.1, scale)));
  }
  function scheduleFit() {
    if (!pending) {pending = true; requestAnimationFrame(fit);}
  }
  new MutationObserver(scheduleFit).observe(main, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ['class', 'open']
  });
  const observer = new ResizeObserver(scheduleFit);
  observer.observe(main);
  main.querySelectorAll('.screen').forEach(screen => observer.observe(screen));
  window.addEventListener('resize', scheduleFit);
  landscape.addEventListener('change', scheduleFit);
  if (document.fonts) document.fonts.ready.then(scheduleFit);
  scheduleFit();
})();
