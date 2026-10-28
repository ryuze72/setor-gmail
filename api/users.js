export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = 'ryuze72';
  const REPO = 'setor-gmail';
  const FILE_PATH = 'users.json';

  if (!TOKEN) {
    return res.status(500).json({ ok: false, error: 'GITHUB_TOKEN belum di-set di Vercel Environment Variables' });
  }

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
    if (!r.ok) throw new Error(data.message || `GitHub API error ${r.status}`);
    return data;
  }

  async function getUsers() {
    try {
      const file = await gh('GET', FILE_PATH);
      const content = Buffer.from(file.content, 'base64').toString('utf8');
      const json = JSON.parse(content);
      return { users: json.users || [], sha: file.sha };
    } catch (e) {
      // file belum ada / error → mulai kosong
      return { users: [], sha: null };
    }
  }

  async function saveUsers(users, sha) {
    const content = Buffer.from(JSON.stringify({
      users,
      updatedAt: new Date().toISOString(),
      note: 'Setiap email hanya disimpan sekali. Update hanya jika password diganti.'
    }, null, 2)).toString('base64');

    const body = {
      message: `Sync users.json (${users.length} users)`,
      content,
      branch: 'main'
    };
    if (sha) body.sha = sha;

    await gh('PUT', FILE_PATH, body);
  }

  try {
    if (req.method === 'GET') {
      // Hanya return jumlah (jangan expose password)
      const { users } = await getUsers();
      return res.status(200).json({ ok: true, total: users.length });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const { action, email, password, username } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'email dan password wajib' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const { users, sha } = await getUsers();
    const idx = users.findIndex(u => (u.email || '').toLowerCase() === emailNorm);

    if (action === 'register' || action === 'login') {
      if (idx === -1) {
        // User baru → simpan
        users.push({
          email: emailNorm,
          username: username || emailNorm.split('@')[0],
          password: password, // demo only
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        await saveUsers(users, sha);
        return res.status(200).json({ ok: true, action: 'created', total: users.length });
      } else {
        // Sudah ada → cuma update password kalau beda
        if (users[idx].password !== password) {
          users[idx].password = password;
          users[idx].updatedAt = new Date().toISOString();
          await saveUsers(users, sha);
          return res.status(200).json({ ok: true, action: 'password_updated', total: users.length });
        }
        return res.status(200).json({ ok: true, action: 'exists', total: users.length });
      }
    }

    if (action === 'update_pass') {
      if (idx === -1) return res.status(404).json({ ok: false, error: 'User tidak ditemukan' });
      users[idx].password = password;
      users[idx].updatedAt = new Date().toISOString();
      await saveUsers(users, sha);
      return res.status(200).json({ ok: true, action: 'password_updated' });
    }

    return res.status(400).json({ ok: false, error: 'action tidak dikenal. Pakai: register | login | update_pass' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
}
