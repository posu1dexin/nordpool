// Import necessary libraries
import React, { Component } from 'react';
import init from 'react_native_mqtt'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
// Components for building UI 
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
} from 'react-native'; 

// Initialize MQTT with AsyncStorage
init({
  size: 10000, 
  storageBackend: AsyncStorage, 
  defaultExpires: 1000 * 3600 * 24, 
  enableCache: true, 
  sync: {}, 
});

// Define the MQTT component
export default class Mqtt extends Component {
  constructor() {
    super();
    // Bind event handler methods
    this.onMessageArrived = this.onMessageArrived.bind(this);
    this.onConnectionLost = this.onConnectionLost.bind(this);

    // Initialize MQTT client with broker details
    const client = new Paho.MQTT.Client('broker.mqttdashboard.com', 8000, '');
    client.onMessageArrived = this.onMessageArrived;
    client.onConnectionLost = this.onConnectionLost;
    client.connect({
      onSuccess: this.onConnect, 
      useSSL: false, 
      onFailure: (e) => { console.log("here is the error", e); } 
    });

    // Initialize component state
    this.state = {
      received_data: [], 
      client, 
      messageToSend: 'scrape', 
      isConnected: false, 
    };
  }

  // Event handler for incoming MQTT messages
  onMessageArrived(entry) {
    console.log("onMessageArrived: " + entry.payloadString);
    
    // Process incoming data if it belongs to the topic "Nordpool/response"
    if (entry.destinationName === "Nordpool/response") {
      const rawData = entry.payloadString;
      const dataRows = rawData.split('], [').map(row => row.replace(/[\[\]']/g, ''));
      const parsedData = dataRows.map(row => {
        const [timeRange, value] = row.split(', ');
        return { timeRange, value };
      });
      console.log("parsedData: ", parsedData);
      this.setState({ received_data: parsedData }); // Update component state with parsed data
    }
  }

  // Callback function for successful MQTT connection
  onConnect = () => {
    const { client } = this.state;
    console.log("Connected!!!!");
    // Subscribe to relevant topics
    client.subscribe('Nordpool/testing');
    client.subscribe('Nordpool/response');
    this.setState({ isConnected: true, error: '' }); // Update component state
  };

  // Method to send MQTT message
  sendMessage = () => {
    const { messageToSend, isConnected, client } = this.state;
    if (isConnected) {
      console.log("Sending message: " + messageToSend);
      const message = new Paho.MQTT.Message(messageToSend);
      message.destinationName = "Nordpool/testing";
      client.send(message); // Send message to MQTT broker
    }
  }

  // Event handler for MQTT connection loss
  onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost: " + responseObject.errorMessage);
      this.setState({ error: 'Lost Connection', isConnected: false }); 
    }
  }

  // Creating the table of the results
  renderTableItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.timeRange}</Text>
      <Text style={styles.tableCell}>{item.value}</Text>
    </View>
  );

  render() {
    const { received_data, error, isConnected } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Text style={styles.welcome}>Nordpool Project</Text>
          <View style={styles.connectionStatus}>
            {error ? (
              <Text style={{ color: 'red' }}>{error}</Text>
            ) : isConnected ? (
              <Text style={{ color: 'green' }}>Connected</Text>
            ) : null}
          </View>
          <View style={styles.buttonContainer}>
            <Button onPress={this.sendMessage} title="Scrape Data" /> // Button to trigger data scraping
          </View>
        </View>
        <FlatList
          data={received_data}
          renderItem={this.renderTableItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.tableContainer}
        />
      </View>
    );
  }
}

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  topContainer: {
    alignSelf: 'stretch',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  connectionStatus: {
    marginBottom: 10,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
});
