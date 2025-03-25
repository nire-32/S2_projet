// Configuration et variables globales
const API_ENDPOINT = '/api/sensors';  // Point d'API sur l'ESP32
const UPDATE_INTERVAL = 5000;         // Intervalle de mise à jour en ms
let historyData = [];                 // Stockage des données historiques
let charts = {};                      // Stockage des objets Chart.js

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des graphiques
    initCharts();
    
    // Premier chargement des données
    fetchSensorData();
    
    // Configuration de la mise à jour périodique
    setInterval(fetchSensorData, UPDATE_INTERVAL);
});

// Fonction pour récupérer les données des capteurs
async function fetchSensorData() {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);  // Ajouter cette ligne pour voir ce que l'API renvoie
        updateDashboard(data);
        addToHistory(data);
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

// Mettre à jour les éléments du tableau de bord avec les nouvelles données
function updateDashboard(data) {
    // Mettre à jour les cartes d'aperçu
    document.getElementById('temperature').textContent = `${data.temperature.toFixed(1)} °C`;
    document.getElementById('humidity').textContent = `${data.humidity.toFixed(1)} %`;
    document.getElementById('soilMoisture').textContent = `${data.soilMoisture} %`;
    document.getElementById('lightLevel').textContent = `${data.lightLevel.toFixed(1)} lux`;
    
    // Mettre à jour les jauges
    updateGauge('phGauge', data.pH / 14 * 100);
    updateGauge('ecGauge', data.ec / 5000 * 100);
    document.getElementById('phValue').textContent = data.pH.toFixed(1);
    document.getElementById('ecValue').textContent = data.ec.toFixed(0);
    
    // Mettre à jour les statuts
    updateStatus('phStatus', data.pH);
    updateStatus('ecStatus', data.ec);
    
    // Mettre à jour les graphiques
    updateCharts(data);
}

// Initialisation des graphiques Chart.js
function initCharts() {
    // Graphique de température et d'humidité
    const tempHumCtx = document.getElementById('tempHumChart').getContext('2d');
    charts.tempHum = new Chart(tempHumCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Température (°C)',
                    data: [],
                    borderColor: '#FF5722',
                    backgroundColor: 'rgba(255, 87, 34, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Humidité (%)',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
    
    // Graphique d'état du sol
    const soilCtx = document.getElementById('soilChart').getContext('2d');
    charts.soil = new Chart(soilCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Humidité du Sol (%)',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'pH',
                    data: [],
                    borderColor: '#FFC107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Humidité (%)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'pH'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    min: 0,
                    max: 14
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Mise à jour des graphiques avec les nouvelles données
function updateCharts(data) {
    // Obtenir l'heure actuelle formatée
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    // Ajouter les données aux graphiques
    if (charts.tempHum.data.labels.length > 12) {
        charts.tempHum.data.labels.shift();
        charts.tempHum.data.datasets[0].data.shift();
        charts.tempHum.data.datasets[1].data.shift();
    }
    charts.tempHum.data.labels.push(timeLabel);
    charts.tempHum.data.datasets[0].data.push(data.temperature);
    charts.tempHum.data.datasets[1].data.push(data.humidity);
    charts.tempHum.update();
    
    if (charts.soil.data.labels.length > 12) {
        charts.soil.data.labels.shift();
        charts.soil.data.datasets[0].data.shift();
        charts.soil.data.datasets[1].data.shift();
    }
    charts.soil.data.labels.push(timeLabel);
    charts.soil.data.datasets[0].data.push(data.soilMoisture);
    charts.soil.data.datasets[1].data.push(data.pH);
    charts.soil.update();
}

// Mise à jour de la jauge
function updateGauge(gaugeId, percentage) {
    const gaugeElement = document.getElementById(gaugeId);
    gaugeElement.querySelector(':before').style.width = `${percentage}%`;
}

// Mise à jour des statuts
function updateStatus(statusId, value) {
    const statusElement = document.getElementById(statusId);
    
    if (statusId === 'phStatus') {
        if (value < 6) {
            statusElement.textContent = 'État: Trop acide';
            statusElement.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            statusElement.style.color = '#F44336';
        } else if (value > 7.5) {
            statusElement.textContent = 'État: Trop alcalin';
            statusElement.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
            statusElement.style.color = '#2196F3';
        } else {
            statusElement.textContent = 'État: Optimal';
            statusElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            statusElement.style.color = '#4CAF50';
        }
    } else if (statusId === 'ecStatus') {
        if (value < 800) {
            statusElement.textContent = 'État: Faible';
            statusElement.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
            statusElement.style.color = '#FFC107';
        } else if (value > 2000) {
            statusElement.textContent = 'État: Élevé';
            statusElement.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            statusElement.style.color = '#F44336';
        } else {
            statusElement.textContent = 'État: Optimal';
            statusElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            statusElement.style.color = '#4CAF50';
        }
    }
}

// Ajouter les données à l'historique
function addToHistory(data) {
    // Formater la date
    const now = new Date();
    const formattedDate = now.toLocaleString();
    
    // Ajouter les données à l'historique
    historyData.push({
        date: formattedDate,
        temperature: data.temperature,
        humidity: data.humidity,
        soilMoisture: data.soilMoisture,
        lightLevel: data.lightLevel,
        pH: data.pH,
        ec: data.ec
    });
    
    // Limiter l'historique à 20 entrées
    if (historyData.length > 20) {
        historyData.shift();
    }
    
    // Mettre à jour le tableau d'historique
    updateHistoryTable();
}

// Mettre à jour le tableau d'historique
function updateHistoryTable() {
    const tableBody = document.getElementById('historyTableBody');
    
    // Effacer le contenu actuel
    tableBody.innerHTML = '';
    
    // Parcourir les données d'historique en ordre inverse (plus récent d'abord)
    historyData.slice().reverse().forEach(record => {
        const row = document.createElement('tr');
        
        // Créer les cellules de données
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.temperature.toFixed(1)} °C</td>
            <td>${record.humidity.toFixed(1)} %</td>
            <td>${record.soilMoisture} %</td>
            <td>${record.lightLevel.toFixed(1)} lux</td>
            <td>${record.pH.toFixed(1)}</td>
            <td>${record.ec.toFixed(0)} µS/cm</td>
        `;
        
        // Ajouter la ligne au tableau
        tableBody.appendChild(row);
    });
}