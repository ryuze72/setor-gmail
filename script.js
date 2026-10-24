// ========== DATA DEMO ==========
const DEMO_GMAILS = [
  { id: 1, email: "rangga.idle92@gmail.com", age: "lama", status: "idle", tag: "Idle" },
  { id: 2, email: "mira.fresh24@gmail.com", age: "baru", status: "fresh", tag: "Fresh" },
  { id: 3, email: "andi.verified@gmail.com", age: "sedang", status: "verified", tag: "Verified" },
  { id: 4, email: "sari.kosong11@gmail.com", age: "lama", status: "idle", tag: "Idle" },
  { id: 5, email: "budi.new2024@gmail.com", age: "baru", status: "fresh", tag: "Fresh" },
  { id: 6, email: "lena.phoneok@gmail.com", age: "sedang", status: "verified", tag: "Verified" },
  { id: 7, email: "tono.tidakpakai@gmail.com", age: "lama", status: "idle", tag: "Idle" },
  { id: 8, email: "nina.clean99@gmail.com", age: "sedang", status: "fresh", tag: "Fresh" },
];

function loadPool() {
  try {
    const saved = localStorage.getItem("setor_gmail_pool");
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [...DEMO_GMAILS];
}

function savePool(pool) {
  localStorage.setItem("setor_gmail_pool", JSON.stringify(pool));
}

function todayKey() {
  const d = new Date();
  return `setor_klaim_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getClaimsToday() {
  return Number(localStorage.getItem(todayKey()) || "0");
}

function bumpClaimsToday() {
  const n = getClaimsToday() + 1;
  localStorage.setItem(todayKey(), String(n));
  return n;
}

let pool = loadPool();
let currentFilter = "all";

function $(id) {
  return document.getElementById(id);
}

function getTagClass(status) {
  if (status === "fresh") return "tag-fresh";
  if (status === "verified") return "tag-verified";
  return "tag-idle";
}

function getAgeLabel(age) {
  if (age === "baru") return "Baru";
  if (age === "lama") return "Lama";
  return "1–3 thn";
}

function renderPool() {
  const grid = $("pool-grid");
  if (!grid) return;
  const searchEl = $("search-pool");
  const search = (searchEl?.value || "").toLowerCase().trim();

  const filtered = pool.filter((item) => {
    const matchFilter = currentFilter === "all" || item.status === currentFilter;
    const matchSearch = !search || item.email.toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:2.5rem; color:var(--text-muted);">
        Tidak ada Gmail yang cocok.
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <div class="gmail-card" data-id="${item.id}">
      <div class="email">${item.email}</div>
      <div class="meta">
        <span class="tag ${getTagClass(item.status)}">${item.tag || item.status}</span>
        <span class="tag tag-lama">${getAgeLabel(item.age)}</span>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-primary btn-claim" data-id="${item.id}">Klaim</button>
      </div>
    </div>`
    )
    .join("");

  grid.querySelectorAll(".btn-claim").forEach((btn) => {
    btn.addEventListener("click", () => claimGmail(Number(btn.dataset.id)));
  });
}

async function claimGmail(id) {
  const item = pool.find((g) => g.id === id);
  if (!item) return;

  const confirmed = confirm(
    `Klaim Gmail ini?\n\n${item.email}\n\nEmail akan disalin ke clipboard dan dihapus dari pool (demo).`
  );
  if (!confirmed) return;

  try {
    await navigator.clipboard.writeText(item.email);
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = item.email;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    ta.remove();
  }

  pool = pool.filter((g) => g.id !== id);
  savePool(pool);
  bumpClaimsToday();
  updateStats();
  renderPool();
  showToast(`Berhasil klaim & disalin: ${item.email}`);
}

function updateStats() {
  const total = $("stat-total");
  const today = $("stat-today");
  if (total) total.textContent = String(pool.length);
  if (today) today.textContent = String(getClaimsToday() || 0);
}

function showToast(msg, isError = false) {
  const toast = $("toast");
  if (!toast) {
    alert(msg);
    return;
  }
  toast.textContent = msg;
  toast.style.background = isError ? "#ef4444" : "var(--green)";
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function bindForm() {
  const form = $("setor-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = ($("email")?.value || "").trim().toLowerCase();
    const age = $("age")?.value || "sedang";
    const status = $("status")?.value || "idle";
    const note = ($("note")?.value || "").trim();
    const agree = $("agree");

    if (agree && !agree.checked) {
      showToast("Centang persetujuan dulu.", true);
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      showToast("Hanya Gmail (@gmail.com) yang diterima.", true);
      return;
    }

    if (pool.some((g) => g.email === email)) {
      showToast("Gmail ini sudah ada di pool.", true);
      return;
    }

    const newItem = {
      id: Date.now(),
      email,
      age,
      status,
      tag: status === "fresh" ? "Fresh" : status === "verified" ? "Verified" : "Idle",
      note: note || null,
    };

    pool.unshift(newItem);
    savePool(pool);
    updateStats();
    renderPool();

    form.reset();
    if ($("age")) $("age").value = "sedang";
    if ($("status")) $("status").value = "idle";

    showToast("Gmail berhasil disetor ke pool!");
    $("pool")?.scrollIntoView({ behavior: "smooth" });
  });
}

function bindFilters() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.dataset.filter || "all";
      renderPool();
    });
  });

  $("search-pool")?.addEventListener("input", () => renderPool());
}

function bindNav() {
  const navToggle = $("nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
  });

  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => navLinks?.classList.remove("open"));
  });

  $("btn-login")?.addEventListener("click", () => {
    showToast("Demo mode: belum ada akun. Langsung setor atau klaim di pool.");
    $("setor")?.scrollIntoView({ behavior: "smooth" });
    navLinks?.classList.remove("open");
  });
}

function bindResetDemo() {
  const logo = document.querySelector(".logo");
  let t = null;
  logo?.addEventListener("pointerdown", () => {
    t = setTimeout(() => {
      if (confirm("Reset pool ke data demo?")) {
        localStorage.removeItem("setor_gmail_pool");
        pool = [...DEMO_GMAILS];
        savePool(pool);
        updateStats();
        renderPool();
        showToast("Pool di-reset ke demo.");
      }
    }, 1200);
  });
  logo?.addEventListener("pointerup", () => clearTimeout(t));
  logo?.addEventListener("pointerleave", () => clearTimeout(t));
}

document.addEventListener("DOMContentLoaded", () => {
  bindForm();
  bindFilters();
  bindNav();
  bindResetDemo();
  updateStats();
  renderPool();
});
