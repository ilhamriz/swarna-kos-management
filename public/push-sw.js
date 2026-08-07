self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "Kos Saya"
  const options = {
    body: data.body || "",
    icon: "/assets/app-icons/icon-192.png",
    badge: "/assets/app-icons/icon-192.png",
    data: { url: data.url || "/" },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  const url = event.notification.data?.url || "/"
  event.waitUntil(self.clients.openWindow(url))
})
