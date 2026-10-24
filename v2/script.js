// ========== AUTH TOGGLE ==========
function setMode(mode) {
  const isDaftar = mode === "daftar";

  document.getElementById("form-masuk").hidden = isDaftar;
  document.getElementById("form-daftar").hidden = !isDaftar;

  document.getElementById("btn-masuk").classList.toggle("active", !isDaftar);
  document.getElementById("btn-daftar").classList.toggle("active", isDaftar);

  // Update URL without reload
  const url = new URL(window.location);
  url.searchParams.set("mode", mode);
  history.replaceState(null, "", url);
}

// Init mode from URL or default
const params = new URLSearchParams(window.location.search);
const initialMode = params.get("mode") === "daftar" ? "daftar" : "masuk";

// Only run on auth page
if (document.getElementById("btn-masuk")) {
  setMode(initialMode);

  document.getElementById("btn-masuk").addEventListener("click", () => setMode("masuk"));
  document.getElementById("btn-daftar").addEventListener("click", () => setMode("daftar"));
}

// ========== FORMS (DEMO) ==========
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.toggle("error", isError);
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2800);
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    showToast(`Demo: Masuk sebagai ${email}`);
    // Di versi real → redirect ke dashboard
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const referral = document.getElementById("reg-referral").value.trim();
    showToast(`Demo: Akun ${name} (${email}) berhasil dibuat`);
    // Di versi real → create user + redirect
  });
}
