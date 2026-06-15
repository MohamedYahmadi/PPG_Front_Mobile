import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../core/auth/AuthContext';
import LoginScreen from '../domains/auth/LoginScreen';
import SignupScreen from '../domains/auth/SignupScreen';
import PassengerTabNavigator from './PassengerTabNavigator';
import DriverNavigator from './DriverNavigator';
import ControllerNavigator from './ControllerNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
        <ActivityIndicator size="large" color="#00a8ff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  switch (role) {
    case 'DRIVER':
      return <DriverNavigator />;
    case 'CONTROLLER':
      return <ControllerNavigator />;
    case 'PASSENGER':
    default:
      return <PassengerTabNavigator />;
  }
};

export default AppNavigator;
