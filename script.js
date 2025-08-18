// Credenciales válidas
const validCredentials = {
    "Movil1": "MovilAcciona2025",
    "Movil2": "MovilAcciona2025"
};

// Coordenadas iniciales para Aeropuerto AMB (SCL) [-33.3931, -70.7858]
const INITIAL_COORDS = [-33.3931, -70.7858]; 
const INITIAL_ZOOM = 15;

// Elementos del DOM
let map;
let currentMarker;
let watchId;

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            redirectToLogin();
        } else {
            initApp(storedUser);
        }
    } else if (window.location.pathname.includes('login.html')) {
        setupLoginForm();
    }
});

// Configurar el formulario de login
function setupLoginForm() {
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

// Inicializar la aplicación
function initApp(username) {
    document.getElementById('current-user').textContent = username;
    document.getElementById('logout-btn').addEventListener('click', logout);
    initMap();
    startTracking(username);
}

// Inicializar el mapa con OpenStreetMap
function initMap() {
    map = L.map('map').setView(INITIAL_COORDS, INITIAL_ZOOM);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    // Marcador inicial en el aeropuerto
    currentMarker = L.marker(INITIAL_COORDS, {
        title: 'Aeropuerto AMB (SCL)'
    }).addTo(map)
    .bindPopup('Aeropuerto Arturo Merino Benítez');
}

// Iniciar seguimiento GPS
function startTracking(username) {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => updatePosition(position, username),
            handleGeolocationError,
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

// Actualizar posición en el mapa
function updatePosition(position, username) {
    const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    
    // Actualizar vista del mapa
    map.setView([coords.lat, coords.lng], map.getZoom());
    
    // Actualizar o crear marcador
    if (currentMarker) {
        currentMarker.setLatLng([coords.lat, coords.lng]);
    } else {
        currentMarker = L.marker([coords.lat, coords.lng], {
            title: `Posición de ${username}`
        }).addTo(map);
    }
    
    // Actualizar popup
    currentMarker
        .setPopupContent(`
            <b>${username}</b><br>
            Lat: ${coords.lat.toFixed(6)}<br>
            Lng: ${coords.lng.toFixed(6)}<br>
            Exactitud: ${position.coords.accuracy.toFixed(1)} metros
        `)
        .openPopup();
}

// Manejar errores de geolocalización
function handleGeolocationError(error) {
    let message = '';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Información de ubicación no disponible';
            break;
        case error.TIMEOUT:
            message = 'Tiempo de espera agotado';
            break;
        default:
            message = `Error desconocido: ${error.message}`;
    }
    alert(`Error de GPS: ${message}`);
}

// Cerrar sesión
function logout() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
    localStorage.removeItem('currentUser');
    redirectToLogin();
}

// Redirigir a login
function redirectToLogin() {
    window.location.href = 'login.html';
}