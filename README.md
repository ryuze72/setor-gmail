# Setor Gmail

Platform setor Gmail dengan desain **iOS Liquid Glass** premium + backend **Firebase Auth + Firestore**.

## Fitur

- Login & Register (Firebase Auth)
- Form setor Gmail + pilihan password wajib: `sgsg1122` atau `goldacok`
- Validasi format `@gmail.com`
- Dashboard, riwayat setoran real-time, status proses, profil
- Toast notification + loading state
- Desain responsif (HP & desktop)
- Tidak ada CAPTCHA
- Tidak menyimpan password Gmail asli selain pilihan yang ditentukan

## Struktur

```
index.html          → Aplikasi lengkap (HTML + CSS + JS + Firebase)
firestore.rules     → Aturan keamanan Firestore
vercel.json         → Konfigurasi deploy Vercel
```

## Firebase

- Project ID: `setor-50777`
- Auth: Email/Password harus aktif
- Firestore: aktif

### Authorized domains
Authentication → Settings → Authorized domains, tambahkan domain Vercel kamu (contoh: `setor-gmail.vercel.app`) dan `localhost`.

### Firestore Rules
Copy isi file `firestore.rules` ke Firebase Console → Firestore → Rules → Publish.

### Jadi Admin
1. Daftar di website
2. Authentication → Users → salin UID
3. Firestore → collection `users` → dokumen UID → field `role` = `"admin"`

## Deploy

### Vercel (direkomendasikan)
1. Hubungkan repo `ryuze72/setor-gmail` ke Vercel
2. Root directory: `.` (root)
3. Deploy

Atau push ke `main` → Vercel otomatis deploy jika sudah terhubung.

## Catatan Keamanan

- Password yang disimpan hanya pilihan `sgsg1122` / `goldacok` (bukan password Gmail asli).
- Sistem ini hanya mencatat alamat Gmail + password pilihan + status.
- Jangan digunakan untuk aktivitas yang melanggar ToS Google.

© 2026 Setor Gmail
