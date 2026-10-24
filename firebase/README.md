# SETOR GMAIL — Firebase Edition

Frontend liquid-glass + backend **Firebase Auth + Firestore** (menggantikan Express + PostgreSQL).

## Fitur
- Landing, daftar/login, dashboard, form setor, riwayat, detail timeline
- Admin: ubah status, catatan, ekspor CSV
- Notifikasi, tema gelap/terang
- Email disamarkan, tidak minta password/OTP Gmail

## Mode demo (tanpa Firebase)
Buka `index.html` langsung di browser. Data di localStorage.

**Admin demo:**
- Email: `admin@setor.local`
- Password: `12345678_`

## Setup Firebase
1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication** → Email/Password
3. Buat **Firestore** database
4. Salin config ke `index.html` (cari `firebaseConfig`)
5. Deploy rules dari `firestore.rules`
6. Jadikan admin (setelah daftar sekali):
   - Di Firestore → collection `users` → dokumen UID Anda → field `role` = `"admin"`

## Struktur data Firestore
- `users/{uid}` — name, email, role
- `submissions/{id}` — userId, gmail, status, timeline, ...
- `notifications/{id}` — userId, title, body, type, read
- `audit_log/{id}` — actor, action
- `categories/{id}` — name (opsional)

## Keamanan
- Rules di `firestore.rules` membatasi akses per user / admin
- Jangan commit API key production ke repo publik tanpa App Check
- Untuk production, pertimbangkan Cloud Functions untuk audit & rate limit

## File
- `index.html` — app lengkap
- `firestore.rules` — security rules
