import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import api from '../../core/api/client';
import LiveMapService from '../transit/LiveMapService';

const MapScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const mapRef = useRef(null);
  const liveServiceRef = useRef(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (liveServiceRef.current) liveServiceRef.current.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, tripsRes] = await Promise.all([
        api.get('/transit/live-vehicles/'),
        api.get('/transit/trips/active/'),
      ]);
      setVehicles(vehiclesRes.data.results || vehiclesRes.data || []);
      setTrips(tripsRes.data.results || tripsRes.data || []);
    } catch (err) {
      console.error('Map fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const followTrip = (trip) => {
    setSelectedTrip(trip);
    if (liveServiceRef.current) liveServiceRef.current.disconnect();
    const service = new LiveMapService(trip.id);
    liveServiceRef.current = service;
    service.connect((lat, lng) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === trip.vehicle_id ? { ...v, latitude: lat, longitude: lng } : v
        )
      );
    });
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
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {vehicles.map((v, i) => (
          <Marker
            key={v.id || i}
            coordinate={{
              latitude: parseFloat(v.latitude) || 36.8065,
              longitude: parseFloat(v.longitude) || 10.1815,
            }}
            title={v.plate_number || `Vehicle`}
            description={`Speed: ${v.speed || 'N/A'} km/h`}
            pinColor={selectedTrip?.vehicle_id === v.id ? '#e84118' : '#00a8ff'}
          />
        ))}
      </MapView>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Active Trips</Text>
        {trips.length === 0 ? (
          <Text style={styles.emptyText}>No active trips</Text>
        ) : (
          trips.slice(0, 5).map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[styles.tripRow, selectedTrip?.id === trip.id && styles.tripRowActive]}
              onPress={() => followTrip(trip)}
            >
              <Text style={styles.tripName}>Trip #{trip.id}</Text>
              <Text style={styles.tripInfo}>
                {trip.direction || 'N/A'} - {trip.status || 'N/A'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: 260,
    elevation: 8,
  },
  panelTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#2f3640' },
  emptyText: { color: '#7f8fa6', textAlign: 'center', marginVertical: 12 },
  tripRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderRadius: 8,
  },
  tripRowActive: { backgroundColor: '#e8f4fd' },
  tripName: { fontSize: 15, fontWeight: '600', color: '#2f3640' },
  tripInfo: { fontSize: 13, color: '#7f8fa6', marginTop: 2 },
});

export default MapScreen;
