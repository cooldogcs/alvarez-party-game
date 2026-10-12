/* Original synthesised fiesta loop and game effects. No audio downloads. */
(() => {
  const musicButton = document.querySelector('#musicToggle');
  const soundButton = document.querySelector('#soundToggle');
  const audioStatus = document.createElement('div');
  audioStatus.className = 'audio-status hidden';
  audioStatus.setAttribute('role', 'status');
  document.querySelector('#app').appendChild(audioStatus);
  function report(message) {audioStatus.textContent = message; audioStatus.classList.remove('hidden');}
  function failed() {report('Audio could not start. Open this link directly in Chrome, then tap Music off.');}
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) { musicButton.hidden = soundButton.hidden = true; report('This browser does not support game audio. Please open the game in Chrome.'); return; }
  let context, musicGain, effectsGain, music = false, sound = true, speaking = false, step = 0, interval;
  async function unlock() {
    if (!context) {
      context = new AudioEngine();
      musicGain = context.createGain(); musicGain.gain.value = 0.45; musicGain.connect(context.destination);
      effectsGain = context.createGain(); effectsGain.gain.value = 0.75; effectsGain.connect(context.destination);
    }
    if (context.state !== 'running') await context.resume();
    if (context.state !== 'running') throw new Error('Audio blocked');
  }
  function tone(note, start, duration, volume, type = 'triangle', channel = effectsGain) {
    const oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = type; oscillator.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(volume, start + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(envelope); envelope.connect(channel);
    oscillator.start(start); oscillator.stop(start + duration + 0.03);
    oscillator.onended = () => {oscillator.disconnect(); envelope.disconnect();};
  }
  const melody = [76,79,81,79,76,74,72,null,74,76,79,76,74,72,71,null,
    72,76,79,81,79,76,74,null,74,77,79,77,74,71,72,null];
  const chords = [[48,60,64,67],[53,60,65,69],[55,59,62,67],[48,60,64,67]];
  function beat() {
    if (!music || document.hidden || !context || context.state !== 'running') return;
    const now = context.currentTime + 0.03, index = step % melody.length;
    const chord = chords[Math.floor(index / 8)];
    if (melody[index] !== null) tone(melody[index], now, 0.2, 0.22, 'triangle', musicGain);
    if (index % 4 === 0) tone(chord[0], now, 0.42, 0.32, 'sine', musicGain);
    if (index % 2 === 1) chord.slice(1).forEach((note, i) => tone(note, now + i * 0.018, 0.18, 0.11, 'triangle', musicGain));
    step++;
  }
  function update() {
    musicButton.setAttribute('aria-pressed', String(music));
    musicButton.textContent = music ? '♫ Music on' : '♫ Music off';
    soundButton.setAttribute('aria-pressed', String(sound));
    soundButton.textContent = sound ? '♪ Sound on' : '♪ Sound off';
  }
  function effect(kind) {
    if (!sound || !context || context.state !== 'running' || document.hidden) return;
    const now = context.currentTime;
    if (kind === 'click') {
      tone(76, now, 0.065, 0.2, 'sine');
      tone(83, now + 0.025, 0.08, 0.12, 'triangle');
      return;
    }
    const notes = kind === 'champion' ? [72,76,79,84,79,84,88] : kind === 'winner' ? [72,76,79,84] : kind === 'bell' ? [88,76,88] : kind === 'round' ? [67,72,76] : [84];
    notes.forEach((note, i) => tone(note, now + i * (kind === 'card' ? 0 : 0.13), kind === 'card' ? 0.09 : 0.4, kind === 'card' ? 0.16 : 0.25, kind === 'bell' ? 'sine' : 'triangle'));
  }
  musicButton.addEventListener('click', async () => {
    try { await unlock(); music = !music; musicGain.gain.setTargetAtTime(music ? (speaking ? 0.07 : 0.45) : 0, context.currentTime, 0.05);
      clearInterval(interval); if (music) {beat(); interval = setInterval(beat, 260);} update();
    } catch {music = false; update(); failed();}
  });
  soundButton.addEventListener('click', async () => {
    try {await unlock(); sound = !sound; update(); if (sound) effect('card');} catch {sound = false; update(); failed();}
  });
  document.addEventListener('pointerdown', () => {unlock().catch(() => {});}, {once:true});
  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) context.suspend().catch(() => {});
    else context.resume().catch(() => {});
  });
  document.querySelector('#alvarez').addEventListener('click', () => {
    if (!document.querySelector('#s-claim').classList.contains('hidden')) effect('bell');
  });
  new MutationObserver(() => {
    if (document.querySelector('#rank').textContent !== '?') effect('card');
  }).observe(document.querySelector('#callNum'), {childList:true,characterData:true,subtree:true});
  let previousScreen = 's-setup';
  new MutationObserver(() => {
    const screen = document.querySelector('.screen:not(.hidden)');
    if (!screen || screen.id === previousScreen) return;
    previousScreen = screen.id;
    if (screen.id === 's-round') effect('round');
    if (screen.id === 's-result' && !document.querySelector('#resultPts').textContent.startsWith('Sin puntos')) effect('winner');
    if (screen.id === 's-champion') effect('champion');
  }).observe(document.querySelector('main'), {subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click', async event => {
    if (!event.target.closest('button') || !sound) return;
    try {await unlock(); effect('click');} catch {}
  });
  document.addEventListener('alvarez-voice', event => {
    speaking = event.detail.speaking;
    if (context && musicGain) musicGain.gain.setTargetAtTime(music ? (speaking ? 0.07 : 0.45) : 0, context.currentTime, 0.06);
  });
  update();
})();
