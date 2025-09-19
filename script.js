// Base de datos SIMULADA (en producción usa Firebase/Backend)
const mobileData = {
    "Movil1": { coords: null, lastUpdate: null },
    "Movil2": { coords: null, lastUpdate: null }
};

// Configuración del mapa
const SCL_COORDS = [-33.3931, -70.7858];
const ZOOM_INICIAL = 14;
let map;
const markers = {}; // Almacena los marcadores

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (isLoginPage()) {
        setupLogin();
    } else {
        initMap();
        loadMobileNumbers(); // <--- Nueva función para cargar los datos
        setupAdminPanel();
    }
});

// Configurar login
function setupLogin() {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (await authenticate(username, password)) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'index.html';
        } else {
            alert('Credenciales incorrectas');
        }
    });
}

// Autenticación simulada
async function authenticate(username, password) {
    // Verifica credenciales
    const validCredentials = {
        "Movil1": "MovilAcciona2025",
        "Movil2": "MovilAcciona2025",
        "Admin": "Acciona2025" // Usuario extra para visualización
    };
    return validCredentials[username] === password;
}

// Inicializar mapa
function initMap() {
    map = L.map('map').setView(SCL_COORDS, ZOOM_INICIAL);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Marcador inicial para SCL
    L.marker(SCL_COORDS).addTo(map)
        .bindPopup('Aeropuerto SCL')
        .openPopup();

    // Actualizar posiciones cada 5 segundos
    setInterval(updateMobilePositions, 5000);
}

// Nueva función para el panel de administración
function setupAdminPanel() {
    const saveButton = document.getElementById('save-mobile-numbers');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const mobileNumbers = {
                mobile1: document.getElementById('mobile1').value.trim(),
                mobile2: document.getElementById('mobile2').value.trim(),
                mobile3: document.getElementById('mobile3').value.trim(),
                mobile4: document.getElementById('mobile4').value.trim()
            };
            
            localStorage.setItem('mobileNumbers', JSON.stringify(mobileNumbers));
            alert('Números de móvil guardados con éxito.');
        });
    }
}

// Nueva función para cargar los números de móvil desde localStorage
function loadMobileNumbers() {
    const mobileNumbers = JSON.parse(localStorage.getItem('mobileNumbers'));
    if (mobileNumbers) {
        document.getElementById('mobile1').value = mobileNumbers.mobile1 || '';
        document.getElementById('mobile2').value = mobileNumbers.mobile2 || '';
        document.getElementById('mobile3').value = mobileNumbers.mobile3 || '';
        document.getElementById('mobile4').value = mobileNumbers.mobile4 || '';
    }
}

// Actualizar posiciones (simula recepción de datos GPS)
function updateMobilePositions() {
    // En un sistema real, aquí harías una petición a tu backend
    Object.keys(mobileData).forEach(mobile => {
        if (mobileData[mobile].coords) {
            updateOrCreateMarker(mobile, mobileData[mobile].coords);
        }
    });
}

// Crear/actualizar marcador
function updateOrCreateMarker(mobile, coords) {
    if (!markers[mobile]) {
        markers[mobile] = L.marker(coords, {
            icon: L.divIcon({
                className: `mobile-icon ${mobile}`,
                html: mobile === 'Movil1' ? '🚗' : '🚕',
                iconSize: [30, 30]
            })
        }).addTo(map)
        .bindPopup(`<b>${mobile}</b>`);
    } else {
        markers[mobile].setLatLng(coords);
    }
}

// Simulador de datos GPS (para prueba)
function simulateGPS(mobile) {
    // Coordenadas aleatorias cerca de SCL (solo para demo)
    const offset = () => (Math.random() * 0.01 - 0.005);
    mobileData[mobile].coords = [
        SCL_COORDS[0] + offset(),
        SCL_COORDS[1] + offset()
    ];
    mobileData[mobile].lastUpdate = new Date();
    
    // En sistema real, esto vendría del GPS del dispositivo
    updateOrCreateMarker(mobile, mobileData[mobile].coords);
}

// Iniciar seguimiento (llamar desde cada dispositivo)
function startTracking(mobile) {
    // En dispositivos reales:
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            position => {
                const coords = [position.coords.latitude, position.coords.longitude];
                mobileData[mobile] = {
                    coords: coords,
                    lastUpdate: new Date()
                };
                // Enviar datos al backend en sistema real
            },
            error => console.error(`Error GPS ${mobile}:`, error),
            { enableHighAccuracy: true }
        );
    } else {
        console.log(`${mobile}: GPS no disponible`);
        // Modo simulación para pruebas
        setInterval(() => simulateGPS(mobile), 10000);
    }
}

// Helper para páginas
function isLoginPage() {
    return window.location.pathname.includes('login.html');
}
