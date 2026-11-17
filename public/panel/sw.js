// Service worker del panel de Arata San (D-119). Solo recibe avisos (Web Push) y abre
// el panel al tocarlos. No guarda páginas ni datos en caché.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch {
    d = { titulo: e.data ? e.data.text() : "" };
  }
  const titulo = d.titulo || "Panel Arata San";
  e.waitUntil(
    self.registration.showNotification(titulo, {
      body: d.cuerpo || "",
      icon: "/panel/icono-192.png",
      badge: "/panel/icono-192.png",
      tag: d.etiqueta || undefined,
      data: { url: typeof d.url === "string" && d.url.startsWith("/panel") ? d.url : "/panel/notificaciones" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "/panel/notificaciones", self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const abierta = ventanas.find((v) => v.url.startsWith(self.location.origin + "/panel"));
      if (abierta) return abierta.navigate(url).then((v) => (v || abierta).focus());
      return self.clients.openWindow(url);
    })
  );
});
