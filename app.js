/* ============================================================
   Taulell AR — Lógica mejorada (con Firebase)
   ============================================================ */

/* ---------- CONFIGURACIÓ ---------- */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJgrdaDPQKYR2V5nbLbyOTu70gHGAGn4Y",
  authDomain: "taulell-ar.firebaseapp.com",
  projectId: "taulell-ar",
  storageBucket: "taulell-ar.firebasestorage.app",
  messagingSenderId: "161850430198",
  appId: "1:161850430198:web:0424d7aab297f043ec52d7"
};
const REQUIRE_SHARED = true;
const REPORT_LIMIT = 3;
const BOARD_ASPECT = 1.5;
const BH = 600, BW = Math.round(BH * BOARD_ASPECT);
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";

/* Detección de post-it */
const DET = {
  baseW: 480,
  maxW: 960,
  minCandidates: 4,
  graceMs: 2000,
  emaAlpha: 0.35,
  minAreaRatio: 0.015
};

const CATS = {
  esports: { label: "Esports", icon: "🏓" },
  avisos: { label: "Avisos", icon: "📢" },
  cantina: { label: "Cantina", icon: "🍽️" },
  events: { label: "Esdeveniments", icon: "🎉" }
};
const COLORS = ["#FF9500", "#007AFF", "#34C759", "#AF52DE", "#FF2D55", "#FFCC00"];
const TEMPLATES = {
  s: { label: "Petita", w: 200, h: 260, lines: 3 },
  m: { label: "Mitjana", w: 260, h: 330, lines: 5 },
  l: { label: "Gran", w: 340, h: 430, lines: 8 }
};
const SEED = [
  { id: "n1", cat: "esports", title: "Torneig de ping-pong al pati", date: "2026-11-20", author: "Departament d'Educació Física", color: "#FF9500", x: .27, y: .3, z: 1, reports: 0, tpl: "m", desc: "Divendres 20 de novembre, durant l'esbarjo gran, comença el torneig de ping-pong del pati." },
  { id: "n2", cat: "cantina", title: "Menú setmanal de la cantina", date: "2026-11-16", author: "Cantina de l'institut", color: "#34C759", x: .72, y: .27, z: 2, reports: 0, tpl: "l", desc: "Dilluns: macarrons i pit de pollastre.\nDimarts: arròs tres delícies i truita." },
  { id: "n3", cat: "events", title: "Sortida Codi Gaudí", date: "2026-12-03", author: "Departament de Tecnologia", color: "#AF52DE", x: .3, y: .72, z: 3, reports: 0, tpl: "m", desc: "El 3 de desembre farem l'excursió Codi Gaudí." },
  { id: "n4", cat: "avisos", title: "Horari de tutories", date: "2026-11-12", author: "Direcció d'estudis", color: "#007AFF", x: .74, y: .7, z: 4, reports: 0, tpl: "s", desc: "Recordatori de l'horari de tutories." }
];
const ADMIN_PIN = "1234";

/* ---------- I18N ---------- */
const TR = {
  ca: {
    appTitle: "Taulell AR", subtitle: "Les notícies de l'institut, sobre el tauler.",
    start: "Activa la càmera AR", qr: "Generador de codi QR", prev: "Vista prèvia sense càmera",
    sync: "Mode local: les notícies només es veuen en aquest dispositiu",
    qrTitle: "Codi QR del tauler", qrDesc: "Escriu l'adreça on has publicat l'app. El QR obrirà la càmera AR directament.",
    qrNote: "Enganxa el QR al costat del tauler i un post-it a cada cantonada.",
    back: "‹ Inici", newPost: "Nova notícia", title: "Títol", category: "Categoria",
    desc: "Descripció", poster: "Cartell (opcional)", import: "Importa un PDF o una imatge",
    author: "Autor/a (opcional)", color: "Color de la targeta", cancel: "Cancel·la",
    publish: "Publica", capture: "Fes una foto del cartell", preview: "Previsualització",
    readMore: "Llegir més ›", close: "Tanca", report: "Denuncia la notícia",
    deleteMine: "Oculta per a mi", deleteAll: "Esborra per a tots",
    admin: "Mode admin", adminPin: "PIN d'administrador:", adminUnlock: "Desbloqueja admin",
    adminOn: "Mode admin ACTIVAT", adminOff: "Mode admin desactivat",
    hintTap: "Toca una notícia per llegir-la.", hintDrag: "Arrossega les notícies per enganxar-les.",
    hintPlace: "Post-it detectats: %d/4. Col·loca els 4 als cantonades i assegura't que hi ha llum.",
    empty: "El tauler és buit. Publica la primera notícia!",
    saved: "Publicada! Arrossega-la per enganxar-la on vulgui.",
    errCam: "No s'ha pogut accedir a la càmera.",
    errSave: "No s'ha pogut desar la notícia.",
    errFile: "No s'ha pogut llegir el fitxer.",
    errFileBig: "El cartell és massa gran.",
    fileOk: "✓ Cartell afegit",
    catAll: "Totes", filter: "Filtrar per categoria",
    lang: "Idioma", langCa: "Català", langEs: "Español", langEn: "English",
    deleteConfirmAll: "Vols esborrar aquesta notícia per a TOTS els dispositius?",
    deleteConfirmMine: "Vols ocultar aquesta notícia només per a tu?",
    deletedAll: "Notícia esborrada per a tots.", deletedMine: "Notícia ocultada per a tu.",
    reports: "Denúncies"
  },
  es: {
    appTitle: "Taulell AR", subtitle: "Las noticias del instituto, sobre el tablero.",
    start: "Activar cámara AR", qr: "Generador de código QR", prev: "Vista previa sin cámara",
    sync: "Modo local: las noticias solo se ven en este dispositivo",
    qrTitle: "Código QR del tablero", qrDesc: "Escribe la dirección donde has publicado la app. El QR abrirá la cámara AR directamente.",
    qrNote: "Pega el QR al lado del tablero y un post-it en cada esquina.",
    back: "‹ Inicio", newPost: "Nueva noticia", title: "Título", category: "Categoría",
    desc: "Descripción", poster: "Cartel (opcional)", import: "Importar PDF o imagen",
    author: "Autor/a (opcional)", color: "Color de la tarjeta", cancel: "Cancelar",
    publish: "Publicar", capture: "Haz una foto del cartel", preview: "Vista previa",
    readMore: "Leer más ›", close: "Cerrar", report: "Denunciar noticia",
    deleteMine: "Ocultar para mí", deleteAll: "Borrar para todos",
    admin: "Modo admin", adminPin: "PIN de administrador:", adminUnlock: "Desbloquear admin",
    adminOn: "Modo admin ACTIVADO", adminOff: "Modo admin desactivado",
    hintTap: "Toca una noticia para leerla.", hintDrag: "Arrastra las noticias para pegarlas.",
    hintPlace: "Post-it detectados: %d/4. Coloca los 4 en las esquinas y asegúrate de que haya luz.",
    empty: "El tablero está vacío. ¡Publica la primera noticia!",
    saved: "¡Publicada! Arrastra-la para pegarla donde quieras.",
    errCam: "No se ha podido acceder a la cámara.",
    errSave: "No se ha podido guardar la noticia.",
    errFile: "No se ha podido leer el archivo.",
    errFileBig: "El cartel es demasiado grande.",
    fileOk: "✓ Cartel añadido",
    catAll: "Todas", filter: "Filtrar por categoría",
    lang: "Idioma", langCa: "Català", langEs: "Español", langEn: "English",
    deleteConfirmAll: "¿Quieres borrar esta noticia para TODOS los dispositivos?",
    deleteConfirmMine: "¿Quieres ocultar esta noticia solo para ti?",
    deletedAll: "Noticia borrada para todos.", deletedMine: "Noticia oculta para ti.",
    reports: "Denuncias"
  },
  en: {
    appTitle: "Bulletin Board AR", subtitle: "School news on the board.",
    start: "Start AR camera", qr: "QR code generator", prev: "Preview without camera",
    sync: "Local mode: news only visible on this device",
    qrTitle: "Board QR code", qrDesc: "Write the address where you published the app. The QR will open the AR camera directly.",
    qrNote: "Paste the QR next to the board and one post-it at each corner.",
    back: "‹ Home", newPost: "New post", title: "Title", category: "Category",
    desc: "Description", poster: "Poster (optional)", import: "Import PDF or image",
    author: "Author (optional)", color: "Card color", cancel: "Cancel",
    publish: "Publish", capture: "Take a photo of the poster", preview: "Preview",
    readMore: "Read more ›", close: "Close", report: "Report post",
    deleteMine: "Hide for me", deleteAll: "Delete for everyone",
    admin: "Admin mode", adminPin: "Admin PIN:", adminUnlock: "Unlock admin",
    adminOn: "Admin mode ON", adminOff: "Admin mode off",
    hintTap: "Tap a post to read it.", hintDrag: "Drag posts to pin them.",
    hintPlace: "Post-its detected: %d/4. Place the 4 at the corners and make sure there is light.",
    empty: "The board is empty. Publish the first post!",
    saved: "Published! Drag it to pin it where you want.",
    errCam: "Could not access the camera.",
    errSave: "Could not save the post.",
    errFile: "Could not read the file.",
    errFileBig: "The poster is too large.",
    fileOk: "✓ Poster added",
    catAll: "All", filter: "Filter by category",
    lang: "Language", langCa: "Català", langEs: "Español", langEn: "English",
    deleteConfirmAll: "Do you want to delete this post for ALL devices?",
    deleteConfirmMine: "Do you want to hide this post only for you?",
    deletedAll: "Post deleted for everyone.", deletedMine: "Post hidden for you.",
    reports: "Reports"
  }
};
let LANG = localStorage.getItem("taulellAR.lang") || "ca";

function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function t(k) { return (TR[LANG] && TR[LANG][k]) || k; }
function setLang(lang) {
  LANG = lang;
  localStorage.setItem("taulellAR.lang", lang);
  document.documentElement.setAttribute("data-lang", lang);
  $$("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (k) el.textContent = t(k);
  });
  if ($("#fC")) renderCats();
}

const dark = h => { const n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 175; };
const fmt = d => { try { return new Date(d + "T12:00:00").toLocaleDateString(LANG === "es" ? "es-ES" : LANG === "en" ? "en-GB" : "ca-ES", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return d; } };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rot = id => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0; return (Math.abs(h) % 9) - 4; };
const okImg = s => typeof s === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(s);
let tt; function toast(m) { const t = $("#toast"); t.textContent = m; t.style.display = "block"; clearTimeout(tt); tt = setTimeout(() => t.style.display = "none", 3500); }

/* ---------- DADES: Firebase (compartit) o localStorage (local) ---------- */
const LS = "taulellAR.noticies.v2", LSR = "taulellAR.denunciades";
let hidden; try { hidden = new Set(JSON.parse(localStorage.getItem(LSR) || "[]")); } catch (e) { hidden = new Set(); }

const Store = {
  live: false, list: [], cbs: [], db: null, col: null, fs: null, seeded: false,
  emit() { this.cbs.forEach(f => f(this.list)); },
  async init() {
    if (FIREBASE_CONFIG) {
      try {
        const B = "https://www.gstatic.com/firebasejs/10.12.2/";
        const [a, f] = await Promise.all([
          import(B + "firebase-app.js"),
          import(B + "firebase-firestore.js")
        ]);
        this.fs = f;
        this.db = f.getFirestore(a.initializeApp(FIREBASE_CONFIG));
        this.col = f.collection(this.db, "noticies");

        f.onSnapshot(this.col, (s) => {
          if (s.empty && !s.metadata.fromCache && !this.seeded) {
            this.seeded = true;
            const batch = f.writeBatch(this.db);
            SEED.forEach(({ id, ...d }) => {
              const docRef = f.doc(this.db, "noticies", id);
              batch.set(docRef, d);
            });
            batch.commit().catch(() => {});
            return;
          }
          this.list = s.docs.map(d => ({ id: d.id, ...d.data() }));
          this.emit();
        }, (err) => {
          toast("Error de connexió amb el tauler.");
          const sy = $("#sync");
          if (sy) { sy.dataset.s = "warn"; sy.textContent = "Error de Firebase: " + (err.code || err.message); }
        });

        this.live = true;
        return;
      } catch (e) {
        toast("Firebase no disponible. S'usa el mode local.");
      }
    }
    try { this.list = JSON.parse(localStorage.getItem(LS)); } catch (e) { }
    if (!Array.isArray(this.list)) { this.list = SEED.map(n => ({ ...n })); this._save(); }
    this.emit();
  },
  _save() { try { localStorage.setItem(LS, JSON.stringify(this.list)); } catch (e) { toast("No hi ha espai per desar."); } },
  async add(n) {
    if (this.live) await this.fs.addDoc(this.col, n);
    else { n.id = "n" + Date.now(); this.list.push(n); this._save(); this.emit(); }
  },
  async move(id, x, y, z) {
    if (this.live) await this.fs.updateDoc(this.fs.doc(this.db, "noticies", id), { x, y, z });
    else { Object.assign(this.list.find(n => n.id === id) || {}, { x, y, z }); this._save(); this.emit(); }
  },
  async report(id) {
    if (this.live) await this.fs.updateDoc(this.fs.doc(this.db, "noticies", id), { reports: this.fs.increment(1) });
    else { const n = this.list.find(n => n.id === id); if (n) { n.reports = (n.reports || 0) + 1; this._save(); this.emit(); } }
  },
  async deleteForAll(id) {
    if (this.live) await this.fs.deleteDoc(this.fs.doc(this.db, "noticies", id));
    else { this.list = this.list.filter(n => n.id !== id); this._save(); this.emit(); }
  }
};

/* ---------- ESTAT ---------- */
let notes = [], mode = "home", stream = null, drag = null, pending = false, quad = null;
let adminMode = false, adminPinAttempts = 0;
let lastValidQuad = null, lastValidTime = 0;
let activeTouches = new Map();
const maxZ = () => notes.reduce((m, n) => Math.max(m, n.z || 0), 0);

Store.cbs.push(l => {
  notes = l.filter(n => !hidden.has(n.id) && (n.reports || 0) < REPORT_LIMIT);
  if (drag) { pending = true; return; }
  if (mode === "ar" || mode === "preview") renderBoard();
});

/* ---------- MODES ---------- */
function setMode(m) {
  mode = m;
  $$(".screen").forEach(s => s.classList.toggle("on", s.id === m));
  $("#cam").style.display = m === "ar" ? "block" : "none";
  $("#dbg").style.display = m === "ar" ? "block" : "none";
  $("#cork").style.display = m === "preview" ? "block" : "none";
  const live = m === "ar" || m === "preview";
  $("#hud").classList.toggle("on", live);
  $("#fab").classList.toggle("on", live);
  $("#hint").style.display = live ? "block" : "none";
  if (m === "preview") $("#hint").textContent = t("hintDrag");
  $("#hudT").textContent = m === "preview" ? t("appTitle") + " — " + t("prev") : "Taulell AR";
  const b = $("#board");
  b.classList.toggle("pv", m === "preview");
  b.classList.toggle("on", m === "preview");
  b.classList.toggle("ar-active", m === "ar");
  const filt = $("#filtros");
  if (filt) filt.style.display = (m === "ar" || m === "preview") ? "flex" : "none";
  if (m === "preview") { renderBoard(); fitPreview(); }
  if (m !== "ar") stopCam();
  renderFilters();
}
$("#bPrev").onclick = () => setMode("preview");
$("#bExit").onclick = () => setMode("home");
$("#qBack").onclick = () => setMode("home");
$("#bQr").onclick = () => { setMode("qr"); $("#qrUrl").value = location.href.split("#")[0].split("?")[0]; makeQR(); };
$("#qrUrl").oninput = makeQR;
function makeQR() {
  let u; try { u = new URL($("#qrUrl").value || location.href, location.href); u.searchParams.set("ar", "1"); } catch (e) { return; }
  $("#qrbox").innerHTML = "";
  new QRCode($("#qrbox"), { text: u.href, width: 210, height: 210 });
  $("#qrFinal").textContent = u.href;
}
addEventListener("resize", () => { if (mode === "preview") fitPreview(); });
function fitPreview() {
  const sw = innerWidth, sh = innerHeight, sc = Math.min((sw - 36) / BW, (sh - 200) / BH), tx = (sw - BW * sc) / 2, ty = (sh - BH * sc) / 2 - 10;
  $("#board").style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
  quad = [[tx, ty], [tx + BW * sc, ty], [tx + BW * sc, ty + BH * sc], [tx, ty + BH * sc]];
}

/* ---------- FILTRES ---------- */
let activeFilter = null;
function renderFilters() {
  const box = $("#filtros");
  if (!box) return;
  box.innerHTML = `<button class="filtro actiu" data-cat="">${t("catAll")}</button>` +
    Object.entries(CATS).map(([k, v]) => `<button class="filtro" data-cat="${k}">${v.icon} ${v.label}</button>`).join("");
  box.onclick = e => {
    const b = e.target.closest(".filtro");
    if (!b) return;
    $$(".filtro").forEach(x => x.classList.toggle("actiu", x === b));
    activeFilter = b.dataset.cat || null;
    renderBoard();
  };
}

/* ---------- TAULER / NOTES ---------- */
const PINS = ["#e63946", "#0a84ff", "#2ecc71", "#f5b700"];
const hsh = id => Math.abs([...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0));

function noteHTML(n) {
  const c = CATS[n.cat] || CATS.avisos;
  const col = /^#[0-9a-f]{6}$/i.test(n.color) ? n.color : "#007AFF";
  const tc = dark(col) ? "#fff" : "#1d1d1f";
  const tpl = TEMPLATES[n.tpl || "m"];
  const st = `left:${clamp(n.x ?? 0.5, 0, 1) * 100}%;top:${clamp(n.y ?? 0.5, 0, 1) * 100}%;z-index:${(n.z || 1) + 1};transform:translate(-50%,-50%) rotate(${rot(n.id)}deg) scale(${n.scale || 1});--c:${col};--pin:${PINS[hsh(n.id) % 4]};--note-w:${tpl.w}px;--note-h:${tpl.h}px;--note-lines:${tpl.lines};`;

  if (okImg(n.img)) {
    return `<div class="note p" data-id="${esc(n.id)}" style="${st}"><img src="${n.img}" alt="${esc(n.title)}"><b>${esc(n.title)}</b></div>`;
  }
  const ex = esc((n.desc || "").replace(/\s+/g, " ").slice(0, 140));
  return `<div class="note" data-id="${esc(n.id)}" style="${st}">
    <div class="hd" style="color:${tc}">${c.label}</div>
    <h3>${esc(n.title)}</h3>${ex ? `<p>${ex}</p>` : ""}
    <span>${t("readMore")}</span></div>`;
}

function renderBoard() {
  const b = $("#board");
  b.style.width = BW + "px";
  b.style.height = BH + "px";
  const list = activeFilter ? notes.filter(n => n.cat === activeFilter) : notes;
  b.innerHTML = '<i class="pi"></i><i class="pi"></i><i class="pi"></i><i class="pi"></i>' +
    (list.length ? list.map(noteHTML).join("") : `<div class="empty">${t("empty")}</div>`);
}

/* ---------- HOMOGRAFIA ---------- */
function toBoard(px, py) {
  if (!quad) return null;
  const h = hCoef(quad, [[0, 0], [BW, 0], [BW, BH], [0, BH]]);
  if (!h) return null;
  const [a, bb, c, d, e, f, g, k] = h, w = g * px + k * py + 1;
  return [(a * px + bb * py + c) / w, (d * px + e * py + f) / w];
}

const boardEl = $("#board");
boardEl.addEventListener("pointerdown", e => {
  const el = e.target.closest(".note");
  if (!el) return;
  drag = { id: el.dataset.id, el, sx: e.clientX, sy: e.clientY, moved: false, pid: e.pointerId, scale: parseFloat(el.style.scale || 1) };
  try { el.setPointerCapture(e.pointerId); } catch (_) { }
});

boardEl.addEventListener("pointermove", e => {
  if (!drag) return;
  if (activeTouches.size === 0 || (activeTouches.size === 1 && activeTouches.has(drag.pid))) {
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 10) return;
      drag.moved = true;
      drag.el.classList.add("drag");
      drag.el.style.zIndex = maxZ() + 5;
    }
    const p = toBoard(e.clientX, e.clientY);
    if (!p) return;
    drag.x = clamp(p[0] / BW, 0.04, 0.96);
    drag.y = clamp(p[1] / BH, 0.05, 0.95);
    drag.el.style.left = drag.x * 100 + "%";
    drag.el.style.top = drag.y * 100 + "%";
  }
  activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY, noteId: drag.id });
  if (activeTouches.size === 2) pinchZoom();
});

function pinchZoom() {
  const [t1, t2] = [...activeTouches.values()];
  const d = Math.hypot(t1.x - t2.x, t1.y - t2.y);
  if (!drag || !drag.el) return;
  const scale = clamp(0.6 + (d - 120) / 300, 0.6, 2.2);
  drag.el.style.setProperty("--note-scale", scale);
  drag.scale = scale;
  const cx = (t1.x + t2.x) / 2, cy = (t1.y + t2.y) / 2;
  const p = toBoard(cx, cy);
  if (p) {
    drag.el.style.left = clamp(p[0] / BW, 0.04, 0.96) * 100 + "%";
    drag.el.style.top = clamp(p[1] / BH, 0.05, 0.95) * 100 + "%";
  }
}

function endDrag(e) {
  if (!drag || e.pointerId !== drag.pid) return;
  const d = drag;
  drag = null;
  d.el.classList.remove("drag");
  activeTouches.delete(e.pointerId);
  if (e.type === "pointercancel") { if (pending) { pending = false; renderBoard(); } return; }
  if (!d.moved) openRead(d.id);
  else if (d.x != null) {
    const n = notes.find(x => x.id === d.id);
    if (n) { n.scale = d.scale; n.x = d.x; n.y = d.y; n.z = maxZ() + 1; }
    try { Store.move(d.id, d.x, d.y, maxZ() + 1); } catch (_) { toast("No s'ha pogut desar la posició."); }
  }
  if (pending) { pending = false; renderBoard(); }
}
boardEl.addEventListener("pointerup", endDrag);
boardEl.addEventListener("pointercancel", endDrag);

/* ---------- DETECCIÓ MILLORADA ---------- */
const det = { cv: document.createElement("canvas"), sm: null, seen: 0, timer: 0, told: false, nq: null };
const dctx = det.cv.getContext("2d", { willReadFrequently: true });

$("#bStart").onclick = startAR;
async function startAR() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
  } catch (e) {
    toast(t("errCam")); setMode("home"); return;
  }
  const v = $("#cam");
  v.srcObject = stream;
  try { await v.play(); } catch (e) { }
  try {
    const tr = stream.getVideoTracks()[0], cp = tr.getCapabilities ? tr.getCapabilities() : {};
    if (cp.focusMode && cp.focusMode.includes("continuous")) await tr.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
  } catch (e) { }
  setMode("ar"); renderBoard();
  det.sm = null; det.seen = 0; clearInterval(det.timer);
  det.timer = setInterval(detect, 120);
}
function stopCam() { clearInterval(det.timer); if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } $("#cam").srcObject = null; }

function blobs() {
  const v = $("#cam");
  if (!v.videoWidth) return null;
  let W = DET.baseW;
  const H = Math.round(W * v.videoHeight / v.videoWidth);
  det.cv.width = W; det.cv.height = H;
  dctx.drawImage(v, 0, 0, W, H);
  let data = dctx.getImageData(0, 0, W, H).data;
  let candidates = analyzeColors(data, W, H);
  if (candidates.length < DET.minCandidates && W < DET.maxW) {
    W = DET.maxW;
    const H2 = Math.round(W * v.videoHeight / v.videoWidth);
    det.cv.width = W; det.cv.height = H2;
    dctx.drawImage(v, 0, 0, W, H2);
    data = dctx.getImageData(0, 0, W, H2).data;
    candidates = analyzeColors(data, W, H2);
  }
  return candidates.sort((a, b) => b.n - a.n).slice(0, 12);
}

function analyzeColors(data, W, H) {
  const m = new Uint8Array(W * H), out = [], st = [];
  const dfs = [];
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i], g = data[i + 1], bl = data[i + 2];
    if (bl >= r || bl >= g) continue;
    const mx = r > g ? r : g, df = mx - bl;
    if (mx < 90 || df < 20) continue;
    dfs.push({ p, r, g, bl, mx, df });
  }
  if (dfs.length === 0) return out;
  dfs.sort((a, b) => b.df - a.df);
  const thr = dfs[Math.floor(dfs.length * 0.6)].df * 0.55;

  for (const { p, r, g, bl, mx, df } of dfs) {
    if (df < thr) continue;
    const h = r >= g ? 60 * (g - bl) / df : 120 - 60 * (r - bl) / df;
    if ((h >= 35 && h <= 75) || (h >= 190 && h <= 260) || (h >= 0 && h <= 20) || (h >= 320 && h <= 360)) {
      m[p] = 1;
    }
  }

  for (let s = 0; s < m.length; s++) {
    if (m[s] !== 1) continue;
    let n = 0, sx = 0, sy = 0, x0 = W, x1 = 0, y0 = H, y1 = 0;
    st.push(s); m[s] = 2;
    while (st.length) {
      const p = st.pop(), x = p % W, y = (p / W) | 0;
      n++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      const nb = [p - 1, p + 1, p - W, p + W];
      for (const q of nb) {
        const qx = q % W, qy = (q / W) | 0;
        if (qx < 0 || qx >= W || qy < 0 || qy >= H) continue;
        if (Math.abs(qx - x) > 1 || Math.abs(qy - y) > 1) continue;
        if (m[q] === 1) { m[q] = 2; st.push(q); }
      }
    }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, asp = bw / bh;
    const density = n / (bw * bh);
    if (n >= 14 && asp > 0.4 && asp < 2.4 && density > 0.35) {
      out.push({ n, x: sx / n / W, y: sy / n / H, w: bw / W, h: bh / H });
    }
  }
  return out;
}

function toScreen(p, v) {
  const sw = innerWidth, sh = innerHeight, vw = v.videoWidth, vh = v.videoHeight, k = Math.max(sw / vw, sh / vh);
  return [p.x * vw * k + (sw - vw * k) / 2, p.y * vh * k + (sh - vh * k) / 2];
}

const ordered = q => {
  const s = q.map(p => p.x + p.y), d = q.map(p => p.x - p.y);
  return [q[s.indexOf(Math.min(...s))], q[d.indexOf(Math.max(...d))], q[s.indexOf(Math.max(...s))], q[d.indexOf(Math.min(...d))]];
};

function quadScore(o) {
  if (new Set(o).size < 4) return 0;
  let a = 0, sg = 0;
  for (let i = 0; i < 4; i++) {
    const p = o[i], r = o[(i + 1) % 4], tt = o[(i + 2) % 4];
    a += p.x * r.y - r.x * p.y;
    const c = (r.x - p.x) * (tt.y - r.y) - (r.y - p.y) * (tt.x - r.x);
    if (!c) return 0;
    sg += c > 0 ? 1 : -1;
  }
  if (Math.abs(sg) !== 4) return 0;
  const area = Math.abs(a) / 2;
  const ns = o.map(p => p.n);
  const sim = Math.min(...ns) / Math.max(...ns);
  return sim < 0.3 ? 0 : area * sim;
}

function bestQuad(c) {
  let best = null, bs = 0;
  for (let a = 0; a < c.length; a++)
    for (let b = a + 1; b < c.length; b++)
      for (let e = b + 1; e < c.length; e++)
        for (let f = e + 1; f < c.length; f++) {
          const o = ordered([c[a], c[b], c[e], c[f]]), sc = quadScore(o);
          if (sc > bs) { bs = sc; best = o; }
        }
  return bs > 0.001 ? best : null;
}

function guess3(c, prev) {
  const idx = c.map(p => { let bi = 0, bd = 9; prev.forEach((q, i) => { const dd = Math.hypot(p.x - q.x, p.y - q.y); if (dd < bd) { bd = dd; bi = i; } }); return bi; });
  if (new Set(idx).size < 3) return null;
  const m = [0, 1, 2, 3].find(i => !idx.includes(i));
  let dx = 0, dy = 0;
  c.forEach((p, j) => { dx += p.x - prev[idx[j]].x; dy += p.y - prev[idx[j]].y; });
  dx /= 3; dy /= 3;
  const o = []; idx.forEach((i, j) => o[i] = c[j]);
  o[m] = { x: prev[m].x + dx, y: prev[m].y + dy, n: prev[m].n };
  return o;
}

function smoothQuad(prev, curr, alpha) {
  return curr.map((p, i) => ({ x: prev[i].x + (p.x - prev[i].x) * alpha, y: prev[i].y + (p.y - prev[i].y) * alpha, n: p.n }));
}

function drawDbg(bl, o, v) {
  const cv = $("#dbg");
  if (cv.width !== innerWidth) cv.width = innerWidth;
  if (cv.height !== innerHeight) cv.height = innerHeight;
  const g = cv.getContext("2d");
  g.clearRect(0, 0, cv.width, cv.height);
  g.lineWidth = 3;
  bl.forEach((p, i) => {
    const [x, y] = toScreen(p, v);
    g.strokeStyle = o && o.includes(p) ? "#2ee66b" : "rgba(255,255,255,.85)";
    g.beginPath(); g.arc(x, y, 14, 0, 7); g.stroke();
    g.fillStyle = "#fff"; g.font = "14px sans-serif"; g.fillText(i + 1, x + 6, y - 6);
  });
  if (o) {
    const pts = o.map(p => toScreen(p, v));
    g.strokeStyle = "#ffd60a"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    pts.forEach(pt => g.lineTo(pt[0], pt[1]));
    g.closePath(); g.stroke();
  }
}

function detect() {
  const v = $("#cam"), bl = blobs();
  if (!bl) return;
  const hint = $("#hint"), b = $("#board"), now = performance.now();

  let o = bl.length >= 4 ? bestQuad(bl) : null;
  if (!o && bl.length >= 3 && det.nq && now - det.seen < DET.graceMs) o = guess3(bl.slice(0, 3), det.nq);

  if (o) {
    if (det.sm) o = smoothQuad(det.sm, o, DET.emaAlpha);
    det.nq = o;
    lastValidQuad = o;
    lastValidTime = now;
  } else if (lastValidQuad && now - lastValidTime < DET.graceMs) {
    o = lastValidQuad;
  }

  drawDbg(bl, o || [], v);

  if (o) {
    det.sm = o;
    const pts = o.map(p => toScreen(p, v));
    det.sm = det.sm && now - det.seen < 800 ? det.sm.map((q, i) => [q[0] + (pts[i][0] - q[0]) * 0.5, q[1] + (pts[i][1] - q[1]) * 0.5]) : pts;
    det.seen = now;
    const h = hCoef([[0, 0], [BW, 0], [BW, BH], [0, BH]], det.sm);
    if (h) {
      const [a, bb, c, d, e, f, g, k] = h;
      b.style.transform = `matrix3d(${a},${d},0,${g},${bb},${e},0,${k},0,0,1,0,${c},${f},0,1)`;
      quad = det.sm;
      b.classList.add("on");
      hint.style.display = "none";
      if (!det.told) { det.told = true; toast("Arrossega una notícia per enganxar-la on vulgui."); }
    }
  } else if (now - det.seen > 1200) {
    b.classList.remove("on");
    det.sm = null; quad = null; det.nq = null;
    hint.style.display = "block";
    hint.textContent = t("hintPlace").replace("%d", Math.min(bl.length, 3));
  }
}

function hCoef(src, dst) {
  const A = [], y = [];
  for (let i = 0; i < 4; i++) {
    const [x, yy] = src[i], [u, vv] = dst[i];
    A.push([x, yy, 1, 0, 0, 0, -u * x, -u * yy]); y.push(u);
    A.push([0, 0, 0, x, yy, 1, -vv * x, -vv * yy]); y.push(vv);
  }
  const n = 8;
  for (let i = 0; i < n; i++) {
    let m = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
    [A[i], A[m]] = [A[m], A[i]]; [y[i], y[m]] = [y[m], y[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      y[r] -= f * y[i];
    }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x.some(v => !isFinite(v)) ? null : x;
}

/* ---------- LECTURA + DENÚNCIA + ADMIN ---------- */
function openRead(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  const c = CATS[n.cat] || CATS.avisos;
  const col = /^#[0-9a-f]{6}$/i.test(n.color) ? n.color : "#007AFF";
  const p = $("#readPanel");
  p.style.setProperty("--c", col);
  const isAdminBtn = adminMode ? `<button class="btn danger" id="rDelAll">${t("deleteAll")}</button>` : "";
  const hideBtn = !adminMode ? `<button class="btn danger" id="rHide">${t("deleteMine")}</button>` : "";
  p.innerHTML = `<div class="grab"></div><div class="chip"><i style="background:${esc(col)}"></i>${c.label}</div>
    <h2>${esc(n.title)}</h2><div class="meta">${fmt(n.date)} · ${esc(n.author || "Anònim")}</div>
    ${okImg(n.img) ? `<img class="poster" src="${n.img}" alt="">` : ""}
    ${n.desc ? `<p>${esc(n.desc)}</p>` : ""}
    <div class="row" style="margin-top:12px">
      <button class="btn main" id="rClose">${t("close")}</button>
      ${hideBtn}
      ${isAdminBtn}
    </div>`;
  $("#read").classList.add("on");
  $("#rClose").onclick = () => $("#read").classList.remove("on");
  if (!adminMode) {
    $("#rHide").onclick = async () => {
      if (!confirm(t("deleteConfirmMine"))) return;
      hidden.add(id);
      try { localStorage.setItem(LSR, JSON.stringify([...hidden])); } catch (e) { }
      notes = notes.filter(x => x.id !== id);
      renderBoard();
      $("#read").classList.remove("on");
      toast(t("deletedMine"));
    };
  } else {
    $("#rDelAll").onclick = async () => {
      if (!confirm(t("deleteConfirmAll"))) return;
      try { await Store.deleteForAll(id); } catch (e) { toast("No s'ha pogut esborrar."); }
      $("#read").classList.remove("on");
      toast(t("deletedAll"));
    };
  }
}
$("#read").onclick = e => { if (e.target.id === "read") e.target.classList.remove("on"); };

/* ---------- ADMIN MODE ---------- */
function toggleAdmin(pin) {
  if (pin === ADMIN_PIN) {
    adminMode = true;
    adminPinAttempts = 0;
    $("#adminBar").style.display = "flex";
    toast(t("adminOn"));
  } else {
    adminPinAttempts++;
    toast("PIN incorrecte (" + adminPinAttempts + "/3)");
    if (adminPinAttempts >= 3) { adminPinAttempts = 0; toast("Demasiados intentos."); }
  }
}
function disableAdmin() {
  adminMode = false;
  $("#adminBar").style.display = "none";
  toast(t("adminOff"));
}

let logoClicks = 0;
$(".brand h1")?.addEventListener("click", () => {
  logoClicks++;
  if (logoClicks >= 3) {
    const pin = prompt(t("adminPin"));
    if (pin !== null) toggleAdmin(pin);
    logoClicks = 0;
  }
});

/* ---------- PUBLICAR ---------- */
function renderCats() {
  $("#fC").innerHTML = Object.entries(CATS).map(([k, v]) => `<option value="${k}">${v.icon} ${v.label}</option>`).join("");
}
$("#sw").innerHTML = COLORS.map((c, i) => `<label style="background:${c}"><input type="radio" name="col" value="${c}" ${i ? "" : "checked"}></label>`).join("");

let pendingImg = null;
let previewImgUrl = null;

$("#fab").onclick = () => {
  pendingImg = null; previewImgUrl = null;
  $("#fFile").value = ""; $("#fFileSt").textContent = "";
  $("#preview").style.display = "none";
  $("#form").reset();
  $("#add").classList.add("on");
};
$("#fCancel").onclick = () => { $("#add").classList.remove("on"); };
$("#fFileBtn").onclick = () => $("#fFile").click();
$("#fCapBtn").onclick = () => $("#fFile").click();

$("#fFile").onchange = async e => {
  const f = e.target.files[0];
  pendingImg = null; previewImgUrl = null;
  $("#preview").style.display = "none";
  if (!f) { $("#fFileSt").textContent = ""; return; }
  $("#fFileSt").textContent = "Processant el cartell…";
  $("#fOk").disabled = true;
  try {
    pendingImg = await fileToImg(f);
    previewImgUrl = pendingImg;
    $("#preview").style.display = "block";
    if (pendingImg) {
      $("#preview").innerHTML = `<img src="${pendingImg}" alt=""><p>${esc(f.name)}</p>`;
      $("#fFileSt").textContent = t("fileOk") + ": " + f.name + (f.type === "application/pdf" ? " (primera pàgina)" : "");
    } else {
      $("#fFileSt").textContent = t("errFileBig");
    }
  } catch (err) {
    $("#fFileSt").textContent = t("errFile");
  }
  $("#fOk").disabled = false;
};

function toJpeg(src, w, h) {
  const k = Math.min(1, 900 / w), cw = Math.round(w * k), ch = Math.round(h * k), c = document.createElement("canvas");
  c.width = cw; c.height = ch;
  const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, cw, ch);
  x.drawImage(src, 0, 0, cw, ch);
  for (let q = 0.8; q >= 0.3; q -= 0.1) {
    const u = c.toDataURL("image/jpeg", q);
    if (u.length < 700000) return u;
  }
  return null;
}
const loadScript = u => new Promise((ok, ko) => { const s = document.createElement("script"); s.src = u; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
async function fileToImg(f) {
  if (f.type === "application/pdf") {
    if (!window.pdfjsLib) {
      await loadScript(PDFJS + "pdf.min.js");
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
    }
    const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
    const pg = await pdf.getPage(1);
    const v0 = pg.getViewport({ scale: 1 });
    const vp = pg.getViewport({ scale: 900 / v0.width });
    const c = document.createElement("canvas");
    c.width = vp.width; c.height = vp.height;
    await pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    return toJpeg(c, c.width, c.height);
  }
  const bm = await createImageBitmap(f);
  return toJpeg(bm, bm.width, bm.height);
}

$("#fT").oninput = updatePreview;
$("#fD").oninput = updatePreview;
function updatePreview() {
  const title = $("#fT").value.trim();
  const desc = $("#fD").value.trim();
  const prev = $("#preview");
  if (!title && !desc && !previewImgUrl) { prev.style.display = "none"; return; }
  prev.style.display = "block";
  if (previewImgUrl) prev.innerHTML = `<img src="${previewImgUrl}" alt="">`;
  prev.innerHTML += `<p>${esc(title || "")}<br>${esc(desc || "")}</p>`;
}

$("#form").onsubmit = async e => {
  e.preventDefault();
  const d = $("#fD").value.trim();
  if (!d && !pendingImg) { toast("Escriu una descripció o importa un cartell."); return; }
  const n = {
    cat: $("#fC").value,
    title: $("#fT").value.trim(),
    desc: d,
    author: $("#fA").value.trim() || "Anònim",
    color: document.querySelector("input[name=col]:checked").value,
    date: new Date().toISOString().slice(0, 10),
    x: 0.5 + (Math.random() - 0.5) * 0.2,
    y: 0.5 + (Math.random() - 0.5) * 0.2,
    z: maxZ() + 1,
    reports: 0,
    tpl: document.querySelector("input[name=tpl]:checked")?.value || "m"
  };
  if (pendingImg) n.img = pendingImg;
  $("#fOk").disabled = true;
  try {
    await Store.add(n);
    $("#form").reset();
    pendingImg = null;
    $("#fFileSt").textContent = "";
    $("#preview").style.display = "none";
    $("#add").classList.remove("on");
    toast(t("saved"));
  } catch (err) {
    toast(t("errSave"));
  }
  $("#fOk").disabled = false;
};

/* ---------- PWA ---------- */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => { });
}

/* ---------- INICI ---------- */
Store.init().then(() => {
  const sy = $("#sync");
  if (Store.live) { sy.dataset.s = "ok"; sy.textContent = "Tauler compartit: tothom ve el mateix"; }
  else if (REQUIRE_SHARED) {
    $("#bStart").disabled = true;
    sy.dataset.s = "warn";
    sy.textContent = "Falta connectar la base de dades compartida (Firebase). L'AR està desactivada.";
  } else {
    sy.dataset.s = "local";
    sy.textContent = t("sync");
  }
  renderFilters();
  setLang(LANG);
  if (Store.live && new URLSearchParams(location.search).get("ar") === "1") startAR();
});
