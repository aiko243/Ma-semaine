// Imitation de Firestore pour les tests : documents JSON sur le faux serveur, écoute par sondage.
const B=location.origin;
const get=async p=>(await fetch(B+'/__doc/'+p)).json();
const put=async(p,v)=>{const r=await fetch(B+'/__doc/'+p,{method:'POST',body:JSON.stringify(v)});if(r.status===409){const e=new Error('conflit');e.code='aborted';throw e}};
export function getFirestore(){return{}}
export function doc(db,...parts){return{path:parts.join('/')}}
export function collection(db,...parts){return{path:parts.join('/')}}
export async function setDoc(ref,val){await put(ref.path,val)}
export async function getDoc(ref){const d=await get(ref.path);return{exists:()=>!!d,data:()=>d,id:ref.path.split('/').pop()}}
export async function deleteDoc(ref){await put(ref.path,null)}
export function query(c,...q){return c}
export function orderBy(){return null}
export function limit(){return null}
export async function getDocs(c){const m=await (await fetch(B+'/__list/'+c.path)).json();
  const docs=Object.entries(m).sort((a,b)=>a[0]<b[0]?1:-1).map(([id,d])=>({id,data:()=>d,ref:{path:c.path+'/'+id}}));return{docs,size:docs.length,forEach:f=>docs.forEach(f)}}
export async function runTransaction(db,fn){
  for(let i=0;i<5;i++){const reads={};const tx={
      get:async ref=>{const d=await get(ref.path);reads[ref.path]=d?d.updatedAt:null;return{exists:()=>!!d,data:()=>d}},
      set:(ref,v)=>{tx._w.push([ref,v]);return tx},_w:[]};
    const out=await fn(tx);
    try{for(const[ref,v]of tx._w)await put(ref.path,{...v,__expect:(ref.path in reads)?reads[ref.path]:undefined});return out}
    catch(e){if(e.code!=='aborted')throw e}}
  const e=new Error('transaction');e.code='aborted';throw e}
export function onSnapshot(ref,opts,next,err){if(typeof opts==='function'){err=next;next=opts}let last='__',stop=false;
  setTimeout(()=>next({exists:()=>false,data:()=>undefined,metadata:{hasPendingWrites:false,fromCache:true}}),10);
  const tick=async()=>{if(stop)return;try{const r=await get(ref.path);const k=JSON.stringify(r);
    if(k!==last){last=k;next({exists:()=>!!r,data:()=>r,metadata:{hasPendingWrites:false,fromCache:false}})}}catch(e){}setTimeout(tick,250)};
  setTimeout(tick,400);return()=>{stop=true}}
