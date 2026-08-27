// Vercel Edge Middleware – egyszerű jelszavas kapu (ingyenes, hobby plan is)
// A SITE_PASSWORD változót a Vercel dashboardon állítsd be (Project Settings → Environment Variables).
// Ha nincs beállítva, az alapértelmezett jelszó: vimara

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'vimara';
const AUTH_COOKIE = 'vimara_auth';
const AUTH_VALUE = 'ok';

function getCookie(req, name) {
  const c = req.headers.get('cookie') || '';
  const m = c.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? m[1] : null;
}

function unlockPage(error) {
  const html = `<!doctype html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vimara Design – Belépés</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;background:#FAF7F1;color:#16140F;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{background:#fff;border:1px solid rgba(22,20,15,.12);border-radius:4px;padding:44px 38px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 40px rgba(22,20,15,.08)}
  .logo{font-family:'Times New Roman',serif;font-size:1.7rem;letter-spacing:.02em;margin-bottom:4px}
  .logo span{color:#9C8765}
  .sub{color:#7E6C4E;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;margin-bottom:26px}
  input{width:100%;padding:.85rem 1rem;border:1.5px solid rgba(22,20,15,.2);border-radius:3px;font-size:1rem;margin-bottom:14px;text-align:center}
  input:focus{outline:none;border-color:#9C8765;box-shadow:0 0 0 2px rgba(156,135,101,.18)}
  button{width:100%;background:#16140F;color:#FAF7F1;border:none;padding:.85rem;border-radius:3px;font-size:.95rem;font-weight:500;cursor:pointer}
  button:hover{background:#7E6C4E}
  .err{color:#9a3b2e;font-size:.85rem;margin-bottom:14px;min-height:1em}
</style>
</head>
<body>
  <div class="card">
    <div class="logo">Vimara <span>Design</span></div>
    <div class="sub">We manufacture your ideas</div>
    <div class="err">${error ? error : ''}</div>
    <form method="POST" action="/api/unlock">
      <input type="password" name="password" placeholder="Jelszó" autofocus>
      <button type="submit">Belépés</button>
    </form>
  </div>
</body>
</html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export default async function (req) {
  const url = new URL(req.url);

  // Jelszó ellenőrzése
  if (url.pathname === '/api/unlock') {
    try {
      const form = await req.formData();
      const pw = form.get('password') || '';
      if (pw === SITE_PASSWORD) {
        const r = new Response('', { status: 302, headers: { Location: '/' } });
        r.headers.append('Set-Cookie', `${AUTH_COOKIE}=${AUTH_VALUE}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax`);
        return r;
      }
    } catch (e) { /* rossz body */ }
    return unlockPage('Hibás jelszó.');
  }

  // Már be vagyunk lépve?
  if (getCookie(req, AUTH_COOKIE) === AUTH_VALUE) {
    return fetch(req);
  }

  // Nincs belépve -> kapu
  return unlockPage();
}
