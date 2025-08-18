// Credenciales válidas
const validCredentials = {
    "Movil1": "MovilAcciona2025",
    "Movil2": "MovilAcciona2025"
};

// Configuración del mapa
const SCL_COORDS = [-33.3931, -70.7858]; // Aeropuerto SCL
const INITIAL_ZOOM = 16;

// Variables globales
let map;
let currentMarker;
let watchId;

// ===== FUNCIONES PRINCIPALES ===== //

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path === '/') {
        checkAuth();
    } else if (path.endsWith('login.html')) {
        setupLogin();
    }
});

// Verificar autenticación
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    
    if (!user) {
        window.location.href = 'login.html';
    } else {
        initApp(user);
    }
}

// Configurar formulario de login
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (validCredentials[username] === password) {
                localStorage.setItem('currentUser', username);
                window.location.href = 'index.html';
            } else {
                alert('Credenciales incorrectas. Usuario: Movil1/Movil2 | Contraseña: MovilAcciona2025');
            }
        });
    }
}

// Inicializar aplicación
function initApp(username) {
    // Configurar interfaz
    const userElement = document.getElementById('current-user');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (userElement) userElement.textContent = username;
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Iniciar mapa y GPS
    initMap();
    startTracking(username);
}

// ===== FUNCIONES DEL MAPA ===== //

// Crear mapa (función crítica)
function initMap() {
    // Verificar si el contenedor existe
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Error: No se encontró el elemento con ID "map"');
        return;
    }
    
    // Inicializar mapa Leaflet
    map = L.map('map').setView(SCL_COORDS, INITIAL_ZOOM);
    
    // Capa de mapa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);
    
    // Marcador inicial
    currentMarker = L.marker(SCL_COORDS, {
        icon: L.divIcon({
            className: 'airport-marker',
            html: '✈️',
            iconSize: [30, 30]
        })
    }).addTo(map)
    .bindPopup('Aeropuerto SCL');
}

// Iniciar seguimiento GPS
function startTracking(username) {
    if (!navigator.geolocation) {
        alert('Error: Tu navegador no soporta geolocalización');
        return;
    }
    
    watchId = navigator.geolocation.watchPosition(
        (position) => updatePosition(position, username),
        (error) => handleGeolocationError(error),
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Actualizar posición en el mapa
function updatePosition(position, username) {
    const coords = [position.coords.latitude, position.coords.longitude];
    
    // Mover el mapa suavemente
    if (map) {
        map.setView(coords, map.getZoom(), {
            animate: true,
            duration: 0.5
        });
    }
    
    // Actualizar o crear marcador
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
    if (currentMarker) {
        currentMarker
            .setPopupContent(`
                <b>${username}</b><br>
                Lat: ${coords[0].toFixed(6)}<br>
                Lng: ${coords[1].toFixed(6)}<br>
                Precisión: ${position.coords.accuracy.toFixed(1)}m
            `)
            .openPopup();
    }
}

// ===== MANEJO DE ERRORES ===== //

function handleGeolocationError(error) {
    let message = 'Error de GPS: ';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Permiso denegado. Active la geolocalización en su navegador.';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Ubicación no disponible.';
            break;
        case error.TIMEOUT:
            message += 'Tiempo de espera agotado.';
            break;
        default:
            message += `Código ${error.code}: ${error.message}`;
    }
    
    console.error(message);
    alert(message);
}

// Cerrar sesión
function logout() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
    
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
