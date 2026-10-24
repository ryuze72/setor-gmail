# SETOR GMAIL — Real Firebase (bukan demo)

## File
Upload **satu file** `index.html` dari folder artifacts (versi Firebase real).

Path lokal: `/home/workdir/artifacts/setor-gmail/index.html`

## Project Firebase
- projectId: `setor-50777`
- Auth: Email/Password harus ON
- Firestore: harus dibuat

## Authorized domains
Authentication → Settings → Authorized domains, tambah:
- `setor-gmail-ten.vercel.app`
- `localhost`
- domain Vercel lain yang kamu pakai

## Rules (Firestore → Rules → Publish)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isAdmin() {
      return signedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{userId} {
      allow read: if signedIn() && (request.auth.uid == userId || isAdmin());
      allow create: if signedIn() && request.auth.uid == userId;
      allow update: if signedIn() && (request.auth.uid == userId || isAdmin());
    }
    match /categories/{id} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }
    match /submissions/{id} {
      allow read: if signedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if signedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if false;
    }
    match /notifications/{id} {
      allow read, update: if signedIn() && resource.data.userId == request.auth.uid;
      allow create: if signedIn();
    }
    match /audit_log/{id} {
      allow read, create: if isAdmin();
    }
  }
}
```

## Jadi admin
1. Daftar di web dengan email kamu
2. Authentication → Users → salin UID
3. Firestore → users → dokumen UID → field `role` = `admin`

## Deploy Vercel (perbaiki 404)
1. vercel.com → project kamu
2. Upload ulang `index.html` (root project, bukan subfolder)
3. Redeploy production

Data real tersimpan di Firestore project setor-50777.
