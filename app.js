/* Daily Journal — cœur de l'appli : données, vues, onglets */
const K='maSemaine_v1';
let S=JSON.parse(localStorage.getItem(K)||'null')||{tasks:[],done:{},stars:0,hist:[],memo:'',weights:[],sess:{},goal:3,cat:[{id:1,name:'Croquettes 🥣',buys:[]},{id:2,name:'Litière 🪣',buys:[]},{id:3,name:'Pâtée 🐟',buys:[]}],reviews:{}};
S.tasks.forEach(t=>{if(t.cat==='Admin')t.cat='Administratif'});
if(!S.postits){S.postits=S.memo?[{id:1,t:S.memo,c:0}]:[{id:1,t:'',c:0}]}
let SOBER=false;try{SOBER=localStorage.getItem('maSemaine_sober')==='1'}catch(e){}
const SUN='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',MOON='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
function applySober(){document.body&&document.body.classList&&document.body.classList.toggle('sober',SOBER);const b=document.getElementById('modeBtn');if(b){b.classList.toggle('on',SOBER);b.setAttribute('aria-checked',SOBER?'true':'false');const k=b.querySelector('.knob');if(k)k.innerHTML=SOBER?MOON:SUN}
  try{let m=document.querySelector('meta[name=theme-color]');if(m)m.content=SOBER?'#1d1a1f':'#fdf1f5'}catch(e){}}
function toggleSober(){SOBER=!SOBER;try{localStorage.setItem('maSemaine_sober',SOBER?'1':'0')}catch(e){}applySober()}
const STK_DEF=[['car','🚗','Conduite'],['shop','🛒','Courses'],['rdv','📅','Rendez-vous'],['doc','🩺','Médecin'],['psy','💬','Psy'],['gym','🏋️','Salle'],['sport','🏃‍♀️','Sport'],
 ['crea','🎨','Loisirs créatifs'],['croch','🧶','Crochet'],['trip','✈️','Voyage'],['out','🎉','Sortie prévue'],['diner','🍷','Dîner entre amis'],['cine','🎬','Cinéma'],
 ['buy','🛍️','Shopping'],['skin','🧴','Skincare'],['clean','🧹','Ménage'],['wash','🧺','Lessive'],['cat','🐱','Chat'],['duo','💕','Soirée à deux'],
 ['fam','👯','Amis / famille'],['resto','🍽️','Resto'],['rest','🛋️','Repos']].map(([id,e,n])=>({id,e,n}));
if(!S.stkDefs)S.stkDefs=STK_DEF;if(!S.stk)S.stk={};
if(!S.stkV2){if(!S.stkDefs.some(x=>x.id==='doc')){const i=S.stkDefs.findIndex(x=>x.id==='rdv');S.stkDefs.splice(i+1,0,{id:'doc',e:'🩺',n:'Médecin'})}S.stkV2=1}
const stkOf=ds=>(S.stk[ds]||[]).map(id=>S.stkDefs.find(x=>x.id===id)).filter(Boolean);
function toggleStk(ds,id){const a=S.stk[ds]||[];S.stk[ds]=a.includes(id)?a.filter(x=>x!==id):[...a,id];if(!S.stk[ds].length)delete S.stk[ds];save();render()}
let stkEdit=false;
function addStk(){openSheet(`<h3>Nouveau sticker</h3><span class="fl">Emoji</span><input id="f_se" placeholder="ex : 🎤" style="width:100px;font-size:24px;text-align:center" autofocus>
  <span class="fl">Nom</span><input id="f_sn" placeholder="ex : Karaoké">
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveStk()">Ajouter</button></div>`)}
function saveStk(){const e=$v('f_se').trim(),n=$v('f_sn').trim();if(!e||!n){alert('Indique un emoji et un nom 🌸');return}
  S.stkDefs.push({id:'u'+uid(),e,n});stkEdit=false;save();closeSheet();render()}
function delStk(id){snap('Sticker supprimé');S.stkDefs=S.stkDefs.filter(x=>x.id!==id);for(const k in S.stk){S.stk[k]=S.stk[k].filter(x=>x!==id);if(!S.stk[k].length)delete S.stk[k]}save();render()}
function stickerCard(ds,title,key='stk'){const on=S.stk[ds]||[],mine=stkOf(ds);
  return `<div class="card"${FA(key,mine.length?mine.map(d=>d.e).join('  '):'Aucun sticker pour l’instant')}><div class="row"><h2 style="margin:0">${title}</h2><span class="sp"></span><button class="btn s" onclick="stkEdit=!stkEdit;render()">${stkEdit?'Terminé':'Modifier'}</button></div>
  <div class="mut" style="margin:4px 0 10px">${stkEdit?'Touche la croix pour retirer un sticker de la liste, ou ajoute le tien.':'Touche ce que tu fais ce jour-là, ça apparaît dans ta semaine et ton mois.'}</div>
  <div class="stks">${S.stkDefs.map(d=>stkEdit?`<button class="stk" onclick="delStk('${d.id}')"><span class="se">${esc(d.e)}</span><span class="sn">${esc(d.n)}</span><span class="sx">✕</span></button>`
    :`<button class="stk ${on.includes(d.id)?'on':''}" onclick="toggleStk('${ds}','${d.id}')"><span class="se">${esc(d.e)}</span><span class="sn">${esc(d.n)}</span></button>`).join('')}
  ${stkEdit?'<button class="stk add" onclick="addStk()"><span class="se">＋</span><span class="sn">Nouveau</span></button>':''}</div></div>`}
const stkLine=(ds,cls)=>{const l=stkOf(ds);return l.length?`<div class="${cls}">${l.map(d=>`<span title="${esc(d.n)}">${esc(d.e)}</span>`).join('')}</div>`:''};
if(!S.sub)S.sub={};if(!S.tpl)S.tpl=[];if(!S.lastDone)S.lastDone={};if(!S.wishCfg)S.wishCfg={wait:7};if(!S.bud)S.bud={tx:[],fixed:[],limits:{}};if(!S.wish)S.wish=[];if(!S.created)S.created=Date.now();
/* États propres à chaque appareil : ne voyagent plus avec la synchro */
let FOLD=(()=>{try{return JSON.parse(localStorage.getItem('maSemaine_fold')||'null')}catch(e){return null}})();if(!FOLD){FOLD=S.fold||{};try{localStorage.setItem('maSemaine_fold',JSON.stringify(FOLD))}catch(e){}}
const saveFold=()=>{try{localStorage.setItem('maSemaine_fold',JSON.stringify(FOLD))}catch(e){}};
let NOTIF=(()=>{try{return JSON.parse(localStorage.getItem('maSemaine_notified')||'{}')}catch(e){return{}}})();
/* Ménage des données qui grossissaient sans servir */
delete S.fold;delete S.notified;
if(S.hist&&S.hist.length)S.hist=S.hist.filter(h=>h.real!=null).slice(0,300);
(()=>{const lim=(()=>{const d=new Date();d.setDate(d.getDate()-90);return d.toISOString().slice(0,10)})();for(const k in S.sub){const ds=k.split('|')[1];if(ds!=='x'&&ds<lim)delete S.sub[k]}})();
const save=()=>{if(window.MS_BOOT){S._mt=Date.now();try{localStorage.setItem('maSemaine_dirty','1')}catch(e){}}localStorage.setItem(K,JSON.stringify(S));try{syncPush()}catch(e){}try{if(UNDO&&Date.now()-lastSnap>400){UNDO=null;const el=document.getElementById('toast');if(el)el.classList.remove('show')}}catch(e){}};
const CATS=['Perso','Maison','Administratif','Sport','Chat'];
const JOURS=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const uid=()=>Date.now()+Math.floor(Math.random()*999);
const iso=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const P=s=>{const[a,b,c]=s.split('-');return new Date(a,b-1,c)};
const add=(s,n)=>{const d=P(s);d.setDate(d.getDate()+n);return iso(d)};
const TODAY=()=>iso(new Date());
const monday=s=>{const d=P(s);const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return iso(d)};
const isoWeek=s=>{const d=P(s);d.setDate(d.getDate()+3-((d.getDay()+6)%7));const y=d.getFullYear();const j4=new Date(y,0,4);return{w:1+Math.round(((d-j4)/864e5-3+((j4.getDay()+6)%7))/7),y}};
const weekStart=(w,y)=>{const j4=iso(new Date(y,0,4));return add(monday(j4),(w-1)*7)};
const weeksIn=y=>isoWeek(iso(new Date(y,11,28))).w;
const YEARS=()=>{const c=new Date().getFullYear(),a=[];for(let y=c-5;y<=c+3;y++)a.push(y);return a};
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const fr=s=>P(s).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tab=(()=>{try{const t=sessionStorage.getItem('maSemaine_tab');sessionStorage.removeItem('maSemaine_tab');return t||'Accueil'}catch(e){return'Accueil'}})(),curDay=TODAY(),curWeek=monday(TODAY()),curMonth=TODAY().slice(0,7);

function occurs(t,ds){
  if(!t.recur) return t.date===ds;
  if(ds<t.recur.start) return false;
  const d=P(ds),r=t.recur;
  if(r.type==='daily') return true;
  if(r.type==='weekly') return r.days.includes(d.getDay());
  if(r.type==='biweekly'){const w=Math.round((P(monday(ds))-P(monday(r.start)))/6048e5);return w%2===0&&r.days.includes(d.getDay())}
  if(r.type==='every'){const n=Math.round((P(ds)-P(r.start))/864e5);return n%(r.n||2)===0}
  if(r.type==='monthly') return d.getDate()===P(r.start).getDate();
  return false}
const tasksOn=ds=>S.tasks.filter(t=>occurs(t,ds)).sort((a,b)=>((b.prio?1:0)-(a.prio?1:0))||((a.time||'99')<(b.time||'99')?-1:(a.time||'99')>(b.time||'99')?1:0));
const isDone=(t,ds)=>!!S.done[t.id+'|'+ds];
function toggle(id,ds){const k=id+'|'+ds;if(!S.done[k])snap('Tâche cochée ✓');{const t0=S.tasks.find(x=>x.id==id);if(t0&&t0.cat==='Maison'&&!S.done[k]){const kk=t0.title.trim().toLowerCase();if(!S.lastDone[kk]||S.lastDone[kk]<ds)S.lastDone[kk]=ds}}if(S.done[k]){delete S.done[k];S.stars=Math.max(0,S.stars-1)}else{S.done[k]=Date.now();S.stars++;const t=S.tasks.find(x=>x.id==id)}save();render()}

function openSheet(html){let el=document.getElementById('sheet');if(!el){el=document.createElement('div');el.id='sheet';el.onclick=e=>{if(e.target===el)closeSheet()};document.body.appendChild(el)}
  el.innerHTML=`<div class="pan"><div class="grab"></div>${html}</div>`;el.classList.add('open');const f=el.querySelector('[autofocus]');if(f)setTimeout(()=>f.focus(),60)}
function closeSheet(){const el=document.getElementById('sheet');if(el){el.classList.remove('open');el.innerHTML=''}}
const $v=id=>{const e=document.getElementById(id);return e?e.value:''};
const $c=id=>{const e=document.getElementById(id);return !!(e&&e.checked)};
const $r=n=>{const e=document.querySelector(`input[name="${n}"]:checked`);return e?e.value:null};
function taskForm(t,o={}){const isNew=!t;t=t||{title:'',dur:null,cat:o.cat||'Perso',prio:false,date:o.date??null,recur:o.recur||null,time:'',subs:[]};
  const rec=t.recur,rt=rec?rec.type:'daily',days=rec?rec.days:[(P(TODAY()).getDay())];
  openSheet(`<h3>${isNew?(o.recur?'Nouvelle routine':'Nouvelle tâche'):'Modifier'}</h3>
  <input id="f_t" placeholder="Qu'est-ce que tu dois faire ?" value="${esc(t.title)}" ${isNew?'autofocus':''}>
  <span class="fl">Catégorie</span><div class="chips">${CATS.map(c=>`<label class="chip c-${c}"><input type="radio" name="f_cat" value="${c}" ${c===t.cat?'checked':''}><span>${c}</span></label>`).join('')}</div>
  <span class="fl">Durée (facultatif)</span><div class="row"><input id="f_d" type="number" inputmode="numeric" min="1" placeholder="minutes" value="${t.dur||''}" style="width:120px"><div class="qk">${[5,15,30,60].map(m=>`<button class="btn s" onclick="document.getElementById('f_d').value=${m}">${m} min</button>`).join('')}<button class="btn s" onclick="document.getElementById('f_d').value=''">Aucune</button></div></div>
  <span class="fl">Heure (facultatif, pour la frise du jour)</span><input id="f_h" type="time" value="${t.time||''}" style="width:150px">
  <span class="fl">Quand ?</span><div class="chips"><label class="chip"><input type="checkbox" id="f_rep" ${rec?'checked':''} onchange="document.getElementById('f_once').classList.toggle('hide2',this.checked);document.getElementById('f_recb').classList.toggle('hide2',!this.checked)"><span>🔁 Ça se répète</span></label>
   <label class="chip"><input type="checkbox" id="f_p" ${t.prio?'checked':''}><span>⭐ Prioritaire</span></label></div>
  <div id="f_once" class="${rec?'hide2':''}" style="margin-top:8px"><input id="f_date" type="date" value="${t.date||''}"><div class="mut" style="margin-top:4px">Laisse vide pour la mettre dans ta to-do générale.</div></div>
  <div id="f_recb" class="${rec?'':'hide2'}" style="margin-top:8px"><select id="f_fq" onchange="document.getElementById('f_days').classList.toggle('hide2',!['weekly','biweekly'].includes(this.value));document.getElementById('f_every').classList.toggle('hide2',this.value!=='every')">
   ${[['daily','Tous les jours'],['weekly','Certains jours chaque semaine'],['biweekly','Une semaine sur deux'],['every','Tous les X jours'],['monthly','Une fois par mois']].map(([v,l])=>`<option value="${v}" ${v===rt?'selected':''}>${l}</option>`).join('')}</select>
   <div id="f_days" class="chips ${['weekly','biweekly'].includes(rt)?'':'hide2'}" style="margin-top:8px">${[1,2,3,4,5,6,0].map(d=>`<label class="chip"><input type="checkbox" name="f_day" value="${d}" ${days.includes(d)?'checked':''}><span>${JOURS[d]}</span></label>`).join('')}</div>
   <div id="f_every" class="${rt==='every'?'':'hide2'}" style="margin-top:8px">Tous les <input id="f_n" type="number" inputmode="numeric" min="2" value="${(rec&&rec.n)||3}" style="width:80px;display:inline-block;padding:6px 8px"> jours</div>
   <div class="mut" style="margin-top:6px">À partir du <input id="f_start" type="date" value="${rec?rec.start:(o.date||TODAY())}" style="width:auto;display:inline-block;padding:4px 8px"></div></div>
  <span class="fl">Petites étapes (facultatif)</span><textarea id="f_s" placeholder="Une étape par ligne&#10;ex : vêtements&#10;bureau&#10;sol">${esc((t.subs||[]).map(x=>x.t).join('\n'))}</textarea>
  <div class="fbtns">${isNew?'':`<button class="btn d" onclick="closeSheet();delTask(${t.id})">Supprimer</button>`}<button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveTask(${isNew?'null':t.id})">Enregistrer</button></div>`)}
function saveTask(id){const title=$v('f_t').trim();if(!title){alert('Donne un nom à ta tâche 🌸');return}
  const t=id?S.tasks.find(x=>x.id==id):{id:uid()};const oldSubs=t.subs||[];
  t.title=title;t.cat=$r('f_cat')||'Perso';t.dur=parseInt($v('f_d'))||null;t.time=$v('f_h')||'';t.prio=$c('f_p');
  if($c('f_rep')){const type=$v('f_fq');let days=[...document.querySelectorAll('input[name="f_day"]:checked')].map(x=>+x.value);
    if(['weekly','biweekly'].includes(type)&&!days.length){alert('Choisis au moins un jour');return}
    t.recur={type,days,start:$v('f_start')||TODAY()};if(type==='every')t.recur.n=Math.max(2,parseInt($v('f_n'))||3);t.date=null}
  else{t.recur=null;t.date=$v('f_date')||null}
  t.subs=$v('f_s').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const o=oldSubs.find(y=>y.t===x);return o||{id:'s'+uid(),t:x}});
  if(!id)S.tasks.push(t);save();closeSheet();render()}
function newTask(o={}){taskForm(null,o)}
function newRoutine(){taskForm(null,{recur:{type:'daily',days:[],start:TODAY()}})}
function editTask(id){taskForm(S.tasks.find(x=>x.id==id))}
function dateSheet(title,def,cb,extra='',past=false){window._dcb=cb;openSheet(`<h3>${title}</h3>${extra}<input id="f_ds" type="date" value="${def}">
  <div class="qk"><button class="btn s" onclick="document.getElementById('f_ds').value=TODAY()">Aujourd'hui</button>${past?`<button class="btn s" onclick="document.getElementById('f_ds').value=add(TODAY(),-1)">Hier</button><button class="btn s" onclick="document.getElementById('f_ds').value=add(TODAY(),-2)">Avant-hier</button>`:`<button class="btn s" onclick="document.getElementById('f_ds').value=add(TODAY(),1)">Demain</button><button class="btn s" onclick="document.getElementById('f_ds').value=add(monday(TODAY()),7)">Lundi prochain</button>`}</div>
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="const d=$v('f_ds');if(!d)return;closeSheet();window._dcb(d)">Valider</button></div>`)}
function planTask(id){dateSheet('Pour quel jour ?',TODAY(),d=>{snap('Tâche déplacée');S.tasks.find(x=>x.id==id).date=d;save();render()})}
function postpone(id){snap('Tâche reportée');const t=S.tasks.find(x=>x.id==id);t.date=(!t.date||t.date<=TODAY())?add(TODAY(),1):add(t.date,1);save();render()}
function subKey(t,ds,sid){return t.id+'|'+(ds||'x')+'|'+sid}
function toggleSub(id,ds,sid){const t=S.tasks.find(x=>x.id==id),k=subKey(t,ds==='null'?null:ds,sid);if(S.sub[k])delete S.sub[k];else S.sub[k]=1;
  if(ds!=='null'&&t.subs.every(x=>S.sub[subKey(t,ds,x.id)])&&!isDone(t,ds)){save();toggle(id,ds);return}save();render()}
function subsHtml(t,ds){if(!t.subs||!t.subs.length)return'';return `<div class="subs">${t.subs.map(x=>{const on=!!S.sub[subKey(t,ds,x.id)];return `<div class="sub ${on?'on':''}"><button class="chk ${on?'on':''}" onclick="toggleSub(${t.id},'${ds}','${x.id}')">${on?'✓':''}</button><span>${esc(x.t)}</span></div>`}).join('')}</div>`}
const subCount=(t,ds)=>t.subs&&t.subs.length?`<span class="pill">${t.subs.filter(x=>S.sub[subKey(t,ds,x.id)]).length}/${t.subs.length} étapes</span>`:'';
function delTask(id){snap('Tâche supprimée');S.tasks=S.tasks.filter(x=>x.id!=id);save();render()}


function taskRow(t,ds,opts=''){
  const dn=ds&&isDone(t,ds);
  return `<div class="task ${dn?'done':''}">${ds?`<button class="chk ${dn?'on':''}" onclick="toggle(${t.id},'${ds}')">${dn?'✓':''}</button>`:(!t.recur?`<button class="chk" onclick="doneUndated(${t.id})"></button>`:'')}
  <div class="sp"><div class="row"><span class="tt">${t.prio?'⭐ ':''}${esc(t.title)}</span><span class="sp"></span>${t.time?`<span class="pill">🕐 ${t.time}</span>`:''}${t.dur?`<span class="pill">${t.dur} min</span>`:''}</div>
  ${dn?subCount(t,ds):subsHtml(t,ds)}<div class="row" style="margin-top:6px"><span class="pill cat-${t.cat}">${t.cat}</span>${t.recur?'<span class="pill">🔁</span>':''}
  ${!dn?`<button class="btn s" onclick="startFocus(${t.id},'${ds||TODAY()}')">🎯 Focus</button>`:''}${ds&&!dn&&!t.recur?`<button class="btn s" onclick="postpone(${t.id})">${t.date<=TODAY()?'➡️ Demain':'➡️ +1 jour'}</button>`:''}${opts}
  <button class="btn s" onclick="editTask(${t.id})">Modifier</button></div></div></div>`}

const MSG=['Une étape à la fois ! ✨','Même 5 minutes, ça compte 💗','Tu fais de ton mieux, et c\'est déjà beaucoup 🌸','Petit pas aujourd\'hui, grande fierté demain 🌷'];

function routineLine(t,ds){const dn=isDone(t,ds),st=streak(t);
  return `<div class="rline ${dn?'done':''}"><button class="chk ${dn?'on':''}" onclick="toggle(${t.id},'${ds}')">${dn?'✓':''}</button><span class="tt">${t.prio?'⭐ ':''}${esc(t.title)}${!dn?subsHtml(t,ds):''}</span>${t.time?`<span class="pill">🕐 ${t.time}</span>`:''}${dn?subCount(t,ds):''}${st?`<span class="pill">🔥 ${st}</span>`:''}${t.dur?`<span class="pill">${t.dur} min</span>`:''}${!dn?`<button class="btn s" onclick="startFocus(${t.id},'${ds}')">🎯</button>`:''}</div>`}
function vAccueil(){const ds=curDay,isT=ds===TODAY(),d=P(ds),all=tasksOn(ds),rt=all.filter(t=>t.recur),tk=all.filter(t=>!t.recur),done=all.filter(t=>isDone(t,ds)).length,pc=all.length?Math.round(done/all.length*100):0,rdone=rt.filter(t=>isDone(t,ds)).length;
  return `<div class="card"><span class="stick" style="right:14px;top:6px">🌷</span><span class="stick" style="right:52px;top:14px;font-size:20px">✨</span>
  <div class="row" style="margin-top:26px;flex-wrap:nowrap"><button class="btn" onclick="curDay=add(curDay,-1);render()" aria-label="Jour précédent">‹</button><input type="date" value="${ds}" onchange="if(this.value){curDay=this.value;render()}" style="flex:1;min-width:0;max-width:190px;margin:0 auto;padding:6px 8px;font-size:13px;text-align:center" aria-label="Choisir un jour"><button class="btn" onclick="curDay=add(curDay,1);render()" aria-label="Jour suivant">›</button></div>
  ${isT?'':`<div style="text-align:center;margin-top:8px"><button class="btn s" onclick="curDay=TODAY();render()">↩️ Revenir à aujourd'hui</button></div>`}
  <div class="ph" style="padding-top:14px"><div class="stamp"><div><b>${d.getDate()}</b><small>${['JANV','FÉV','MARS','AVR','MAI','JUIN','JUIL','AOÛT','SEPT','OCT','NOV','DÉC'][d.getMonth()]}</small></div></div>
  <div><div class="wd">${d.toLocaleDateString('fr-FR',{weekday:'long'})}</div><div class="mo">${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()} · semaine ${isoWeek(ds).w}</div></div></div>
  <div class="boost" style="margin-top:16px">${MSG[d.getDate()%MSG.length]}</div>
  <div class="bar" style="margin-top:14px"><i style="width:${pc}%"></i></div><div class="row mut" style="margin-top:6px"><span>${done}/${all.length} fait ${isT?'aujourd\'hui':'ce jour-là'}</span><span class="sp"></span><span>⭐ ${S.stars} étoiles</span></div></div>
  ${F.id&&S.tasks.some(x=>x.id==F.id)?`<div class="boost" style="margin:14px 0;display:flex;align-items:center;gap:10px"><span class="sp">🎯 ${esc(S.tasks.find(x=>x.id==F.id).title)}</span><button class="btn p" onclick="go('Focus')">Reprendre</button></div>`:''}
  ${isT?backupCard()+catAlerts():''}
  <div class="card"${FA('acc-rout',rt.length?`${rdone}/${rt.length} faites`+(rt.filter(t=>!isDone(t,ds)).length?' · reste : '+firstTitles(rt.filter(t=>!isDone(t,ds))):' · tout est fait 🎉'):'Pas de routine ce jour-là')}><div class="row"><h2 style="margin:0">☀️ Ma routine</h2><span class="sp"></span><span class="lbl">${rdone}/${rt.length}</span></div>
  <div style="margin-top:8px">${rt.map(t=>routineLine(t,ds)).join('')||'<p class="mut">Pas de routine ce jour-là.</p>'}</div>
  <div class="row" style="margin-top:10px"><button class="btn" onclick="newRoutine()">+ Routine</button><button class="btn s" onclick="goOpen('To-do','rout')">Gérer mes routines</button></div></div>
  <div class="card"${FA('acc-todo',tk.length?`${tk.filter(t=>isDone(t,ds)).length}/${tk.length} faites`+(tk.filter(t=>!isDone(t,ds)).length?' · '+firstTitles(tk.filter(t=>!isDone(t,ds))):''):'Rien d’autre de prévu')}><div class="row"><h2 style="margin:0">📋 To-do du jour</h2><span class="sp"></span><button class="btn" onclick="newTask({date:curDay})">+ Ajouter</button></div>
  ${tk.map(t=>taskRow(t,ds)).join('')||'<p class="mut">Rien d\'autre de prévu, profite 🌸</p>'}
  <button class="btn" style="margin-top:10px" onclick="copyDay()">📋 Copier cette to-do vers un autre jour</button>
  <div class="row" style="margin-top:8px"><button class="btn s" onclick="tplApplySheet()">🗂️ Appliquer un modèle</button><button class="btn s" onclick="tplSaveSheet()">💾 Enregistrer comme modèle</button></div></div>
  ${isT?'<button class="btn p flemme" style="margin:0 0 6px" onclick="flemme()">🙈 J\'ai la flemme, choisis pour moi</button>':''}
  ${stickerCard(ds,'✨ Ma journée en stickers','acc-stk')}
  ${timeline(ds)}
  <div class="card"${FA('acc-pi',(()=>{const f=S.postits.filter(n=>n.t.trim());return f.length?f.length+' post-it · '+f[0].t.trim().split('\n')[0].slice(0,40):'Aucune note'})())}><div class="row"><h2 style="margin:0">💖 Pense-bête</h2><span class="sp"></span><button class="btn" onclick="addPostit()">+ Post-it</button></div>
  <div class="postits">${S.postits.map(n=>`<div class="pi c${n.c}"><button class="x" onclick="delPostit(${n.id})">✕</button><textarea placeholder="Note ici..." oninput="S.postits.find(x=>x.id==${n.id}).t=this.value;save();growPi(this)">${esc(n.t)}</textarea></div>`).join('')}</div></div>`}
function addPostit(){S.postits.push({id:uid(),t:'',c:S.postits.length%5});save();render()}
function delPostit(id){snap('Post-it supprimé');S.postits=S.postits.filter(x=>x.id!=id);save();render()}

function vMois(){const [y,m]=curMonth.split('-').map(Number);const first=new Date(y,m-1,1);let d=monday(iso(first));const cells=[];
  for(let i=0;i<42;i++){const ds=add(d,i);const l=tasksOn(ds);
    cells.push(`<div class="mday ${ds.slice(0,7)!==curMonth?'out':''} ${ds===TODAY()?'today':''}" onclick="curDay='${ds}';go('Accueil')"><b>${P(ds).getDate()}</b>${stkLine(ds,'mstk')}${l.slice(0,3).map(t=>`<span class="dot cat-${t.cat}" style="${isDone(t,ds)?'text-decoration:line-through;opacity:.6':''}">${esc(t.title)}</span>`).join('')}${l.length>3?`<span class="mut">+${l.length-3}</span>`:''}</div>`)}
  return `<div class="card"><div class="row"><button class="btn" onclick="shiftMonth(-1)">‹</button><span class="sp row" style="justify-content:center"><select class="sel" onchange="curMonth=${y}+'-'+String(+this.value+1).padStart(2,'0');render()">${MOIS.map((x,i)=>`<option value="${i}" ${i===m-1?'selected':''}>${x}</option>`).join('')}</select><select class="sel" onchange="curMonth=this.value+'-'+String(${m}).padStart(2,'0');render()">${YEARS().concat(YEARS().includes(y)?[]:[y]).sort().map(a=>`<option ${a===y?'selected':''}>${a}</option>`).join('')}</select></span><button class="btn" onclick="shiftMonth(1)">›</button></div>
  <div style="text-align:center;margin-top:8px"><button class="btn s" onclick="curMonth=TODAY().slice(0,7);render()">Aujourd'hui</button></div>
  <div class="grid7" style="margin-top:12px">${['L','M','M','J','V','S','D'].map(x=>`<div class="mut" style="text-align:center">${x}</div>`).join('')}${cells.join('')}</div></div>`}
function dragStart(e,id,from){e.preventDefault();const li=e.target.closest('li'),g=document.createElement('div');g.className='ghost';g.textContent=li.textContent.replace('⠿','');document.body.appendChild(g);li.classList.add('dragging');
  let over=null;const mv=ev=>{g.style.left=(ev.clientX+10)+'px';g.style.top=(ev.clientY-14)+'px';g.style.display='none';const el=document.elementFromPoint(ev.clientX,ev.clientY);g.style.display='';const wd=el&&el.closest('.wday');if(over&&over!==wd)over.classList.remove('drop');over=wd;if(wd)wd.classList.add('drop')};
  const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);g.remove();li.classList.remove('dragging');if(over)over.classList.remove('drop');
    if(over&&over.dataset.ds&&over.dataset.ds!==from){snap('Tâche déplacée');S.tasks.find(x=>x.id==id).date=over.dataset.ds;save();render()}};
  mv(e);window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)}
function shiftMonth(n){const[y,m]=curMonth.split('-').map(Number);curMonth=iso(new Date(y,m-1+n,1)).slice(0,7);render()}

function vSemaine(){let tot=0,dn=0;const days=[...Array(7)].map((_,i)=>{const ds=add(curWeek,i),l=tasksOn(ds);tot+=l.length;dn+=l.filter(t=>isDone(t,ds)).length;
  return `<div class="wday ${ds===TODAY()?'today':''}" data-ds="${ds}"><div class="row"><b style="text-transform:capitalize">${P(ds).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'})}</b><span class="sp"></span><button class="btn s" onclick="curDay='${ds}';go('Accueil')">Voir</button></div>${stkLine(ds,'wstk')}
  <ul class="wl">${l.map(t=>`<li style="${isDone(t,ds)?'text-decoration:line-through;color:#aaa':''}">${!t.recur?`<span class="dh" onpointerdown="dragStart(event,${t.id},'${ds}')">⠿</span>`:'<span class="dh off">🔁</span>'}${t.prio?'⭐':''}${esc(t.title)}</li>`).join('')||'<li class="mut">Libre 🌸</li>'}</ul></div>`});
  const wk=curWeek,rv=S.reviews[wk]||'',iw=isoWeek(curWeek);
  return `<div class="card"><div class="row"><button class="btn" onclick="curWeek=add(curWeek,-7);render()">‹</button><span class="sp" style="text-align:center"><h2 style="margin:0">Semaine ${iw.w}</h2><div class="mut">du ${P(curWeek).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} au ${P(add(curWeek,6)).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div></span><button class="btn" onclick="curWeek=add(curWeek,7);render()">›</button></div>
  <div class="row" style="justify-content:center;margin-top:10px"><select class="sel" onchange="curWeek=weekStart(+this.value,${iw.y});render()">${[...Array(weeksIn(iw.y))].map((_,i)=>`<option value="${i+1}" ${i+1===iw.w?'selected':''}>Semaine ${i+1}</option>`).join('')}</select><select class="sel" onchange="curWeek=weekStart(Math.min(${iw.w},weeksIn(+this.value)),+this.value);render()">${YEARS().concat(YEARS().includes(iw.y)?[]:[iw.y]).sort().map(a=>`<option ${a===iw.y?'selected':''}>${a}</option>`).join('')}</select><button class="btn s" onclick="curWeek=monday(TODAY());render()">Aujourd'hui</button></div>
  <div class="bar" style="margin-top:12px"><i style="width:${tot?dn/tot*100:0}%"></i></div><div class="mut" style="margin-top:6px">${dn}/${tot} tâches faites cette semaine</div></div>
  <div class="week">${days.join('')}</div>`}

function timeline(ds){const ts=tasksOn(ds).filter(t=>t.time);const PX=60;
  const h0=0,h1=24;let first=8;ts.forEach(t=>{first=Math.min(first,+t.time.split(':')[0])});
  const evs=ts.map(t=>{const[a,b]=t.time.split(':').map(Number),st=a*60+b;return{t,st,en:st+Math.max(t.dur||30,30)}}).sort((x,y)=>x.st-y.st);
  const cols=[];evs.forEach(e=>{let c=cols.findIndex(en=>en<=e.st);if(c<0){c=cols.length;cols.push(0)}cols[c]=e.en;e.c=c});const nc=Math.max(1,cols.length);
  const COL={Perso:'#ece2fd',Maison:'#fde4ee',Administratif:'#e6efff',Sport:'#e3f6ec',Chat:'#fff1dc'};
  const now=new Date(),nm=now.getHours()*60+now.getMinutes();
  return `<div class="card"${FA('tl',(()=>{if(!ts.length)return'Aucun créneau avec une heure';const nx=evs.find(e=>e.en>=(ds===TODAY()?nm:0)&&!isDone(e.t,ds));return ts.length+' créneau'+(ts.length>1?'x':'')+(nx?` · prochain : ${nx.t.time} ${nx.t.title}`:'')})())}><div class="row"><h2 style="margin:0">🕐 Ma journée</h2><span class="sp"></span><button class="btn s" onclick="newTask({date:'${ds}'})">+ Ajouter</button></div>
  ${ts.length?'':'<div class="mut">Ajoute une heure à une tâche pour la voir sur ta frise.</div>'}
  <div class="tlw" data-ds="${ds}" data-start="${(ds===TODAY()&&(nm<first*60||nm>21*60)?Math.max(0,Math.floor(nm/60)-1):first)*PX-6}" onscroll="TLS={ds:this.dataset.ds,top:this.scrollTop}"><div class="tl" style="height:${(h1-h0)*PX+8}px;margin-top:10px">${[...Array(h1-h0+1)].map((_,i)=>`<div class="h" style="top:${i*PX}px"><span>${String(h0+i).padStart(2,'0')}h</span></div>`).join('')}
  ${evs.map(e=>`<div class="ev ${isDone(e.t,ds)?'dn':''} cat-${e.t.cat}" onclick="editTask(${e.t.id})" style="top:${(e.st-h0*60)/60*PX+1}px;height:${(e.en-e.st)/60*PX-3}px;background:${COL[e.t.cat]};left:calc(46px + (100% - 50px)*${e.c}/${nc});right:auto;width:calc((100% - 50px)/${nc} - 4px)">${e.t.prio?'⭐ ':''}${esc(e.t.title)}<small>${e.t.time}${e.t.dur?' · '+e.t.dur+' min':''}</small></div>`).join('')}
  ${ds===TODAY()?`<div class="now" style="top:${(nm-h0*60)/60*PX}px"></div>`:''}</div></div><div class="mut" style="margin-top:6px;text-align:center">↕️ Fais défiler pour voir toute la journée</div></div>`}
function tplSaveSheet(){const l=S.tasks.filter(t=>!t.recur&&t.date===curDay);if(!l.length){alert('Ajoute d\'abord des tâches à ce jour, puis enregistre-le comme modèle 🌸');return}
  openSheet(`<h3>Nouveau modèle de journée</h3><div class="mut">${l.length} tâche${l.length>1?'s':''} : ${esc(l.map(t=>t.title).join(', '))}</div><span class="fl">Nom du modèle</span><input id="f_tn" placeholder="ex : Journée labo, Dimanche ménage…" autofocus>
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="tplSave()">Enregistrer</button></div>`)}
function tplSave(){const n=$v('f_tn').trim();if(!n){alert('Donne un nom à ton modèle');return}
  S.tpl.push({id:uid(),name:n,items:S.tasks.filter(t=>!t.recur&&t.date===curDay).map(t=>({title:t.title,cat:t.cat,dur:t.dur,time:t.time||'',prio:!!t.prio,subs:(t.subs||[]).map(x=>x.t)}))});save();closeSheet();render()}
function tplApplySheet(){openSheet(`<h3>Appliquer un modèle</h3><div class="mut">Les tâches du modèle seront ajoutées au ${fr(curDay)}.</div>
  ${S.tpl.length?S.tpl.map(m=>`<div class="task"><div class="sp"><div class="tt">${esc(m.name)}</div><div class="mut">${m.items.length} tâche${m.items.length>1?'s':''} · ${esc(m.items.slice(0,3).map(x=>x.title).join(', '))}${m.items.length>3?'…':''}</div></div><button class="btn p" onclick="tplApply(${m.id})">Ajouter</button><button class="btn s" onclick="tplDel(${m.id})">✕</button></div>`).join(''):'<p class="mut">Pas encore de modèle. Prépare une journée type, puis « Enregistrer comme modèle ».</p>'}
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Fermer</button></div>`)}
function tplApply(id){const m=S.tpl.find(x=>x.id==id);snap('Modèle appliqué');m.items.forEach(x=>S.tasks.push({id:uid(),title:x.title,cat:x.cat,dur:x.dur,time:x.time,prio:x.prio,date:curDay,recur:null,subs:x.subs.map(t=>({id:'s'+uid(),t}))}));save();closeSheet();render()}
function tplDel(id){snap('Modèle supprimé');S.tpl=S.tpl.filter(x=>x.id!=id);save();tplApplySheet()}
const norm=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function searchSheet(){openSheet(`<h3>Rechercher</h3><input id="f_q" placeholder="Tâche, envie, note…" autofocus oninput="searchRun(this.value)"><div id="sres" style="margin-top:8px"></div><div class="fbtns"><button class="btn p" onclick="closeSheet()">Fermer</button></div>`)}
function searchRun(q){q=norm(q).trim();const el=document.getElementById('sres');if(!q){el.innerHTML='';return}const r=[];
  S.tasks.forEach(t=>{if(norm(t.title).includes(q)||(t.subs||[]).some(x=>norm(x.t).includes(q)))r.push([t.recur?'🔁':'📝',t.title,t.recur?FREQ(t):t.date?fr(t.date):'Sans date',`openRes('t',${t.id})`])});
  S.wish.forEach(w=>{if(norm(w.name).includes(q))r.push(['🛍️',w.name,w.bought?'Déjà acheté':'Envie'+(w.price!=null?' · '+eur(w.price):''),`openRes('w',${w.id})`])});
  S.postits.forEach(n=>{if(norm(n.t).includes(q))r.push(['💖',n.t.split('\n')[0].slice(0,50),'Post-it',`openRes('p',${n.id})`])});
  (S.bud.tx||[]).forEach(x=>{if(norm(x.note).includes(q)||norm(x.cat).includes(q))r.push(['💶',(x.note||x.cat),fr(x.d)+' · '+eur(x.amt),`openRes('b',${x.id})`])});
  el.innerHTML=r.length?r.slice(0,40).map(x=>`<button class="sr" onclick="${x[3]}"><span style="font-size:20px">${x[0]}</span><span class="sp"><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></button>`).join(''):'<p class="mut">Rien trouvé 🌸</p>'}
function goOpen(t,k){if(k){FOLD[k]=1;saveFold()}closeSheet();if(tab===t)render();else go(t)}
function openRes(k,id){if(k==='t'){const t=S.tasks.find(x=>x.id==id);if(t.recur)goOpen('To-do','rout');else if(t.date){curDay=t.date;goOpen('Accueil','acc-todo')}else goOpen('To-do',t.cat==='Maison'?'todo-men':'todo-gen')}
  else if(k==='w')goOpen('Budget','ach-wish');else if(k==='p')goOpen('Accueil','acc-pi');else if(k==='b'){const x=S.bud.tx.find(y=>y.id==id);budMonth=x.d.slice(0,7);goOpen('Budget','bud-ops')}}
function copyDay(){dateSheet('Copier vers quel jour ?',add(curDay,1),to=>{S.tasks.filter(t=>!t.recur&&t.date===curDay).forEach(t=>S.tasks.push({...t,id:uid(),date:to,subs:(t.subs||[]).map(x=>({...x}))}));save();curDay=to;render()})}

const MENAGE=[['Aspirateur',30,7],['Serpillière',25,14],['Poussière',15,14],['Salle de bain',20,7],['Toilettes',10,7],['Cuisine & plan de travail',20,7],['Changer les draps',15,14],['Vitres',30,30],['Nettoyer le frigo',20,30],['Sortir les poubelles',5,3],['Ranger le salon',20,7],['Ranger la chambre',20,7]];
function lastDoneMap(){const m={...S.lastDone},byId={};S.tasks.forEach(t=>byId[t.id]=t);for(const k in S.done){const[id,ds]=k.split('|'),t=byId[id];if(!t)continue;const kk=t.title.trim().toLowerCase();if(!m[kk]||m[kk]<ds)m[kk]=ds}return m}
function addMenage(i){const[m,d]=MENAGE[i];S.tasks.push({id:uid(),title:m,dur:d,cat:'Maison',prio:false,date:null,recur:null,time:'',subs:[]});save();render()}
function menageDone(i){snap('Noté comme fait');S.lastDone[MENAGE[i][0].toLowerCase()]=TODAY();save();render()}
function menageChips(have){const ld=lastDoneMap(),td=P(TODAY());
  return MENAGE.map((m,i)=>{const l=ld[m[0].toLowerCase()],d=l?Math.round((td-P(l))/864e5):null,late=d===null||d>=m[2];return{m,i,d,late,r:d===null?1:d/m[2]}}).filter(x=>!have.has(x.m[0])).sort((a,b)=>b.r-a.r)
   .map(x=>`<div class="mchip ${x.late?'late':''}"><button class="mc-add" onclick="addMenage(${x.i})">+ ${x.m[0]}<small>${x.d===null?'jamais noté':x.d===0?'fait aujourd\'hui':'il y a '+x.d+' j'}</small></button><button class="mc-ok" title="Déjà fait aujourd'hui" onclick="menageDone(${x.i})">✓</button></div>`).join('')}
function doneUndated(id){snap('Tâche cochée ✓');const t=S.tasks.find(x=>x.id==id);t.date=TODAY();toggle(id,TODAY())}
function todoGroups(list){const td=TODAY(),pr=(a,b)=>((b.prio?1:0)-(a.prio?1:0))||((a.time||'99')<(b.time||'99')?-1:1);
  const und=list.filter(t=>!t.date).sort(pr),late=list.filter(t=>t.date&&t.date<td&&!isDone(t,t.date)).sort((a,b)=>a.date<b.date?-1:1),fut=list.filter(t=>t.date&&t.date>=td).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:pr(a,b));
  const lab=d=>d===td?'Aujourd\'hui':d===add(td,1)?'Demain':P(d).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  const row=t=>taskRow(t,t.date||null,`<button class="btn s" onclick="planTask(${t.id})">📅 ${t.date?'Changer le jour':'Choisir un jour'}</button>`);
  let h='';if(late.length)h+=`<div class="tgh late">⏰ En retard</div>`+late.map(t=>`<div class="mut" style="margin-top:4px">prévu ${lab(t.date)}</div>`+row(t)).join('');
  if(und.length)h+=`<div class="tgh">🗂️ Sans date</div>`+und.map(row).join('');
  let last='';fut.forEach(t=>{if(t.date!==last){last=t.date;h+=`<div class="tgh">📅 ${lab(t.date)}</div>`}h+=row(t)});
  return{h,n:und.length+late.length+fut.filter(t=>!isDone(t,t.date)).length,open:[...late,...und,...fut.filter(t=>!isDone(t,t.date))]}}
function vTodo(){const td=TODAY(),one=S.tasks.filter(t=>!t.recur&&(!t.date||t.date>=td||!isDone(t,t.date))),men=one.filter(t=>t.cat==='Maison'),l=one.filter(t=>t.cat!=='Maison');
  const G=todoGroups(l),M=todoGroups(men),have=new Set(M.open.map(t=>t.title));
  const sum=(g,empty)=>g.n?g.n+' à faire · '+firstTitles(g.open):empty;
  return `<div class="card"${FA('todo-gen',sum(G,'Rien en attente'))}><div class="row"><h2 style="margin:0">📝 Ma to-do générale</h2><span class="sp"></span><button class="btn p" onclick="newTask()">+ Ajouter</button></div>
  <div class="mut">Tout ce que tu as à faire, avec ou sans date. Une tâche avec une date apparaît aussi dans ce jour-là, et inversement.</div>
  ${G.h||'<p class="mut">Rien en attente, bravo 🌷</p>'}</div>
  <div class="card"${FA('todo-men',M.n?M.n+' à faire'+(M.open.some(t=>t.dur)?' · environ '+M.open.reduce((a,t)=>a+(t.dur||0),0)+' min':'')+' · '+firstTitles(M.open):'Rien à faire côté ménage')}><div class="row"><h2 style="margin:0">🧹 To-do ménage</h2><span class="sp"></span><button class="btn p" onclick="newTask({cat:'Maison'})">+ Ajouter</button></div>
  <div class="mut">Tes tâches de la maison, avec ou sans date. L'appli retient quand tu as fait chaque chose.</div>
  <div class="fl" style="margin-top:10px">À prévoir, du plus urgent au moins urgent</div><div class="mchips">${menageChips(have)}</div><div class="mut" style="margin:4px 0 6px">« + » l'ajoute à ta liste, « ✓ » note que tu viens de le faire. Ce qui est en rose commence à dater.</div>
  ${M.h||'<p class="mut">Rien à faire côté ménage pour l\'instant ✨</p>'}</div>${routinesCard()}`}
function streak(t){let n=0,ds=TODAY();if(!isDone(t,ds))ds=add(ds,-1);for(let i=0;i<400;i++){if(occurs(t,ds)){if(isDone(t,ds))n++;else break}if(ds<t.recur.start)break;ds=add(ds,-1)}return n}
const FREQ=t=>({daily:'Tous les jours',weekly:'Chaque '+t.recur.days.map(d=>JOURS[d]).join(', '),biweekly:'Une semaine sur deux · '+t.recur.days.map(d=>JOURS[d]).join(', '),monthly:'Le '+P(t.recur.start).getDate()+' de chaque mois',every:'Tous les '+(t.recur.n||2)+' jours'}[t.recur.type]);
function routinesCard(){const l=S.tasks.filter(t=>t.recur),ds=TODAY();
  return `<div class="card"${FA('rout',l.length?l.length+' routine'+(l.length>1?'s':'')+' · '+firstTitles(l,3):'Pas encore de routine')}><div class="row"><h2 style="margin:0">🔁 Mes routines</h2><span class="sp"></span><button class="btn p" onclick="newRoutine()">+ Ajouter</button></div>
  <div class="mut">Elles apparaissent toutes seules dans les bons jours.</div>
  ${l.map(t=>{const s=streak(t);return `<div><div class="mut" style="margin-top:10px">${FREQ(t)} ${s?`· 🔥 ${s} d'affilée`:''}</div>${taskRow(t,occurs(t,ds)?ds:null)}</div>`}).join('')||'<p class="mut">Pas encore de routine.</p>'}</div>`}

let SWR=null;
try{if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').then(r=>SWR=r).catch(()=>{})}catch(e){}
function notify(title,body){try{if(!('Notification' in window)||Notification.permission!=='granted')return;const o={body,icon:'icon.png',badge:'icon.png'};
  if(SWR&&SWR.showNotification)SWR.showNotification(title,o);else new Notification(title,o)}catch(e){}}
async function askNotif(){if(!('Notification' in window)){alert('Pour les alertes, ouvre l\'appli depuis son icône sur l\'écran d\'accueil (pas depuis Safari).');return}
  const r=await Notification.requestPermission();render();if(r==='granted')notify('C\'est activé 🌷','Tu recevras tes rappels ici.')}
const notifState=()=>!('Notification' in window)?'indispo':Notification.permission;
function checkReminders(){try{if(notifState()!=='granted')return;const ds=TODAY(),now=new Date(),nm=now.getHours()*60+now.getMinutes();let ch=false;
  tasksOn(ds).forEach(t=>{if(!t.time||isDone(t,ds))return;const[a,b]=t.time.split(':').map(Number),st=a*60+b;
    [[10,'Dans 10 min'],[0,'C\'est l\'heure']].forEach(([m,l])=>{const k=t.id+'|'+ds+'|'+m;if(!NOTIF[k]&&nm>=st-m&&nm<st-m+5){NOTIF[k]=1;ch=true;notify(l+' : '+t.title,(t.dur?t.dur+' min · ':'')+t.cat)}})});
  for(const k in NOTIF)if(!k.includes(ds)){delete NOTIF[k];ch=true}if(ch)try{localStorage.setItem('maSemaine_notified',JSON.stringify(NOTIF))}catch(e){}}catch(e){}}
setInterval(checkReminders,30000);setTimeout(checkReminders,3000);
let F={id:null,ds:null,left:0,run:false,start:null,iv:null};
function startFocus(id,ds){const t=S.tasks.find(x=>x.id==id);clearInterval(F.iv);F={id,ds,left:t.dur?t.dur*60:0,up:!t.dur,run:true,start:Date.now(),iv:null};F.iv=setInterval(tick,1000);go('Focus')}
function tick(){if(!F.run)return;if(F.up){F.left++}else{F.left--;}if(!F.up&&F.left<=0){F.left=0;F.run=false;try{navigator.vibrate&&navigator.vibrate(400)}catch(e){}notify('⏰ Temps écoulé','Tu as terminé « '+((S.tasks.find(x=>x.id==F.id)||{}).title||'ta tâche')+' » ?');alert('⏰ Temps écoulé ! Tu as terminé ?')}const el=document.getElementById('tm');if(el)el.textContent=fmt(F.left)}
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function focusDone(){const t=S.tasks.find(x=>x.id==F.id);if(!t)return;const real=Math.round((Date.now()-F.start)/60000);
  if(!isDone(t,F.ds)){S.done[t.id+'|'+F.ds]=Date.now();S.stars+=2;S.hist.unshift({t:t.title,d:Date.now(),est:t.dur,real});S.hist.length=Math.min(S.hist.length,300)}
  clearInterval(F.iv);F={id:null};save();alert('Bravo ! 🎉 +2 étoiles');go('Accueil')}
function flemme(){const ds=TODAY(),l=tasksOn(ds).filter(t=>!isDone(t,ds)).sort((a,b)=>(a.dur||9999)-(b.dur||9999));if(!l.length){alert('Tout est fait aujourd\'hui, repose-toi 🌸');return}startFocus(l[0].id,ds)}
function vFocus(){const t=S.tasks.find(x=>x.id==F.id);
  if(!t){const l=tasksOn(TODAY()).filter(x=>!isDone(x,TODAY()));return `<div class="card"><h2>🎯 Focus</h2><div class="mut">Choisis une seule tâche. Juste celle-là.</div>${l.map(x=>`<div class="task"><span class="sp tt">${esc(x.title)}</span><button class="btn p" onclick="startFocus(${x.id},TODAY())">Lancer</button></div>`).join('')||'<p class="mut">Rien à faire aujourd\'hui 🌷</p>'}<button class="btn flemme" onclick="flemme()">🙈 J'ai la flemme, choisis pour moi</button><button class="btn s" style="margin-top:10px" onclick="go('Accueil')">‹ Retour</button></div>`}
  return `<div class="card" style="text-align:center"><div class="kick">EN CE MOMENT</div><h2>${esc(t.title)}</h2><div class="timer" id="tm">${fmt(F.left)}</div>${F.up?'<div class="mut">⏱️ Chrono libre, prends ton temps</div>':''}
  ${t.subs&&t.subs.length?`<div style="text-align:left;max-width:360px;margin:0 auto 12px">${subsHtml(t,F.ds)}</div>`:''}<div class="boost">Juste cette tâche. Rien d'autre n'existe 💗</div><div class="row" style="justify-content:center;margin-top:14px">
  <button class="btn" onclick="F.run=!F.run;render()">${F.run?'⏸ Pause':'▶️ Reprendre'}</button>${F.up?'':`<button class="btn" onclick="F.left+=300;render()">+5 min</button>`}
  <button class="btn p" onclick="focusDone()">✅ Terminé</button><button class="btn d" onclick="clearInterval(F.iv);F={id:null};go('Accueil')">Arrêter</button></div>
  <p class="mut">Garde la page ouverte. Pour une alerte fiable, lance aussi le minuteur de l'iPad.</p></div>`}

function weekCounts(n){const out=[];let m=monday(TODAY());for(let i=n-1;i>=0;i--){const w=add(m,-7*i);let c=0;for(let j=0;j<7;j++){const ds=add(w,j);S.tasks.forEach(t=>{if(isDone(t,ds))c++})}out.push([w,c])}return out}
function chart(data,lab){const mx=Math.max(1,...data.map(d=>d[1]));return `<div class="chart">${data.map(d=>`<div style="height:${d[1]/mx*100}%" title="${d[1]}"><span>${lab(d[0])}</span></div>`).join('')}</div><div style="height:16px"></div>`}
function vProgres(){const nd=Object.keys(S.done).length,wc=weekCounts(8);
  const B=[[1,'🌱 Premier pas'],[5,'🍓 5 petites victoires'],[20,'🌸 20 tâches'],[50,'🦋 50 tâches'],[100,'👑 100 tâches']].filter(b=>nd>=b[0]);
  const focusH=S.hist.filter(h=>h.real!=null&&h.est);
  return `<div class="card"><h2>⭐ Étoiles et badges</h2><div class="row"><div class="stat">Étoiles<b>${S.stars} ⭐</b></div><div class="stat">Tâches faites<b>${nd}</b></div></div>
  <p><b>Mes badges</b></p>${B.map(b=>`<span class="badge">${b[1]}</span>`).join('')||'<span class="mut">Ton premier badge arrive vite !</span>'}</div>
  <div class="card"><h2>📈 Tâches faites par semaine</h2><div class="mut">Tes 8 dernières semaines.</div>${chart(wc,w=>P(w).getDate()+'/'+(P(w).getMonth()+1))}</div>
  <div class="card"${FA('tr-ser',(()=>{const r=S.tasks.filter(t=>t.recur).map(t=>[t,streak(t)]).sort((a,b)=>b[1]-a[1]);return r.length&&r[0][1]?`Meilleure série : ${r[0][0].title} 🔥 ${r[0][1]}`:'Pas encore de série en cours'})())}><h2>🔥 Mes séries</h2>${S.tasks.filter(t=>t.recur).map(t=>`<div class="task"><span class="sp">${esc(t.title)}</span><span class="pill">🔥 ${streak(t)}</span></div>`).join('')||'<p class="mut">Ajoute des routines pour voir tes séries.</p>'}</div>
  <div class="card"${FA('tr-est',focusH.length?focusH.length+' mesure'+(focusH.length>1?'s':'')+' · '+focusH.filter(h=>h.real<=h.est).length+' dans les temps 💪':'Pas encore de focus terminé')}><h2>⏱️ Estimé vs réel</h2><div class="mut">En mode focus, tu vois si tu estimes bien tes durées.</div>
  ${focusH.slice(0,15).map(h=>`<div class="task"><div class="sp"><div class="tt">${esc(h.t)}</div><div class="mut">${new Date(h.d).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} · estimé ${h.est} min · réel ${h.real} min ${h.real<=h.est?'💪':''}</div></div></div>`).join('')||'<p class="mut">Pas encore de focus terminé.</p>'}</div>`}

function sportDone(w){let c=0;for(let j=0;j<7;j++){const ds=add(w,j);S.tasks.forEach(t=>{if(t.cat==='Sport'&&isDone(t,ds))c++})}return c}
function planSport(){newTask({date:TODAY(),cat:'Sport'})}
function vSport(){const wk=monday(TODAY()),man=S.sess[wk]||0,n=man+sportDone(wk),ws=[...S.weights].sort((a,b)=>a.d<b.d?-1:1);
  let svg='';if(ws.length>1){const v=ws.map(w=>w.kg),mn=Math.min(...v)-1,mx=Math.max(...v)+1;const pts=ws.map((w,i)=>`${i/(ws.length-1)*300},${110-(w.kg-mn)/(mx-mn)*100}`).join(' ');
    svg=`<svg viewBox="-5 0 310 120" style="width:100%;margin-top:10px"><defs><linearGradient id="g"><stop offset="0" stop-color="#f2a7c3"/><stop offset="1" stop-color="#c9b3f5"/></linearGradient></defs><polyline points="${pts}" fill="none" stroke="url(#g)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${ws.map((w,i)=>`<circle cx="${i/(ws.length-1)*300}" cy="${110-(w.kg-mn)/(mx-mn)*100}" r="4" fill="#c9b3f5"/>`).join('')}</svg>`}
  const diff=ws.length>1?(ws[ws.length-1].kg-ws[0].kg).toFixed(1):null;
  const sw=[];for(let i=7;i>=0;i--){const w=add(wk,-7*i);sw.push([w,(S.sess[w]||0)+sportDone(w)])}
  return `<div class="card"><h2>💪 Séances cette semaine</h2><div class="row"><button class="btn" onclick="S.sess['${wk}']=Math.max(0,${man}-1);save();render()">−</button><b style="font-size:34px;margin:0 10px">${n}</b><span class="mut">/ objectif ${S.goal}</span><span class="sp"></span><button class="btn p" onclick="S.sess['${wk}']=${man}+1;S.stars++;save();render()">+ Séance</button></div>
  <div class="mut" style="margin-top:6px">Tes séances cochées dans le planning comptent toutes seules. Le + sert aux séances improvisées.</div>
  <div class="bar" style="margin-top:12px"><i style="width:${Math.min(100,n/S.goal*100)}%"></i></div>
  <button class="btn s" style="margin-top:10px" onclick="goalForm()">Changer l'objectif</button>
  ${chart(sw,w=>P(w).getDate()+'/'+(P(w).getMonth()+1))}</div>
  <div class="card"${FA('sp-plan',(()=>{let c=0,d=0;for(let j=0;j<7;j++){const x=add(wk,j);tasksOn(x).filter(t=>t.cat==='Sport').forEach(t=>{c++;if(isDone(t,x))d++})}return c?`${c} séance${c>1?'s':''} prévue${c>1?'s':''} · ${d} faite${d>1?'s':''}`:'Aucune séance prévue'})())}><div class="row"><h2 style="margin:0">📅 Séances prévues cette semaine</h2><span class="sp"></span><button class="btn" onclick="planSport()">+ Planifier</button></div>
  ${(()=>{const r=[];for(let j=0;j<7;j++){const ds=add(wk,j);tasksOn(ds).filter(t=>t.cat==='Sport').forEach(t=>r.push(`<div class="mut" style="margin-top:8px;text-transform:capitalize">${fr(ds)}</div>`+taskRow(t,ds)))}return r.join('')||'<p class="mut">Aucune séance prévue. Ajoute une tâche en catégorie Sport, ou appuie sur Planifier.</p>'})()}</div>
  <div class="card"${FA('sp-poids',ws.length?`Dernier : ${String(ws[ws.length-1].kg).replace('.',',')} kg`+(diff!==null?` · ${diff>0?'+':''}${String(diff).replace('.',',')} kg depuis le début`:''):'Aucune pesée')}><div class="row"><h2 style="margin:0">⚖️ Mon poids</h2><span class="sp"></span><button class="btn p" onclick="addWeight()">+ Ajouter</button></div>
  ${ws.length?`<div class="mut">Dernier : <b>${ws[ws.length-1].kg} kg</b>${diff!==null?` · ${diff>0?'+':''}${diff} kg depuis le début`:''}</div>`:'<p class="mut">Ajoute ta première pesée.</p>'}${svg}
  ${ws.slice(-6).reverse().map(w=>`<div class="task"><span class="sp">${fr(w.d)}</span><b>${w.kg} kg</b><button class="btn s" onclick="S.weights=S.weights.filter(x=>x.d!=='${w.d}');save();render()">✕</button></div>`).join('')}</div>`}

function addWeight(){openSheet(`<h3>Nouvelle pesée</h3><span class="fl">Poids (kg)</span><input id="f_kg" type="number" inputmode="decimal" step="0.1" autofocus>
  <span class="fl">Date</span><input id="f_wd" type="date" value="${TODAY()}">
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveWeight()">Enregistrer</button></div>`)}
function saveWeight(){const k=parseFloat(($v('f_kg')||'').replace(',','.')),ds=$v('f_wd');if(!k||!ds){alert('Indique le poids et la date');return}
  S.weights=S.weights.filter(w=>w.d!==ds);S.weights.push({d:ds,kg:k});save();closeSheet();render()}
function catInfo(it){const b=[...it.buys].sort();if(b.length<2)return{avg:null,next:null};let s=0;for(let i=1;i<b.length;i++)s+=(P(b[i])-P(b[i-1]))/864e5;const avg=Math.round(s/(b.length-1));return{avg,next:add(b[b.length-1],avg)}}
function catAlerts(){return S.cat.map(it=>{const c=catInfo(it);if(!c.next)return'';const left=Math.round((P(c.next)-P(TODAY()))/864e5);return left<=3?`<div class="alert">🐱 ${esc(it.name)} : ${left<0?'normalement épuisé, pense à racheter !':left===0?'à racheter aujourd\'hui':'à racheter dans '+left+' jour'+(left>1?'s':'')}</div>`:''}).join('')}
function wishForm(id){const w=id?S.wish.find(x=>x.id==id):{name:'',price:'',link:''};
  openSheet(`<h3>${id?'Modifier':'Une envie d\'achat'}</h3><span class="fl">Quoi ?</span><input id="f_wn" value="${esc(w.name)}" placeholder="ex : Pull en laine" ${id?'':'autofocus'}>
  <span class="fl">Prix (€)</span><input id="f_wp" type="number" inputmode="decimal" step="0.01" value="${w.price??''}" style="width:140px">
  <span class="fl">Lien (facultatif)</span><input id="f_wl" type="url" value="${esc(w.link||'')}" placeholder="https://...">
  <div class="fbtns">${id?`<button class="btn d" onclick="delWish(${id})">Supprimer</button>`:''}<button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveWish(${id||'null'})">Enregistrer</button></div>`)}
function saveWish(id){const name=$v('f_wn').trim();if(!name){alert('Indique ce que tu veux acheter 🌸');return}
  const price=parseFloat(($v('f_wp')||'').replace(',','.'));const w=id?S.wish.find(x=>x.id==id):{id:uid(),added:TODAY(),bought:null};
  w.name=name;w.price=isNaN(price)?null:price;w.link=$v('f_wl').trim();if(w.link&&!/^https?:\/\//i.test(w.link))w.link='https://'+w.link.replace(/^[a-z]+:\/*/i,'');if(!id)S.wish.push(w);save();closeSheet();render()}
function delWish(id){snap('Envie retirée');S.wish=S.wish.filter(x=>x.id!=id);save();closeSheet();render()}
function buyWish(id){const w=S.wish.find(x=>x.id==id);
  if(!w.bought){const d=Math.round((P(TODAY())-P(w.added))/864e5),wait=S.wishCfg.wait||0,lim=S.bud.limits.Shopping,sp=catSpent(TODAY().slice(0,7),'Shopping'),msg=[];
    if(d<wait)msg.push(`ça fait seulement ${d} jour${d>1?'s':''} que tu l'as notée (ton délai : ${wait} jours)`);
    if(lim&&w.price!=null&&sp+w.price>lim)msg.push(`ça dépasserait ton budget shopping du mois (${eur(sp)} déjà dépensés sur ${eur(lim)})`);
    if(msg.length&&!confirm('Petite pause 🌸 : '+msg.join(', et ')+'.\n\nTu l\'achètes quand même ?'))return;
    snap('Envie achetée 🛍️');w.bought=TODAY();if(w.price!=null)S.bud.tx.push({id:uid(),d:TODAY(),amt:w.price,type:'out',cat:'Shopping',note:w.name,wish:w.id})}
  else{snap('Achat annulé');w.bought=null;S.bud.tx=S.bud.tx.filter(x=>x.wish!==w.id)}
  save();render()}
function wishCfgForm(){openSheet(`<h3>Réglages des envies</h3><span class="fl">Délai d'attente avant d'acheter</span>
  <div class="chips">${[0,3,7,14,30].map(n=>`<label class="chip"><input type="radio" name="f_wait" value="${n}" ${n==(S.wishCfg.wait||0)?'checked':''}><span>${n?n+' jours':'Aucun'}</span></label>`).join('')}</div>
  <span class="fl">Budget shopping par mois (€)</span><input id="f_wb" type="number" inputmode="decimal" value="${S.bud.limits.Shopping??''}" placeholder="pas de limite" style="width:160px">
  <div class="mut" style="margin-top:6px">C'est la même limite que la catégorie Shopping de ton budget. Tes envies achetées y sont ajoutées automatiquement.</div>
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveWishCfg()">Enregistrer</button></div>`)}
function saveWishCfg(){S.wishCfg.wait=parseInt($r('f_wait'))||0;const b=parseFloat($v('f_wb'));if(b>0)S.bud.limits.Shopping=b;else delete S.bud.limits.Shopping;save();closeSheet();render()}
const eur=n=>n==null?'':n.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
function wishCard(){const todo=S.wish.filter(w=>!w.bought),done=S.wish.filter(w=>w.bought).sort((a,b)=>a.bought<b.bought?1:-1);
  const tot=todo.reduce((a,w)=>a+(w.price||0),0),days=w=>Math.round((P(TODAY())-P(w.added))/864e5);
  return `<div class="card"${FA('ach-wish',todo.length?todo.length+' envie'+(todo.length>1?'s':'')+' · total '+eur(tot)+' · '+todo.slice(0,2).map(w=>w.name).join(' · '):'Aucune envie notée')}><div class="row"><h2 style="margin:0">🛍️ Mes envies</h2><span class="sp"></span><button class="btn s" onclick="wishCfgForm()" style="margin-right:6px">⚙️</button><button class="btn p" onclick="wishForm()">+ Ajouter</button></div>
  <div class="mut" style="margin:4px 0 8px">Note ici ce que tu as envie d'acheter au lieu de le prendre tout de suite. Si l'envie est toujours là dans quelques jours, c'est peut-être une bonne idée.</div>
  ${todo.length?`<div class="row" style="margin-bottom:4px"><span class="lbl">Total : ${eur(tot)}</span></div>`:''}
  ${S.bud.limits.Shopping?(()=>{const sp=catSpent(TODAY().slice(0,7),'Shopping'),l=S.bud.limits.Shopping;return `<div style="margin:8px 0"><div class="row mut"><span class="sp">🛍️ Shopping ce mois-ci</span><b style="color:var(--ink)">${eur(sp)}</b>&nbsp;/ ${eur(l)}</div><div class="bar" style="margin-top:4px;height:8px"><i style="width:${Math.min(100,sp/l*100)}%;${sp>l?'background:#e0708f':''}"></i></div></div>`})():''}
  ${todo.map(w=>{const d=days(w);return `<div class="task"><div class="sp"><div class="row"><span class="tt">${esc(w.name)}</span><span class="sp"></span>${w.price!=null?`<span class="pill">${eur(w.price)}</span>`:''}</div>
   <div class="mut" style="margin-top:3px">${d<=0?'Ajouté aujourd\'hui':d===1?'Ajouté hier':'Ajouté il y a '+d+' jours'}${w.link?` · <a href="${esc(/^https?:\/\//i.test(w.link)?w.link:'#')}" target="_blank" rel="noopener" style="color:#b0446f">voir le lien</a>`:''}</div>
   <div class="row" style="margin-top:6px">${(S.wishCfg.wait||0)>d?`<span class="pill">⏳ encore ${(S.wishCfg.wait||0)-d} j</span>`:(S.wishCfg.wait?'<span class="pill" style="background:#e3f6ec;color:#2f7a52">✅ prête</span>':'')}<button class="btn s" onclick="buyWish(${w.id})">✅ Acheté</button><button class="btn s" onclick="wishForm(${w.id})">Modifier</button></div></div></div>`}).join('')||'<p class="mut">Aucune envie notée pour l\'instant 🌸</p>'}
  ${done.length?`<details style="margin-top:10px"><summary class="mut">Déjà achetés (${done.length})</summary>${done.map(w=>`<div class="task done"><span class="sp tt">${esc(w.name)}</span>${w.price!=null?`<span class="pill">${eur(w.price)}</span>`:''}<button class="btn s" onclick="buyWish(${w.id})">Annuler</button></div>`).join('')}</details>`:''}</div>`}
function goalForm(){openSheet(`<h3>Objectif de la semaine</h3><span class="fl">Séances par semaine</span>
  <div class="chips">${[1,2,3,4,5,6,7].map(n=>`<label class="chip"><input type="radio" name="f_goal" value="${n}" ${n==S.goal?'checked':''}><span>${n}</span></label>`).join('')}</div>
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveGoal()">Enregistrer</button></div>`)}
function saveGoal(){const g=parseInt($r('f_goal'));if(g){S.goal=g;save()}closeSheet();render()}
function catItemForm(){openSheet(`<h3>Nouvel article pour le chat</h3><span class="fl">Quoi ?</span><input id="f_ci" placeholder="ex : Friandises 🍬" autofocus>
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveCatItem()">Ajouter</button></div>`)}
function saveCatItem(){const n=$v('f_ci').trim();if(!n){alert('Indique le nom de l\'article 🐱');return}S.cat.push({id:uid(),name:n,buys:[]});save();closeSheet();render()}
function catBuyOn(id){dateSheet('Acheté quel jour ?',TODAY(),d=>{S.cat.find(x=>x.id==id).buys.push(d);save();render()},'',true)}
let budMonth=TODAY().slice(0,7);
const BOUT=[['Courses','🛒'],['Logement','🏠'],['Transport','🚗'],['Factures','💡'],['Santé','🩺'],['Chat','🐱'],['Loisirs','🎨'],['Resto & sorties','🍽️'],['Shopping','🛍️'],['Beauté','🧴'],['Cadeaux','🎁'],['Épargne','🐷'],['Autre','✨']];
const BIN=[['Salaire','💼'],['Remboursement','↩️'],['Autre revenu','💶']];
const bIcon=c=>([...BOUT,...BIN].find(x=>x[0]===c)||['','💶'])[1];
const r2=n=>Math.round(n*100)/100;
function monthOps(m){const ops=S.bud.tx.filter(x=>x.d.slice(0,7)===m).map(x=>({...x}));
  S.bud.fixed.forEach(f=>{if(f.start<=m&&(!f.end||f.end>=m)){const last=new Date(+m.slice(0,4),+m.slice(5,7),0).getDate();ops.push({id:'f'+f.id,fid:f.id,fixed:true,d:m+'-'+String(Math.min(f.day||1,last)).padStart(2,'0'),amt:f.amt,type:f.type,cat:f.cat,note:f.name})}});
  return ops.sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0)}
function monthTot(m){const o=monthOps(m),inn=r2(o.filter(x=>x.type==='in').reduce((a,x)=>a+x.amt,0)),out=r2(o.filter(x=>x.type==='out').reduce((a,x)=>a+x.amt,0)),sav=r2(o.filter(x=>x.type==='out'&&x.cat==='Épargne').reduce((a,x)=>a+x.amt,0));return{o,inn,out,sav,rest:r2(inn-out)}}
const catSpent=(m,c)=>r2(monthOps(m).filter(x=>x.type==='out'&&x.cat===c).reduce((a,x)=>a+x.amt,0));
const mLabel=m=>MOIS[+m.slice(5,7)-1]+' '+m.slice(0,4);
function shiftBud(n){const[y,mm]=budMonth.split('-').map(Number);budMonth=iso(new Date(y,mm-1+n,1)).slice(0,7);render()}
function catChips(name,list,sel){return `<div class="chips">${list.map(([c,e])=>`<label class="chip"><input type="radio" name="${name}" value="${c}" ${c===sel?'checked':''}><span>${e} ${c}</span></label>`).join('')}</div>`}
function txForm(id,type='out'){const x=id?S.bud.tx.find(y=>y.id==id):{amt:'',type,cat:type==='out'?'Courses':'Salaire',d:budMonth===TODAY().slice(0,7)?TODAY():budMonth+'-01',note:''};
  openSheet(`<h3>${id?'Modifier':x.type==='out'?'Nouvelle dépense':'Nouveau revenu'}</h3>
  <div class="chips"><label class="chip"><input type="radio" name="f_ty" value="out" ${x.type==='out'?'checked':''} onchange="tyToggle()"><span>➖ Dépense</span></label><label class="chip"><input type="radio" name="f_ty" value="in" ${x.type==='in'?'checked':''} onchange="tyToggle()"><span>➕ Revenu</span></label></div>
  <span class="fl">Montant (€)</span><input id="f_amt" type="number" inputmode="decimal" step="0.01" value="${x.amt}" style="font-size:22px;font-weight:700" ${id?'':'autofocus'}>
  <span class="fl">Catégorie</span><div id="f_cout" class="${x.type==='out'?'':'hide2'}">${catChips('f_bco',BOUT,x.type==='out'?x.cat:'Courses')}</div><div id="f_cin" class="${x.type==='in'?'':'hide2'}">${catChips('f_bci',BIN,x.type==='in'?x.cat:'Salaire')}</div>
  <span class="fl">Date</span><input id="f_bd" type="date" value="${x.d}">
  <span class="fl">Note (facultatif)</span><input id="f_bn" value="${esc(x.note||'')}" placeholder="ex : Carrefour, essence, ciné…">
  <div class="fbtns">${id?`<button class="btn d" onclick="delTx(${id})">Supprimer</button>`:''}<button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveTx(${id||'null'})">Enregistrer</button></div>`)}
function tyToggle(){const o=$r('f_ty')==='out';document.getElementById('f_cout').classList.toggle('hide2',!o);document.getElementById('f_cin').classList.toggle('hide2',o)}
function saveTx(id){const amt=r2(parseFloat(($v('f_amt')||'').replace(',','.')));if(!amt||amt<=0){alert('Indique un montant 💶');return}const type=$r('f_ty')||'out',d=$v('f_bd')||TODAY();
  const x=id?S.bud.tx.find(y=>y.id==id):{id:uid()};Object.assign(x,{amt,type,cat:type==='out'?($r('f_bco')||'Autre'):($r('f_bci')||'Autre revenu'),d,note:$v('f_bn').trim()});if(!id)S.bud.tx.push(x);budMonth=d.slice(0,7);save();closeSheet();render()}
function delTx(id){snap('Opération supprimée');S.bud.tx=S.bud.tx.filter(x=>x.id!=id);save();closeSheet();render()}
function fixedForm(id){const f=id?S.bud.fixed.find(y=>y.id==id):{name:'',amt:'',type:'out',cat:'Logement',day:1,start:budMonth};
  openSheet(`<h3>${id?'Modifier':'Nouvelle charge ou revenu fixe'}</h3><div class="mut">Compté automatiquement chaque mois (loyer, abonnements, téléphone, salaire…).</div>
  <div class="chips" style="margin-top:10px"><label class="chip"><input type="radio" name="f_ty" value="out" ${f.type==='out'?'checked':''} onchange="tyToggle()"><span>➖ Dépense</span></label><label class="chip"><input type="radio" name="f_ty" value="in" ${f.type==='in'?'checked':''} onchange="tyToggle()"><span>➕ Revenu</span></label></div>
  <span class="fl">Nom</span><input id="f_fn" value="${esc(f.name)}" placeholder="ex : Loyer, Netflix, Salaire" ${id?'':'autofocus'}>
  <span class="fl">Montant par mois (€)</span><input id="f_amt" type="number" inputmode="decimal" step="0.01" value="${f.amt}">
  <span class="fl">Catégorie</span><div id="f_cout" class="${f.type==='out'?'':'hide2'}">${catChips('f_bco',BOUT,f.type==='out'?f.cat:'Logement')}</div><div id="f_cin" class="${f.type==='in'?'':'hide2'}">${catChips('f_bci',BIN,f.type==='in'?f.cat:'Salaire')}</div>
  <span class="fl">Jour du mois</span><input id="f_fd" type="number" min="1" max="31" value="${f.day||1}" style="width:90px">
  <div class="fbtns">${id?`<button class="btn d" onclick="delFixed(${id})">Arrêter</button>`:''}<button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveFixed(${id||'null'})">Enregistrer</button></div>`)}
function saveFixed(id){const name=$v('f_fn').trim(),amt=r2(parseFloat(($v('f_amt')||'').replace(',','.')));if(!name||!amt||amt<=0){alert('Indique un nom et un montant');return}const type=$r('f_ty')||'out';
  const f=id?S.bud.fixed.find(y=>y.id==id):{id:uid(),start:budMonth};Object.assign(f,{name,amt,type,cat:type==='out'?($r('f_bco')||'Autre'):($r('f_bci')||'Autre revenu'),day:Math.min(31,Math.max(1,parseInt($v('f_fd'))||1))});if(!id)S.bud.fixed.push(f);save();closeSheet();render()}
function delFixed(id){snap('Charge fixe arrêtée');const f=S.bud.fixed.find(y=>y.id==id),prev=iso(new Date(+budMonth.slice(0,4),+budMonth.slice(5,7)-2,1)).slice(0,7);
  if(f.start>prev)S.bud.fixed=S.bud.fixed.filter(y=>y.id!=id);else f.end=prev;save();closeSheet();render()}
function limitsForm(){openSheet(`<h3>Mes limites par mois</h3><div class="mut">Mets un montant maximum pour les catégories que tu veux surveiller. Laisse vide sinon.</div>
  ${BOUT.filter(c=>c[0]!=='Épargne').map(([c,e])=>`<div class="row" style="margin-top:8px"><span class="sp">${e} ${c}</span><input data-lim="${c}" type="number" inputmode="decimal" value="${S.bud.limits[c]??''}" placeholder="—" style="width:110px"></div>`).join('')}
  <div class="fbtns"><button class="btn" onclick="closeSheet()">Annuler</button><button class="btn p" onclick="saveLimits()">Enregistrer</button></div>`)}
function saveLimits(){document.querySelectorAll('[data-lim]').forEach(i=>{const v=parseFloat(i.value);if(v>0)S.bud.limits[i.dataset.lim]=v;else delete S.bud.limits[i.dataset.lim]});save();closeSheet();render()}
function vBudget(){const m=budMonth,T=monthTot(m),y=+m.slice(0,4),mo=+m.slice(5,7)-1;
  const cats=BOUT.map(([c,e])=>({c,e,v:catSpent(m,c),l:S.bud.limits[c]})).filter(x=>x.v||x.l).sort((a,b)=>b.v-a.v);
  const fx=S.bud.fixed.filter(f=>f.start<=m&&(!f.end||f.end>=m)),fxOut=r2(fx.filter(f=>f.type==='out').reduce((a,f)=>a+f.amt,0));
  const hist=[...Array(6)].map((_,i)=>{const mm=iso(new Date(y,mo-5+i,1)).slice(0,7);return[mm,monthTot(mm)]}),mx=Math.max(1,...hist.map(h=>Math.max(h[1].inn,h[1].out)));
  const over=cats.filter(x=>x.l&&x.v>x.l);
  return `<div class="card"><div class="row"><button class="btn" onclick="shiftBud(-1)">‹</button><span class="sp" style="text-align:center"><b style="text-transform:capitalize;font-size:17px">${mLabel(m)}</b></span><button class="btn" onclick="shiftBud(1)">›</button></div>
  <div style="text-align:center;margin:14px 0 4px"><div class="mut">Reste ce mois-ci</div><div class="bigeur ${T.rest<0?'neg':''}">${eur(T.rest)}</div></div>
  <div class="row" style="justify-content:center;gap:18px"><span class="lbl" style="border-color:#bfe8d1;color:#2f7a52">➕ ${eur(T.inn)}</span><span class="lbl">➖ ${eur(T.out)}</span>${T.sav?`<span class="lbl" style="border-color:#e5d4f7;color:#6a48b0">🐷 ${eur(T.sav)} épargnés</span>`:''}</div>
  ${T.inn?`<div class="bar" style="margin-top:12px"><i style="width:${Math.min(100,T.out/T.inn*100)}%;${T.out>T.inn?'background:#e0708f':''}"></i></div><div class="mut" style="margin-top:4px;text-align:center">${Math.round(T.out/T.inn*100)} % de tes revenus dépensés</div>`:'<div class="mut" style="text-align:center;margin-top:8px">Ajoute ton salaire en revenu fixe pour voir ce qu\'il te reste.</div>'}
  ${over.length?`<div class="alert" style="margin-top:10px">⚠️ Limite dépassée : ${over.map(x=>x.e+' '+x.c).join(', ')}</div>`:''}
  <div class="row" style="margin-top:14px"><button class="btn p" style="flex:1" onclick="txForm(null,'out')">➖ Dépense</button><button class="btn" style="flex:1" onclick="txForm(null,'in')">➕ Revenu</button></div></div>
  <div class="card"${FA('bud-cat',cats.length?cats.slice(0,3).map(x=>x.e+' '+eur(x.v)).join(' · '):'Aucune dépense ce mois-ci')}><div class="row"><h2 style="margin:0">📊 Par catégorie</h2><span class="sp"></span><button class="btn s" onclick="limitsForm()">🎯 Limites</button></div>
  ${cats.map(x=>`<div style="margin-top:12px"><div class="row"><span class="sp">${x.e} ${x.c}</span><b>${eur(x.v)}</b>${x.l?`<span class="mut">&nbsp;/ ${eur(x.l)}</span>`:''}</div>
   <div class="bar" style="margin-top:5px;height:8px"><i style="width:${x.l?Math.min(100,x.v/x.l*100):(T.out?x.v/T.out*100:0)}%;${x.l&&x.v>x.l?'background:#e0708f':''}"></i></div></div>`).join('')||'<p class="mut">Rien pour l\'instant.</p>'}</div>
  <div class="card"${FA('bud-ops',T.o.length?T.o.length+' opération'+(T.o.length>1?'s':'')+' · dernière : '+(T.o[0].note||T.o[0].cat)+' '+eur(T.o[0].amt):'Aucune opération ce mois-ci')}><div class="row"><h2 style="margin:0">🧾 Opérations</h2><span class="sp"></span><button class="btn" onclick="txForm(null,'out')">+ Ajouter</button></div>
  ${T.o.map(x=>`<button class="op" onclick="${x.fixed?`fixedForm(${x.fid})`:`txForm(${x.id})`}"><span class="opi">${bIcon(x.cat)}</span><span class="sp"><b>${esc(x.note||x.cat)}</b><small>${P(x.d).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} · ${x.cat}${x.fixed?' · 📌 fixe':''}</small></span><b class="${x.type==='in'?'pos':''}">${x.type==='in'?'+':'−'}${eur(x.amt)}</b></button>`).join('')||'<p class="mut">Touche « ➖ Dépense » quand tu achètes quelque chose. Même les petites dépenses comptent 🌸</p>'}</div>
  <div class="card"${FA('bud-fix',fx.length?fx.length+' fixe'+(fx.length>1?'s':'')+(fxOut?' · '+eur(fxOut)+' de charges par mois':''):'Aucune charge fixe')}><div class="row"><h2 style="margin:0">📌 Fixes chaque mois</h2><span class="sp"></span><button class="btn" onclick="fixedForm()">+ Ajouter</button></div>
  <div class="mut">Loyer, abonnements, téléphone, assurance, salaire… comptés tout seuls chaque mois.</div>
  ${fx.map(f=>`<button class="op" onclick="fixedForm(${f.id})"><span class="opi">${bIcon(f.cat)}</span><span class="sp"><b>${esc(f.name)}</b><small>le ${f.day} de chaque mois · ${f.cat}</small></span><b class="${f.type==='in'?'pos':''}">${f.type==='in'?'+':'−'}${eur(f.amt)}</b></button>`).join('')}</div>
  <div class="card"${FA('bud-hist','Revenus et dépenses de tes 6 derniers mois')}><h2>📈 6 derniers mois</h2>
  <div class="bchart">${hist.map(([mm,t])=>`<div class="bcol"><div class="bars"><i class="in" style="height:${t.inn/mx*100}%"></i><i class="out" style="height:${t.out/mx*100}%"></i></div><span>${MOIS[+mm.slice(5,7)-1].slice(0,4)}</span></div>`).join('')}</div>
  <div class="row mut" style="justify-content:center;gap:14px;margin-top:6px"><span><i class="lg in"></i> revenus</span><span><i class="lg out"></i> dépenses</span></div></div>`}
function vAchats(){return vChat()+wishCard()}
function vChat(){return catAlerts()+`<div class="card"${FA('ach-chat',(()=>{const n=S.cat.map(it=>[it,catInfo(it)]).filter(x=>x[1].next).sort((a,b)=>a[1].next<b[1].next?-1:1)[0];return n?`Prochain : ${n[0].name} vers le ${P(n[1].next).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}`:S.cat.length+' articles suivis'})())}><div class="row"><h2 style="margin:0">🐱 Courses du chat</h2><span class="sp"></span><button class="btn" onclick="catItemForm()">+ Article</button></div>
  <div class="mut">Clique sur « Acheté » à chaque achat. Après 2 achats, je calcule ton rythme et je te préviens 3 jours avant.</div>
  ${S.cat.map(it=>{const c=catInfo(it),last=[...it.buys].sort().pop();return `<div class="task"><div class="sp"><div class="tt">${esc(it.name)}</div><div class="mut">${last?'Dernier achat : '+fr(last):'Jamais acheté encore'}${c.avg?` · tous les ~${c.avg} jours · prochain vers le ${P(c.next).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}`:''}</div>
  <div class="row" style="margin-top:6px"><button class="btn p" onclick="S.cat.find(x=>x.id==${it.id}).buys.push(TODAY());save();render()">🛒 Acheté</button><button class="btn s" onclick="catBuyOn(${it.id})">Autre date</button><button class="btn s" onclick="if(confirm('Supprimer ?')){S.cat=S.cat.filter(x=>x.id!=${it.id});save();render()}">Supprimer</button></div></div></div>`}).join('')}</div>`}

function vReglages(){const ns=notifState();return `<div class="card"><h2>🔔 Alertes</h2>
  <div class="mut">Un rappel 10 minutes avant et à l'heure de tes tâches avec une heure, et à la fin du minuteur Focus.</div>
  <div class="alert" style="margin-top:10px">Ça marche quand l'appli est ouverte ou vient d'être quittée. Si l'iPad la met en veille, les alertes ne partent plus : pour un rappel important, utilise aussi Rappels d'Apple.</div>
  ${ns==='granted'?'<p><b>✅ Alertes activées</b></p>':ns==='denied'?'<p class="mut">Alertes refusées. Pour les réactiver : Réglages de l\'iPad → Notifications → Daily Journal.</p>':`<button class="btn p" style="width:100%" onclick="askNotif()">Autoriser les alertes</button>`}</div>
  ${syncCard()}${bkCard()}${prevCard()}<div class="card"><h2>💾 Sauvegarde</h2><div class="mut">Dernière sauvegarde : ${S.lastBackup?new Date(S.lastBackup).toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):'jamais'}</div><div class="mut">Crée un fichier avec toutes tes données (range-le dans iCloud Drive), puis importe-le sur ton autre appareil.</div>
  <div class="row" style="margin-top:10px"><button class="btn p" onclick="exportData()">Sauvegarder</button><label class="btn">Importer<input type="file" accept=".json,application/json" class="hide" onchange="importData(this.files[0])"></label></div>
  <button class="btn d" style="margin-top:14px;width:100%" onclick="resetAll()">Réinitialiser les données</button></div>`}
async function exportData(){const name='daily-journal-'+TODAY()+'.json',txt=JSON.stringify(S);
  const done=()=>{S.lastBackup=Date.now();S.backupSnooze=0;save();render()};
  try{const f=new File([txt],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Sauvegarde Daily Journal'});done();return}}catch(e){if(e&&e.name==='AbortError')return}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;a.click();done()}
function backupCard(){if(window.SYNC_ON)return'';const now=Date.now(),last=S.lastBackup||0,days=Math.floor((now-(last||S.created))/864e5);
  if((S.backupSnooze||0)>now)return'';if(last?days<7:days<3)return'';if(!S.tasks.length)return'';
  return `<div class="backup"><b>💾 Petite sauvegarde ?</b><div class="mut" style="margin:4px 0 10px">${last?`Ta dernière sauvegarde date de ${days} jours.`:'Tu n\'as encore jamais sauvegardé.'} Tes données ne sont que dans cet appareil, un fichier dans iCloud Drive les met à l'abri.</div>
  <div class="row"><button class="btn p" onclick="exportData()">Sauvegarder maintenant</button><button class="btn s" onclick="S.backupSnooze=Date.now()+2*864e5;save();render()">Plus tard</button></div></div>`}
function importData(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.tasks)throw 0;if(confirm('Remplacer les données de cet appareil par celles du fichier ?'+(SY.st==='on'?' Elles seront aussi envoyées sur tes autres appareils.':'')+'\n\nUne copie de tes données actuelles est gardée dans Réglages → Version précédente.')){try{localStorage.setItem('maSemaine_prev',JSON.stringify({at:Date.now(),data:JSON.stringify(S)}))}catch(e){}S=d;save();render();alert('Importé ! 🎉')}}catch(e){alert('Fichier non reconnu 😕')}};r.readAsText(f)}

const TITLES={Accueil:'Mon récap',Mois:'Mon mois',Semaine:'Ma semaine','To-do':'À faire',Focus:'Mon focus','Trophées':'Mes trophées',Sport:'Mon sport',Budget:'Budget & achats','Réglages':'Mes réglages'};
const HIDDEN={Focus:['🎯',vFocus]};
const TABS={Accueil:['🏡',vAccueil],Mois:['🗓️',vMois],Semaine:['📆',vSemaine],'To-do':['📝',vTodo],'Trophées':['🏆',vProgres],Sport:['💪',vSport],Budget:['💶',()=>vBudget()+vAchats()],'Réglages':['💾',vReglages]};
let turning=false;
function go(t){if(t===tab){scrollTo(0,0);return}const keys=Object.keys(TABS).concat(Object.keys(HIDDEN)),fwd=keys.indexOf(t)>keys.indexOf(tab),pg=document.getElementById('page');
  const anim=pg&&pg.cloneNode&&!turning&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  let ov=null;
  if(anim&&fwd){scrollTo(0,0);ov=pg.cloneNode(true);ov.removeAttribute('id');ov.className='turn';ov.style.height=Math.min(pg.offsetHeight,innerHeight+200)+'px';
    ov.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));document.getElementById('book').appendChild(ov)}
  tab=t;render();scrollTo(0,0);
  if(anim){turning=true;if(fwd){requestAnimationFrame(()=>ov.classList.add('fwd'));setTimeout(()=>{ov.remove();turning=false},600)}
    else{pg.classList.remove('back');void pg.offsetWidth;pg.classList.add('back');setTimeout(()=>{pg.classList.remove('back');turning=false},600)}}}
let TLS=null;
const FA=(k,sum)=>` data-fold="${k}" data-sum="${esc(sum)}"`;
const firstTitles=(l,n=2)=>l.slice(0,n).map(t=>t.title).join(' · ')+(l.length>n?` · +${l.length-n}`:'');
function foldify(){try{document.querySelectorAll('#app .card[data-fold]').forEach(c=>{const k=c.dataset.fold,head=c.firstElementChild;if(!head||c.querySelector(':scope>.fbody'))return;
  const body=document.createElement('div');body.className='fbody';while(head.nextSibling)body.appendChild(head.nextSibling);
  const sm=document.createElement('div');sm.className='fsum'+(/[a-zà-ÿ]/i.test(c.dataset.sum)?'':' big');sm.textContent=c.dataset.sum;c.appendChild(sm);c.appendChild(body);
  head.classList.add('fhead');const h2=head.matches('h2')?head:head.querySelector('h2');if(h2){const ch=document.createElement('span');ch.className='chev';ch.textContent='›';h2.appendChild(ch)}
  if(FOLD[k])c.classList.add('fopen');
  head.addEventListener('click',e=>{if(e.target.closest('button,input,select,a,label,textarea'))return;FOLD[k]=!FOLD[k];saveFold();c.classList.toggle('fopen',!!FOLD[k]);
    if(FOLD[k]){c.querySelectorAll('.pi textarea').forEach(growPi);c.querySelectorAll('.tlw').forEach(w=>{w.scrollTop=(TLS&&TLS.ds===w.dataset.ds)?TLS.top:+w.dataset.start})}})})}catch(e){}}
let UNDO=null,undoT=null,lastSnap=0;
function snap(msg){const now=Date.now();if(now-lastSnap<400)return;lastSnap=now;UNDO=JSON.stringify(S);
  let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el)}
  el.innerHTML=`<span>${msg}</span><button onclick="undo()">Annuler</button>`;el.classList.add('show');clearTimeout(undoT);undoT=setTimeout(()=>{el.classList.remove('show');UNDO=null},6000)}
function undo(){if(!UNDO)return;S=JSON.parse(UNDO);UNDO=null;save();const el=document.getElementById('toast');if(el)el.classList.remove('show');render()}
function growPi(e){e.style.height='auto';e.style.height=Math.max(104,Math.ceil(e.scrollHeight/26)*26)+'px'}
function render(){if(!TABS[tab]&&!HIDDEN[tab])tab=tab==='Routines'?'To-do':tab==='Achats'?'Budget':'Accueil';try{applySober()}catch(e){}try{const h=document.getElementById('ttl');if(h)h.textContent=(tab==='Accueil'&&curDay!==TODAY()?'Ma journée':TITLES[tab]||'Daily Journal')}catch(e){}document.getElementById('tabs').innerHTML=Object.entries(TABS).map(([k,v],i)=>`<button class="tab t${i} ${k===tab?'on':''}" onclick="${k==='Accueil'?"if(curDay!==TODAY()){curDay=TODAY();if(tab==='Accueil')render()}":''}go('${k}')"><span class="ic">${v[0]}</span>${k}</button>`).join('');document.getElementById('app').innerHTML=(TABS[tab]||HIDDEN[tab])[1]();try{document.querySelectorAll('.pi textarea').forEach(growPi)}catch(e){}foldify();try{document.querySelectorAll('.tlw').forEach(w=>{if(!w.offsetParent)return;w.scrollTop=(TLS&&TLS.ds===w.dataset.ds)?TLS.top:+w.dataset.start;TLS={ds:w.dataset.ds,top:w.scrollTop}})}catch(e){}}
