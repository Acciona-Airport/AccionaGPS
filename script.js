// Credenciales válidas
const validCredentials = {
    "Movil1": "MovilAcciona2025",
    "Movil2": "MovilAcciona2025"
};

// Coordenadas iniciales (Aeropuerto SCL)
const INITIAL_COORDS = [-33.3931, -70.7858];
const INITIAL_ZOOM = 15;

// Variables globales
let map;
let currentMarker;
let watchId;

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        checkAuth();
    } else if (window.location.pathname.endsWith('login.html')) {
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

// Configurar login
function setupLogin() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (validCredentials[username] && password === validCredentials[username]) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'index.html';
        } else {
            alert('Credenciales incorrectas. Usa Movil1/Movil2 y contraseña "MovilAcciona2025"');
        }
    });
}

// Inicializar aplicación
function initApp(username) {
    document.getElementById('current-user').textContent = username;
    document.getElementById('logout-btn').addEventListener('click', logout);
    initMap();
    startTracking(username);
}

// Inicializar mapa
function initMap() {
    map = L.map('map').setView(INITIAL_COORDS, INITIAL_ZOOM);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Marcador inicial en aeropuerto
    currentMarker = L.marker(INITIAL_COORDS, {
        title: 'Aeropuerto SCL'
    }).addTo(map)
    .bindPopup('Aeropuerto Arturo Merino Benítez');
}

// Iniciar seguimiento GPS
function startTracking(username) {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => updatePosition(position, username),
            (error) => handleGeolocationError(error),
            { 
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000 
            }
        );
    } else {
        alert('Tu navegador no soporta geolocalización');
    }
}

// Actualizar posición en mapa
function updatePosition(position, username) {
    const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    
    // Mover vista del mapa
    map.setView([coords.lat, coords.lng], map.getZoom());
    
    // Actualizar marcador
    if (currentMarker) {
        currentMarker.setLatLng([coords.lat, coords.lng]);
    } else {
        currentMarker = L.marker([coords.lat, coords.lng]).addTo(map);
    }
    
    // Actualizar popup
    currentMarker
        .setPopupContent(`
            <b>${username}</b><br>
            Lat: ${coords.lat.toFixed(6)}<br>
            Lng: ${coords.lng.toFixed(6)}<br>
            Precisión: ${position.coords.accuracy.toFixed(1)} metros
        `)
        .openPopup();
}

// Manejar errores de geolocalización
function handleGeolocationError(error) {
    let message = 'Error de GPS: ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Permiso denegado';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Ubicación no disponible';
            break;
        case error.TIMEOUT:
            message += 'Tiempo de espera agotado';
            break;
        default:
            message += `Error desconocido (${error.code})`;
    }
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
