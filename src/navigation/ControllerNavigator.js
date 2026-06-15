import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ControllerHomeScreen from '../domains/controller/HomeScreen';
import ScanScreen from '../domains/controller/ScanScreen';
import ValidationHistoryScreen from '../domains/controller/HistoryScreen';

const Stack = createStackNavigator();

const ControllerNavigator = () => (
  <Stack.Navigator
    initialRouteName="ControllerHome"
    screenOptions={{ headerStyle: { backgroundColor: '#f5f6fa' } }}
  >
    <Stack.Screen name="ControllerHome" component={ControllerHomeScreen} options={{ title: 'Controller' }} />
    <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan Ticket' }} />
    <Stack.Screen name="History" component={ValidationHistoryScreen} options={{ title: 'Validations' }} />
  </Stack.Navigator>
);

export default ControllerNavigator;
