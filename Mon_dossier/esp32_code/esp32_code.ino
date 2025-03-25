#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Configuration WiFi
const char* ssid = "TOPNET_71E0";
const char* password = "u8v5qew9fg";

// Définition des pins
#define DHTPIN 4         // Broche du DHT11
#define DHTTYPE DHT11    // Type de capteur DHT11
#define SOIL_MOISTURE_PIN 34  // Pin analogique pour FC-28
#define PH_PIN 35        // Pin analogique pour capteur pH
#define EC_PIN 32        // Pin analogique pour capteur EC

// Intervalle entre les mesures (en ms)
const long interval = 10000;
unsigned long previousMillis = 0;

// Initialisation des capteurs
DHT dht(DHTPIN, DHTTYPE);

// Création du serveur web sur le port 80
AsyncWebServer server(80);

// Structure pour stocker les données des capteurs
struct SensorData {
  float temperature;
  float humidity;
  int soilMoisture;
  float pH;
  float ec;
  String timestamp;
} sensorData;

// Déclaration des fonctions
void readSensors();
String getSensorDataJson();

void setup() {
  Serial.begin(115200);

  // Initialisation des capteurs
  dht.begin();

  // Initialisation du système de fichiers SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Erreur lors du montage du système de fichiers SPIFFS");
    return;
  }

  // Connexion au WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connexion au WiFi...");
  }

  Serial.println("Connecté au WiFi");
  Serial.print("Adresse IP: ");
  Serial.println(WiFi.localIP());

  // Définition des routes du serveur web
  server.on("/api/sensors", HTTP_GET, [](AsyncWebServerRequest *request) {
    String json = getSensorDataJson();
    Serial.println("Données envoyées : " + json);
    request->send(200, "application/json", json);
  });

  server.on("/styles.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/styles.css", "text/css");
  });

  server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/script.js", "text/javascript");
  });

  // Démarrage du serveur
  server.begin();
}

void loop() {
  unsigned long currentMillis = millis();

  // Lecture des capteurs à intervalles réguliers
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    readSensors();

    // Affichage des valeurs dans le moniteur série pour débogage
    Serial.println("Nouvelles lectures de capteurs:");
    Serial.print("Température: ");
    Serial.print(sensorData.temperature);
    Serial.println(" °C");
    Serial.print("Humidité air: ");
    Serial.print(sensorData.humidity);
    Serial.println(" %");
    Serial.print("Humidité sol: ");
    Serial.print(sensorData.soilMoisture);
    Serial.println(" %");
    Serial.print("pH: ");
    Serial.println(sensorData.pH);
    Serial.print("EC: ");
    Serial.print(sensorData.ec);
    Serial.println(" µS/cm");
    Serial.println("---------------------");
  }
}

// Fonction pour lire les valeurs des capteurs
void readSensors() {
  // Lecture du DHT22 (température et humidité)
  sensorData.temperature = dht.readTemperature();
  sensorData.humidity = dht.readHumidity();

  // Vérification si les lectures du DHT22 sont valides
  if (isnan(sensorData.humidity) || isnan(sensorData.temperature)) {
    Serial.println("Échec de lecture du capteur DHT22");
    sensorData.temperature = 0.0;
    sensorData.humidity = 0.0;
  }

  // Lecture de l'humidité du sol (FC-28)
  int soilRawValue = analogRead(SOIL_MOISTURE_PIN);
  sensorData.soilMoisture = map(soilRawValue, 4095, 1000, 0, 100);
  sensorData.soilMoisture = constrain(sensorData.soilMoisture, 0, 100);

  // Lecture du pH
  int pHRaw = analogRead(PH_PIN);
  sensorData.pH = map(pHRaw, 0, 4095, 0, 14) / 1.0;

  // Lecture de la conductivité électrique
  int ecRaw = analogRead(EC_PIN);
  sensorData.ec = map(ecRaw, 0, 4095, 0, 5000) / 1.0;

  // Horodatage
  sensorData.timestamp = String(millis() / 1000);
}

// Fonction pour obtenir les données des capteurs au format JSON
String getSensorDataJson() {
  DynamicJsonDocument doc(2048);

  doc["temperature"] = sensorData.temperature;
  doc["humidity"] = sensorData.humidity;
  doc["soilMoisture"] = sensorData.soilMoisture;
  doc["pH"] = sensorData.pH;
  doc["ec"] = sensorData.ec;
  doc["timestamp"] = sensorData.timestamp;

  String json;
  serializeJson(doc, json);
  return json;
}