// Credenciales
const validCredentials = {
    "Movil1": "MovilAcciona2025",
    "Movil2": "MovilAcciona2025"
};

// Coordenadas Aeropuerto SCL
const SCL_COORDS = [-33.3931, -70.7858];
const INITIAL_ZOOM = 16;

// Variables globales
let map, currentMarker;

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    if (isIndexPage()) {
        checkAuth();
    } else if (isLoginPage()) {
        setupLogin();
    }
});

// Verificar autenticación
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        redirectToLogin();
    } else {
        initApp(user);
    }
}

// Configurar login
function setupLogin() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (validCredentials[username] && password === validCredentials[username]) {
            localStorage.setItem('currentUser', username);
            redirectToIndex();
        } else {
            alert('Credenciales incorrectas. Usa Movil1/Movil2 y contraseña "MovilAcciona2025"');
        }
    });
}

// Iniciar aplicación
function initApp(username) {
    document.getElementById('current-user').textContent = username;
    document.getElementById('logout-btn').addEventListener('click', logout);
    initMap();
    startTracking(username);
}

// Inicializar mapa (FUNCIÓN CRÍTICA)
function initMap() {
    map = L.map('map', {
        center: SCL_COORDS,
        zoom: INITIAL_ZOOM,
        tap: false, // Mejor compatibilidad táctil
        zoomControl: true
    });

    // Capa de mapa (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    // Marcador inicial
    currentMarker = L.marker(SCL_COORDS, {
        icon: L.divIcon({
            className: 'airport-icon',
            html: '✈️',
            iconSize: [30, 30]
        })
    }).addTo(map)
    .bindPopup('Aeropuerto Arturo Merino Benítez (SCL)');
}

// Seguimiento GPS
function startTracking(username) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => updatePosition(position, username),
            (error) => handleGeolocationError(error),
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert('Tu dispositivo no soporta geolocalización');
    }
}

// Actualizar posición
function updatePosition(position, username) {
    const coords = [position.coords.latitude, position.coords.longitude];
    
    // Mover mapa suavemente
    map.setView(coords, map.getZoom(), {
        animate: true,
        duration: 1
    });
    
    // Actualizar marcador
    if (!currentMarker) {
        currentMarker = L.marker(coords, {
            icon: L.divIcon({
                className: 'user-marker',
                html: '📍',
                iconSize: [40, 40]
            })
        }).addTo(map);
    } else {
        currentMarker.setLatLng(coords);
    }
    
    // Actualizar popup
    currentMarker
        .setPopupContent(`
            <b>${username}</b><br>
            Lat: ${coords[0].toFixed(6)}<br>
            Lng: ${coords[1].toFixed(6)}<br>
            Precisión: ${position.coords.accuracy.toFixed(1)}m
        `)
        .openPopup();
}

// Manejar errores de GPS
function handleGeolocationError(error) {
    let message = '';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Ubicación no disponible';
            break;
        case error.TIMEOUT:
            message = 'Tiempo de espera agotado';
            break;
        default:
            message = `Error desconocido (${error.code})`;
    }
    console.error('Error GPS:', message);
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    redirectToLogin();
}

// Helper: Redirigir a login
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Helper: Redirigir a index
function redirectToIndex() {
    window.location.href = 'index.html';
}

// Helper: Verificar si es página index
function isIndexPage() {
    return window.location.pathname.endsWith('index.html') || 
           window.location.pathname === '/';
}

// Helper: Verificar si es página login
function isLoginPage() {
    return window.location.pathname.endsWith('login.html');
}
