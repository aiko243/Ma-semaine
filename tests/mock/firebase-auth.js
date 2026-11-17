// Imitation de Firebase Auth pour les tests (un compte = un e-mail).
let cbs=[],user=null;try{const u=localStorage.getItem('mockUser');if(u)user=JSON.parse(u)}catch(e){}
const uidOf=em=>'u_'+em.replace(/[^a-z0-9]/gi,'');
export function getAuth(){return{}}
export function onAuthStateChanged(a,cb){cbs.push(cb);setTimeout(()=>cb(user),50)}
function set(u){user=u;localStorage.setItem('mockUser',JSON.stringify(u));cbs.forEach(c=>c(u))}
export async function signInWithEmailAndPassword(a,em){set({uid:uidOf(em),email:em})}
export async function createUserWithEmailAndPassword(a,em){set({uid:uidOf(em),email:em})}
export async function signOut(){user=null;localStorage.removeItem('mockUser');cbs.forEach(c=>c(null))}
export async function sendPasswordResetEmail(){}
