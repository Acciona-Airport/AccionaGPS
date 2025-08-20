// sw.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_GPS_TRACKING') {
    startGeolocationTracking(event.data.mobileId);
  }
});

function startGeolocationTracking(mobileId) {
  function getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
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

  getLocation();
  setInterval(getLocation, 5000);
}

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
