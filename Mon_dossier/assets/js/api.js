const ESP32_IP = "192.168.1.11";  // Remplace avec l'IP de ton ESP32
const API_URL = `http://${ESP32_IP}/api/sensors`;  // Définir l'URL de l'API

export async function fetchSensorData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return null;
    }
}

// Appel initial pour récupérer les données
fetchSensorData();