# Security notes — setor-gmail

## WAJIB
1. **Jadikan repository PRIVATE** (Settings → Change visibility → Private).
   File `db/users.json` berisi data akun. Repo publik = data bisa di-scrape siapa saja.
2. Jangan commit token GitHub / password ke file.
3. Set `GITHUB_TOKEN` hanya di environment hosting (Vercel/Cloudflare), bukan di kode.
4. Opsional: set `SG_APP_KEY` di environment, lalu kirim header `X-SG-Key` dari client.

## Sudah diamankan di update ini
- API GET tidak mengembalikan password user / password gmail setor
- CORS dibatasi (bukan `*`)
- Firebase config client dihapus dari index.html
- robots.txt melarang bot ke `/db/` dan `/api/`

## Batasan
Aplikasi SPA + JSON di GitHub **tidak bisa 100% anti-scrape**.
Siapa pun yang buka website tetap bisa lihat HTML/JS.
Proteksi terkuat: **repo private** + jangan simpan password plain di file publik.
