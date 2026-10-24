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

// Load from localStorage or use demo
function loadPool() {
  const saved = localStorage.getItem("setor_gmail_pool");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...DEMO_GMAILS];
    }
  }
  return [...DEMO_GMAILS];
}

function savePool(pool) {
  localStorage.setItem("setor_gmail_pool", JSON.stringify(pool));
}

let pool = loadPool();
let currentFilter = "all";

// ========== RENDER POOL ==========
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
  const grid = document.getElementById("pool-grid");
  const search = document.getElementById("search-pool").value.toLowerCase().trim();

  let filtered = pool.filter((item) => {
    const matchFilter =
      currentFilter === "all" ||
      item.status === currentFilter ||
      (currentFilter === "verified" && item.status === "verified");
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
        <button class="btn btn-primary btn-claim" data-id="${item.id}">Klaim</button>
      </div>
    </div>`
    )
    .join("");

  // Bind claim buttons
  document.querySelectorAll(".btn-claim").forEach((btn) => {
    btn.addEventListener("click", () => claimGmail(Number(btn.dataset.id)));
  });
}

// ========== CLAIM ==========
function claimGmail(id) {
  const item = pool.find((g) => g.id === id);
  if (!item) return;

  const confirmed = confirm(
    `Klaim Gmail ini?\n\n${item.email}\n\nSetelah diklaim, Gmail akan hilang dari pool (demo).`
  );
  if (!confirmed) return;

  pool = pool.filter((g) => g.id !== id);
  savePool(pool);
  updateStats();
  renderPool();
  showToast(`Berhasil klaim: ${item.email}`);
}

// ========== SETOR ==========
document.getElementById("setor-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const age = document.getElementById("age").value;
  const status = document.getElementById("status").value;
  const note = document.getElementById("note").value.trim();

  if (!email.endsWith("@gmail.com")) {
    showToast("Hanya Gmail (@gmail.com) yang diterima.", true);
    return;
  }

  // Cek duplikat
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

  // Reset form
  e.target.reset();
  document.getElementById("age").value = "sedang";
  document.getElementById("status").value = "idle";

  showToast("Gmail berhasil disetor ke pool!");
  // Scroll ke pool
  document.getElementById("pool").scrollIntoView({ behavior: "smooth" });
});

// ========== FILTER & SEARCH ==========
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentFilter = chip.dataset.filter;
    renderPool();
  });
});

document.getElementById("search-pool").addEventListener("input", () => {
  renderPool();
});

// ========== STATS ==========
function updateStats() {
  document.getElementById("stat-total").textContent = pool.length;
  // "klaim hari ini" tetap demo random-ish
  const today = localStorage.getItem("setor_klaim_today") || "23";
  document.getElementById("stat-today").textContent = today;
}

// ========== TOAST ==========
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = isError ? "#ef4444" : "var(--green)";
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

// ========== MOBILE NAV ==========
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// Close mobile nav on link click
document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ========== INIT ==========
updateStats();
renderPool();
