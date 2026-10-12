/* Shared shell contract: each game exposes only the settings it supports. */
(() => {
  const controls = [
    {id:'musicToggle',label:'Music',type:'toggle'},
    {id:'voiceToggle',label:'Voice caller',type:'toggle'},
    {id:'soundToggle',label:'Sound effects',type:'toggle'},
    {id:'speed',label:'Calling speed',type:'select'}
  ];
  window.GameBoxSettings = {
    getSettings() {
      const settings = controls.map(setting => {
        const control = document.getElementById(setting.id);
        return {...setting, disabled:control.hidden || control.disabled,
          value:setting.type==='toggle' ? control.getAttribute('aria-pressed')==='true' : control.value,
          options:setting.type==='select' ? Array.from(control.options, o=>({value:o.value,label:o.textContent})) : undefined};
      });
      settings.push({id:'resetGame',label:'Reset game',type:'action',confirmation:'Reset this game? All players, scores and round progress will be cleared.'});
      return settings;
    },
    setSetting(id,value) {
      const setting = controls.find(s=>s.id===id),control = document.getElementById(id);
      if (!setting || !control || control.hidden || control.disabled) return;
      if (setting.type==='toggle') {
        if ((control.getAttribute('aria-pressed')==='true') !== value) control.click();
      } else if (Array.from(control.options).some(o=>o.value===value)) {
        control.value=value;control.dispatchEvent(new Event('change',{bubbles:true}));
      }
    },
    runAction(id) {
      if (id !== 'resetGame') return false;
      document.getElementById('newGame').click();
      return true;
    },
    getStatus() {
      return Array.from(document.querySelectorAll('.audio-status:not(.hidden)')).map(e=>e.textContent).filter(Boolean).join(' ');
    }
  };
})();
