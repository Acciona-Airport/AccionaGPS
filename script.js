// Credenciales válidas
const validCredentials = {
    "Movil1": "MovilAcciona2025",
    "Movil2": "MovilAcciona2025"
};

// Coordenadas Aeropuerto SCL
const SCL_COORDS = [-33.3931, -70.7858];
const ZOOM_INICIAL = 16;

// Variables globales
let map;
let currentMarker;

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname.split('/').pop();
    
    if (path === 'index.html' || path === '') {
        checkAuth();
    } else if (path === 'login.html') {
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
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    initMap();
    startTracking(username);
}

// Inicializar mapa
function initMap() {
    map = L.map('map').setView(SCL_COORDS, ZOOM_INICIAL);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    currentMarker = L.marker(SCL_COORDS).addTo(map)
        .bindPopup('Aeropuerto SCL')
        .openPopup();
}

// Iniciar seguimiento GPS
function startTracking(username) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => updatePosition(position, username),
            (error) => console.error('Error GPS:', error),
            { enableHighAccuracy: true }
        );
    } else {
        alert('Geolocalización no soportada');
    }
}

// Actualizar posición
function updatePosition(position, username) {
    const coords = [position.coords.latitude, position.coords.longitude];
    map.setView(coords);
    
    if (currentMarker) {
        currentMarker.setLatLng(coords)
            .setPopupContent(`${username}<br>Lat: ${coords[0].toFixed(4)}<br>Lng: ${coords[1].toFixed(4)}`)
            .openPopup();
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
