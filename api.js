'use strict';

const firebaseConfig = {
  apiKey: "AIzaSyD0wMmg9vQoiG--PqPaaHETyyhu__BObv8",
  authDomain: "setor-50777.firebaseapp.com",
  projectId: "setor-50777",
  storageBucket: "setor-50777.firebasestorage.app",
  messagingSenderId: "654313758897",
  appId: "1:654313758897:web:b086b6a076470904d4c290",
  measurementId: "G-G9QRVM54LH"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function maskEmail(e){ if(!e||!e.includes('@')) return e; const [u,d]=e.split('@'); return u.slice(0,2)+'\u2022'.repeat(Math.max(3,u.length-2))+'@'+d; }
function seriesFromSubs(subs, days){
  const map={}; const now=new Date();
  for(let i=days-1;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i); map[d.toISOString().slice(0,10)]=0; }
  subs.forEach(s=>{ const key=String(s.createdAt||'').slice(0,10); if(key in map) map[key]++; });
  return Object.entries(map).map(([d,c])=>({d,c}));
}
async function getUserDoc(uid){ const snap=await db.collection('users').doc(uid).get(); return snap.exists ? {uid, ...snap.data()} : null; }
async function currentUser(){ const u=auth.currentUser; if(!u) return null; const doc=await getUserDoc(u.uid); return { uid:u.uid, name:(doc&&doc.name)||u.displayName||'User', email:u.email, role:(doc&&doc.role)||'user' }; }
async function requireUser(){ const me=await currentUser(); if(!me) throw new Error('Silakan masuk terlebih dahulu.'); return me; }
async function requireAdmin(){ const me=await requireUser(); if(me.role!=='admin') throw new Error('Akses admin diperlukan.'); return me; }

async function req(path, {method = 'GET', body, headers = {}} = {}){
  if(path==='/auth/me'){
    const me=await currentUser(); if(!me) return {user:null, unread:0};
    let unread=0; try { const ns=await db.collection('notifications').where('userId','==',me.uid).where('read','==',false).get(); unread=ns.size; } catch(e){}
    return {user:me, unread};
  }
  if(path==='/auth/register' && method==='POST'){
    const {name,email,password}=body||{}; if(!name||!email||!password) throw new Error('Lengkapi semua field.');
    const cred=await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({displayName:name});
    await db.collection('users').doc(cred.user.uid).set({ name, email:String(email).toLowerCase(), role:'user', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    return {user:{uid:cred.user.uid, name, email:String(email).toLowerCase(), role:'user'}};
  }
  if(path==='/auth/login' && method==='POST'){
    const {email,password}=body||{};
    try{
      const cred=await auth.signInWithEmailAndPassword(email, password);
      const me=await getUserDoc(cred.user.uid) || {name:cred.user.displayName||'User', email:cred.user.email, role:'user'};
      return {user:{uid:cred.user.uid, name:me.name, email:cred.user.email, role:me.role||'user'}};
    }catch(e){
      if(['auth/user-not-found','auth/wrong-password','auth/invalid-credential','auth/invalid-email'].includes(e.code)) throw new Error('Email atau password salah.');
      throw new Error(e.message||'Gagal masuk.');
    }
  }
  if(path==='/auth/logout' && method==='POST'){ await auth.signOut(); return {ok:true}; }
  if(path==='/public/stats'){
    const snap=await db.collection('submissions').get(); const subs=snap.docs.map(d=>d.data());
    return {total:subs.length, ok:subs.filter(s=>s.status==='diterima').length, system:'Aktif'};
  }
  if(path==='/categories'){
    const snap=await db.collection('categories').get();
    if(snap.empty){ for(const [i,name] of ['Reguler','Prioritas','Lainnya'].entries()) await db.collection('categories').add({name, order:i}); const again=await db.collection('categories').get(); return again.docs.map(d=>({id:d.id, ...d.data()})); }
    return snap.docs.map(d=>({id:d.id, ...d.data()}));
  }
  if(path==='/dashboard/stats'){
    const me=await requireUser();
    const snap=await db.collection('submissions').where('userId','==',me.uid).get();
    const subs=snap.docs.map(d=>({id:d.id, ...d.data(), createdAt:d.data().createdAt?.toDate?.()?.toISOString?.()||''}));
    return {total:subs.length, pending:subs.filter(s=>s.status==='menunggu'||s.status==='diproses').length, ok:subs.filter(s=>s.status==='diterima').length, bad:subs.filter(s=>s.status==='ditolak').length, series:seriesFromSubs(subs,7)};
  }
  if(path==='/submissions' && method==='GET'){
    const me=await requireUser();
    const snap=await db.collection('submissions').where('userId','==',me.uid).get();
    return snap.docs.map(d=>{ const x=d.data(); return {id:d.id, ...x, createdAt:x.createdAt?.toDate?.()?.toISOString?.()||x.createdAt||''}; }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }
  if(path.startsWith('/submissions/') && method==='GET'){
    const me=await requireUser(); const id=decodeURIComponent(path.split('/').pop());
    const doc=await db.collection('submissions').doc(id).get(); if(!doc.exists) throw new Error('Tidak ditemukan.');
    const x=doc.data(); if(x.userId!==me.uid && me.role!=='admin') throw new Error('Tidak ditemukan.');
    return {id:doc.id, ...x, createdAt:x.createdAt?.toDate?.()?.toISOString?.()||x.createdAt||'', timeline:(x.timeline||[]).map(t=>({...t, at:t.at?.toDate?.()?.toISOString?.()||t.at}))};
  }
  if(path==='/submissions' && method==='POST'){
    const me=await requireUser(); const {name,gmail,category,note}=body||{};
    if(!gmail || !/@gmail\.com$/i.test(gmail)) throw new Error('Gmail tidak valid.');
    const now=firebase.firestore.Timestamp.now(); const ref=db.collection('submissions').doc();
    const sub={ userId:me.uid, name:name||me.name, email:String(gmail).toLowerCase(), emailMasked:maskEmail(String(gmail).toLowerCase()), category:category||'Reguler', note:note||'', status:'menunggu', adminNote:'', createdAt:now, timeline:[{status:'menunggu', at:now, note:'Pengajuan diterima sistem.'}] };
    await ref.set(sub);
    return {id:ref.id, ...sub, createdAt:new Date().toISOString(), timeline:[{status:'menunggu', at:new Date().toISOString(), note:'Pengajuan diterima sistem.'}]};
  }
  if(path==='/notifications'){
    const me=await requireUser();
    const snap=await db.collection('notifications').where('userId','==',me.uid).get();
    return snap.docs.map(d=>{ const x=d.data(); return {id:d.id, ...x, at:x.at?.toDate?.()?.toISOString?.()||x.at||''}; }).sort((a,b)=>new Date(b.at)-new Date(a.at));
  }
  if(path==='/notifications/read' && method==='POST'){
    const me=await requireUser();
    const snap=await db.collection('notifications').where('userId','==',me.uid).where('read','==',false).get();
    const batch=db.batch(); snap.docs.forEach(d=>batch.update(d.ref,{read:true})); await batch.commit(); return {ok:true};
  }
  if(path==='/admin/submissions' && method==='GET'){
    await requireAdmin();
    const snap=await db.collection('submissions').get();
    return snap.docs.map(d=>{ const x=d.data(); return {id:d.id, ...x, createdAt:x.createdAt?.toDate?.()?.toISOString?.()||x.createdAt||''}; }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }
  if(path.startsWith('/admin/submissions/') && method==='GET'){
    await requireAdmin(); const id=decodeURIComponent(path.split('/').pop());
    const doc=await db.collection('submissions').doc(id).get(); if(!doc.exists) throw new Error('Tidak ditemukan.');
    const x=doc.data();
    return {id:doc.id, ...x, createdAt:x.createdAt?.toDate?.()?.toISOString?.()||x.createdAt||'', timeline:(x.timeline||[]).map(t=>({...t, at:t.at?.toDate?.()?.toISOString?.()||t.at}))};
  }
  if(path.startsWith('/admin/submissions/') && method==='PATCH'){
    const admin=await requireAdmin(); const parts=path.split('/'); const id=decodeURIComponent(parts[parts.length-1]);
    const {status, note}=body||{}; const ref=db.collection('submissions').doc(id);
    const doc=await ref.get(); if(!doc.exists) throw new Error('Tidak ditemukan.');
    const x=doc.data(); const now=firebase.firestore.Timestamp.now();
    const timeline=[...(x.timeline||[]), {status, at:now, note:note||('Status diubah ke '+status)}];
    await ref.update({status, adminNote:note||x.adminNote||'', timeline});
    await db.collection('notifications').add({userId:x.userId, title:'Status diperbarui', body:id+' \u2192 '+status, type:'status', read:false, at:now});
    await db.collection('audit_log').add({action:'set status '+id+' \u2192 '+status, actor:admin.email, at:now});
    return {id, ...x, status, adminNote:note||x.adminNote};
  }
  if(path==='/admin/stats'){
    await requireAdmin();
    const snap=await db.collection('submissions').get();
    const subs=snap.docs.map(d=>({id:d.id, ...d.data(), createdAt:d.data().createdAt?.toDate?.()?.toISOString?.()||''}));
    return {total:subs.length, pending:subs.filter(s=>s.status==='menunggu'||s.status==='diproses').length, ok:subs.filter(s=>s.status==='diterima').length, bad:subs.filter(s=>s.status==='ditolak').length, series:seriesFromSubs(subs,30)};
  }
  if(path==='/admin/audit'){
    await requireAdmin();
    try { const snap=await db.collection('audit_log').orderBy('at','desc').limit(100).get(); return snap.docs.map(d=>{ const x=d.data(); return {id:d.id, ...x, at:x.at?.toDate?.()?.toISOString?.()||x.at||''}; }); } catch(e){ return []; }
  }
  if(path==='/admin/categories' && method==='POST'){
    await requireAdmin(); const name=(body&&body.name||'').trim(); if(!name) throw new Error('Nama kosong.');
    const ref=await db.collection('categories').add({name}); return {id:ref.id, name};
  }
  if(path.startsWith('/admin/categories/') && method==='DELETE'){
    await requireAdmin(); await db.collection('categories').doc(path.split('/').pop()).delete(); return {ok:true};
  }
  throw new Error('Endpoint tidak dikenal: '+path);
}
