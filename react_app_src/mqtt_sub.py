# Import necessary libraries
import paho.mqtt.client as mqtt
from nordpool import scrape_nordpool_data


MQTT_Topic = "Nordpool/testing" # Mqtt topic for scraping request
MQTT_Response_Topic = "Nordpool/response" #Mqtt topic for scrapped data 
mqttBroker = "broker.mqttdashboard.com"

# Callback function to handle incoming MQTT messages
def on_message(client, userdata, message):

    print("Received message: ", str(message.payload.decode("utf-8")))
    
    # Check if the received message is a request to scrape data, because otherwise it goes into endless cycle
    if str(message.payload.decode("utf-8")) == "scrape":
        # Scrape Nordpool data
        content = scrape_nordpool_data()
        # Publish the scraped data to the response topic
        client.publish(MQTT_Response_Topic, str(content))


client = mqtt.Client(client_id='', callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
client.connect(mqttBroker)
client.subscribe(MQTT_Topic)
client.on_message = on_message
client.loop_forever()
