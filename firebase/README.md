# SETOR GMAIL — Firebase Edition

Backend: **Firebase Auth + Firestore** (menggantikan Express + PostgreSQL).

Repo: https://github.com/ryuze72/setor-gmail/tree/main/firebase

## File
- `index.html` — struktur UI
- `style.css` — desain liquid glass (upload dari lokal jika belum ada)
- `app.js` — logic + Firebase API (upload dari lokal jika belum ada)
- `firestore.rules` — security rules

**File lengkap lokal:** folder `setor-gmail-firebase` (index/style/app).

---

## Mode demo (tanpa Firebase)

1. Download ketiga file: `index.html`, `style.css`, `app.js`
2. Buka `index.html` di browser (sama folder)
3. Data tersimpan di localStorage

**Admin demo:**
- Email: `admin@setor.local`
- Password: `12345678_`

---

## Cara setup Firebase (langkah demi langkah)

### 1. Buat project
1. Buka https://console.firebase.google.com
2. **Add project** → nama misalnya `setor-gmail`
3. Nonaktifkan Google Analytics (opsional) → Create

### 2. Aktifkan Authentication
1. Menu **Build → Authentication → Get started**
2. Tab **Sign-in method**
3. Aktifkan **Email/Password** → Save

### 3. Buat Firestore
1. Menu **Build → Firestore Database → Create database**
2. Pilih **Start in test mode** dulu (nanti diganti rules)
3. Lokasi: `asia-southeast2` (Jakarta) atau terdekat → Enable

### 4. Ambil config web
1. Ikon **⚙️ Project settings**
2. Scroll **Your apps** → **</> Web**
3. Nickname: `setor-web` → Register
4. Copy object `firebaseConfig` (apiKey, authDomain, projectId, dll.)

### 5. Paste config ke `app.js`
Buka `app.js`, cari bagian:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Ganti semua nilai dengan config dari Console.

Kalau sudah diisi (bukan `YOUR_API_KEY`), app otomatis pakai Firebase (bukan demo localStorage).

### 6. Deploy security rules
1. Firestore → tab **Rules**
2. Paste isi file `firestore.rules` dari repo
3. **Publish**

### 7. Jadikan akun admin
1. Daftar dulu lewat app (email & password)
2. Firebase Console → **Authentication** → catat UID user
3. **Firestore** → collection `users` → dokumen = UID tersebut
4. Tambah/edit field:
   - `role` (string) = `admin`
   - `name`, `email` sudah ada saat daftar
5. Logout & login lagi → menu Admin muncul

### 8. Hosting (opsional)
```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # public = folder firebase, single-page = no
firebase deploy
```

Atau upload folder ke Vercel / Netlify / GitHub Pages.

---

## Struktur data Firestore

| Collection | Field penting |
|------------|----------------|
| `users/{uid}` | name, email, role (`user`/`admin`) |
| `submissions/{id}` | userId, gmail, status, timeline, category |
| `notifications/{id}` | userId, title, body, type, read |
| `audit_log/{id}` | actor, action |

Status: `menunggu` → `diproses` → `diterima` / `ditolak`

---

## Keamanan
- Jangan minta password Gmail / OTP / recovery
- Email disamarkan di daftar user
- Rules membatasi baca/tulis per user & admin
- Untuk production: aktifkan App Check, pertimbangkan Cloud Functions untuk rate limit

---

© 2026 SETOR GMAIL
