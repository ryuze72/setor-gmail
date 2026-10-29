export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = 'ryuze72';
  const REPO = 'setor-gmail';

  if (!TOKEN) {
    return res.status(500).json({ ok: false, error: 'GITHUB_TOKEN belum di-set di Vercel Environment Variables' });
  }

  const FILES = {
    users: 'db/users.json',
    submissions: 'db/submissions.json',
    withdrawals: 'db/withdrawals.json',
    config: 'db/config.json'
  };

  async function gh(method, path, body) {
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || `GitHub API ${r.status}`);
    return data;
  }

  async function readFile(path) {
    try {
      const file = await gh('GET', path);
      const content = Buffer.from(file.content, 'base64').toString('utf8');
      return { data: JSON.parse(content), sha: file.sha };
    } catch (e) {
      return { data: null, sha: null };
    }
  }

  async function writeFile(path, data, sha, message) {
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const body = { message: message || `Update ${path}`, content, branch: 'main' };
    if (sha) body.sha = sha;
    await gh('PUT', path, body);
  }

  try {
    // GET ?type=users|submissions|withdrawals|config
    if (req.method === 'GET') {
      const type = (req.query.type || 'users').toLowerCase();
      const path = FILES[type];
      if (!path) return res.status(400).json({ ok: false, error: 'type invalid' });
      const { data } = await readFile(path);
      return res.status(200).json({ ok: true, type, data });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const body = req.body || {};
    const { action, type } = body;

    // ===== USERS =====
    if (type === 'users' || action === 'register' || action === 'login' || action === 'update_user') {
      const path = FILES.users;
      const { data, sha } = await readFile(path);
      const store = data || { users: [], updatedAt: null };
      if (!Array.isArray(store.users)) store.users = [];

      const email = String(body.email || '').trim().toLowerCase();
      const username = String(body.username || body.user || '').trim().toLowerCase();
      const password = String(body.password || body.pass || '');

      if (!email && !username) {
        return res.status(400).json({ ok: false, error: 'email/username wajib' });
      }

      const idx = store.users.findIndex(u =>
        (email && (u.email || '').toLowerCase() === email) ||
        (username && (u.user || '').toLowerCase() === username)
      );

      if (action === 'register' || (action === 'login' && idx === -1)) {
        if (idx >= 0) {
          // already exists — only update password if changed
          if (password && store.users[idx].pass !== password) {
            store.users[idx].pass = password;
            store.users[idx].updatedAt = new Date().toISOString();
            store.updatedAt = new Date().toISOString();
            await writeFile(path, store, sha, `Update password ${email || username}`);
            return res.status(200).json({ ok: true, action: 'password_updated' });
          }
          return res.status(200).json({ ok: true, action: 'exists' });
        }
        store.users.push({
          id: body.id || Date.now().toString(36),
          user: username || email.split('@')[0],
          email: email || '',
          pass: password,
          ref: body.ref || '',
          role: body.role || 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        store.updatedAt = new Date().toISOString();
        await writeFile(path, store, sha, `Add user ${email || username}`);
        return res.status(200).json({ ok: true, action: 'created', total: store.users.length });
      }

      if (action === 'update_user' && idx >= 0) {
        if (password) store.users[idx].pass = password;
        if (body.banned !== undefined) store.users[idx].banned = !!body.banned;
        store.users[idx].updatedAt = new Date().toISOString();
        store.updatedAt = new Date().toISOString();
        await writeFile(path, store, sha, `Update user ${email || username}`);
        return res.status(200).json({ ok: true, action: 'updated' });
      }

      return res.status(200).json({ ok: true, action: 'noop' });
    }

    // ===== SUBMISSIONS (gmail setor) =====
    if (type === 'submissions' || action === 'add_submission') {
      const path = FILES.submissions;
      const { data, sha } = await readFile(path);
      const store = data || { submissions: [], updatedAt: null };
      if (!Array.isArray(store.submissions)) store.submissions = [];

      const items = Array.isArray(body.items) ? body.items : [body];
      let added = 0;
      for (const it of items) {
        const gmail = String(it.gmail || '').trim().toLowerCase();
        if (!gmail) continue;
        // skip exact dup in file
        if (store.submissions.some(s => s.gmail === gmail && s.userId === (it.userId || it.uid))) continue;
        store.submissions.unshift({
          id: it.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          gmail,
          password: it.password || it.pass || '',
          status: it.status || 'pending',
          userId: it.userId || it.uid || '',
          user: it.user || '',
          email: it.email || '',
          timestamp: it.timestamp || Date.now(),
          createdAt: new Date().toISOString()
        });
        added++;
      }
      if (added > 0) {
        // keep last 2000
        store.submissions = store.submissions.slice(0, 2000);
        store.updatedAt = new Date().toISOString();
        await writeFile(path, store, sha, `Add ${added} submission(s)`);
      }
      return res.status(200).json({ ok: true, action: 'submissions_added', added, total: store.submissions.length });
    }

    // ===== WITHDRAWALS =====
    if (type === 'withdrawals' || action === 'add_withdrawal') {
      const path = FILES.withdrawals;
      const { data, sha } = await readFile(path);
      const store = data || { withdrawals: [], updatedAt: null };
      if (!Array.isArray(store.withdrawals)) store.withdrawals = [];

      store.withdrawals.unshift({
        id: body.id || Date.now().toString(36),
        amt: body.amt || body.amount || 0,
        method: body.method || 'DANA',
        dana: body.dana || body.account || '',
        name: body.name || '',
        status: body.status || 'pending',
        userId: body.userId || body.uid || '',
        user: body.user || '',
        email: body.email || '',
        ts: body.ts || Date.now(),
        createdAt: new Date().toISOString()
      });
      store.withdrawals = store.withdrawals.slice(0, 1000);
      store.updatedAt = new Date().toISOString();
      await writeFile(path, store, sha, `Add WD ${body.amt || 0}`);
      return res.status(200).json({ ok: true, action: 'withdrawal_added', total: store.withdrawals.length });
    }

    // ===== CONFIG =====
    if (type === 'config' || action === 'update_config') {
      const path = FILES.config;
      const { data, sha } = await readFile(path);
      const store = { ...(data || {}), ...body.config, updatedAt: new Date().toISOString() };
      delete store.action; delete store.type; delete store.config;
      await writeFile(path, store, sha, 'Update config');
      return res.status(200).json({ ok: true, action: 'config_updated', data: store });
    }

    return res.status(400).json({ ok: false, error: 'action/type tidak dikenal' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
}
