/* ☁️ Synchronisation Firebase : mêmes données sur le téléphone et l'iPad */
// Configuration du projet Firebase (Console Firebase → Paramètres du projet → Vos applications → Config).
const FB_CONFIG={apiKey:"AIzaSyAETyemut2x7qEMgSTIYZ_jqcxYLcqFE9U",authDomain:"daily-journal-2c3b0.firebaseapp.com",projectId:"daily-journal-2c3b0",
  storageBucket:"daily-journal-2c3b0.firebasestorage.app",messagingSenderId:"196580893553",appId:"1:196580893553:web:de6cba773aa0df05be8cd0"};
const FBV='10.12.2';
function lsg(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lss(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
const DEV=lsg('maSemaine_dev')||(()=>{const d='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);lss('maSemaine_dev',d);return d})();
let SY={st:FB_CONFIG?'load':'off',user:null,err:'',busy:false,last:+(lsg('maSemaine_syncAt')||0),pend:null,timer:null,pt:null,fb:null,unsub:null};
const isDirty=()=>lsg('maSemaine_dirty')==='1';
function errMsg(e){const c=(e&&e.code)||'';return({'auth/invalid-credential':'E-mail ou mot de passe incorrect.','auth/wrong-password':'Mot de passe incorrect.','auth/user-not-found':'Aucun compte avec cet e-mail.',
  'auth/email-already-in-use':'Un compte existe déjà avec cet e-mail : connecte-toi.','auth/weak-password':'Mot de passe trop court (6 caractères minimum).','auth/invalid-email':'E-mail invalide.',
  'auth/missing-password':'Indique ton mot de passe.','auth/network-request-failed':'Pas de connexion internet.','auth/too-many-requests':'Trop d’essais, réessaie dans quelques minutes.',
  'auth/operation-not-allowed':'Active « Adresse e-mail/Mot de passe » dans Firebase Authentication.','permission-denied':'Accès refusé par le serveur (vérifie les règles Firestore).',
  'unavailable':'Serveur injoignable, nouvel essai automatique.'})[c]||('Erreur : '+((e&&e.message)||e))}
async function syncInit(){if(!FB_CONFIG)return;
  try{const u='https://www.gstatic.com/firebasejs/'+FBV+'/';
    const[A,Au,Fs]=await Promise.all([import(u+'firebase-app.js'),import(u+'firebase-auth.js'),import(u+'firebase-firestore.js')]);
    const app=A.initializeApp(FB_CONFIG),auth=Au.getAuth(app),db=Fs.getFirestore(app);SY.fb={Au,Fs,auth,db};SY.err='';
    Au.onAuthStateChanged(auth,usr=>{SY.user=usr;if(SY.unsub){SY.unsub();SY.unsub=null}
      if(usr){SY.st='on';window.SYNC_ON=true;listen()}else{SY.st='out';window.SYNC_ON=false}syncUI();if(tab==='Réglages')render()})}
  catch(e){SY.st='err';SY.err='Impossible de joindre le serveur (pas de connexion ?).';syncUI()}}
const sRef=()=>SY.fb.Fs.doc(SY.fb.db,'users',SY.user.uid);
function listen(){const uid=SY.user.uid;
  SY.unsub=SY.fb.Fs.onSnapshot(sRef(),{includeMetadataChanges:true},snap=>{if(snap.metadata.hasPendingWrites)return;
    /* Une réponse « depuis le cache » (réseau lent ou coupé) ne dit rien du serveur : on attend la vraie réponse. */
    if(snap.metadata.fromCache)return;
    const first=lsg('maSemaine_syncUid')!==uid;
    if(!snap.exists()){lss('maSemaine_syncUid',uid);push(true);return}
    const r=snap.data(),R=r.updatedAt||0;
    if(first){lss('maSemaine_syncUid',uid);let d={};try{d=JSON.parse(r.data)}catch(e){}
      const loc=dataSize(S),rem=dataSize(d);
      if(!rem&&!d._reset){save();push(true,true);return}            /* serveur vide : on y envoie cet appareil */
      if(!loc){adopt(r,true);return}                            /* appareil vide : on récupère le serveur */
      if(confirm(`Il y a des données à la fois sur cet appareil (${loc} éléments) et sur ton compte (${rem} éléments).\n\nOK : garder celles du COMPTE sur cet appareil (une copie de celles de l’appareil est gardée dans Réglages).\nAnnuler : garder celles de CET APPAREIL et les envoyer sur ton compte.`))adopt(r,true);else{save();push(true,true)}return}
    if(r.device===DEV||R<=SY.last){if(R===SY.last&&!getBase())setBase(r.data);SY.last=Math.max(SY.last,R);lss('maSemaine_syncAt',SY.last);if(isDirty())push();syncUI();return}
    if(isDirty()&&(S._mt||0)>R){push(true);return}
    adopt(r)},e=>{SY.err=errMsg(e);syncUI()})}
const dataSize=d=>((d&&d.tasks)||[]).length+Object.keys((d&&d.done)||{}).length+((d&&d.hist)||[]).length+((d&&d.bud&&d.bud.tx)||[]).length+((d&&d.weights)||[]).length+Object.keys((d&&d.sport)||{}).length;
function adopt(r,ok){let d;try{d=JSON.parse(r.data)}catch(e){return}
  /* Protection : un compte vide (sans remise à zéro volontaire) ne remplace jamais des données existantes */
  if(!ok&&dataSize(d)===0&&!d._reset&&dataSize(S)>0){save();push(true,true);return}
  SY.pend=r;applyPend()}
function syncIdle(){const a=document.activeElement,sh=document.getElementById('sheet');
  return!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))&&!(sh&&sh.classList.contains('open'))&&!F.run}
function applyPend(){const r=SY.pend;if(!r)return;
  if(isDirty()&&(S._mt||0)>(r.updatedAt||0)){SY.pend=null;push(true);return}
  if(!syncIdle()){clearTimeout(SY.pt);SY.pt=setTimeout(applyPend,2000);return}
  SY.pend=null;try{if(dataSize(S)>0)localStorage.setItem('maSemaine_prev',JSON.stringify({at:Date.now(),data:JSON.stringify(S)}))}catch(e){}localStorage.setItem(K,r.data);setBase(r.data);lss('maSemaine_dirty',null);SY.last=r.updatedAt||0;lss('maSemaine_syncAt',SY.last);
  try{sessionStorage.setItem('maSemaine_tab',tab);sessionStorage.setItem('maSemaine_y',String(scrollY))}catch(e){}location.reload()}
function syncPush(){if(SY.st!=='on')return;clearTimeout(SY.timer);SY.timer=setTimeout(()=>push(),1200)}
/* ---------- Fusion : chaque appareil garde la « base », dernière version commune connue du serveur.
   À l'envoi, si le serveur a changé entre-temps, on fusionne base / cet appareil / serveur élément par élément :
   ajouts gardés des deux côtés, suppressions respectées, modifications fusionnées (cet appareil gagne en cas
   de modification du même champ des deux côtés). ---------- */
const getBase=()=>{try{return JSON.parse(lsg('maSemaine_base')||'null')}catch(e){return null}};
const setBase=txt=>lss('maSemaine_base',txt);
function canon(v){if(Array.isArray(v))return'['+v.map(canon).join(',')+']';if(v&&typeof v==='object')return'{'+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}';return JSON.stringify(v)}
const same=(a,b)=>canon(a)===canon(b);
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const itemKey=x=>isObj(x)?(x.id!=null?'i'+x.id:x.d!=null&&x.kg!=null?'w'+x.d:'j'+canon(x)):'p'+canon(x);
const ADDITIVE=/^(stars|sess\.[^.]+)$/;
function merge3(b,l,r,path=''){
  if(same(l,r))return l;
  if(b!==undefined&&same(b,l))return r;
  if(b!==undefined&&same(b,r))return l;
  if(typeof l==='number'&&typeof r==='number'&&typeof b==='number'&&ADDITIVE.test(path))return Math.max(0,l+r-b);
  if(isObj(l)&&isObj(r)){const B=isObj(b)?b:{},o={};
    for(const k of new Set([...Object.keys(l),...Object.keys(r)])){const v=mergeKey(B[k],l[k],r[k],path?path+'.'+k:k);if(v!==undefined)o[k]=v}return o}
  if(Array.isArray(l)&&Array.isArray(r)){const B=Array.isArray(b)?b:[],bm=new Map(B.map(x=>[itemKey(x),x])),lm=new Map(l.map(x=>[itemKey(x),x])),rm=new Map(r.map(x=>[itemKey(x),x]));
    const order=[...l.map(itemKey),...r.map(itemKey).filter(k=>!lm.has(k))],out=[];
    for(const k of order){const v=mergeKey(bm.get(k),lm.get(k),rm.get(k),path+'[]');if(v!==undefined)out.push(v)}return out}
  return l}
/* une entrée présente d'un seul côté : ajoutée (on la garde) ou supprimée de l'autre côté (on la retire, sauf si modifiée entre-temps) */
function mergeKey(b,l,r,path){
  if(l===undefined&&r===undefined)return undefined;
  if(l===undefined)return b===undefined||!same(b,r)?r:undefined;
  if(r===undefined)return b===undefined||!same(b,l)?l:undefined;
  return merge3(b,l,r,path)}

async function push(force,overwrite){if(!SY.user||!SY.fb)return;if(!force&&!isDirty())return;
  if(SY.pushing){SY.again=true;return}SY.pushing=true;SY.busy=true;syncUI();
  try{const{Fs,db}=SY.fb,ref=sRef(),mt0=S._mt||(S._mt=Date.now());let merged=null,out=null;
    await Fs.runTransaction(db,async tx=>{const snap=await tx.get(ref);merged=null;
      let data=S;const cur=snap.exists()?snap.data():null,R=cur?(cur.updatedAt||0):0;
      if(cur&&!overwrite&&R!==SY.last&&cur.device!==DEV){            /* le serveur a bougé depuis notre dernière synchro */
        let rem;try{rem=JSON.parse(cur.data)}catch(e){rem=null}
        if(rem){merged=merge3(getBase()||undefined,JSON.parse(JSON.stringify(S)),rem);data=merged}}
      const at=Math.max(Date.now(),R+1),txt=JSON.stringify({...data,_mt:at});
      if(txt.length>950000){const e=new Error('trop');e.code='too-big';throw e}
      tx.set(ref,{data:txt,updatedAt:at,device:DEV});out={at,txt}});
    if(out){const editedMeanwhile=(S._mt||0)!==mt0;
      if(merged&&!editedMeanwhile){S=merged;S._mt=out.at;localStorage.setItem(K,JSON.stringify(S));try{render()}catch(e){}}
      else if(!merged&&!editedMeanwhile){S._mt=out.at;localStorage.setItem(K,JSON.stringify(S))}
      setBase(out.txt);SY.last=out.at;lss('maSemaine_syncAt',SY.last);
      if(!editedMeanwhile)lss('maSemaine_dirty',null);SY.err='';backupDaily()}}
  catch(e){SY.err=e&&e.code==='too-big'?'Données trop volumineuses pour la synchro (limite 1 Mo).':errMsg(e)}
  SY.pushing=false;SY.busy=false;syncUI();if(SY.again){SY.again=false;push(true)}}
const syncVal=id=>{const el=document.getElementById(id);return el?el.value:''};
async function syncLogin(create){const em=syncVal('sy_em').trim(),pw=syncVal('sy_pw');
  if(!em||!pw){SY.err='Indique ton e-mail et ton mot de passe 🌸';syncUI();return}
  if(create&&pw.length<8){SY.err='Choisis un mot de passe d’au moins 8 caractères.';syncUI();return}
  SY.err='';SY.busy=true;syncUI();const{Au,auth}=SY.fb;
  try{await(create?Au.createUserWithEmailAndPassword:Au.signInWithEmailAndPassword)(auth,em,pw)}catch(e){SY.err=errMsg(e)}SY.busy=false;syncUI()}
async function syncForgot(){const em=syncVal('sy_em').trim();if(!em){SY.err='Écris ton e-mail, puis touche « Mot de passe oublié ».';syncUI();return}
  try{await SY.fb.Au.sendPasswordResetEmail(SY.fb.auth,em);alert('E-mail envoyé 💌 Regarde ta boîte de réception (et les spams).')}catch(e){SY.err=errMsg(e);syncUI()}}
function syncOut(){openSheet(`<div style="text-align:center"><h3>Se déconnecter ?</h3><div class="mut">Tu es connecté·e avec <b>${esc((SY.user&&SY.user.email)||'')}</b>.</div>
  <div class="mut" style="margin-top:8px">Tes données restent sur cet appareil, mais elles ne se synchroniseront plus avec tes autres appareils.</div>
  <div class="fbtns" style="justify-content:center"><button class="btn" style="flex:1" onclick="closeSheet()">Annuler</button><button class="btn d" style="flex:1" onclick="syncOutGo()">Se déconnecter</button></div></div>`)}
async function syncOutGo(){lss('maSemaine_syncUid',null);let ok=true;try{await SY.fb.Au.signOut(SY.fb.auth)}catch(e){ok=false}
  openSheet(ok?`<div style="text-align:center"><h3>Déconnecté·e ✓</h3><div class="mut">Tu es bien déconnecté·e. Tes données sont toujours sur cet appareil.</div>
  <div class="mut" style="margin-top:8px">Pour synchroniser de nouveau, reconnecte-toi dans Réglages → Synchronisation.</div>
  <div class="fbtns"><button class="btn p" style="flex:1" onclick="closeSheet()">OK</button></div></div>`
  :`<div style="text-align:center"><h3>Oups</h3><div class="mut">La déconnexion n’a pas marché. Réessaie dans un instant.</div><div class="fbtns"><button class="btn p" style="flex:1" onclick="closeSheet()">OK</button></div></div>`)}
function syncInner(){const t=SY.last?new Date(SY.last).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'jamais';let h='<h2>☁️ Synchronisation</h2>';
  if(SY.st==='off')h+='<div class="mut">Pas encore configurée : il manque la configuration Firebase dans l’appli.</div>';
  else if(SY.st==='load')h+='<div class="mut">Connexion au serveur…</div>';
  else if(SY.st==='err')h+=`<div class="mut">${esc(SY.err)}</div><button class="btn" style="margin-top:8px" onclick="SY.st='load';syncUI();syncInit()">Réessayer</button>`;
  else if(SY.st==='out')h+=`<div class="mut">Connecte-toi avec le même compte sur ton téléphone et ton iPad : tes données se mettent à jour toutes seules.</div>
  <span class="fl">E-mail</span><input id="sy_em" type="email" autocomplete="username" autocapitalize="off">
  <span class="fl">Mot de passe</span><div class="row" style="gap:6px;flex-wrap:nowrap"><input id="sy_pw" type="${SY.showPw?'text':'password'}" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" style="flex:1;min-width:0">
  <button type="button" class="btn s" onclick="syncTogglePw()" aria-label="${SY.showPw?'Masquer':'Afficher'} le mot de passe" title="${SY.showPw?'Masquer':'Afficher'} le mot de passe">${SY.showPw?EYE_OFF:EYE}</button></div>
  <div class="row" style="margin-top:10px"><button class="btn p" onclick="syncLogin(false)"${SY.busy?' disabled':''}>Se connecter</button><button class="btn" onclick="syncLogin(true)"${SY.busy?' disabled':''}>Créer mon compte</button></div>
  <button class="btn s" style="margin-top:8px" onclick="syncForgot()">Mot de passe oublié ?</button>`;
  else h+=`<div class="mut">Connecté·e : <b>${esc(SY.user.email||'')}</b></div><div class="mut">${SY.busy?'Envoi en cours…':isDirty()?'Modifications en attente d’envoi':'✅ À jour'} · dernière synchro : ${t}</div>
  <div class="row" style="margin-top:10px"><button class="btn" onclick="push(true)">Synchroniser maintenant</button><button class="btn s" onclick="syncOut()">Se déconnecter</button></div>`;
  if(SY.err&&SY.st!=='err')h+=`<div class="alert" style="margin-top:10px">${esc(SY.err)}</div>`;return h}
const EYE='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',EYE_OFF='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block"><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.5"/><path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M2 2l20 20"/></svg>';
function syncTogglePw(){SY.showPw=!SY.showPw;syncUI();const el=document.getElementById('sy_pw');if(el){el.focus();try{const n=el.value.length;el.setSelectionRange(n,n)}catch(e){}}}
const CLOUD_ON='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 19H7a5 5 0 1 1 .9-9.9A6 6 0 0 1 19.5 11a4 4 0 0 1-2 8z"/><path d="M9 14l2 2 4-4"/></svg>',CLOUD_OFF='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2l20 20"/><path d="M5.8 9.4A5 5 0 0 0 7 19h10.5c.6 0 1.2-.1 1.7-.4"/><path d="M21.3 15.6A4 4 0 0 0 19.5 11a6 6 0 0 0-9.3-4.9"/></svg>',WIFI_ON='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5 12.6a10 10 0 0 1 14 0"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M12 20h.01"/></svg>',WIFI_OFF='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2l20 20"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M5 12.6a10 10 0 0 1 4.2-2.4"/><path d="M19 12.6a10 10 0 0 0-2.2-1.6"/><path d="M2 8.8a15 15 0 0 1 4.2-2.7"/><path d="M10.7 5.1A15 15 0 0 1 22 8.8"/><path d="M12 20h.01"/></svg>';
function statUI(){const b=document.getElementById('statBtn');if(!b)return;const on=navigator.onLine!==false,acc=SY.st==='on';
  b.innerHTML=`<span class="${acc?'ok':'no'}" title="${acc?'Compte connecté':'Compte non connecté'}">${acc?CLOUD_ON:CLOUD_OFF}</span><span class="${on?'ok':'ko'}" title="${on?'En ligne':'Hors ligne'}">${on?WIFI_ON:WIFI_OFF}</span>`;
  b.setAttribute('aria-label',(acc?'Compte connecté':'Compte non connecté')+', '+(on?'en ligne':'hors ligne'))}
function statInfo(){const on=navigator.onLine!==false,acc=SY.st==='on';
  openSheet(`<div style="text-align:center"><h3>Connexion</h3>
  <div class="row" style="justify-content:center;gap:10px;margin:6px 0"><span class="neti ${acc?'ok':'no'}">${acc?CLOUD_ON:CLOUD_OFF}</span><b>${acc?'Compte connecté':'Compte non connecté'}</b></div>
  <div class="mut">${acc?'Connecté·e avec '+esc(SY.user.email||'')+'. Tes données se synchronisent.':'Tes données restent sur cet appareil. Connecte-toi pour les synchroniser.'}</div>
  <div class="row" style="justify-content:center;gap:10px;margin:14px 0 6px"><span class="neti ${on?'ok':'ko'}">${on?WIFI_ON:WIFI_OFF}</span><b>${on?'En ligne':'Hors ligne'}</b></div>
  <div class="mut">${on?'Internet fonctionne.':'Pas d’internet : tes modifications sont gardées et seront envoyées au retour de la connexion.'}</div>
  <div class="fbtns"><button class="btn" style="flex:1" onclick="closeSheet()">Fermer</button>${acc?'':'<button class="btn p" style="flex:1" onclick="closeSheet();go(\'Réglages\');setTimeout(()=>{const c=document.getElementById(\'syncCard\');if(c)c.scrollIntoView({behavior:\'smooth\',block:\'center\'})},350)">Me connecter</button>'}</div></div>`)}
addEventListener('offline',statUI);addEventListener('online',statUI);
const syncCard=()=>`<div class="card" id="syncCard">${syncInner()}</div>`;
function prevInfo(){try{const p=JSON.parse(lsg('maSemaine_prev')||'null');if(!p)return null;const d=JSON.parse(p.data);return{at:p.at,n:dataSize(d),data:p.data}}catch(e){return null}}
function prevCard(){const p=prevInfo();if(!p)return'';return `<div class="card"><h2>🛟 Version précédente</h2><div class="mut">Avant chaque mise à jour venue de ton compte, l’appli garde une copie de ce qu’il y avait sur cet appareil.</div>
  <div class="mut" style="margin-top:6px">Copie du ${new Date(p.at).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})} · ${p.n} élément${p.n>1?'s':''}</div>
  <button class="btn" style="margin-top:10px" onclick="restorePrev()">Revenir à cette version</button></div>`}
function restorePrev(){const p=prevInfo();if(!p)return;if(!confirm('Remplacer les données actuelles par la copie du '+new Date(p.at).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+' ?'+(SY.st==='on'?' Elle sera aussi envoyée sur tes autres appareils.':'')))return;
  try{localStorage.setItem('maSemaine_prev',JSON.stringify({at:Date.now(),data:JSON.stringify(S)}))}catch(e){}
  S=JSON.parse(p.data);S._reset=0;save();push(true,true);render();alert('C’est fait 🌷')}
function syncUI(){statUI();const el=document.getElementById('syncCard');
  if(el){const v=[syncVal('sy_em'),syncVal('sy_pw')];el.innerHTML=syncInner();const e2=document.getElementById('sy_em'),p2=document.getElementById('sy_pw');if(e2&&v[0])e2.value=v[0];if(p2&&v[1])p2.value=v[1]}
  const f=document.querySelector('footer');if(f)f.textContent=SY.st==='on'?'Daily Journal · tes données sont synchronisées ☁️':'Daily Journal · tes données restent dans ce navigateur. Pense à sauvegarder 💾'}
function resetAll(){if(!confirm(SY.st==='on'?'Tout effacer, sur cet appareil ET sur tes autres appareils ? Pense à sauvegarder avant.':'Tout effacer ? Pense à sauvegarder avant.'))return;
  try{localStorage.setItem('maSemaine_prev',JSON.stringify({at:Date.now(),data:JSON.stringify(S)}))}catch(e){}localStorage.removeItem(K);if(SY.st==='on')lss('maSemaine_forcePush','1');try{sessionStorage.setItem('maSemaine_tab',tab)}catch(e){}location.reload()}

/* ---------- Sauvegardes automatiques sur le compte : une par jour, les 30 dernières ----------
   Rangées dans users/{uid}/backups/{AAAA-MM-JJ}. Si les règles Firebase ne l'autorisent pas encore,
   la synchro continue normalement et Réglages explique quoi faire. */
const BK_MAX=30;
const bkCol=()=>SY.fb.Fs.collection(SY.fb.db,'users',SY.user.uid,'backups');
const bkRef=id=>SY.fb.Fs.doc(SY.fb.db,'users',SY.user.uid,'backups',id);
function backupDaily(){if(lsg('maSemaine_bkDay')===TODAY())return;backupNow()}
async function backupNow(){if(!SY.user||!SY.fb||SY.bkBusy||!dataSize(S))return;SY.bkBusy=true;
  try{const{Fs}=SY.fb,day=TODAY();
    await Fs.setDoc(bkRef(day),{data:JSON.stringify(S),at:Date.now(),n:dataSize(S),device:DEV});
    lss('maSemaine_bkDay',day);SY.bkErr='';
    const all=await Fs.getDocs(bkCol()),ids=all.docs.map(d=>d.id).filter(id=>/^\d{4}-\d\d-\d\d$/.test(id)).sort().reverse();
    for(const id of ids.slice(BK_MAX))await Fs.deleteDoc(bkRef(id))}
  catch(e){SY.bkErr=(e&&/permission/i.test(e.code||e.message||''))?'rules':'net'}
  SY.bkBusy=false;const el=document.getElementById('bkCard');if(el)el.outerHTML=bkCard()}
async function loadBackups(){const el=document.getElementById('bkList');if(!el)return;el.innerHTML='<div class="mut">Chargement…</div>';
  try{const all=await SY.fb.Fs.getDocs(bkCol());const rows=all.docs.filter(d=>/^\d{4}-\d\d-\d\d$/.test(d.id)).sort((a,b)=>a.id<b.id?1:-1);
    el.innerHTML=rows.length?rows.map(d=>{const v=d.data()||{};return `<div class="task"><div class="sp"><div class="tt" style="text-transform:capitalize">${esc(fr(d.id))}</div><div class="mut">${v.n||0} élément${(v.n||0)>1?'s':''}</div></div><button class="btn s" onclick="restoreBackup('${d.id}')">Restaurer</button></div>`}).join(''):'<div class="mut">Pas encore de sauvegarde.</div>'}
  catch(e){el.innerHTML=`<div class="mut">${/permission/i.test((e&&(e.code||e.message))||'')?'Les règles Firebase bloquent les sauvegardes (voir ci-dessus).':'Impossible de charger les sauvegardes. Réessaie plus tard.'}</div>`}}
async function restoreBackup(id){if(!SY.user||!SY.fb)return;
  if(!confirm('Remplacer tes données actuelles par la sauvegarde du '+fr(id)+' ? Elle sera aussi envoyée sur tes autres appareils.\n\nUne copie de tes données actuelles est gardée dans « Version précédente ».'))return;
  try{const snap=await SY.fb.Fs.getDoc(bkRef(id));if(!snap.exists())throw 0;const d=JSON.parse(snap.data().data);
    try{localStorage.setItem('maSemaine_prev',JSON.stringify({at:Date.now(),data:JSON.stringify(S)}))}catch(e){}
    S=d;S._reset=0;save();await push(true,true);render();alert('Sauvegarde restaurée 🌷')}
  catch(e){alert('Impossible de restaurer cette sauvegarde 😕')}}
function bkCard(){if(SY.st!=='on')return'';const day=lsg('maSemaine_bkDay');
  return `<div class="card" id="bkCard"><h2>☁️ Sauvegardes sur ton compte</h2>
  <div class="mut">Chaque jour, une copie de tes données est rangée sur ton compte. Les 30 derniers jours sont gardés.</div>
  ${SY.bkErr==='rules'?'<div class="alert" style="margin-top:10px">Les règles Firebase n’autorisent pas encore les sauvegardes. Mets à jour les règles (Firestore → Règles) avec la version qui contient <b>{document=**}</b>.</div>'
   :`<div class="mut" style="margin-top:6px">Dernière sauvegarde : ${day?fr(day):'pas encore'}${SY.bkErr==='net'?' · la dernière tentative a échoué, nouvel essai à la prochaine synchro':''}</div>`}
  <div id="bkList" style="margin-top:8px"></div>
  <div class="row" style="margin-top:10px"><button class="btn" onclick="loadBackups()">Voir mes sauvegardes</button><button class="btn s" onclick="backupNow().then(()=>loadBackups())">Sauvegarder maintenant</button></div></div>`}
