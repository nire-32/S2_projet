import { Chart } from 'chart.js';

let tempHumChart;
let soilChart;

export function createTemperatureChart(ctx, data) {
    tempHumChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Température (°C)',
                data: data.values,
                borderColor: '#e74c3c'
            }]
        }
    });
}

export function createSoilChart(ctx, data) {
    soilChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Humidité du sol (%)',
                data: data.values,
                borderColor: '#3498db'
            }]
        }
    });
}