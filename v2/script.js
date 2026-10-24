// ========== STORAGE HELPERS ==========
const STORAGE = {
  users: "sg_users",
  session: "sg_session",
  pool: "sg_pool",
  myGmails: "sg_my_gmails",
};

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.users) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE.users, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.session) || "null");
  } catch {
    return null;
  }
}

function setSession(data) {
  localStorage.setItem(STORAGE.session, JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem(STORAGE.session);
}

function getPool() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.pool) || "[]");
  } catch {
    return [];
  }
}

function savePool(pool) {
  localStorage.setItem(STORAGE.pool, JSON.stringify(pool));
}

function getMyGmails(username) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE.myGmails) || "{}");
    return all[username] || [];
  } catch {
    return [];
  }
}

function addMyGmail(username, email) {
  const all = JSON.parse(localStorage.getItem(STORAGE.myGmails) || "{}");
  if (!all[username]) all[username] = [];
  all[username].push(email);
  localStorage.setItem(STORAGE.myGmails, JSON.stringify(all));
}

// ========== TOAST ==========
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.toggle("error", isError);
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2800);
}

// ========== AUTH TOGGLE ==========
function setMode(mode) {
  const isDaftar = mode === "daftar";
  const formMasuk = document.getElementById("form-masuk");
  const formDaftar = document.getElementById("form-daftar");
  if (!formMasuk || !formDaftar) return;

  formMasuk.hidden = isDaftar;
  formDaftar.hidden = !isDaftar;
  document.getElementById("btn-masuk")?.classList.toggle("active", !isDaftar);
  document.getElementById("btn-daftar")?.classList.toggle("active", isDaftar);

  const url = new URL(window.location);
  url.searchParams.set("mode", mode);
  history.replaceState(null, "", url);
}

if (document.getElementById("btn-masuk")) {
  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get("mode") === "daftar" ? "daftar" : "masuk";
  setMode(initialMode);
  document.getElementById("btn-masuk").addEventListener("click", () => setMode("masuk"));
  document.getElementById("btn-daftar").addEventListener("click", () => setMode("daftar"));
}

// ========== REGISTER ==========
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim().toLowerCase();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;

    if (username.length < 3) {
      showToast("Username minimal 3 karakter.", true);
      return;
    }
    if (!email.endsWith("@gmail.com")) {
      showToast("Gunakan alamat @gmail.com.", true);
      return;
    }
    if (password.length < 6) {
      showToast("Kata sandi minimal 6 karakter.", true);
      return;
    }
    if (password !== confirm) {
      showToast("Konfirmasi kata sandi tidak cocok.", true);
      return;
    }
    if (username === "admin112") {
      showToast("Username ini tidak tersedia.", true);
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.username === username)) {
      showToast("Username sudah dipakai.", true);
      return;
    }
    if (users.some((u) => u.email === email)) {
      showToast("Gmail ini sudah terdaftar.", true);
      return;
    }

    users.push({ username, email, password, createdAt: Date.now() });
    saveUsers(users);
    showToast("Akun berhasil dibuat! Silakan masuk.");
    registerForm.reset();
    setTimeout(() => setMode("masuk"), 800);
  });
}

// ========== LOGIN ==========
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    if (username === "admin112" && password === "12345678_") {
      setSession({ username: "admin112", role: "admin" });
      showToast("Masuk sebagai Admin...");
      setTimeout(() => { window.location.href = "admin.html"; }, 600);
      return;
    }

    const users = getUsers();
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      showToast("Username atau kata sandi salah.", true);
      return;
    }

    setSession({ username: user.username, email: user.email, role: "user" });
    showToast("Berhasil masuk...");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
  });
}

// ========== GUARD + LOGOUT ==========
function requireAuth(role) {
  const session = getSession();
  if (!session) {
    window.location.href = "auth.html?mode=masuk";
    return null;
  }
  if (role && session.role !== role) {
    window.location.href = session.role === "admin" ? "admin.html" : "dashboard.html";
    return null;
  }
  return session;
}

const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    clearSession();
    window.location.href = "auth.html?mode=masuk";
  });
}

// ========== DASHBOARD ==========
if (document.body.classList.contains("panel-page") && !document.querySelector(".badge-admin")) {
  const session = requireAuth("user");
  if (session) {
    const nameEl = document.getElementById("user-name");
    const displayEl = document.getElementById("user-display");
    if (nameEl) nameEl.textContent = session.username;
    if (displayEl) displayEl.textContent = session.username;

    function renderMyGmails() {
      const list = document.getElementById("my-gmails");
      if (!list) return;
      const mine = getMyGmails(session.username);
      if (mine.length === 0) {
        list.innerHTML = '<li class="empty">Belum ada Gmail yang disetor.</li>';
      } else {
        list.innerHTML = mine.map((e) => `<li>${e}</li>`).join("");
      }
    }
    renderMyGmails();

    const setorForm = document.getElementById("setor-form");
    if (setorForm) {
      setorForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("setor-email").value.trim().toLowerCase();
        if (!email.endsWith("@gmail.com")) {
          showToast("Hanya @gmail.com yang diterima.", true);
          return;
        }
        const pool = getPool();
        if (pool.includes(email)) {
          showToast("Gmail sudah ada di pool.", true);
          return;
        }
        pool.unshift(email);
        savePool(pool);
        addMyGmail(session.username, email);
        document.getElementById("setor-email").value = "";
        renderMyGmails();
        showToast("Gmail berhasil disetor ke pool!");
      });
    }
  }
}

// ========== ADMIN PANEL ==========
if (document.querySelector(".badge-admin")) {
  const session = requireAuth("admin");
  if (session) {
    const displayEl = document.getElementById("user-display");
    if (displayEl) displayEl.textContent = "admin112";

    function renderAdmin() {
      const users = getUsers();
      const pool = getPool();

      document.getElementById("stat-users").textContent = users.length;
      document.getElementById("stat-gmails").textContent = pool.length;

      const tbody = document.getElementById("users-tbody");
      if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty">Belum ada pengguna.</td></tr>';
      } else {
        tbody.innerHTML = users
          .map(
            (u) => `
          <tr>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td><button class="btn-delete" data-user="${u.username}">Hapus</button></td>
          </tr>`
          )
          .join("");

        tbody.querySelectorAll(".btn-delete").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (!confirm(`Hapus user ${btn.dataset.user}?`)) return;
            const updated = getUsers().filter((u) => u.username !== btn.dataset.user);
            saveUsers(updated);
            renderAdmin();
            showToast("Pengguna dihapus.");
          });
        });
      }

      const poolList = document.getElementById("pool-list");
      if (pool.length === 0) {
        poolList.innerHTML = '<li class="empty">Pool masih kosong.</li>';
      } else {
        poolList.innerHTML = pool
          .map(
            (e) => `
          <li>
            <span>${e}</span>
            <button class="btn-delete" data-email="${e}">Hapus</button>
          </li>`
          )
          .join("");

        poolList.querySelectorAll(".btn-delete").forEach((btn) => {
          btn.addEventListener("click", () => {
            const updated = getPool().filter((x) => x !== btn.dataset.email);
            savePool(updated);
            renderAdmin();
            showToast("Gmail dihapus dari pool.");
          });
        });
      }
    }
    renderAdmin();
  }
}
