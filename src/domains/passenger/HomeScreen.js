import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../../core/api/client';

const HomeScreen = ({ navigation }) => {
  const [trajets, setTrajets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [trajetsRes, vehiclesRes] = await Promise.all([
        api.get('/transit/trajets/'),
        api.get('/transit/live-vehicles/'),
      ]);
      setTrajets(trajetsRes.data.results || trajetsRes.data || []);
      setVehicles(vehiclesRes.data.results || vehiclesRes.data || []);
    } catch (err) {
      console.error('Home fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00a8ff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 36.8065,
            longitude: 10.1815,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {vehicles.map((v, i) => (
            <Marker
              key={v.id || i}
              coordinate={{
                latitude: parseFloat(v.latitude) || 36.8065,
                longitude: parseFloat(v.longitude) || 10.1815,
              }}
              title={v.plate_number || `Bus #${i + 1}`}
              pinColor="#00a8ff"
            />
          ))}
        </MapView>
        <TouchableOpacity
          style={styles.mapOverlayBtn}
          onPress={() => navigation.navigate('MapView')}
        >
          <Text style={styles.mapOverlayText}>Open Full Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionLabel}>Search Routes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Lines')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>Lines</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MapView')}
        >
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionLabel}>Live Map</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Active Routes</Text>
      {trajets.length === 0 ? (
        <Text style={styles.emptyText}>No active routes at the moment</Text>
      ) : (
        trajets.slice(0, 5).map((trajet) => (
          <View key={trajet.id} style={styles.routeCard}>
            <View style={[styles.routeColor, { backgroundColor: trajet.line?.color || '#00a8ff' }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{trajet.line?.name || `Route #${trajet.id}`}</Text>
              <Text style={styles.routeStations}>
                {trajet.start_station_name || 'Start'} → {trajet.end_station_name || 'End'}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' },
  mapContainer: { height: 220, margin: 16, borderRadius: 12, overflow: 'hidden', elevation: 3 },
  map: { width: '100%', height: '100%' },
  mapOverlayBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#00a8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapOverlayText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  quickActions: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#2f3640', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3640', marginHorizontal: 16, marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#7f8fa6', marginVertical: 20, fontSize: 15 },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 1,
  },
  routeColor: { width: 6 },
  routeInfo: { flex: 1, padding: 14 },
  routeName: { fontSize: 15, fontWeight: '600', color: '#2f3640' },
  routeStations: { fontSize: 13, color: '#7f8fa6', marginTop: 4 },
});

export default HomeScreen;
