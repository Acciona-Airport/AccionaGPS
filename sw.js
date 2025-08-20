// sw.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_GPS_TRACKING') {
    startGeolocationTracking(event.data.mobileId);
  }
});

function startGeolocationTracking(mobileId) {
  // Función para obtener y enviar la ubicación
  function getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Enviar datos al thread principal
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'POSITION_UPDATE',
              mobileId: mobileId,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            });
          });
        });
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // Obtener ubicación inmediatamente y luego cada 15 segundos
  getLocation();
  setInterval(getLocation, 15000);
}

// Mantener vivo el Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});