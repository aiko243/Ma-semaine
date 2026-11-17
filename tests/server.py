"""Faux serveur pour les tests : sert l'appli + imite la base Firestore (documents JSON en mémoire).
Lancement : python3 tests/server.py   (port 8765)"""
import json, os, http.server, socketserver, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = {}
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(s, *a): pass
    def _json(s, obj, code=200):
        b = json.dumps(obj).encode(); s.send_response(code)
        s.send_header('Content-Type', 'application/json'); s.send_header('Access-Control-Allow-Origin', '*')
        s.send_header('Content-Length', str(len(b))); s.end_headers(); s.wfile.write(b)
    def do_GET(s):
        p = urllib.parse.unquote(s.path)
        if p.startswith('/__doc/'): return s._json(DOCS.get(p[7:]))
        if p.startswith('/__list/'):
            pre = p[8:].rstrip('/') + '/'
            return s._json({k[len(pre):]: v for k, v in DOCS.items() if k.startswith(pre) and '/' not in k[len(pre):]})
        if p == '/__reset': DOCS.clear(); return s._json({})
        return super().do_GET()
    def do_POST(s):
        p = urllib.parse.unquote(s.path); n = int(s.headers.get('Content-Length', 0)); body = json.loads(s.rfile.read(n) or 'null')
        if p.startswith('/__doc/'):
            key = p[7:]
            if isinstance(body, dict) and '__expect' in body:          # écriture conditionnelle (transaction)
                exp = body.pop('__expect'); cur = DOCS.get(key)
                if (cur or {}).get('updatedAt') != exp and not (cur is None and exp is None):
                    return s._json({'conflict': True}, 409)
            if body is None: DOCS.pop(key, None)
            else: DOCS[key] = body
            return s._json({})
        s._json({}, 404)
    def do_OPTIONS(s):
        s.send_response(200)
        for h, v in [('Access-Control-Allow-Origin', '*'), ('Access-Control-Allow-Headers', '*'), ('Access-Control-Allow-Methods', '*')]: s.send_header(h, v)
        s.end_headers()
socketserver.ThreadingTCPServer.allow_reuse_address = True
if __name__ == '__main__':
    socketserver.ThreadingTCPServer(('127.0.0.1', 8765), H).serve_forever()
