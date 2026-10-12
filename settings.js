/* App-wide drawer. Games supply the GameBoxSettings adapter contract. */
(() => {
  const drawer=document.querySelector('#settings-drawer'),openButton=document.querySelector('#settings-open'),closeButton=document.querySelector('#settings-close'),backdrop=document.querySelector('#settings-backdrop'),home=document.querySelector('#gamebox-home'),view=document.querySelector('#game-view'),frame=document.querySelector('#game-frame'),back=document.querySelector('#home-button'),section=document.querySelector('#game-settings'),controls=document.querySelector('#game-settings-controls'),status=document.querySelector('#game-settings-status');
  let opened=false,refreshTimer;
  function adapter(){try{return !view.classList.contains('hidden') ? frame.contentWindow.GameBoxSettings : null;}catch{return null;}}
  function refresh(){
    const game=adapter(),settings=game?.getSettings()||[];
    back.hidden=view.classList.contains('hidden');section.hidden=!settings.length;
    for(const setting of settings){
      let control=controls.querySelector(`[data-setting="${setting.id}"]`);
      if(!control){
        if(setting.type==='action'){
          control=document.createElement('button');control.type='button';controls.append(control);
          control.addEventListener('click',()=>{
            if(setting.confirmation && !window.confirm(setting.confirmation))return;
            if(adapter()?.runAction?.(setting.id)){close();}
          });
        }else if(setting.type==='select'){
          const label=document.createElement('label');label.textContent=setting.label;control=document.createElement('select');control.setAttribute('aria-label',setting.label);
          for(const option of setting.options){const el=document.createElement('option');el.value=option.value;el.textContent=option.label;control.append(el);}label.append(control);controls.append(label);
          control.addEventListener('change',()=>{adapter()?.setSetting(setting.id,control.value);refresh();});
        }else{
          control=document.createElement('button');control.type='button';controls.append(control);
          control.addEventListener('click',()=>{adapter()?.setSetting(setting.id,control.getAttribute('aria-pressed')!=='true');refresh();});
        }
        control.dataset.setting=setting.id;
      }
      control.disabled=setting.disabled;
      if(setting.type==='action')control.textContent=setting.label;
      else if(setting.type==='select')control.value=setting.value;
      else{control.setAttribute('aria-pressed',String(setting.value));control.textContent=`${setting.label}: ${setting.value?'On':'Off'}`;}
    }
    status.textContent=game?.getStatus?.()||'';
  }
  function open(){opened=true;controls.replaceChildren();refresh();drawer.inert=false;drawer.classList.add('open');backdrop.hidden=false;openButton.setAttribute('aria-expanded','true');home.inert=view.inert=openButton.inert=true;document.body.classList.add('settings-open');closeButton.focus();refreshTimer=setInterval(refresh,200);}
  function close(){opened=false;clearInterval(refreshTimer);drawer.inert=true;drawer.classList.remove('open');backdrop.hidden=true;openButton.setAttribute('aria-expanded','false');home.inert=view.inert=openButton.inert=false;document.body.classList.remove('settings-open');openButton.focus();}
  openButton.addEventListener('click',open);closeButton.addEventListener('click',close);backdrop.addEventListener('click',close);
  back.addEventListener('click',close);
  document.addEventListener('keydown',event=>{
    if(!opened)return;
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='Tab'){
      const elements=Array.from(drawer.querySelectorAll('button,select')).filter(e=>!e.disabled&&!e.hidden&&e.getClientRects().length),first=elements[0],last=elements[elements.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  frame.addEventListener('load',()=>{controls.replaceChildren();refresh();});
  window.addEventListener('gamebox-viewchange',()=>{controls.replaceChildren();refresh();});
})();
