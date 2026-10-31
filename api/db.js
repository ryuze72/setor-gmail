export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowedExact = ['https://storemail.my.id','https://www.storemail.my.id','https://setor-gmail.vercel.app','https://setor-gmail-ten.vercel.app','http://localhost:3000','http://127.0.0.1:3000'];
  if (allowedExact.includes(origin) || /\.pages\.dev$/i.test(origin) || /\.vercel\.app$/i.test(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://storemail.my.id');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-SG-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = process.env.GITHUB_TOKEN;
  const APP_KEY = process.env.SG_APP_KEY || '';
  const OWNER = process.env.GH_OWNER || 'ryuze72';
  const REPO = process.env.GH_REPO || 'setor-gmail';
  const BRANCH = process.env.GH_BRANCH || 'main';
  if (!TOKEN) return res.status(500).json({ ok: false, error: 'GITHUB_TOKEN belum di-set di Vercel' });
  if (APP_KEY) {
    const key = req.headers['x-sg-key'] || '';
    if (key !== APP_KEY) return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const FILES = {
    users: 'db/users.json', submissions: 'db/submissions.json', withdrawals: 'db/withdrawals.json',
    config: 'db/config.json', reports: 'db/reports.json', audit: 'db/audit.json', bans: 'db/bans.json'
  };

  async function gh(method, path, body) {
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, ok: r.ok, data };
  }
  async function readFile(path) {
    const { status, ok, data } = await gh('GET', path);
    if (status === 404) return { data: null, sha: null };
    if (!ok) throw new Error(data.message || `GitHub GET ${status}`);
    try { return { data: JSON.parse(Buffer.from(data.content || '', 'base64').toString('utf8')), sha: data.sha }; }
    catch (e) { return { data: null, sha: data.sha }; }
  }
  async function writeFile(path, obj, sha, message) {
    const content = Buffer.from(JSON.stringify(obj, null, 2)).toString('base64');
    const body = { message: message || `Update ${path}`, content, branch: BRANCH };
    if (sha) body.sha = sha;
    const { status, ok, data } = await gh('PUT', path, body);
    if (status === 409 || status === 422) { const err = new Error('conflict'); err.code = 'CONFLICT'; throw err; }
    if (!ok) throw new Error(data.message || `GitHub PUT ${status}`);
    return data;
  }
  async function mutate(path, mutator, message, emptyFactory) {
    let lastErr = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { data, sha } = await readFile(path);
        const base = data != null ? data : emptyFactory();
        const next = await mutator(JSON.parse(JSON.stringify(base)));
        await writeFile(path, next, sha, message);
        return next;
      } catch (e) {
        lastErr = e;
        if (e.code === 'CONFLICT' || /conflict/i.test(e.message || '')) { await new Promise(r => setTimeout(r, 150 + attempt * 200)); continue; }
        throw e;
      }
    }
    throw lastErr || new Error('mutate failed');
  }

  try {
    if (req.method === 'GET') {
      const type = String(req.query.type || 'users').toLowerCase();
      const path = FILES[type];
      if (!path) return res.status(400).json({ ok: false, error: 'type invalid' });
      const { data } = await readFile(path);
      if (type === 'users') {
        const store = data || { users: [] };
        return res.status(200).json({ ok: true, type, data: { users: (store.users || []).map(u => ({ id: u.id, user: u.user, email: u.email || '', pass: u.pass || u.password || '', role: u.role || 'user', ref: u.ref || '', refCode: u.refCode || '', banned: !!u.banned, banReason: u.banReason || '', createdAt: u.createdAt, updatedAt: u.updatedAt, ts: u.ts || (u.createdAt ? Date.parse(u.createdAt) : undefined) })) } });
      }
      if (type === 'submissions') {
        const store = data || { submissions: [] };
        return res.status(200).json({ ok: true, type, data: { submissions: (store.submissions || []).map(s => ({ id: s.id, gmail: s.gmail, password: s.password || s.pass || '', status: s.status || 'pending', userId: s.userId || s.uid || '', user: s.user || '', email: s.email || '', category: s.category || '', harga: s.harga, timestamp: s.timestamp || Date.now(), createdAt: s.createdAt })) } });
      }
      if (type === 'withdrawals') return res.status(200).json({ ok: true, type, data: data || { withdrawals: [] } });
      if (type === 'config') return res.status(200).json({ ok: true, type, data: data || {} });
      if (type === 'reports') return res.status(200).json({ ok: true, type, data: data || { reports: [] } });
      if (type === 'audit') return res.status(200).json({ ok: true, type, data: data || { logs: [] } });
      if (type === 'bans') return res.status(200).json({ ok: true, type, data: data || { bans: {}, reasons: {} } });
      return res.status(200).json({ ok: true, type, data });
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

    const body = req.body || {};
    const action = body.action;
    const type = body.type;

    if (type === 'users' || action === 'register' || action === 'login' || action === 'update_user') {
      const email = String(body.email || '').trim().toLowerCase();
      const username = String(body.username || body.user || '').trim().toLowerCase();
      const password = String(body.password || body.pass || '');
      if (!email && !username && !body.id) return res.status(400).json({ ok: false, error: 'email/username wajib' });
      const store = await mutate(FILES.users, (s) => {
        if (!Array.isArray(s.users)) s.users = [];
        const idx = s.users.findIndex((u) => (body.id && u.id === body.id) || (email && (u.email || '').toLowerCase() === email) || (username && (u.user || '').toLowerCase() === username));
        const now = new Date().toISOString();
        if (idx >= 0) {
          if (password) s.users[idx].pass = password;
          if (body.role) s.users[idx].role = body.role;
          if (body.ref !== undefined) s.users[idx].ref = body.ref;
          if (body.refCode) s.users[idx].refCode = body.refCode;
          if (body.banned !== undefined) s.users[idx].banned = !!body.banned;
          if (body.banReason !== undefined) s.users[idx].banReason = body.banReason;
          s.users[idx].updatedAt = now; s._action = 'updated';
        } else {
          s.users.push({ id: body.id || 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), user: username || (email ? email.split('@')[0] : 'user'), email: email || '', pass: password, ref: body.ref || '', refCode: body.refCode || '', role: body.role || 'user', banned: !!body.banned, banReason: body.banReason || '', createdAt: now, updatedAt: now });
          s._action = 'created';
        }
        s.updatedAt = now; return s;
      }, `users ${action || 'upsert'}`, () => ({ users: [], updatedAt: null }));
      const act = store._action || 'ok'; delete store._action;
      return res.status(200).json({ ok: true, action: act, total: (store.users || []).length });
    }

    if (type === 'submissions' || action === 'add_submission' || action === 'update_submission') {
      const items = action === 'update_submission' ? [body] : (Array.isArray(body.items) ? body.items : [body]);
      const store = await mutate(FILES.submissions, (s) => {
        if (!Array.isArray(s.submissions)) s.submissions = [];
        let added = 0, updated = 0;
        for (const it of items) {
          if (!it) continue;
          const gmail = String(it.gmail || '').trim().toLowerCase();
          const id = it.id || null;
          if (!gmail && !id) continue;
          let idx = -1;
          if (id) idx = s.submissions.findIndex((x) => x.id === id);
          if (idx < 0 && gmail) {
            const uid = it.userId || it.uid || '';
            idx = s.submissions.findIndex((x) => (x.gmail || '').toLowerCase() === gmail && (!uid || x.userId === uid || x.uid === uid));
          }
          const now = new Date().toISOString();
          if (idx >= 0) {
            const cur = s.submissions[idx];
            if (it.status) cur.status = it.status;
            if (it.password !== undefined || it.pass !== undefined) cur.password = it.password || it.pass || '';
            if (it.category) cur.category = it.category;
            if (it.harga !== undefined) cur.harga = it.harga;
            if (it.userId || it.uid) cur.userId = it.userId || it.uid;
            if (it.user) cur.user = it.user;
            if (it.email) cur.email = it.email;
            if (gmail) cur.gmail = gmail;
            cur.updatedAt = now; updated++;
          } else if (gmail) {
            s.submissions.unshift({ id: id || Date.now().toString(36) + Math.random().toString(36).slice(2, 5), gmail, password: it.password || it.pass || '', status: it.status || 'pending', userId: it.userId || it.uid || '', user: it.user || '', email: it.email || '', category: it.category || '', harga: it.harga, timestamp: it.timestamp || Date.now(), createdAt: now });
            added++;
          }
        }
        s.submissions = s.submissions.slice(0, 3000);
        s.updatedAt = new Date().toISOString();
        s._added = added; s._updated = updated; return s;
      }, `submissions ${action || 'upsert'}`, () => ({ submissions: [], updatedAt: null }));
      const added = store._added || 0, updated = store._updated || 0;
      delete store._added; delete store._updated;
      return res.status(200).json({ ok: true, action: 'submissions_upserted', added, updated, total: (store.submissions || []).length });
    }

    if (type === 'withdrawals' || action === 'add_withdrawal' || action === 'update_withdrawal') {
      const store = await mutate(FILES.withdrawals, (s) => {
        if (!Array.isArray(s.withdrawals)) s.withdrawals = [];
        const id = body.id || null;
        let idx = id ? s.withdrawals.findIndex((x) => x.id === id) : -1;
        const now = new Date().toISOString();
        if (idx >= 0) {
          const cur = s.withdrawals[idx];
          if (body.status) cur.status = body.status;
          if (body.amt !== undefined || body.amount !== undefined) cur.amt = body.amt || body.amount;
          if (body.method) cur.method = body.method;
          if (body.dana || body.account) cur.dana = body.dana || body.account;
          if (body.name) cur.name = body.name;
          cur.updatedAt = now; s._action = 'updated';
        } else {
          s.withdrawals.unshift({ id: id || Date.now().toString(36), amt: body.amt || body.amount || 0, method: body.method || 'DANA', dana: body.dana || body.account || '', name: body.name || '', status: body.status || 'pending', userId: body.userId || body.uid || '', user: body.user || '', email: body.email || '', ts: body.ts || Date.now(), createdAt: now });
          s._action = 'created';
        }
        s.withdrawals = s.withdrawals.slice(0, 2000); s.updatedAt = now; return s;
      }, `withdrawals ${action || 'upsert'}`, () => ({ withdrawals: [], updatedAt: null }));
      const act = store._action; delete store._action;
      return res.status(200).json({ ok: true, action: act === 'updated' ? 'withdrawal_updated' : 'withdrawal_added', total: (store.withdrawals || []).length });
    }

    if (type === 'bans' || action === 'set_ban') {
      const store = await mutate(FILES.bans, (s) => {
        if (!s.bans) s.bans = {}; if (!s.reasons) s.reasons = {};
        const uid = body.userId || body.uid || body.id;
        if (!uid) return s;
        if (body.banned) { s.bans[uid] = true; s.reasons[uid] = body.reason || body.banReason || 'Banned'; }
        else { delete s.bans[uid]; delete s.reasons[uid]; }
        s.updatedAt = new Date().toISOString(); return s;
      }, `ban ${body.userId || ''}`, () => ({ bans: {}, reasons: {}, updatedAt: null }));
      try {
        await mutate(FILES.users, (s) => {
          if (!Array.isArray(s.users)) return s;
          const uid = body.userId || body.uid || body.id;
          const i = s.users.findIndex(u => u.id === uid);
          if (i >= 0) { s.users[i].banned = !!body.banned; s.users[i].banReason = body.banned ? (body.reason || body.banReason || '') : ''; s.users[i].updatedAt = new Date().toISOString(); }
          return s;
        }, 'mirror ban', () => ({ users: [] }));
      } catch (e) {}
      return res.status(200).json({ ok: true, action: 'ban_updated', data: store });
    }

    if (type === 'reports' || action === 'add_report' || action === 'update_report') {
      const store = await mutate(FILES.reports, (s) => {
        if (!Array.isArray(s.reports)) s.reports = [];
        if (action === 'update_report' && body.id) {
          const i = s.reports.findIndex(r => r.id === body.id);
          if (i >= 0) { if (body.status) s.reports[i].status = body.status; s.reports[i].updatedAt = new Date().toISOString(); }
        } else {
          const items = Array.isArray(body.items) ? body.items : [body];
          for (const it of items) {
            if (!it || !(it.msg || it.message)) continue;
            const id = it.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
            if (s.reports.some(r => r.id === id)) {
              const j = s.reports.findIndex(r => r.id === id);
              if (j >= 0 && it.status) s.reports[j].status = it.status;
              continue;
            }
            s.reports.unshift({ id, msg: it.msg || it.message || '', type: it.type || 'general', status: it.status || 'pending', userId: it.userId || it.uid || '', user: it.user || '', ts: it.ts || Date.now(), createdAt: new Date().toISOString() });
          }
        }
        s.reports = s.reports.slice(0, 1000); s.updatedAt = new Date().toISOString(); return s;
      }, `reports ${action || 'upsert'}`, () => ({ reports: [], updatedAt: null }));
      return res.status(200).json({ ok: true, action: 'reports_ok', total: (store.reports || []).length });
    }

    if (type === 'audit' || action === 'add_audit') {
      const store = await mutate(FILES.audit, (s) => {
        if (!Array.isArray(s.logs)) s.logs = [];
        const items = Array.isArray(body.items) ? body.items : [body];
        for (const it of items) {
          if (!it || !(it.msg || it.message)) continue;
          s.logs.unshift({ msg: it.msg || it.message, by: it.by || 'sys', t: it.t || Date.now() });
        }
        s.logs = s.logs.slice(0, 500); s.updatedAt = new Date().toISOString(); return s;
      }, 'audit log', () => ({ logs: [], updatedAt: null }));
      return res.status(200).json({ ok: true, action: 'audit_ok', total: (store.logs || []).length });
    }

    if (type === 'config' || action === 'update_config') {
      const store = await mutate(FILES.config, (s) => {
        const cfg = body.config || body;
        const next = { ...s, ...cfg, updatedAt: new Date().toISOString() };
        delete next.action; delete next.type; delete next.config; return next;
      }, 'Update config', () => ({}));
      return res.status(200).json({ ok: true, action: 'config_updated', data: store });
    }

    return res.status(400).json({ ok: false, error: 'action/type tidak dikenal' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
}
