#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT22.h>

const char* ssid = "ALHN-5201";
const char* password = "F775bCj4yt";
const char* mqtt_server = "91.121.93.94"; // test.mosquitto.org
const int mqtt_port = 1883;

const int dhtPin = 4;
DHT22 dht(dhtPin);

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long previousMillis = 0;
const long readInterval = 5000;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  //Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= readInterval) {
    previousMillis = currentMillis;
    float temperature = dht.getTemperature();
    float humidity = dht.getHumidity();
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    if (!client.connected()) {
      reconnect();
    }
    // Create a string to hold both temperature and humidity
    String data = String(temperature) + "," + String(humidity);
    
    // Publish the combined data
    client.publish("dht/data", data.c_str());
  }
  client.loop();
}
