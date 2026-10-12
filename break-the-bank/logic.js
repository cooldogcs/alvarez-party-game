(function(root){
'use strict';
function total(cards){let sum=0,aces=0;for(const c of cards){if(c.rank==='A'){sum+=11;aces++;}else sum+=['J','Q','K'].includes(c.rank)?10:Number(c.rank);}while(sum>21&&aces){sum-=10;aces--;}return sum;}
function deck(){const cards=[];for(const suit of ['♠','♥','♦','♣'])for(const rank of ['A','2','3','4','5','6','7','8','9','10','J','Q','K'])cards.push({rank,suit});for(let i=cards.length-1;i>0;i--){const random=new Uint32Array(1);let n;const limit=Math.floor(4294967296/(i+1))*(i+1);do{crypto.getRandomValues(random);n=random[0];}while(n>=limit);const j=n%(i+1);[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
function settle(players,bank,stakes,results,round){
if(players.length!==stakes.length||players.length!==results.length)throw Error('Missing player results');
const balances=players.map(p=>p.chips),paid=players.map(()=>0);let available=bank;
for(let i=0;i<players.length;i++){if(!Number.isInteger(stakes[i])||stakes[i]<0||stakes[i]>Math.min(3,balances[i])||(balances[i]>0&&stakes[i]<1))throw Error('Invalid stake');if(stakes[i]&&!['win','win21','draw','loss'].includes(results[i]))throw Error('Choose a result for every player');if(stakes[i]&&results[i]==='loss'){balances[i]-=stakes[i];available+=stakes[i];}}
// Give each winner one chip per pass; rotate priority each round for a short final bank.
let claims=stakes.map((s,i)=>results[i]==='win21'?s*2:results[i]==='win'?s:0);
while(available>0&&claims.some(Boolean)){for(let offset=0;offset<players.length&&available>0;offset++){const i=(round-1+offset)%players.length;if(claims[i]){claims[i]--;paid[i]++;balances[i]++;available--;}}}
return {bank:available,players:players.map((p,i)=>({...p,chips:balances[i]})),paid,short:claims.some(Boolean)};
}
const api={total,deck,settle};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BankLogic=api;
})(typeof window!=='undefined'?window:globalThis);
