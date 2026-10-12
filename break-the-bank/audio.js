/* Locally synthesised casino effects. Audio starts after a player gesture. */
(()=>{
'use strict';
const Engine=window.AudioContext||window.webkitAudioContext,key='gamebox.bank.sound.v1';
let context,master,enabled=true;const sources=new Set();
try{enabled=localStorage.getItem(key)!=='off';}catch{}
function visible(){try{return !document.hidden&&!window.parent.document.querySelector('#game-view')?.classList.contains('hidden');}catch{return !document.hidden;}}
function stop(){for(const source of sources){try{source.stop();}catch{}}sources.clear();}
async function unlock(){if(!Engine||!enabled||!visible())return false;try{if(!context){context=new Engine();master=context.createGain();master.gain.value=.45;master.connect(context.destination);}if(context.state==='suspended')await context.resume();return context.state==='running';}catch{return false;}}
function tone(hz,at,length,volume=.12,type='sine',end=hz){const source=context.createOscillator(),gain=context.createGain();source.type=type;source.frequency.setValueAtTime(hz,at);source.frequency.exponentialRampToValueAtTime(end,at+length);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+length);source.connect(gain);gain.connect(master);sources.add(source);source.onended=()=>{sources.delete(source);source.disconnect();gain.disconnect();};source.start(at);source.stop(at+length+.02);}
function noise(at,length,volume=.09){const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter();source.buffer=buffer;filter.type='highpass';filter.frequency.value=1600;gain.gain.value=volume;source.connect(filter);filter.connect(gain);gain.connect(master);sources.add(source);source.onended=()=>{sources.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(at);source.stop(at+length+.02);}
function coin(at){tone(1500,at,.14,.12);tone(2350,at,.1,.045);tone(1800,at+.04,.12,.055);}
function notes(list,at,step=.11,length=.25){list.forEach((hz,i)=>{tone(hz,at+i*step,length,.13,'triangle');tone(hz*2,at+i*step,length,.035);});}
async function play(kind){if(!enabled||!visible()||!await unlock()||!enabled||!visible())return;const t=context.currentTime+.008;try{switch(kind){
case 'click':tone(420,t,.045,.11,'triangle',180);noise(t,.025,.055);break;
case 'chip':coin(t);tone(210,t,.05,.07,'triangle');break;
case 'deal':noise(t,.12,.14);tone(160,t+.08,.07,.07,'triangle',95);break;
case 'reveal':noise(t,.16,.12);notes([440,554,659],t+.06,.055,.17);break;
case 'win':coin(t);coin(t+.12);notes([523,659,784],t+.05,.10,.24);break;
case 'double':coin(t);coin(t+.10);coin(t+.20);notes([523,659,784,1047],t+.06,.10,.3);break;
case 'draw':notes([440,440],t,.11,.12);break;
case 'loss':notes([330,262,196],t,.1,.2);break;
case 'bust':tone(220,t,.36,.14,'triangle',75);noise(t,.09,.08);break;
case 'victory':notes([523,659,784,1047,784,1047,1319],t,.15,.4);[0,.16,.32,.48,.64].forEach(offset=>coin(t+offset));break;
case 'house':noise(t,.18,.12);tone(80,t+.1,.42,.2,'triangle',35);tone(180,t+.12,.12,.10,'triangle',60);notes([392,330,262,196],t+.2,.16,.3);break;
}}catch{}}
function setEnabled(value){enabled=!!value;if(!enabled)stop();try{localStorage.setItem(key,enabled?'on':'off');}catch{}if(enabled)play('click');}
document.addEventListener('pointerdown',()=>{void unlock();},{capture:true,passive:true});
document.addEventListener('click',event=>{const button=event.target.closest('button');if(button&&!button.disabled)void play('click');},{capture:true});
document.addEventListener('visibilitychange',()=>{if(!visible())stop();});
try{if(window.parent!==window)window.parent.addEventListener('gamebox-viewchange',()=>{if(!visible())stop();});}catch{}
window.addEventListener('pagehide',stop);
window.BankAudio={play,setEnabled,isEnabled:()=>enabled,isSupported:()=>!!Engine};
})();
