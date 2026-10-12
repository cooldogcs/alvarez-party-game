(() => {
  const button = document.querySelector('#voiceToggle');
  const synth = window.speechSynthesis;
  const status = document.querySelector('#voiceStatus');
  let enabled = false, serial = 0, restoreTimer, activeSpeech;
  const ranks = {A:'as',2:'dos',3:'tres',4:'cuatro',5:'cinco',6:'seis',7:'siete',8:'ocho',9:'nueve',10:'diez',J:'jota',Q:'reina',K:'rey'};
  const suits = {'♥':'corazones','♦':'diamantes','♣':'tréboles','♠':'espadas'};
  const cardOrder = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const cardQuips = {
  "♥": [
    "Un corazón, pero ganas para toda la familia.",
    "Dos enamorados, una sola contraseña.",
    "Tres corazones. ¡Ya se armó la novela!",
    "Cuatro corazones y nadie lava los platos.",
    "Cinco suspiros. ¡No era amor, era hambre!",
    "Seis serenatas y el vecino ya se quejó.",
    "Siete corazones. ¡El chisme viene fuerte!",
    "Ocho mensajes y sigue sin contestar.",
    "Nueve corazones. ¡La suegra está contando!",
    "Diez corazones. ¡Esto ya parece telenovela!",
    "El galán llegó, pero viene en chanclas.",
    "La reina manda. ¡Y el control también!",
    "Mucho rey, pero pide permiso para salir."
  ],
  "♦": [
    "Brilla mucho. ¡Ojalá también pagara la luz!",
    "Dos diamantes. ¡Alcanza para presumir tantito!",
    "Tres diamantes, cero ganas de trabajar.",
    "Cuatro diamantes. ¡La tanda sí cumplió!",
    "Cinco diamantes. ¡No los gastes en abonos!",
    "Seis diamantes y todavía pide descuento.",
    "Siete diamantes. ¡El aguinaldo llegó temprano!",
    "Ocho diamantes. ¡Hoy invita el primo!",
    "Nueve diamantes. ¡Ya se siente de Polanco!",
    "Llegó la quincena, duró diez minutos.",
    "El galán presume joyas. ¡Son prestadas!",
    "La reina brilla. ¡Ni filtro necesita!",
    "El rey trae dinero, pero olvidó la cartera."
  ],
  "♣": [
    "Un trébol. ¡La suerte por fin contestó!",
    "Dos tréboles. ¡Ahora sí, ya merito!",
    "Tres tréboles. ¡No los cambies por cilantro!",
    "Cuatro tréboles. ¡La suerte viene completa!",
    "Cinco tréboles y todavía toca madera.",
    "Seis tréboles. ¡Hasta el vecino se apunta!",
    "Siete tréboles. ¡Hoy sí sale el premio!",
    "Ocho tréboles. ¡La suerte anda de fiesta!",
    "Nueve tréboles. ¡Hasta el gato está ganando!",
    "Diez tréboles. ¡Guarda suerte para mañana!",
    "El galán trae suerte, pero no trae cambio.",
    "La reina ganó. ¡Ya pidió la revancha!",
    "El rey del jardín. ¡Ni riega las plantas!"
  ],
  "♠": [
    "Una espada. ¡Corta el chisme, no el pastel!",
    "Dos espadas. ¡El duelo es por la última tortilla!",
    "Tres espadas. ¡Ya salió el primo valiente!",
    "Cuatro espadas. ¡La familia vino preparada!",
    "Cinco espadas y nadie abre la piñata.",
    "Seis espadas. ¡Mucho filo, poquito miedo!",
    "Siete espadas. ¡Ponte trucha con esta!",
    "Ocho espadas. ¡Que nadie esconda las cartas!",
    "Nueve espadas. ¡El drama viene afilado!",
    "Diez espadas. ¡Se cortó hasta el internet!",
    "El galán pelea. ¡Pero por el cargador!",
    "La reina llegó. ¡Escondan el chisme!",
    "El rey presume espada. ¡Es para el aguacate!"
  ]
};
  function duck(active) {document.dispatchEvent(new CustomEvent('alvarez-voice', {detail:{speaking:active}}));}
  function stop() {serial++; clearTimeout(restoreTimer); if (synth) synth.cancel(); activeSpeech = null; duck(false);}
  function update() {button.textContent = enabled ? '🗣 Voz activada' : '🗣 Voz apagada'; button.setAttribute('aria-pressed', String(enabled));}
  function say(text) {
    if (!enabled || document.hidden) return;
    stop(); const token = serial;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const voice = voices.find(v => /^es[-_]US$/i.test(v.lang))
      || voices.find(v => /^es[-_]MX$/i.test(v.lang))
      || voices.find(v => /^es[-_](419|AR|CO|CL|PE)$/i.test(v.lang))
      || voices.find(v => /^es([_-]|$)/i.test(v.lang));
    if (voice) utterance.voice = voice;
    utterance.lang = voice ? voice.lang : 'es-US';
    utterance.rate = 0.95; utterance.pitch = 1; utterance.volume = 1;
    const restore = () => {if (serial === token) {clearTimeout(restoreTimer); duck(false);}};
    utterance.onstart = () => {if (serial === token) duck(true);};
    utterance.onend = restore;
    utterance.onerror = event => {
      restore();
      if (!['canceled','interrupted'].includes(event.error)) {
        status.textContent = 'No se pudo reproducir la voz. Comprueba que tu tablet tenga una voz en español disponible.';
        status.classList.remove('hidden');
      }
    };
    duck(true); restoreTimer = setTimeout(restore, Math.max(4500, text.length * 100));
    activeSpeech = utterance;
    synth.speak(utterance);
  }
  if (!synth || !window.SpeechSynthesisUtterance) {button.hidden = true; return;}
  button.addEventListener('click', () => {
    enabled = !enabled; status.classList.add('hidden'); update();
    if (enabled) narrate(); else stop();
  });
  new MutationObserver(() => {
    if (document.querySelector('#s-game').classList.contains('hidden')) return;
    const rank = document.querySelector('#rank').textContent;
    const suit = document.querySelector('#suit').textContent;
    if (ranks[rank] && suits[suit]) say(`${ranks[rank]} de ${suits[suit]}. ${cardQuips[suit][cardOrder.indexOf(rank)]}`);
  }).observe(document.querySelector('#callNum'), {subtree:true,childList:true,characterData:true});
  const text = id => document.querySelector(id).textContent.trim();
  const roundTalk = {
    'CINCO RÁPIDO': '¡Cinco rápido! Cuando tengas cinco cartas que ya hayan salido, grita Aldelir. Tres puntos en juego. ¡Aquí el que pestañea, pierde!',
    'CORAZÓN': '¡Ronda de corazones! Necesitas tres corazones de tu mano que hayan salido. Solo se llaman corazones. Son tres puntos. ¡Mucho corazón, pero nada de enamorarse de las cartas del vecino!',
    'VIENDO ROJO': '¡Viendo rojo! Marca cuatro cartas rojas de tu mano: corazones o diamantes. Solo llamamos esos dos palos. Tres puntos para cada ganador verificado. ¡Ojo con el rojo, familia!',
    'SEIS RÁPIDO': '¡Seis rápido! Cuando tengas seis cartas de tu mano que ya hayan salido, grita Aldelir. Todos los palos cuentan. Cuatro puntos en juego. ¡Aquí hasta el primo distraído tiene oportunidad!',
    'NEGRO TOTAL': '¡Negro total! Marca cuatro cartas negras de tu mano: espadas o tréboles. Solo llamamos esos dos palos. Son tres puntos. ¡Ponte trucha y revisa bien tus cartas!',
    'FORTUNA': '¡Llegó la fortuna! Necesitas tres diamantes de tu mano que hayan salido. Solo se llaman diamantes. Cuatro puntos para cada ganador verificado. ¡Estos diamantes sí se pueden presumir!',
    'OCHO DE ORO': '¡La gran final! Diez cartas para cada jugador. Necesitas ocho que hayan salido. Cada ganador verificado se lleva diez puntos. ¡Todavía puede cambiar todo!'
  };
  function narrate() {
    const screen = document.querySelector('.screen:not(.hidden)');
    if (!screen) return;
    let message = '';
    switch (screen.id) {
      case 's-setup': message = '¡Qué onda, familia! Bienvenidos a Aldelir. De tres a ocho jugadores, dos barajas y siete rondas. Elijan cuántos van a jugar. ¡Aquí se vale competir, pero no esconderle las cartas a la tía!'; break;
      case 's-names': message = 'Ahora escriban un nombre distinto para cada jugador. ¡Queremos saber quién gana y quién nos debe la revancha!'; break;
      case 's-deal': {
        const amount = text('#dealBig').match(/(\d+)\s+CARTAS/i)?.[1];
        message = `¡A repartir! Mezclen las dos barajas y den ${amount || 'las'} cartas a cada jugador. Todas boca arriba. Cuando estén listos, continuamos. ¡Nada de cartas escondidas bajo la mesa!`; break;
      }
      case 's-round': message = roundTalk[text('#roundEs')] || text('#objectiveEs'); break;
      case 's-game': {
        // Card announcements take priority once the first card is called.
        if (text('#rank') === '?') message = '¡Órale, arrancamos!';
        break;
      }
      case 's-claim': message = '¡Tenemos Aldelir! Seleccionen a todos los que gritaron. Si varios completaron el reto con la misma carta, todos pueden ganar. ¡A ver esas cartas, que aquí no hay mordidas!'; break;
      case 's-verify': message = `${text('#verifyName').replace('🔍', '').trim()}, te toca. ¿Completaste el reto con la última carta? Revisen las cartas llamadas y marquen si es válido. ¡Sin trampas, que la familia se acuerda!`; break;
      case 's-result': {
        if (text('#resultPts').startsWith('Sin puntos')) message = '¡Falsa alarma! No hay puntos esta vez. Volvemos a la misma ronda. ¡La emoción se entiende, pero las cartas mandan!';
        else message = `¡Eso es todo! ${text('#winnerNames').replaceAll('•', 'y')}. ${text('#resultPts').split('/')[0].replace('⭐', '')}. Revisen el marcador. ¡Que nadie se confíe, esto todavía se pone bueno!`;
        break;
      }
      case 's-exhausted': message = `¡Se acabaron las ${document.querySelector('#exhaustedCalled').children.length} cartas válidas de esta ronda y nadie ganó! No se suman puntos. Revisen si se les pasó alguna carta. Si nadie completó el reto, mezclen y repartan de nuevo. Repetimos la misma ronda. ¡Órale, segunda oportunidad!`; break;
      case 's-champion': message = `¡Se acabó, familia! ${text('#champTitleEs')}. ${text('#champName')}. ${text('#champScore').split('/')[0].replace('⭐', '')}. ¡Un aplauso! Se vale presumir, pero la revancha ya viene en camino.`; break;
    }
    if (message) say(message);
  }
  let lastNarrationKey = '';
  new MutationObserver(() => {
    const screen = document.querySelector('.screen:not(.hidden)');
    if (!screen) return;
    const key = screen.id + (screen.id === 's-verify' ? text('#verifyProgress') + text('#verifyName') : '');
    if (key === lastNarrationKey) return;
    lastNarrationKey = key;
    stop();
    if (enabled) narrate();
  }).observe(document.querySelector('main'), {subtree:true,attributes:true,attributeFilter:['class'],childList:true,characterData:true});
  document.querySelector('#pause').addEventListener('click', stop);
  document.addEventListener('visibilitychange', () => {if (document.hidden) stop();});
  window.addEventListener('pagehide', stop);
  update();
})();
