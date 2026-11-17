/* Démarrage de l'appli */
addEventListener('online',()=>{if(SY.st==='err')syncInit();else push()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')push()});
if(!TABS[tab])tab='Accueil';
render();
try{const y=+sessionStorage.getItem('maSemaine_y');sessionStorage.removeItem('maSemaine_y');if(y)setTimeout(()=>scrollTo(0,y),50)}catch(e){}
window.MS_BOOT=1;
if(lsg('maSemaine_forcePush')){lss('maSemaine_forcePush',null);S._reset=Date.now();save()}
statUI();syncInit();
