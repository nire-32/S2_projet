export function updateSensorDisplays(data) {
  document.getElementById("temperature").textContent = `${data.temperature} °C`;
  document.getElementById("humidity").textContent = `${data.humidity} %`;
  document.getElementById("soilMoisture").textContent = `${data.soilMoisture} %`;
  document.getElementById("lightLevel").textContent = `${data.lightLevel} lux`;
}

export function updateCharts(data) {
  tempHumChart.data.labels.push(new Date().toLocaleTimeString());
  tempHumChart.data.datasets[0].data.push(data.temperature);
  tempHumChart.data.datasets[1].data.push(data.humidity);
  tempHumChart.update();

  soilChart.data.labels.push(new Date().toLocaleTimeString());
  soilChart.data.datasets[0].data.push(data.soilMoisture);
  soilChart.update();
}