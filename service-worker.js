const CACHE = "taulellAR-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];

// Nunca cachear Firebase ni Google APIs (necesario para que Firestore funcione en tiempo real)
const isFirebaseOrGoogle = (url) =>
  url.includes("firebaseio.com") ||
  url.includes("googleapis.com") ||
  url.includes("gstatic.com");

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  // Firebase y Google siempre van directo a la red
  if (isFirebaseOrGoogle(url)) {
    e.respondWith(fetch(e.request));
    return;
  }

  // El resto de archivos de la app sí se cachean para funcionar sin conexión
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
