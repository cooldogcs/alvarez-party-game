(() => {
  const button = document.querySelector('#fullscreenToggle');
  const status = document.querySelector('#fullscreenStatus');
  const root = document.documentElement;
  let statusTimer;
  function update() {
    const active = Boolean(document.fullscreenElement);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
    button.querySelector('span').textContent = active ? 'Exit full screen' : 'Full screen';
  }
  if (!root.requestFullscreen || !document.fullscreenEnabled) {
    button.hidden = true;
    return;
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.classList.add('hidden');
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.requestFullscreen();
    } catch (error) {
      status.textContent = 'Full screen unavailable. Open the game directly in Chrome and try again.';
      status.classList.remove('hidden');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => status.classList.add('hidden'), 6000);
    } finally {
      button.disabled = false;
      update();
    }
  });
  document.addEventListener('fullscreenchange', update);
  update();
})();
