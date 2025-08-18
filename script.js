// Credenciales
const validCredentials = {
    "Movil1": "MovilAcciona2025",
    "Movil2": "MovilAcciona2025"
};

// Coordenadas Aeropuerto SCL
const SCL_COORDS = [-33.3931, -70.7858];
const MOBILE_ZOOM = 16;

// Variables globales
let map, currentMarker;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        checkAuth();
    } else if (window.location.pathname.includes('login.html')) {
        setupLogin();
    }
});

// Autenticación
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'login.html';
    } else {
        initApp(user);
    }
}

// Login
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

// Aplicación principal
function initApp(username) {
    document.getElementById('current-user').textContent = username;
    document.getElementById('logout-btn').addEventListener('click', logout);
    initMap();
    startTracking(username);
}

// Mapa móvil optimizado
function initMap() {
    map = L.map('map', {
        center: SCL_COORDS,
        zoom: MOBILE_ZOOM,
        tap: false, // Mejor compatibilidad táctil
        dragging: true,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);

    // Marcador inicial
    currentMarker = L.marker(SCL_COORDS, {
        icon: L.divIcon({
            className: 'mobile-marker',
            html: '✈️',
            iconSize: [30, 30]
        })
    }).addTo(map).bindPopup('Aeropuerto SCL');
}

// Geolocalización para móvil
function startTracking(username) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            position => updatePosition(position, username),
            error => alert(`Error GPS: ${error.message}`),
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocalización no soportada');
    }
}

// Actualizar posición
function updatePosition(position, username) {
    const coords = [position.coords.latitude, position.coords.longitude];
    
    // Suavizar movimiento en móvil
    map.panTo(coords, { animate: true, duration: 1 });
    
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
    
    // Popup móvil
    currentMarker
        .setPopupContent(`
            <b>${username}</b><br>
            <small>Lat: ${coords[0].toFixed(5)}</small><br>
            <small>Lng: ${coords[1].toFixed(5)}</small>
        `)
        .openPopup();
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
