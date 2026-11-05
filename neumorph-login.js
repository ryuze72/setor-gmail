/* ===== neumorph-login.js =====
   Taruh SEBELUM </body>:  <script src="neumorph-login.js"></script>
   (atau tempel isinya di dalam <script>...</script> paling bawah)
   Isi: 1) tema neumorphism untuk seluruh app  2) halaman login geser sign in/sign up
        3) perbaikan login macet di "Memeriksa..." */
(function () {
  'use strict';
  var KU = 'sg_users', KA = 'sg_auth', KBAN = 'sg_ban';
  var $ = function (i) { return document.getElementById(i); };

  /* ---------- 1) CSS ---------- */
  var css = `
:root{--n-bg:#F4F1EA;--n-hi:#FBF9F4;--n-lo:#E8E3D7;--n-sd:rgba(178,167,145,.55);--n-sl:#fff;--n-ink:#2C2A29;--n-mut:#8A857F;--n-navy:#1E2A38;--n-gold:#C5A880;--n-gold-d:#A58859;--n-ease:cubic-bezier(.65,0,.35,1);
--font-body:'Montserrat',-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;--font-display:var(--font-body);
--g-ink:#2C2A29;--g-ink2:#41454d;--g-mut:#8A857F;--g-blue:#1E2A38;--ink:#2C2A29;--muted:#8A857F;--muted-2:#A7A196;--blue:#1E2A38;--blue-2:#C5A880;--brand:#1E2A38;--blue-soft:rgba(197,168,128,.22);--blue-border:rgba(197,168,128,.5);--bg:#F4F1EA}
html{background:#F4F1EA!important}
html body{background:#F4F1EA!important;color:var(--n-ink)!important;font-family:var(--font-body)!important}
/* permukaan timbul */
html body :is(.card,.form-card,.list-card,.menu-list,.profile-card,.ref-display,.rules,.wd-balance,.cfg-card,.ad-table,.qa,.meter-card,.stat-card,.ref-stat,.ad-stat,.help-box,.tg-card,.user-row,.admin-side,.bulk-bar){background:linear-gradient(145deg,var(--n-hi),var(--n-bg) 55%,var(--n-lo))!important;border:0!important;border-radius:22px!important;box-shadow:8px 8px 18px var(--n-sd),-8px -8px 18px var(--n-sl)!important;color:var(--n-ink)!important}
html body :is(.list-row,.menu-btn,.ad-table-row){border-color:rgba(0,0,0,.05)!important}
html body :is(.input,.textarea,select.input,.admin-search-box input){background:linear-gradient(145deg,var(--n-lo),var(--n-hi))!important;border:0!important;border-radius:14px!important;color:var(--n-ink)!important;box-shadow:inset 4px 4px 9px var(--n-sd),inset -4px -4px 9px var(--n-sl)!important}
html body :is(.input,.textarea,select.input,.admin-search-box input):focus{box-shadow:inset 4px 4px 9px var(--n-sd),inset -4px -4px 9px var(--n-sl),0 0 0 2px rgba(197,168,128,.9)!important}
html body :is(.pw-options label,.wd-preset,.wd-preset-all){background:linear-gradient(145deg,var(--n-hi),var(--n-lo))!important;border:0!important;color:var(--n-ink)!important;box-shadow:4px 4px 9px var(--n-sd),-4px -4px 9px var(--n-sl)!important}
html body .pw-options label:has(input:checked){box-shadow:inset 3px 3px 7px var(--n-sd),inset -3px -3px 7px var(--n-sl)!important;color:var(--n-navy)!important}
/* tombol */
html body :is(.btn-primary,.btn.primary,.btn-blue,#b-login,#b-reg,#b-setor,#b-wd,.help-box .btn){background:linear-gradient(145deg,#2A394B,#1E2A38 60%,#16202B)!important;color:#F4F1EA!important;border:0!important;text-shadow:none!important;box-shadow:6px 8px 16px rgba(30,42,56,.3),-4px -4px 10px var(--n-sl)!important}
html body :is(.btn-secondary,.btn-sec,.btn-ghost,.btn-danger){background:linear-gradient(145deg,var(--n-hi),var(--n-lo))!important;color:var(--n-ink)!important;border:0!important;box-shadow:5px 5px 11px var(--n-sd),-5px -5px 11px var(--n-sl)!important}
html body .btn-danger{color:#c0392b!important}
html body .btn-success{background:linear-gradient(145deg,#E3CDA6,#C5A880 60%,#A58859)!important;color:var(--n-navy)!important;border:0!important;box-shadow:5px 6px 14px rgba(165,136,89,.4),-4px -4px 9px var(--n-sl)!important}
/* header */
html body .app-header-inner{background:linear-gradient(145deg,var(--n-hi),var(--n-lo))!important;border:0!important;box-shadow:6px 6px 14px var(--n-sd),-6px -6px 14px var(--n-sl)!important}
html body .hdr-greet .hi{color:var(--n-mut)!important}html body .hdr-greet .name{color:var(--n-ink)!important}
html body .badge-status{background:var(--n-bg)!important;color:#0a7a3a!important;border:0!important;box-shadow:inset 2px 2px 5px var(--n-sd),inset -2px -2px 5px var(--n-sl)!important}
html body .badge-status.closed{color:#c0392b!important}
html body :is(.avatar-btn,.profile-avatar,.admin-user-avatar){background:radial-gradient(circle at 30% 25%,#F1E2C6,#C5A880 55%,#A58859)!important;color:var(--n-navy)!important;border:0!important;box-shadow:5px 5px 11px var(--n-sd),-4px -4px 9px var(--n-sl)!important}
/* kartu saldo */
html body .balance-card{background:linear-gradient(145deg,#2A394B,#1E2A38 60%,#16202B)!important;color:#F4F1EA!important;border:0!important;border-radius:26px!important;box-shadow:10px 12px 24px rgba(30,42,56,.35),-8px -8px 18px var(--n-sl)!important}
html body .balance-card .chip{background:rgba(255,255,255,.09)!important;border:0!important;box-shadow:inset 2px 2px 5px rgba(0,0,0,.25)!important}
html body .balance-actions .solid{background:var(--n-bg)!important;color:var(--n-navy)!important;border:0!important;box-shadow:4px 4px 10px rgba(0,0,0,.25)!important}
html body .balance-actions .outline{background:linear-gradient(145deg,#E3CDA6,#C5A880 60%,#A58859)!important;color:var(--n-navy)!important;border:0!important;box-shadow:4px 4px 10px rgba(0,0,0,.25)!important}
/* ikon, dock, kuota, promo */
html body .qa-btn:nth-child(n) .qa-i{background:linear-gradient(145deg,var(--n-hi),var(--n-lo))!important;color:var(--n-navy)!important;border:0!important;box-shadow:5px 5px 11px var(--n-sd),-5px -5px 11px var(--n-sl)!important}
html body :is(.row-icon,.menu-icon,.stat-ico,.hb-ico){background:linear-gradient(145deg,var(--n-hi),var(--n-lo))!important;color:var(--n-navy)!important;box-shadow:3px 3px 7px var(--n-sd),-3px -3px 7px var(--n-sl)!important}
html body .dock{background:linear-gradient(145deg,var(--n-hi),var(--n-lo))!important;border:0!important;border-radius:999px!important;box-shadow:8px 8px 20px var(--n-sd),-8px -8px 20px var(--n-sl)!important}
html body .dock button{background:transparent!important;color:var(--n-mut)!important;box-shadow:none!important}
html body .dock button.on{color:var(--n-navy)!important;background:linear-gradient(145deg,var(--n-lo),var(--n-hi))!important;box-shadow:inset 3px 3px 7px var(--n-sd),inset -3px -3px 7px var(--n-sl)!important}
html body .dock button[data-p="stor"],html body .dock button[data-p="stor"].on{background:linear-gradient(145deg,#2A394B,#1E2A38)!important;color:var(--n-gold)!important;border:0!important;box-shadow:6px 8px 16px rgba(30,42,56,.35),-4px -4px 10px var(--n-sl)!important}
html body .ring{background:conic-gradient(var(--n-gold) calc(var(--p)*1%),rgba(0,0,0,.08) 0)!important}
html body .ring::before{background:var(--n-bg)!important}html body .ring b,html body .meter-head span b{color:var(--n-navy)!important}
html body .meter{background:var(--n-lo)!important;box-shadow:inset 2px 2px 5px var(--n-sd),inset -2px -2px 5px var(--n-sl)!important}
html body .meter i{background:linear-gradient(90deg,#E3CDA6,#C5A880)!important;box-shadow:none!important}
html body .promo{background:linear-gradient(135deg,#2A394B,#1E2A38)!important;border:0!important;box-shadow:8px 10px 20px rgba(30,42,56,.3),-6px -6px 14px var(--n-sl)!important}
html body .promo-cta{background:var(--n-gold)!important;color:var(--n-navy)!important;border:0!important}
html body :is(.ann,.warn,.check-result,.ref-banner,.ref-rule){border:0!important;box-shadow:inset 3px 3px 7px var(--n-sd),inset -3px -3px 7px var(--n-sl)!important}
html body :is(.admin-mnav button,.filter-tabs button){background:linear-gradient(145deg,var(--n-hi),var(--n-lo))!important;color:var(--n-ink)!important;border:0!important;box-shadow:4px 4px 9px var(--n-sd),-4px -4px 9px var(--n-sl)!important}
html body :is(.admin-mnav button.on,.filter-tabs button.on,.admin-nav button.on){background:linear-gradient(145deg,#2A394B,#1E2A38)!important;color:#F4F1EA!important}
html body .switch input:checked+span{background:var(--n-gold)!important}

/* ===== login geser ===== */
#auth{position:fixed!important;inset:0;z-index:5;display:block!important;overflow:hidden;background:var(--n-bg)!important;padding:0!important}
#auth.hidden{display:none!important}
#auth *{font-family:var(--font-body)}
.nm-stage{position:absolute;left:50%;top:50%;width:720px;height:440px;margin:-220px 0 0 -360px;transform-origin:center}
.nm-card{position:relative;width:100%;height:100%;border-radius:22px;overflow:hidden;background:linear-gradient(145deg,var(--n-hi),var(--n-bg) 45%,var(--n-lo));box-shadow:0 50px 80px -30px rgba(110,95,65,.45),0 22px 40px -18px rgba(110,95,65,.3),-14px -14px 30px rgba(255,255,255,.9),inset 1px 1px 0 #fff;animation:nmRise 1s var(--n-ease) both}
@keyframes nmRise{from{opacity:0;transform:translateY(24px) scale(.97)}}
.nm-pane{position:absolute;top:0;width:50%;height:100%;padding:0 40px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;visibility:hidden;transition:visibility 0s linear .85s}
.nm-pane.up{right:0}.nm-pane.in{left:0}
.nm-card.is-in .in,.nm-card:not(.is-in) .up{visibility:visible;transition-delay:0s}
.nm-pane>*{width:100%;opacity:0;filter:blur(8px);transform:translateX(34px);transition:opacity .6s ease,filter .6s ease,transform 1s var(--n-ease)}
.nm-pane.in>*{transform:translateX(-34px)}
.nm-pane>:nth-child(2){--i:1}.nm-pane>:nth-child(3){--i:2}
.nm-card:not(.is-in) .up>*,.nm-card.is-in .in>*{opacity:1;filter:none;transform:none;transition-delay:calc(.4s + var(--i,0)*.09s)}
.nm-pane h1{font-size:24px;font-weight:800;letter-spacing:-.02em;text-align:center;color:var(--n-ink)}
.nm-hint{font-size:9.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--n-mut);text-align:center}
.nm-form{display:flex;flex-direction:column;gap:11px}
.nm-fld{position:relative}
.nm-fld>svg{position:absolute;left:14px;top:12px;width:16px;height:16px;fill:none;stroke:var(--n-mut);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;pointer-events:none;transition:stroke .3s}
.nm-fld:focus-within>svg{stroke:var(--n-gold-d)}
#auth .nm-fld input{width:100%;height:40px;padding:0 14px 0 40px;font:500 13px var(--font-body);color:var(--n-ink);border:0;border-radius:12px;outline:0;background:linear-gradient(145deg,var(--n-lo),var(--n-hi));box-shadow:inset 5px 5px 10px var(--n-sd),inset -5px -5px 10px var(--n-sl);transition:box-shadow .35s}
#auth .nm-fld input::placeholder{color:#A7A196}
#auth .nm-fld input:focus{box-shadow:inset 5px 5px 10px var(--n-sd),inset -5px -5px 10px var(--n-sl),0 0 0 2px rgba(197,168,128,.9),0 0 18px rgba(197,168,128,.35)}
.nm-msg{min-height:14px;font-size:11px;font-weight:600;color:#c0392b;text-align:center;line-height:1.3}
#auth .nm-btn{position:relative;height:44px;border:0;border-radius:30px;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;font:700 11.5px var(--font-body);letter-spacing:.16em;text-transform:uppercase;color:#F4F1EA;background:linear-gradient(145deg,#2A394B,var(--n-navy) 60%,#16202B);box-shadow:8px 10px 20px rgba(30,42,56,.35),-5px -5px 12px var(--n-sl),inset 0 1px 0 rgba(255,255,255,.12);transition:transform .3s,box-shadow .3s}
#auth .nm-btn::before{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(197,168,128,.5),transparent);transform:skewX(-20deg);transition:left .9s var(--n-ease)}
#auth .nm-btn:hover{transform:translateY(-2px)}#auth .nm-btn:hover::before{left:130%}
#auth .nm-btn:active{transform:translateY(1px)}
#auth .nm-btn:disabled{opacity:.85;cursor:progress}
.nm-btn .lbl{transition:opacity .3s,transform .3s}
.nm-btn .spin{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border:2px solid rgba(255,255,255,.25);border-top-color:var(--n-gold);border-radius:50%;opacity:0;transition:opacity .3s}
.nm-btn.load .lbl{opacity:0;transform:translateY(-8px)}.nm-btn.load .spin{opacity:1;animation:nmSp .8s linear infinite}
@keyframes nmSp{to{transform:rotate(360deg)}}
.nm-alt{text-align:center;font-size:11.5px;color:var(--n-mut)}
.nm-alt button{border:0;background:linear-gradient(var(--n-gold),var(--n-gold)) 0 100%/0 2px no-repeat;color:var(--n-navy);font:700 11.5px var(--font-body);cursor:pointer;transition:background-size .4s var(--n-ease)}
.nm-alt button:hover{background-size:100% 2px}
#auth .ref-banner{padding:7px 10px;font-size:11px;border-radius:10px}
.nm-ov{position:absolute;top:0;left:0;width:50%;height:100%;z-index:5;overflow:hidden;background:linear-gradient(145deg,var(--n-hi),var(--n-bg) 55%,#EDE8DC);box-shadow:14px 0 34px -8px rgba(110,95,65,.28),1px 0 0 rgba(255,255,255,.8);transition:transform 1.2s var(--n-ease),box-shadow 1.2s var(--n-ease)}
.nm-card.is-in .nm-ov{transform:translateX(100%);box-shadow:-14px 0 34px -8px rgba(110,95,65,.28),-1px 0 0 rgba(255,255,255,.8)}
.nm-ring{position:absolute;border-radius:50%;box-shadow:inset 10px 10px 22px var(--n-sd),inset -10px -10px 22px var(--n-sl);transition:transform 1.35s var(--n-ease)}
.nm-r1{width:250px;height:250px;top:-105px;right:-80px}.nm-r2{width:300px;height:300px;bottom:-170px;left:-70px}.nm-r3{width:110px;height:110px;bottom:36px;right:24px;opacity:.7}
.nm-card.is-in .nm-r1{transform:translate(-190px,120px) scale(1.2)}.nm-card.is-in .nm-r2{transform:translate(170px,-130px) scale(.9)}.nm-card.is-in .nm-r3{transform:translate(-190px,-90px) scale(.8)}
.nm-ot{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:0 40px;text-align:center;transition:opacity .6s ease,filter .6s ease,transform 1s var(--n-ease)}
.nm-ot h2{font-size:25px;font-weight:800;letter-spacing:-.02em;color:var(--n-ink)}
.nm-ot p{font-size:12.5px;line-height:1.75;color:var(--n-mut);max-width:230px}
.nm-logo{max-width:170px;max-height:70px;object-fit:contain;filter:drop-shadow(6px 8px 10px rgba(110,95,65,.3))}
.nm-ot.a{transition-delay:.4s}
.nm-ot.b{opacity:0;filter:blur(8px);transform:translateX(-34px);pointer-events:none}
.nm-card.is-in .nm-ot.a{opacity:0;filter:blur(8px);transform:translateX(34px);transition-delay:0s}
.nm-card.is-in .nm-ot.b{opacity:1;filter:none;transform:none;transition-delay:.4s;pointer-events:auto}
@media (prefers-reduced-motion:reduce){#auth *{animation:none!important;transition-duration:.01s!important;transition-delay:0s!important}}
`;
  var st = document.createElement('style'); st.id = 'neumorph'; st.textContent = css; document.head.appendChild(st);
  var fl = document.createElement('link'); fl.rel = 'stylesheet';
  fl.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap'; document.head.appendChild(fl);

  /* ---------- 2) markup login ---------- */
  var auth = $('auth'); if (!auth) return;
  var oldLogo = auth.querySelector('.auth-logo'), logoSrc = oldLogo ? oldLogo.src : '';
  var regHandler = $('b-reg') && $('b-reg').onclick;
  var logo = logoSrc ? '<img class="nm-logo" src="' + logoSrc + '" alt="Stor Email">' : '';
  var ic = function (d) { return '<svg viewBox="0 0 24 24">' + d + '</svg>'; };
  var iUser = ic('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>'),
      iMail = ic('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
      iLock = ic('<rect x="5" y="10.5" width="14" height="9.5" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
      iGift = ic('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>');
  var btn = function (id, t) { return '<button type="button" class="nm-btn" id="' + id + '"><span class="lbl">' + t + '</span><i class="spin"></i></button>'; };
  auth.innerHTML =
    '<div class="nm-stage" id="nmStage"><div class="nm-card is-in" id="nmCard">' +
    '<section class="nm-pane up" id="registerPanel"><h1>Create Account</h1><p class="nm-hint">daftar untuk mulai setor</p><div class="nm-form">' +
    '<div id="refBanner" class="ref-banner hidden"><span>Diundang dengan kode <b id="refBannerCode">—</b></span></div>' +
    '<div class="nm-fld">' + iUser + '<input id="r-user" placeholder="Username" maxlength="24" autocomplete="username"></div>' +
    '<div class="nm-fld">' + iMail + '<input id="r-email" type="email" placeholder="nama@gmail.com" autocomplete="email" onblur="typeof autocorrectEmail===\'function\'&&autocorrectEmail(this)"></div>' +
    '<div class="nm-fld">' + iLock + '<input id="r-pass" type="password" placeholder="Password (min 6)" autocomplete="new-password"></div>' +
    '<div class="nm-fld">' + iGift + '<input id="r-ref" placeholder="Kode referral (opsional)" maxlength="24"></div>' +
    '<div id="registerMsg" class="nm-msg"></div>' + btn('b-reg', 'Sign Up') +
    '<p class="nm-alt">Sudah punya akun? <button type="button" id="showLogin">Sign In</button></p></div></section>' +
    '<section class="nm-pane in" id="loginPanel"><h1>Sign in to Website</h1><p class="nm-hint">masuk ke akunmu</p><div class="nm-form">' +
    '<div class="nm-fld">' + iUser + '<input id="l-user" placeholder="Username atau email" autocomplete="username"></div>' +
    '<div class="nm-fld">' + iLock + '<input id="l-pass" type="password" placeholder="Password" autocomplete="current-password"></div>' +
    '<div id="loginMsg" class="nm-msg"></div>' + btn('b-login', 'Sign In') +
    '<p class="nm-alt">Belum punya akun? <button type="button" id="showRegister">Sign Up</button></p></div></section>' +
    '<aside class="nm-ov"><span class="nm-ring nm-r1"></span><span class="nm-ring nm-r2"></span><span class="nm-ring nm-r3"></span>' +
    '<div class="nm-ot a">' + logo + '<h2>Welcome Back!</h2><p>Masuk dengan akunmu untuk melanjutkan setoran Gmail</p></div>' +
    '<div class="nm-ot b">' + logo + '<h2>Hello Friend!</h2><p>Daftar sekarang dan mulai setor Gmail bersama kami</p></div></aside>' +
    '</div></div>';

  var card = $('nmCard'), stage = $('nmStage');
  $('showRegister').onclick = function (e) { e && e.preventDefault && e.preventDefault(); card.classList.remove('is-in'); };
  $('showLogin').onclick = function (e) { e && e.preventDefault && e.preventDefault(); card.classList.add('is-in'); };
  if (regHandler) $('b-reg').onclick = regHandler;
  auth.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    var b = e.target.closest('#loginPanel') ? $('b-login') : $('b-reg'); b && b.click();
  });
  var ref = new URLSearchParams(location.search).get('ref');
  if (ref) { card.classList.remove('is-in'); $('r-ref').value = ref; $('refBanner').classList.remove('hidden'); $('refBannerCode').textContent = ref.toUpperCase(); }
  function fit() { stage.style.transform = 'scale(' + Math.min((innerWidth - 16) / 720, (innerHeight - 16) / 440, 1.3) + ')'; }
  fit(); addEventListener('resize', fit);

  /* ---------- 3) perbaikan login macet ---------- */
  // semua request ke /api/db otomatis dibatasi 7 detik (sebelumnya bisa menggantung tanpa batas)
  var _f = window.fetch.bind(window);
  window.fetch = function (u, o) {
    var url = typeof u === 'string' ? u : (u && u.url) || '';
    if (!/\/api\/db/.test(url) || (o && o.signal)) return _f(u, o);
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, 7000);
    return _f(u, Object.assign({}, o, { signal: c.signal })).finally(function () { clearTimeout(t); });
  };
  var T = function (p, ms) { return Promise.race([p, new Promise(function (r) { setTimeout(function () { r(null); }, ms); })]); };
  // tarik data penuh maksimal 12 detik, tidak pernah menahan UI
  var _pull = window.pullFromRemote;
  if (typeof _pull === 'function') window.pullFromRemote = function () { return T(_pull.apply(this, arguments), 12000).then(function (v) { return !!v; }); };

  var readUsers = function () { try { return JSON.parse(localStorage.getItem(KU) || '[]'); } catch (e) { return []; } };
  var findUser = function (list, u) { u = u.toLowerCase(); return list.find(function (x) { return (x.user || '').toLowerCase() === u || (x.email || '').toLowerCase() === u; }); };
  async function fetchUsers() {
    try {
      var r = await fetch('https://setor-gmail-ten.vercel.app/api/db?type=users', { cache: 'no-store' }), j = await r.json();
      if (j && j.ok && j.data && Array.isArray(j.data.users)) return j.data.users;
    } catch (e) {}
    try {
      if (window.db) { var s = await T(window.db.collection('users').get(), 6000); if (s && !s.empty) { var a = []; s.forEach(function (d) { a.push(d.data()); }); return a; } }
    } catch (e) {}
    return null;
  }
  function mergeUsers(remote) {
    var local = readUsers();
    remote.forEach(function (ru) {
      if (!ru) return;
      var em = (ru.email || '').toLowerCase(), un = (ru.user || '').toLowerCase(), pass = ru.pass || ru.password || '';
      var ex = local.find(function (x) { return (ru.id && x.id === ru.id) || (em && (x.email || '').toLowerCase() === em) || (un && (x.user || '').toLowerCase() === un); });
      if (ex) { if (pass) ex.pass = pass; if (ru.email) ex.email = ru.email; if (ru.refCode) ex.refCode = ru.refCode; if (ru.ref) ex.ref = ru.ref; }
      else local.push({ id: ru.id || ('u_' + Date.now().toString(36)), user: ru.user || '', email: ru.email || '', pass: pass, ref: ru.ref || '', refCode: ru.refCode || '', role: ru.role || 'user', ts: ru.ts || Date.now() });
    });
    localStorage.setItem(KU, JSON.stringify(local));
  }

  $('b-login').onclick = async function () {
    var b = $('b-login'), msg = $('loginMsg');
    var u = ($('l-user').value || '').trim(), p = $('l-pass').value || '';
    msg.textContent = '';
    if (!u || !p) { msg.textContent = 'Isi username/email dan password.'; return; }
    if (b.disabled) return;
    b.disabled = true; b.classList.add('load');
    try {
      if (u.toLowerCase() === 'admin' && p === 'admin123') {
        me = { id: 'admin', user: 'admin', email: 'admin@local', pass: 'admin123', role: 'admin' };
        localStorage.setItem(KA, JSON.stringify(me)); enterApp(); toast('Selamat datang, admin'); return;
      }
      // 1) cek data lokal dulu (instan). Hanya jika tidak cocok, tanya server (maks ±9 detik)
      var f = findUser(readUsers(), u);
      if (!f || String(f.pass || '') !== String(p)) {
        var remote = await T(fetchUsers(), 9000);
        if (remote) { mergeUsers(remote); f = findUser(readUsers(), u); }
      }
      if (!f || String(f.pass || '') !== String(p)) { msg.textContent = 'Login gagal. Username/password salah atau belum daftar.'; return; }
      var bans = {}; try { bans = JSON.parse(localStorage.getItem(KBAN) || '{}'); } catch (e) {}
      if (bans[f.id]) { msg.textContent = 'Akun di-ban'; toast('Akun di-ban', 'err'); return; }
      me = f; try { ensureRefCode(me); } catch (e) {}
      localStorage.setItem(KA, JSON.stringify(me));
      enterApp(); toast('Selamat datang, ' + me.user);
      // 2) sinkron data lengkap di latar belakang (tidak menahan login)
      setTimeout(function () {
        try { syncToGitHub({ action: 'login', type: 'users', email: me.email || '', username: me.user, password: p, id: me.id, role: me.role || 'user' }); } catch (e) {}
        pullFromRemote().then(function () {
          try {
            var bn = JSON.parse(localStorage.getItem(KBAN) || '{}');
            if (me && bn[me.id]) { logout(); toast('Akun di-ban', 'err'); return; }
            if (typeof pushLocalHistToRemote === 'function') pushLocalHistToRemote();
            if (typeof upd === 'function') upd();
            if (typeof renderAll === 'function') renderAll();
          } catch (e) {}
        }).catch(function () {});
      }, 300);
    } catch (err) {
      msg.textContent = 'Error: ' + (err && err.message || 'gagal');
    } finally {
      b.disabled = false; b.classList.remove('load');
    }
  };
})();
