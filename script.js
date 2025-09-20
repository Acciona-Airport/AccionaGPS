// Base de datos SIMULADA (en producción usa Firebase/Backend)
const mobileData = {
    "Movil1": { coords: null, lastUpdate: null },
    "Movil2": { coords: null, lastUpdate: null },
    "Movil3": { coords: null, lastUpdate: null },
    "Movil4": { coords: null, lastUpdate: null }
};

// Configuración del mapa
const SCL_COORDS = [-33.3931, -70.7858];
const ZOOM_INICIAL = 14;
let map;
const markers = {}; // Almacena los marcadores
let vehicleNames = {}; // Almacena los nombres personalizados de vehículos

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (isLoginPage()) {
        setupLogin();
    } else {
        initMap();
        loadMobileNumbers(); // Carga los nombres guardados al iniciar
        setupAdminPanel(); // Configura el botón para guardar
        setupDashboardTabs(); // Configura las pestañas del dashboard
        loadVehicleNames(); // Carga los nombres de vehículos
        updateVehicleNamesInUI(); // Actualiza la UI con los nombres
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
        "Movil3": "MovilAcciona2025",
        "Movil4": "MovilAcciona2025",
        "Admin": "Acciona2025", // Usuario admin para gestión
        "Funcionarios": "Funcionarios2025" // Usuario para visualización
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

// Configurar pestañas del dashboard
function setupDashboardTabs() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.dashboard-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}Content`).classList.add('active');
        });
    });
}

// Nueva función para el panel de administración
function setupAdminPanel() {
    const saveButton = document.getElementById('saveVehicleNumbersBtn');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const vehicleNumbers = {
                Movil1: document.getElementById('movil1Input').value.trim(),
                Movil2: document.getElementById('movil2Input').value.trim(),
                Movil3: document.getElementById('movil3Input').value.trim(),
                Movil4: document.getElementById('movil4Input').value.trim()
            };
            
            localStorage.setItem('vehicleNumbers', JSON.stringify(vehicleNumbers));
            
            // Actualizar los nombres de vehículos
            Object.keys(vehicleNumbers).forEach(mobileId => {
                if (vehicleNumbers[mobileId]) {
                    vehicleNames[mobileId] = vehicleNumbers[mobileId];
                }
            });
            
            localStorage.setItem('vehicleNames', JSON.stringify(vehicleNames));
            updateVehicleNamesInUI();
            
            alert('Números de vehículos guardados con éxito.');
        });
    }
}

// Cargar números de móvil desde localStorage
function loadMobileNumbers() {
    const mobileNumbers = JSON.parse(localStorage.getItem('mobileNumbers'));
    if (mobileNumbers) {
        document.getElementById('mobile1').value = mobileNumbers.mobile1 || '';
        document.getElementById('mobile2').value = mobileNumbers.mobile2 || '';
        document.getElementById('mobile3').value = mobileNumbers.mobile3 || '';
        document.getElementById('mobile4').value = mobileNumbers.mobile4 || '';
    }
}

// Cargar nombres de vehículos desde localStorage
function loadVehicleNames() {
    const savedVehicleNames = localStorage.getItem('vehicleNames');
    if (savedVehicleNames) {
        vehicleNames = JSON.parse(savedVehicleNames);
    }
}

// Actualizar nombres de vehículos en la UI
function updateVehicleNamesInUI() {
    for (let i = 1; i <= 4; i++) {
        const mobileId = 'Movil' + i;
        const nameElement = document.getElementById(`${mobileId.toLowerCase()}-name`);
        const inputElement = document.getElementById(`movil${i}Input`);
        
        if (nameElement && vehicleNames[mobileId]) {
            nameElement.textContent = vehicleNames[mobileId];
        }
        
        if (inputElement && vehicleNames[mobileId]) {
            inputElement.value = vehicleNames[mobileId];
        }
    }
}

// Actualizar posiciones (simula recepción de datos GPS)
function updateMobilePositions() {
    Object.keys(mobileData).forEach(mobile => {
        if (mobileData[mobile].coords) {
            updateOrCreateMarker(mobile, mobileData[mobile].coords);
        }
    });
}

// Crear/actualizar marcador
function updateOrCreateMarker(mobile, coords) {
    const displayName = vehicleNames[mobile] || mobile;
    
    if (!markers[mobile]) {
        markers[mobile] = L.marker(coords, {
            icon: L.divIcon({
                className: `mobile-icon ${mobile}`,
                html: '🚗',
                iconSize: [30, 30]
            })
        }).addTo(map)
        .bindPopup(`<b>${displayName}</b>`);
    } else {
        markers[mobile].setLatLng(coords);
        markers[mobile].setPopupContent(`<b>${displayName}</b>`);
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
    
    updateOrCreateMarker(mobile, mobileData[mobile].coords);
}

// Iniciar seguimiento (llamar desde cada dispositivo)
function startTracking(mobile) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            position => {
                const coords = [position.coords.latitude, position.coords.longitude];
                mobileData[mobile] = {
                    coords: coords,
                    lastUpdate: new Date()
                };
            },
            error => console.error(`Error GPS ${mobile}:`, error),
            { enableHighAccuracy: true }
        );
    } else {
        console.log(`${mobile}: GPS no disponible`);
        setInterval(() => simulateGPS(mobile), 10000);
    }
}

// Helper para páginas
function isLoginPage() {
    return window.location.pathname.includes('login.html');
}

// Mostrar/ocultar panel de administración según el usuario
function checkAdminAccess() {
    const currentUser = localStorage.getItem('currentUser');
    const adminDashboard = document.getElementById('adminDashboard');
    const vehicleManagementTab = document.querySelector('[data-tab="vehicleManagement"]');
    
    if (currentUser === 'Admin' && adminDashboard && vehicleManagementTab) {
        adminDashboard.style.display = 'block';
        vehicleManagementTab.style.display = 'block';
    } else if (adminDashboard && vehicleManagementTab) {
        adminDashboard.style.display = 'none';
        vehicleManagementTab.style.display = 'none';
    }
}

// Inicializar verificación de acceso admin al cargar
document.addEventListener('DOMContentLoaded', function() {
    if (!isLoginPage()) {
        checkAdminAccess();
    }
});
