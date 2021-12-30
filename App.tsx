import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
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
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  async function onScan(result: BarCodeScanningResult) {
    setScanned(true);
    const details = await getDetailsFromBarcode(result.data);
    console.log(`details = ${details}`)
    navigation.navigate('Settings', details);
  }

  const camera = 
    <BarCodeScanner style={styles.camera}
      type={type}
      onBarCodeScanned={scanned ? undefined : onScan}
      barCodeTypes={[BarCodeScanner.Constants.BarCodeType.upc_a, BarCodeScanner.Constants.BarCodeType.ean13]}>
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
    </BarCodeScanner>

  return (
    <View style={styles.container}>
      {scanned ? undefined : camera}
    </View>
  );
}

function SettingsScreen({ route, navigation }) {
  const details = route.params;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{color: 'white'}}>{details}</Text>
      <Button
          title="Go back Home"
          onPress={() => navigation.navigate('Home')}/>
    </View>
  );
}

async function getDetailsFromBarcode(barcode: String) {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/search?code=${barcode}&fields=brand_owner,brand_owner_imported,brands,brands_tags,_keywords`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  return response.text();
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
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