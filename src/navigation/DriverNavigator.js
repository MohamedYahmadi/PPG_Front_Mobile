import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DriverHomeScreen from '../domains/driver/HomeScreen';
import TripScreen from '../domains/driver/TripScreen';
import GPSLiveScreen from '../domains/driver/GPSLiveScreen';
import IncidentScreen from '../domains/driver/IncidentScreen';

const Stack = createStackNavigator();

const DriverNavigator = () => (
  <Stack.Navigator
    initialRouteName="DriverHome"
    screenOptions={{ headerStyle: { backgroundColor: '#f5f6fa' } }}
  >
    <Stack.Screen name="DriverHome" component={DriverHomeScreen} options={{ title: 'Driver Dashboard' }} />
    <Stack.Screen name="Trip" component={TripScreen} options={{ title: 'Active Trip' }} />
    <Stack.Screen name="GPSLive" component={GPSLiveScreen} options={{ title: 'GPS Broadcast' }} />
    <Stack.Screen name="Incident" component={IncidentScreen} options={{ title: 'Report Incident' }} />
  </Stack.Navigator>
);

export default DriverNavigator;
