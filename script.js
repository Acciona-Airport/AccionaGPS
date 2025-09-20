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
        loadVehicleNames(); // Carga los nombres de vehículos
        setupAdminPanel(); // Configura el botón para guardar
        setupDashboardTabs(); // Configura las pestañas del dashboard
        updateVehicleNamesInUI(); // Actualiza la UI con los nombres
        checkAdminAccess(); // Verifica acceso de administrador
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

// Configurar panel de administración
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
            
            // Guardar en localStorage
            localStorage.setItem('vehicleNumbers', JSON.stringify(vehicleNumbers));
            
            // Actualizar los nombres de vehículos en memoria
            Object.keys(vehicleNumbers).forEach(mobileId => {
                if (vehicleNumbers[mobileId]) {
                    vehicleNames[mobileId] = vehicleNumbers[mobileId];
                }
            });
            
            // Guardar también en vehicleNames para consistencia
            localStorage.setItem('vehicleNames', JSON.stringify(vehicleNames));
            
            // Actualizar la UI y los marcadores
            updateVehicleNamesInUI();
            updateMarkersWithNewNames();
            
            alert('Números de vehículos guardados con éxito.');
        });
    }
}

// Cargar nombres de vehículos desde localStorage
function loadVehicleNames() {
    // Primero intenta cargar de vehicleNames
    const savedVehicleNames = localStorage.getItem('vehicleNames');
    if (savedVehicleNames) {
        vehicleNames = JSON.parse(savedVehicleNames);
    } else {
        // Si no existe, intenta cargar de vehicleNumbers (para compatibilidad)
        const savedVehicleNumbers = localStorage.getItem('vehicleNumbers');
        if (savedVehicleNumbers) {
            const numbers = JSON.parse(savedVehicleNumbers);
            Object.keys(numbers).forEach(mobileId => {
                if (numbers[mobileId]) {
                    vehicleNames[mobileId] = numbers[mobileId];
                }
            });
            localStorage.setItem('vehicleNames', JSON.stringify(vehicleNames));
        }
    }
    
    // Llenar los inputs del formulario
    if (document.getElementById('movil1Input')) {
        document.getElementById('movil1Input').value = vehicleNames.Movil1 || '';
        document.getElementById('movil2Input').value = vehicleNames.Movil2 || '';
        document.getElementById('movil3Input').value = vehicleNames.Movil3 || '';
        document.getElementById('movil4Input').value = vehicleNames.Movil4 || '';
    }
}

// Actualizar nombres de vehículos en la UI
function updateVehicleNamesInUI() {
    for (let i = 1; i <= 4; i++) {
        const mobileId = 'Movil' + i;
        const nameElement = document.getElementById(`${mobileId.toLowerCase()}-name`);
        
        if (nameElement && vehicleNames[mobileId]) {
            nameElement.textContent = vehicleNames[mobileId];
        }
    }
}

// Actualizar marcadores con nuevos nombres
function updateMarkersWithNewNames() {
    Object.keys(markers).forEach(mobile => {
        const displayName = vehicleNames[mobile] || mobile;
        if (markers[mobile]) {
            markers[mobile].setPopupContent(`<b>${displayName}</b>`);
        }
    });
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

// Helper para páginas
function isLoginPage() {
    return window.location.pathname.includes('login.html');
}

// Función para descargar datos en Excel
function downloadExcelData() {
    // Simulación de datos para exportar
    const data = [
        ['Vehículo', 'Última Actualización', 'Estado'],
        ['Móvil 1', new Date().toLocaleString(), 'Activo'],
        ['Móvil 2', new Date().toLocaleString(), 'Inactivo'],
        ['Móvil 3', new Date().toLocaleString(), 'Activo'],
        ['Móvil 4', new Date().toLocaleString(), 'Activo']
    ];
    
    // Crear workbook y worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos Vehículos");
    
    // Descargar archivo
    const today = new Date();
    const fileName = `datos_vehiculos_${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert('Datos descargados exitosamente');
}

// Asignar evento al botón de descarga
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadExcelBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadExcelData);
    }
});
