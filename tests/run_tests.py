"""Tests automatiques de Daily Journal.

Lance un faux serveur (tests/server.py) puis simule des appareils dans Chrome.
    python3 tests/run_tests.py            # tout
    python3 tests/run_tests.py sync       # seulement les tests dont le nom contient « sync »
Code de sortie 0 si tout passe, 1 sinon.
"""
import asyncio, os, subprocess, sys, time, json, urllib.request
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'http://127.0.0.1:8765/index.html'
MOCKS = {'firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'}
RESULTS = []


def check(label, cond, detail=''):
    RESULTS.append(bool(cond))
    print(('  ✅ ' if cond else '  ❌ ') + label + ('' if cond or not detail else f'  → {detail}'), flush=True)


def reset_server():
    urllib.request.urlopen('http://127.0.0.1:8765/__reset').read()


def server_doc(path):
    return json.loads(urllib.request.urlopen('http://127.0.0.1:8765/__doc/' + path).read())


def server_list(path):
    return json.loads(urllib.request.urlopen('http://127.0.0.1:8765/__list/' + path).read())


class Device:
    """Un appareil = un navigateur isolé (son propre stockage)."""

    def __init__(self, page, name):
        self.page, self.name, self.dialogs, self.answer, self.errors = page, name, [], True, []

    @classmethod
    async def new(cls, browser, name, chrome=None):
        ctx = await browser.new_context(viewport={'width': 390, 'height': 844})

        async def route(r):
            f = r.request.url.split('/')[-1]
            if f in MOCKS:
                await r.fulfill(path=os.path.join(HERE, 'mock', f), content_type='application/javascript',
                                headers={'Access-Control-Allow-Origin': '*'})
            else:
                await r.abort()
        await ctx.route(lambda u: u.startswith('https://'), route)
        page = await ctx.new_page()
        d = cls(page, name)
        page.on('pageerror', lambda e: d.errors.append(str(e)))

        async def on_dialog(dlg):
            d.dialogs.append(dlg.message)
            await (dlg.accept() if d.answer else dlg.dismiss())
        page.on('dialog', lambda dlg: asyncio.ensure_future(on_dialog(dlg)))
        await page.goto(URL)
        await page.wait_for_timeout(700)
        return d

    async def js(self, code):
        return await self.page.evaluate(code)

    async def wait(self, ms):
        await self.page.wait_for_timeout(ms)

    async def login(self, email):
        await self.js("go('Réglages')")
        await self.wait(900)
        await self.page.fill('#sy_em', email)
        await self.page.fill('#sy_pw', 'motdepasse123')
        await self.page.click('text=Se connecter')
        await self.wait(3500)

    async def add(self, title, **kw):
        extra = ''.join(f",{k}:{json.dumps(v)}" for k, v in kw.items())
        await self.js(f"S.tasks.push({{id:uid(),title:{json.dumps(title)},cat:'Perso',date:TODAY(),recur:null,subs:[]{extra}}});save();render()")

    async def titles(self):
        return sorted(await self.js("S.tasks.map(t=>t.title)"))


# ---------------------------------------------------------------- tests

async def test_onglets(b):
    print('Onglets et affichage')
    d = await Device.new(b, 'A')
    await d.add("L'<img src=x onerror=alert(1)>")
    tabs = await d.js("Object.keys(TABS)")
    check('8 onglets', tabs == ['Accueil', 'Mois', 'Semaine', 'To-do', 'Trophées', 'Sport', 'Budget', 'Réglages'], tabs)
    for t in tabs:
        await d.js(f"go('{t}')")
        await d.wait(650)
        check(f'onglet {t} s’affiche', len(await d.js("document.getElementById('app').innerText")) > 20)
    await d.js("S.wish.push({id:7,name:'Pull',price:30,link:'javascript:alert(1)',added:TODAY(),bought:null});FOLD['ach-wish']=1;save();go('Budget')")
    await d.wait(700)
    check('lien piégé neutralisé', await d.page.get_attribute('a[target=_blank]', 'href') == '#')
    await d.js("FOLD['acc-todo']=1;go('Accueil')")
    await d.wait(700)
    check('texte piégé affiché comme du texte', await d.page.locator('#app img[src=x]').count() == 0)
    check('aucune erreur JavaScript', not d.errors, d.errors)


async def test_sync_base(b):
    print('Synchro entre deux appareils')
    reset_server()
    ipad, tel = await Device.new(b, 'iPad'), await Device.new(b, 'Tel')
    for i in range(6):
        await ipad.add(f'iPad{i}')
    await tel.login('a@t.fr')          # le téléphone vide se connecte en premier (cas qui avait tout effacé)
    await ipad.login('a@t.fr')
    await tel.wait(4000)
    check('l’iPad garde ses 6 tâches', len(await ipad.titles()) == 6)
    check('le téléphone les récupère', len(await tel.titles()) == 6)
    check('aucune question piège', not ipad.dialogs and not tel.dialogs, ipad.dialogs + tel.dialogs)
    await ipad.add('Ajout iPad')
    await tel.wait(4500)
    check('ajout iPad → téléphone', 'Ajout iPad' in await tel.titles())
    await tel.add('Ajout tél')
    await ipad.wait(4500)
    check('ajout téléphone → iPad', 'Ajout tél' in await ipad.titles())
    await tel.js("S.tasks.find(t=>t.title==='iPad0').title='Renommée';save();render()")
    await ipad.wait(4500)
    check('modification téléphone → iPad', 'Renommée' in await ipad.titles())
    await ipad.js("S.tasks=S.tasks.filter(t=>!t.title.startsWith('iPad'));save();render()")
    await tel.wait(4500)
    check('grosse suppression suivie', await tel.titles() == sorted(['Renommée', 'Ajout iPad', 'Ajout tél']), await tel.titles())
    await ipad.js("toggle(S.tasks[0].id,TODAY())")
    await tel.wait(4500)
    check('case cochée suivie', await tel.js("Object.keys(S.done).length") == 1)
    t3 = await Device.new(b, 'Tel2')
    await t3.login('a@t.fr')
    await t3.wait(2500)
    check('troisième appareil vide récupère tout', len(await t3.titles()) == 3)
    await ipad.wait(1500)
    check('… sans vider les autres', len(await ipad.titles()) == 3)
    for d in (ipad, tel, t3):
        check(f'aucune erreur JavaScript ({d.name})', not d.errors, d.errors)


async def test_sync_premiere_connexion(b):
    print('Synchro : deux appareils remplis, compte neuf')
    reset_server()
    x, y = await Device.new(b, 'X'), await Device.new(b, 'Y')
    await x.add('X1')
    await x.login('b@t.fr')
    await y.add('Y1')
    y.answer = False
    await y.login('b@t.fr')
    await x.wait(4500)
    check('une question claire est posée', len(y.dialogs) == 1, y.dialogs)
    check('« Annuler » garde l’appareil et l’envoie', await x.titles() == ['Y1'] and await y.titles() == ['Y1'],
          (await x.titles(), await y.titles()))
    check('l’ancienne version de X est restaurable', await x.js("prevInfo()&&prevInfo().n") == 1)


async def test_sync_fusion(b):
    print('Synchro : modifications simultanées (fusion)')
    reset_server()
    a, c = await Device.new(b, 'A'), await Device.new(b, 'C')
    for i in range(3):
        await a.add(f'Base{i}')
    await a.login('f@t.fr')
    await c.login('f@t.fr')
    await c.wait(3000)
    check('départ identique', await a.titles() == await c.titles() and len(await a.titles()) == 3)
    # Les deux appareils modifient en même temps des choses différentes.
    await a.js("SY.unsub&&SY.unsub();SY.unsub=null")            # A ne « voit » plus le serveur (réseau lent)
    await c.js("SY.unsub&&SY.unsub();SY.unsub=null")
    await a.add('Ajout A')
    await a.js("toggle(S.tasks.find(t=>t.title==='Base0').id,TODAY())")
    await c.add('Ajout C')
    await c.js("S.tasks=S.tasks.filter(t=>t.title!=='Base2');save();render()")
    await c.js("S.tasks.find(t=>t.title==='Base1').title='Base1 modifiée';save();render()")
    await a.wait(2500)
    await a.js("listen()")
    await c.js("listen()")
    await a.wait(6000)
    want = sorted(['Base0', 'Base1 modifiée', 'Ajout A', 'Ajout C'])
    check('les ajouts des deux côtés sont gardés', await a.titles() == want, await a.titles())
    check('… pareil sur l’autre appareil', await c.titles() == want, await c.titles())
    check('la suppression faite sur C est respectée', 'Base2' not in await a.titles())
    check('la case cochée sur A est gardée', await c.js("S.tasks.some(t=>t.title==='Base0'&&isDone(t,TODAY()))"))
    srv = json.loads(server_doc('users/u_ftfr')['data'])
    check('le serveur a la version fusionnée', sorted(t['title'] for t in srv['tasks']) == want)
    for d in (a, c):
        check(f'aucune erreur JavaScript ({d.name})', not d.errors, d.errors)


async def test_fusion_unitaire(b):
    print('Règles de fusion')
    d = await Device.new(b, 'U')
    cases = {
        'ajouts des deux côtés gardés': ("merge3({tasks:[{id:1}]},{tasks:[{id:1},{id:2}]},{tasks:[{id:1},{id:3}]}).tasks.map(t=>t.id).sort()", [1, 2, 3]),
        'suppression d’un côté respectée': ("merge3({tasks:[{id:1},{id:2}]},{tasks:[{id:1}]},{tasks:[{id:1},{id:2}]}).tasks.map(t=>t.id)", [1]),
        'modification gagne sur suppression': ("merge3({tasks:[{id:1,title:'a'}]},{tasks:[]},{tasks:[{id:1,title:'b'}]}).tasks.map(t=>t.title)", ['b']),
        'champs différents fusionnés': ("(o=>[o.title,o.cat])(merge3({tasks:[{id:1,title:'a',cat:'X'}]},{tasks:[{id:1,title:'b',cat:'X'}]},{tasks:[{id:1,title:'a',cat:'Y'}]}).tasks[0])", ['b', 'Y']),
        'cases cochées des deux côtés': ("Object.keys(merge3({done:{}},{done:{'1|d':1}},{done:{'2|d':1}}).done).sort()", ['1|d', '2|d']),
        'case décochée d’un côté': ("Object.keys(merge3({done:{'1|d':1}},{done:{}},{done:{'1|d':1}}).done)", []),
        'étoiles additionnées': ("merge3({stars:10},{stars:12},{stars:13}).stars", 15),
        'jours de routine fusionnés': ("merge3({d:[1,3]},{d:[1,3,5]},{d:[1]}).d", [1, 5]),
    }
    for label, (code, want) in cases.items():
        got = await d.js(code)
        check(label, got == want, f'{got} au lieu de {want}')


async def test_sauvegardes(b):
    print('Sauvegardes automatiques sur le serveur')
    reset_server()
    a = await Device.new(b, 'A')
    await a.add('À garder')
    await a.login('s@t.fr')
    await a.wait(3000)
    bk = server_list('users/u_stfr/backups')
    check('une sauvegarde du jour est créée', len(bk) == 1, bk.keys())
    # On simule 35 jours de sauvegardes anciennes : l'appli n'en garde que 30.
    for i in range(1, 36):
        day = time.strftime('%Y-%m-%d', time.localtime(time.time() - 86400 * i))
        req = urllib.request.Request(f'http://127.0.0.1:8765/__doc/users/u_stfr/backups/{day}', method='POST',
                                     data=json.dumps({'data': json.dumps({'tasks': [{'id': i, 'title': f'Ancienne {i}'}]}), 'at': 0, 'n': 1}).encode())
        urllib.request.urlopen(req).read()
    await a.js("lss('maSemaine_bkDay',null);backupNow()")
    await a.wait(2500)
    check('seules les 30 dernières sont gardées', len(server_list('users/u_stfr/backups')) == 30, len(server_list('users/u_stfr/backups')))
    await a.js("go('Réglages')")
    await a.wait(1500)
    check('la liste des sauvegardes s’affiche', 'Sauvegardes sur ton compte' in await a.js("document.getElementById('app').innerText"))
    await a.js("S.tasks=[];save();render()")
    await a.wait(2000)
    hier = time.strftime('%Y-%m-%d', time.localtime(time.time() - 86400))
    await a.js(f"restoreBackup('{hier}')")
    await a.wait(2500)
    check('restaurer une sauvegarde remet les données', await a.titles() == ['Ancienne 1'], await a.titles())
    check('aucune erreur JavaScript', not a.errors, a.errors)


async def test_sauvegardes_bloquees(b):
    print('Sauvegardes bloquées par les règles Firebase')
    reset_server()
    a, c = await Device.new(b, 'A'), await Device.new(b, 'C')
    await a.add('Tâche 1')
    await a.login('r@t.fr')
    # Les règles refusent tout ce qui est rangé sous « backups »
    await a.js("(()=>{const o=SY.fb.Fs;SY.fb={...SY.fb,Fs:{...o,setDoc:async(ref,v)=>{if(ref.path.includes('backups')){const e=new Error('Missing or insufficient permissions.');e.code='permission-denied';throw e}return o.setDoc(ref,v)}}};lss('maSemaine_bkDay',null)})()")
    await a.add('Tâche 2')
    await a.wait(3000)
    await c.login('r@t.fr')
    await c.wait(3000)
    check('la synchro continue malgré le refus', await c.titles() == ['Tâche 1', 'Tâche 2'], await c.titles())
    await a.js("go('Réglages')")
    await a.wait(1000)
    check('Réglages explique quoi faire', 'n’autorisent pas encore' in await a.js("document.getElementById('app').innerText"))
    check('aucune erreur JavaScript', not a.errors and not c.errors, a.errors + c.errors)


async def test_rappels(b):
    print('Rappels')
    d = await Device.new(b, 'A')
    await d.page.context.grant_permissions(['notifications'], origin='http://127.0.0.1:8765')
    await d.js("window._n=0;window.notify=()=>_n++;const x=new Date();x.setMinutes(x.getMinutes()+8);"
               "S.tasks.push({id:3,title:'RDV',cat:'Perso',time:String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0'),date:TODAY(),recur:null,subs:[]});"
               "save();localStorage.removeItem('maSemaine_dirty')")
    await d.js("checkReminders();checkReminders();checkReminders()")
    check('rappel envoyé une seule fois', await d.js("_n") == 1)
    check('les rappels ne déclenchent pas de synchro', await d.js("localStorage.getItem('maSemaine_dirty')") is None)


async def test_hors_ligne(b):
    print('Ouverture hors ligne')
    ctx = await b.new_context()
    await ctx.route(lambda u: u.startswith('https://'), lambda r: r.abort())
    p = await ctx.new_page()
    await p.goto(URL)
    await p.wait_for_timeout(500)
    await p.evaluate("navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready)")
    await p.wait_for_timeout(600)
    await p.reload()
    await p.wait_for_timeout(1200)
    await p.evaluate("S.tasks.push({id:9,title:'Hors ligne OK',cat:'Perso',date:TODAY(),recur:null,subs:[]});save()")
    await ctx.set_offline(True)
    await p.reload()
    await p.wait_for_timeout(1500)
    ok = await p.evaluate("typeof S==='object'&&S.tasks.some(t=>t.title==='Hors ligne OK')")
    check('l’appli s’ouvre sans réseau', ok)
    await ctx.set_offline(False)


TESTS = [test_onglets, test_fusion_unitaire, test_sync_base, test_sync_premiere_connexion, test_sync_fusion, test_sauvegardes, test_sauvegardes_bloquees, test_rappels, test_hors_ligne]


async def main(filt):
    srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'server.py')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            exe = os.environ.get('CHROME_PATH')
            b = await p.chromium.launch(**({'executable_path': exe} if exe else {}), args=['--no-sandbox'])
            for t in TESTS:
                if filt and filt not in t.__name__:
                    continue
                try:
                    await t(b)
                except Exception as e:
                    check(f'{t.__name__} s’exécute sans planter', False, repr(e)[:300])
            await b.close()
    finally:
        srv.terminate()
    ok = all(RESULTS)
    print(f"\n{sum(RESULTS)}/{len(RESULTS)} vérifications réussies — {'TOUT OK' if ok else 'ÉCHECS'}")
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else '')))
