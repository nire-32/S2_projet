// Mettre à jour les données des capteurs
function updateSensorData(data) {
    document.getElementById('temperature').textContent = data.temperature + ' °C';
    document.getElementById('humidity').textContent = data.humidity + ' %';
    document.getElementById('soilMoisture').textContent = data.soilMoisture + ' %';
    document.getElementById('lightLevel').textContent = data.lightLevel + ' lux';
    document.getElementById('phValue').textContent = data.ph;
    document.getElementById('ecValue').textContent = data.ec;
}

// Configurer les graphiques
const tempHumChartCtx = document.getElementById('tempHumChart').getContext('2d');
const tempHumChart = new Chart(tempHumChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Température (°C)',
                data: [],
                borderColor: '#e74c3c',
                fill: false
            },
            {
                label: 'Humidité (%)',
                data: [],
                borderColor: '#3498db',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const soilChartCtx = document.getElementById('soilChart').getContext('2d');
const soilChart = new Chart(soilChartCtx, {
    type: 'bar',
    data: {
        labels: ['Humidité Sol', 'pH', 'Conductivité'],
        datasets: [{
            label: 'Valeurs',
            data: [],
            backgroundColor: ['#2ecc71', '#f1c40f', '#9b59b6']
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Récupérer les données de l'ESP32
async function fetchSensorData() {
    const response = await fetch('http://esp32-ip-address/api/sensors');
    const data = await response.json();
    updateSensorData(data);
    updateCharts(data);
}

// Mettre à jour les graphiques
function updateCharts(data) {
    const now = new Date().toLocaleTimeString();
    tempHumChart.data.labels.push(now);
    tempHumChart.data.datasets[0].data.push(data.temperature);
    tempHumChart.data.datasets[1].data.push(data.humidity);
    tempHumChart.update();

    soilChart.data.datasets[0].data = [data.soilMoisture, data.ph, data.ec];
    soilChart.update();
}

// Charger les données initiales
fetchSensorData();
setInterval(fetchSensorData, 5000); // Rafraîchir toutes les 5 secondes