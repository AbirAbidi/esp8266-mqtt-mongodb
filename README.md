# esp8266-mqtt-mongodb
this project will enable your esp8266 to connect through the mqtt protocol to your mongodb database (we are using in this project the mqtt.fx GUI for debugging and testing)

1. open the .ino file and upload it to your esp8366
2. install Mqtt.fx
3. Press on the setup icon, in the broker address insert 91.121.93.94 which is the ip address of test.mosquitto.org, port 1883 and apply
4. In the pusblish field, insert your topic "here it is dht/data", click on publish
5. Open the rest_api_mqtt.js file
6. Install the necessary libraries and then run "node rest_api_mqtt.js", the rest api server will start running
7. Do not forget to run your MongoDb (the name of my database is "test" and of the document is "esp_data" )
8. Restart your esp8266 and then the magic will start :
   The dht sensor will read temperature/humidity, send it to the broker, and then the rest api will fetch these data from that broker and insert it in the Mongodb
   ----> You have now an esp8266 that reads data and stores it in MongoDb, Congrats ! 
