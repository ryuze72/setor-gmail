# Deploy Setor Gmail — Cloudflare Pages saja (bukan Vercel)

## Deploy
1. https://dash.cloudflare.com → Workers & Pages
2. Create → Pages → Connect repo `ryuze72/setor-gmail`
3. Framework: None | Build command: kosong | Output: `/` atau `.`
4. Save and Deploy → dapat `xxx.pages.dev`
5. Custom domains → add `storemail.my.id`

## DNS
- Hapus A record ke `76.76.21.21` (Vercel)
- Jangan buat A record manual ke IP Vercel
- Biarkan Pages yang isi DNS saat custom domain Active

## SSL
- SSL/TLS → mode Full

## Catatan
- Folder `api/` format Vercel; di Pages static, fitur `/api/db` tidak jalan kecuali pakai Cloudflare Workers terpisah.
- App tetap bisa jalan dengan localStorage di browser.
