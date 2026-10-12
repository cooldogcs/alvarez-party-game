(()=>{"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const app=$("#app"), screens=["setup","names","deal","round","game","claim","verify","result","exhausted","champion"];
let pc=6,players=[],round=0,deck=[],called=[],timer=null,paused=false,selected=[],verifyIndex=0,validWinners=[];
const cardCounts={3:14,4:12,5:10,6:10,7:8,8:8};
const rounds=[
 {icon:"⚡",es:"CINCO RÁPIDO",en:"QUICK FIVE",oes:"Marca 5 cartas de tu mano que hayan sido llamadas.",oen:"Match any 5 called cards in your hand.",pts:3,need:5},
 {icon:"❤️",es:"CORAZÓN",en:"HEARTS",oes:"Marca 3 corazones de tu mano que hayan sido llamados.",oen:"Match 3 called hearts in your hand.",pts:3,need:3,allowed:["♥"],poolEs:"Solo corazones",poolEn:"Hearts only"},
 {icon:"🔴",es:"VIENDO ROJO",en:"SEEING RED",oes:"Marca 4 cartas rojas de tu mano que hayan sido llamadas.",oen:"Match 4 called red cards in your hand.",pts:3,need:4,allowed:["♥","♦"],poolEs:"Solo corazones y diamantes",poolEn:"Hearts and diamonds only"},
 {icon:"⚡",es:"SEIS RÁPIDO",en:"QUICK SIX",oes:"Marca 6 cartas de tu mano que hayan sido llamadas.",oen:"Match any 6 called cards in your hand.",pts:4,need:6},
 {icon:"♠️",es:"NEGRO TOTAL",en:"BLACKOUT",oes:"Marca 4 cartas negras de tu mano que hayan sido llamadas.",oen:"Match 4 called black cards in your hand.",pts:3,need:4,allowed:["♠","♣"],poolEs:"Solo espadas y tréboles",poolEn:"Spades and clubs only"},
 {icon:"♦️",es:"FORTUNA",en:"DIAMOND RUSH",oes:"Marca 3 diamantes de tu mano que hayan sido llamados.",oen:"Match 3 called diamonds in your hand.",pts:4,need:3,allowed:["♦"],poolEs:"Solo diamantes",poolEn:"Diamonds only"},
 {icon:"🌟",es:"OCHO DE ORO",en:"GOLDEN EIGHT",oes:"¡La Gran Final! Marca 8 cartas llamadas de tu mano de 10.",oen:"The Grand Final! Match 8 called cards in your hand of 10.",pts:10,need:8,final:true,deal:10}
];
const ranks=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const suits=[{s:"♥",es:"CORAZONES",en:"HEARTS",red:true},{s:"♦",es:"DIAMANTES",en:"DIAMONDS",red:true},{s:"♣",es:"TRÉBOLES",en:"CLUBS",red:false},{s:"♠",es:"ESPADAS",en:"SPADES",red:false}];
const names={A:["AS","ACE"],J:["JOTA","JACK"],Q:["REINA","QUEEN"],K:["REY","KING"]};

function show(name){screens.forEach(x=>$("#s-"+x).classList.toggle("hidden",x!==name));clearTimeout(timer);window.scrollTo({top:0,behavior:"smooth"})}
function setTheme(){for(let i=0;i<=7;i++)app.classList.remove("round-theme-"+i);app.classList.add("round-theme-"+(round+1))}
function dealCount(){return rounds[round]?.deal||cardCounts[pc]}
function setupCounts(){const b=$("#counts");b.innerHTML="";for(let n=3;n<=8;n++){const x=document.createElement("button");x.type="button";x.className="count-btn"+(n===pc?" selected":"");x.textContent=n;x.onclick=()=>{pc=n;setupCounts()};b.appendChild(x)}$("#dealInfo").innerHTML=`<strong>${pc} jugadores / players</strong><br>${cardCounts[pc]} cartas normalmente / cards normally<br><small>Gran Final / Grand Final: 10 each</small>`}
function makeNames(){const f=$("#nameFields");f.innerHTML="";for(let i=0;i<pc;i++){const row=document.createElement("label");row.className="name-row";row.innerHTML=`<b>${i+1}</b><input maxlength="18" autocomplete="off" placeholder="Nombre / Player name">`;f.appendChild(row)}}
function dealScreen(){setTheme();const r=rounds[round],n=dealCount();$("#dealRound").textContent=`RONDA ${round+1} DE ${rounds.length} / ROUND ${round+1} OF ${rounds.length}`;$("#dealTitle").textContent=r.final?"🌟 ¡PREPARA LA GRAN FINAL!":"🃏 ¡NUEVA MANO!";$("#dealSubtitle").textContent=r.final?"GET READY FOR THE GRAND FINAL!":"NEW HAND!";$("#dealBig").innerHTML=`REPARTE <strong>${n} CARTAS</strong> A CADA JUGADOR<br><span class="english">DEAL <strong>${n} CARDS</strong> TO EACH PLAYER</span>`;show("deal")}
function intro(){setTheme();const r=rounds[round];$("#roundNo").textContent=r.final?"🌟 RONDA 7 DE 7 • LA GRAN FINAL / THE GRAND FINAL 🌟":`RONDA ${round+1} DE ${rounds.length} / ROUND ${round+1} OF ${rounds.length}`;$("#roundIcon").textContent=r.icon;$("#roundEs").textContent=r.es;$("#roundEn").textContent=r.en;$("#objectiveEs").textContent=r.oes;$("#objectiveEn").textContent=r.oen;$("#doublePoints").classList.toggle("hidden",!r.final);$("#roundPoints").textContent=`⭐ ${r.pts} PUNTOS / POINTS`;show("round")}
function buildDeck(){deck=[];for(const s of suits){if(rounds[round].allowed&&!rounds[round].allowed.includes(s.s))continue;for(const r of ranks)deck.push({r,...s});}for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}called=[]}
function ranked(){const s=[...players].sort((a,b)=>b.score-a.score);let prev=null,pos=0;return s.map((p,i)=>{if(prev===null||p.score!==prev)pos=i+1;prev=p.score;return{p,rank:pos}})}
function board(id){const b=$(id);b.innerHTML="";const rows=ranked(),top=rows.length?rows[0].p.score:0,topCount=rows.filter(x=>x.p.score===top).length;rows.forEach(({p,rank})=>{const leader=p.score===top,d=document.createElement("div");d.className=(id==="#scores"?"score-card":"standing")+(leader?" leader":"");const badge=leader?(topCount>1?"🤝":"👑"):"";d.innerHTML=id==="#scores"?`<div class="score-rank">${badge} ${rank}.º / #${rank}</div><strong>${escapeHtml(p.name)}</strong><div>⭐ ${p.score}</div>`:`<span>${badge} ${rank}.º / #${rank} &nbsp; ${escapeHtml(p.name)}</span><span>⭐ ${p.score}</span>`;b.appendChild(d)})}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function schedule(){clearTimeout(timer);if(!paused&&!$("#s-game").classList.contains("hidden"))timer=setTimeout(callAfterSpeech,Number($("#speed").value))}
function callAfterSpeech(){
  if(paused||$("#s-game").classList.contains("hidden"))return;
  const speech=window.speechSynthesis;
  const voiceOn=$("#voiceToggle")?.getAttribute("aria-pressed")==="true";
  if(voiceOn&&speech&&(speech.speaking||speech.pending)){timer=setTimeout(callAfterSpeech,100);return;}
  call();
}
function startCallsAfterIntro(){
  let waited=false;
  function ready(){
    if(paused||$("#s-game").classList.contains("hidden"))return;
    const speech=window.speechSynthesis;
    const voiceOn=$("#voiceToggle")?.getAttribute("aria-pressed")==="true";
    if(voiceOn&&speech&&(speech.speaking||speech.pending)){
      waited=true;timer=setTimeout(ready,100);return;
    }
    timer=setTimeout(call,waited?350:0);
  }
  timer=setTimeout(ready,900);
}
function animateCard(){const c=$("#playingCard");c.classList.remove("deal");void c.offsetWidth;c.classList.add("deal")}
function call(){if(!deck.length){endWithoutWinner();return;}const c=deck.pop();called.push(c);["#rank","#cornerRank1","#cornerRank2"].forEach(x=>$(x).textContent=c.r);["#suit","#cornerSuit1","#cornerSuit2"].forEach(x=>$(x).textContent=c.s);$("#playingCard").classList.toggle("red-card",c.red);const rr=names[c.r]||[c.r,c.r];$("#cardEs").textContent=`${rr[0]} DE ${c.es}`;$("#cardEn").textContent=`${rr[1]} OF ${c.en}`;$("#callNum").textContent=`${called.length} / ${called.length+deck.length} llamadas / calls`;animateCard();schedule()}
function cardText(c){return c?c.r+c.s:"?"}
function renderCalled(id="#called"){const b=$(id);b.innerHTML="";called.forEach((c,i)=>{const x=document.createElement("span");x.className="called-chip"+(i===called.length-1?" last":"")+(c.red?" red":"");x.textContent=c.r+c.s;b.appendChild(x)})}
function endWithoutWinner(){clearTimeout(timer);paused=true;selected=[];validWinners=[];verifyIndex=0;renderCalled("#exhaustedCalled");$("#exhaustedSummaryEs").textContent=`Se llamaron las ${called.length} cartas válidas de esta ronda. No se otorgan puntos.`;$("#exhaustedSummaryEn").textContent=`All ${called.length} eligible cards for this round were called. No points awarded.`;show("exhausted")}
function renderVerify(){const idx=selected[verifyIndex],p=players[idx],last=called[called.length-1];$("#verifyProgress").textContent=`${verifyIndex+1} / ${selected.length}`;$("#verifyName").textContent="🔍 "+p.name;$("#verifyLastCard").textContent=cardText(last);$("#verifyLastCard").classList.toggle("red",!!last?.red);renderCalled();show("verify")}
function confetti(amount=60){const box=$("#confetti"),colors=["#f6c64c","#d53b35","#2d8a63","#2e79a0","#e05d8d","#f18b2c"];box.innerHTML="";for(let i=0;i<amount;i++){const p=document.createElement("i");p.className="confetti-piece";p.style.left=Math.random()*100+"vw";p.style.setProperty("--c",colors[i%colors.length]);p.style.setProperty("--d",(2.3+Math.random()*2.2)+"s");p.style.setProperty("--r",(Math.random()*180)+"deg");p.style.setProperty("--x",((Math.random()-.5)*180)+"px");p.style.animationDelay=(Math.random()*.7)+"s";box.appendChild(p)}setTimeout(()=>box.innerHTML="",5200)}
function finishVerification(){const r=rounds[round];validWinners.forEach(i=>players[i].score+=r.pts);const n=validWinners.length;if(n===1){$("#celebration").textContent="¡ALDELIR!";$("#celebrationEn").textContent="ONE WINNER!"}else if(n===2){$("#celebration").textContent="¡DOBLE ALDELIR!";$("#celebrationEn").textContent="DOUBLE ALDELIR!"}else if(n===3){$("#celebration").textContent="¡TRIPLE ALDELIR!";$("#celebrationEn").textContent="TRIPLE ALDELIR!"}else if(n>=4){$("#celebration").textContent="¡MEGA ALDELIR!";$("#celebrationEn").textContent=n+" WINNERS!"}else{$("#celebration").textContent="¡FALSA ALARMA!";$("#celebrationEn").textContent="NO VALID WINNERS"}$("#winnerNames").textContent=n?validWinners.map(i=>players[i].name).join(" • "):"Nadie / Nobody";$("#resultPts").textContent=n?`Cada ganador: ⭐ +${r.pts} / Each winner: +${r.pts}`:"Sin puntos / No points";board("#resultBoard");$("#nextRound").textContent=n===0?"VOLVER A LA RONDA / RETURN TO ROUND":round===rounds.length-1?"🏆 VER CAMPEÓN / SEE CHAMPION":"SIGUIENTE RONDA / NEXT ROUND ›";show("result");if(n){$("#celebrationPanel").classList.remove("celebrate");void $("#celebrationPanel").offsetWidth;$("#celebrationPanel").classList.add("celebrate");confetti(n>=4?120:n===3?100:n===2?80:60)}}
function verifyDecision(ok){if(ok)validWinners.push(selected[verifyIndex]);verifyIndex++;if(verifyIndex<selected.length)renderVerify();else finishVerification()}
function champion(){const rows=ranked(),best=rows[0].p.score,w=rows.filter(x=>x.p.score===best).map(x=>x.p);if(w.length===1){$("#champTitleEs").textContent="CAMPEÓN DE LA FAMILIA";$("#champTitleEn").textContent="FAMILY CHAMPION";$("#champName").textContent=w[0].name;$("#champMessage").innerHTML="¡Campeón de Aldelir!<br>Aldelir Family Champion!"}else{$("#champTitleEs").textContent="¡CAMPEONES COMPARTIDOS!";$("#champTitleEn").textContent="SHARED FAMILY CHAMPIONS!";$("#champName").textContent=w.map(x=>x.name).join(" + ");$("#champMessage").innerHTML=`¡Empate por el campeonato entre ${w.length} jugadores!<br>${w.length}-way tie for the Aldelir championship!`}$("#champScore").textContent=`⭐ ${best} PUNTOS / POINTS`;board("#finalBoard");show("champion");confetti(150)}
setupCounts();
$("#setupNext").onclick=()=>{makeNames();show("names")};
$("#namesNext").onclick=()=>{const v=$$("#nameFields input").map(x=>x.value.trim());if(v.some(x=>!x)||new Set(v.map(x=>x.toLowerCase())).size!==v.length){$("#nameErr").textContent="Completa nombres únicos / Enter unique names";return}players=v.map(name=>({name,score:0}));round=0;dealScreen()};
$("#dealReady").onclick=intro;
$("#roundStart").onclick=()=>{buildDeck();paused=false;$("#pause").innerHTML="⏸ PAUSA <small>PAUSE</small>";board("#scores");const r=rounds[round];$("#liveRound").textContent=`${r.icon} ${r.es} / ${r.en}`;$("#specialHint").innerHTML=`<strong>🎯 RETO / ROUND RULES · ⭐ ${r.pts}</strong><div>${escapeHtml(r.oes)}</div><div class="english">${escapeHtml(r.oen)}</div><div class="call-pool">${r.poolEs||"Todos los palos"} / ${r.poolEn||"All suits"}</div><small>Al completar el reto, grita ¡ALDELIR! / Call ALDELIR when you finish.</small>`;$("#callNum").textContent=`0 / ${deck.length} llamadas / calls`;["#rank","#cornerRank1","#cornerRank2"].forEach(x=>$(x).textContent="?");$("#suit").textContent="♠";$("#cornerSuit1").textContent="♠";$("#cornerSuit2").textContent="♠";$("#playingCard").classList.remove("red-card");$("#cardEs").textContent="PREPARADOS...";$("#cardEn").textContent="GET READY...";show("game");startCallsAfterIntro()};
$("#pause").onclick=()=>{paused=!paused;$("#pause").innerHTML=paused?"▶ CONTINUAR <small>RESUME</small>":"⏸ PAUSA <small>PAUSE</small>";if(paused)clearTimeout(timer);else schedule()};
$("#speed").onchange=()=>{if(!paused)schedule()};
$("#alvarez").onclick=()=>{if(!called.length)return;clearTimeout(timer);paused=true;selected=[];validWinners=[];verifyIndex=0;const last=called[called.length-1];$("#claimLastCard").textContent=cardText(last);$("#claimLastCard").classList.toggle("red",last.red);const b=$("#claimers");b.innerHTML="";players.forEach((p,i)=>{const x=document.createElement("button");x.type="button";x.className="claimer";x.textContent=p.name;x.onclick=()=>{const at=selected.indexOf(i);if(at>=0){selected.splice(at,1);x.classList.remove("selected");x.textContent=p.name}else{selected.push(i);x.classList.add("selected");x.textContent="✓ "+p.name}$("#claimErr").textContent=""};b.appendChild(x)});show("claim")};
$("#verifyClaims").onclick=()=>{if(!selected.length){$("#claimErr").textContent="Selecciona al menos un jugador / Select at least one player";return}verifyIndex=0;validWinners=[];renderVerify()};
$("#invalid").onclick=()=>verifyDecision(false);
$("#valid").onclick=()=>verifyDecision(true);
$("#nextRound").onclick=()=>{if(validWinners.length===0){paused=false;show("game");schedule();return}if(round===rounds.length-1)champion();else{round++;paused=false;selected=[];validWinners=[];dealScreen()}};
$("#replayRound").onclick=()=>{clearTimeout(timer);paused=false;selected=[];validWinners=[];verifyIndex=0;dealScreen()};
$("#newGame").onclick=()=>{players=[];round=0;selected=[];validWinners=[];pc=6;setTheme();setupCounts();show("setup")};
})();