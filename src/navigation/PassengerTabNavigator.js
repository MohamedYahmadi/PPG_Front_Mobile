import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../domains/passenger/HomeScreen';
import MapScreen from '../domains/passenger/MapScreen';
import SearchScreen from '../domains/passenger/SearchScreen';
import LinesScreen from '../domains/passenger/LinesScreen';
import LineDetailScreen from '../domains/passenger/LineDetailScreen';
import TicketPurchaseScreen from '../domains/passenger/TicketPurchaseScreen';
import SubscriptionScreen from '../domains/passenger/SubscriptionScreen';
import QRDisplayScreen from '../domains/passenger/QRDisplayScreen';
import HistoryScreen from '../domains/passenger/HistoryScreen';
import WalletScreen from '../domains/passenger/WalletScreen';
import ProfileScreen from '../domains/auth/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ label, focused }) => (
  <Text style={{ fontSize: 18, color: focused ? '#00a8ff' : '#7f8fa6' }}>{label}</Text>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#f5f6fa' } }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'PPG Transport' }} />
    <Stack.Screen name="MapView" component={MapScreen} options={{ title: 'Live Tracking' }} />
    <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Routes' }} />
    <Stack.Screen name="Lines" component={LinesScreen} options={{ title: 'Lines & Stations' }} />
    <Stack.Screen name="LineDetail" component={LineDetailScreen} options={{ title: 'Line Details' }} />
  </Stack.Navigator>
);

const TicketStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#f5f6fa' } }}>
    <Stack.Screen name="WalletMain" component={WalletScreen} options={{ title: 'Wallet' }} />
    <Stack.Screen name="TicketPurchase" component={TicketPurchaseScreen} options={{ title: 'Buy Ticket' }} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Subscriptions' }} />
    <Stack.Screen name="QRDisplay" component={QRDisplayScreen} options={{ title: 'Your Ticket' }} />
    <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#f5f6fa' } }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Stack.Navigator>
);

const PassengerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
      tabBarActiveTintColor: '#00a8ff',
      tabBarInactiveTintColor: '#7f8fa6',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />, tabBarLabel: 'Home' }}
    />
    <Tab.Screen
      name="Tickets"
      component={TicketStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="🎫" focused={focused} />, tabBarLabel: 'Tickets' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />, tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

export default PassengerTabNavigator;
