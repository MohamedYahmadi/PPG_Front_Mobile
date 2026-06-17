import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../../core/api/client';
import LiveMapService from '../transit/LiveMapService';

const GPSLiveScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const watchSubscription = useRef(null);
  const liveService = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS access is required');
        navigation.goBack();
        return;
      }
      try {
        const sessionRes = await api.get('/transit/driver/current/');
        const tripIdVal = sessionRes.data?.current_trip_id;
        setTripId(tripIdVal);
        if (tripIdVal) {
          liveService.current = new LiveMapService(tripIdVal);
        }
      } catch (e) {
        console.warn('Failed to fetch current session:', e);
      }
      setLoading(false);
    })();
    return () => {
      if (watchSubscription.current) watchSubscription.current.remove();
      if (liveService.current) liveService.current.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startBroadcasting = async () => {
    if (!tripId) {
      Alert.alert('No Active Trip', 'Start a trip before broadcasting GPS');
      return;
    }
    setIsBroadcasting(true);
    liveService.current?.connect(() => {});

    watchSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 5000 },
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setRouteCoordinates((prev) => [...prev, { latitude, longitude }]);
        if (liveService.current) {
          liveService.current.sendGpsDriver(
            latitude,
            longitude,
            pos.coords.speed || 0,
            pos.coords.heading || 0
          );
        }
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    );

    intervalRef.current = setInterval(async () => {
      if (location) {
        try {
          await api.post(`/transit/driver/trips/${tripId}/gps/`, {
            lat: location.latitude,
            lng: location.longitude,
            speed_kmh: 0,
            heading: 0,
          });
        } catch {}
      }
    }, 15000);
  };

  const stopBroadcasting = () => {
    setIsBroadcasting(false);
    if (watchSubscription.current) watchSubscription.current.remove();
    if (liveService.current) liveService.current.disconnect();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00a8ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 36.8065,
          longitude: 10.1815,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {location && <Marker coordinate={location} title="Your Bus" pinColor="#e84118" />}
        {routeCoordinates.length > 1 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={3} strokeColor="#00a8ff" />
        )}
      </MapView>

      <View style={styles.controlPanel}>
        <Text style={styles.statusText}>
          Status: {isBroadcasting ? '🔴 Broadcasting' : '⚪ Off'}
        </Text>
        {location && (
          <Text style={styles.coordText}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
        {!isBroadcasting ? (
          <TouchableOpacity style={styles.startBtn} onPress={startBroadcasting}>
            <Text style={styles.btnText}>Start GPS Broadcast</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={stopBroadcasting}>
            <Text style={styles.btnText}>Stop Broadcast</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 8,
  },
  statusText: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#2f3640' },
  coordText: { fontSize: 13, color: '#7f8fa6', marginBottom: 16, fontFamily: 'monospace' },
  startBtn: { backgroundColor: '#4cd137', padding: 16, borderRadius: 12, alignItems: 'center' },
  stopBtn: { backgroundColor: '#e84118', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default GPSLiveScreen;
