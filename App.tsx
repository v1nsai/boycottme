import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import ApiCredentials from './credentials.json'

function HomeScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  async function onScan(result: BarCodeScanningResult) {
    setScanned(true);
    const details = await getDetailsFromBarcode(result.data);
    navigation.navigate('Settings', details);
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera}
        type={type}
        onBarCodeScanned={scanned ? undefined : onScan}>
        <View>
          <TouchableOpacity
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text> Flip </Text>
          </TouchableOpacity>
        </View>
      </Camera>
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate('Settings')}
      />
    </View>
  );
}

function SettingsScreen({ route, navigation }) {
  const details = route.params;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>brand = {details['hints'][0]['food']['brand']}</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

async function getDetailsFromBarcode(barcode: String) {
  const response = await fetch(`https://api.edamam.com/api/food-database/v2/parser?app_id=${ApiCredentials['appId']}&app_key=${ApiCredentials['appKey']}&upc=${barcode}&nutrition-type=cooking`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  return response.json();
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  camera: {
    height: "80%",
    width: "80%",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});