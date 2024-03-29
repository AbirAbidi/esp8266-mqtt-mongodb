const express = require('express');
const { MongoClient } = require('mongodb');
const mqtt = require('mqtt');

const app = express();
const PORT = 1883;
const HOST = '0.0.0.0';
const MONGODB_URL = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'test';
const COLLECTION_NAME = 'esp_data';
const MQTT_BROKER_URL = 'mqtt://91.121.93.94'; // Change this to your MQTT broker IP

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB client instance
const client = new MongoClient(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    }
}
connectToDB();

// MQTT client instance
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

// Handle MQTT messages
mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker');
    mqttClient.subscribe('dht/data');   
});

mqttClient.on('message', async (topic, message) => {
    try {
        const dataParts = message.toString().split(','); // Split the message by comma
        const temperature = parseFloat(dataParts[0]); // Extract temperature
        const humidity = parseFloat(dataParts[1]); // Extract humidity

        const data = {
            topic: topic,
            temperature: temperature,
            humidity: humidity
        };

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.insertOne(data);
        console.log('Data inserted successfully:', result.insertedId);
    } catch (error) {
        console.error('Error inserting data:', error);
    }
});

// Handle POST request to '/api/post_data'
app.post('/api/post_data', async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ error: 'No data provided' });
        }

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.insertOne(data);
        console.log('Data inserted successfully:', result.insertedId);
        res.status(201).json({ message: 'Data inserted successfully', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
