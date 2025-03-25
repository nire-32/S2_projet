document.addEventListener('DOMContentLoaded', function() {
  // Initialiser la mise à jour des données
  fetchSensorData();

  // Fonction pour récupérer les données des capteurs via HTTP
  function fetchSensorData() {
      fetch('http://192.168.1.11/sensor-data') // Remplacez par l'IP de votre ESP32
          .then(response => response.json()) // Analyse de la réponse JSON
          .then(data => {
              updateSensorDisplays(data); // Met à jour l'affichage des capteurs
              updateCharts(data); // Met à jour les graphiques
          })
          .catch(error => {
              console.log('Erreur lors de la récupération des données:', error);
          });
  }

  // Fonction pour mettre à jour l'affichage des capteurs
  function updateSensorDisplays(data) {
      // Mettez à jour l'affichage des capteurs avec les données reçues
      document.getElementById("temperature").textContent = `${data.temperature} °C`;
      document.getElementById("humidity").textContent = `${data.humidity} %`;
      document.getElementById("soilMoisture").textContent = `${data.soilMoisture} %`;
      document.getElementById("lightLevel").textContent = `${data.lightLevel} lux`;
  }

  // Fonction pour mettre à jour les graphiques
  function updateCharts(data) {
      // Exemple d'utilisation de Chart.js pour mettre à jour les graphiques
      // Supposons que vous avez un graphique pour la température et l'humidité
      tempHumChart.data.datasets[0].data.push(data.temperature);
      tempHumChart.data.datasets[1].data.push(data.humidity);
      tempHumChart.update();

      // Si vous avez un graphique pour l'humidité du sol
      soilChart.data.datasets[0].data.push(data.soilMoisture);
      soilChart.update();
  }

  // Mettre à jour les données périodiquement (toutes les 5 secondes)
  setInterval(fetchSensorData, 5000); // Mise à jour toutes les 5 secondes
});
