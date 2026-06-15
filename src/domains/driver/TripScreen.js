import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../../core/api/client';

const TripScreen = ({ navigation }) => {
  const [session, setSession] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchSession = async () => {
    try {
      const sessionRes = await api.get('/transit/driver/current/');
      setSession(sessionRes.data);
      if (sessionRes.data?.trajet_id) {
        const trajetRes = await api.get(`/transit/trajets/${sessionRes.data.trajet_id}/`);
        setStations(trajetRes.data.stations || []);
      }
    } catch (err) {
      console.error('Trip fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchSession);
    return unsubscribe;
  }, [navigation]);

  const handleUpdateStation = async () => {
    setUpdating(true);
    try {
      await api.post('/transit/driver/update-station/', {});
      Alert.alert('Success', 'Moved to next station');
      fetchSession();
    } catch (err) {
      Alert.alert('Error', 'Failed to update station');
    } finally {
      setUpdating(false);
    }
  };

  const handleFinishTrip = async () => {
    Alert.alert('End Trip', 'Are you sure you want to end this trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/transit/driver/finish/', {});
            Alert.alert('Success', 'Trip finished');
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Failed to finish trip');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00a8ff" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🚌</Text>
        <Text style={styles.emptyText}>No active session</Text>
        <Text style={styles.emptySubtext}>Set up a session from the dashboard first</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStationIndex = stations.findIndex(
    (s) => s.station_name === session.current_station_name || s.id === session.current_station_id
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Trip</Text>
        <Text style={styles.headerSub}>
          {session.line_name || 'Line'} · {session.plate_number || session.vehicle_id || 'Vehicle'}
        </Text>
      </View>

      <View style={styles.stationContainer}>
        <Text style={styles.sectionTitle}>Route Progress</Text>
        {stations.length === 0 ? (
          <Text style={styles.emptyText}>No station data available</Text>
        ) : (
          stations.map((station, index) => {
            const isPast = index < currentStationIndex;
            const isCurrent = index === currentStationIndex;
            const isFuture = index > currentStationIndex;
            return (
              <View key={station.id || index} style={styles.stationRow}>
                <View style={styles.stationIndicator}>
                  <View
                    style={[
                      styles.stationDot,
                      isPast && styles.dotPast,
                      isCurrent && styles.dotCurrent,
                      isFuture && styles.dotFuture,
                    ]}
                  >
                    {isCurrent && <View style={styles.dotInner} />}
                  </View>
                  {index < stations.length - 1 && (
                    <View
                      style={[
                        styles.stationLine,
                        isPast && styles.linePast,
                        isCurrent && styles.lineCurrent,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.stationInfo}>
                  <Text
                    style={[
                      styles.stationName,
                      isCurrent && styles.stationNameCurrent,
                    ]}
                  >
                    {station.station_name || station.name || `Station ${index + 1}`}
                  </Text>
                  {isCurrent && <Text style={styles.currentBadge}>CURRENT</Text>}
                  {station.time_to_next && (
                    <Text style={styles.stationTime}>{station.time_to_next} min to next</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleUpdateStation}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Arrived at Next Station</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinishTrip}>
          <Text style={styles.btnText}>Finish Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#2f3640' },
  emptySubtext: { fontSize: 14, color: '#7f8fa6', marginTop: 4, marginBottom: 20 },
  backBtn: { backgroundColor: '#00a8ff', padding: 14, borderRadius: 10 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
  header: { backgroundColor: '#fff', padding: 20, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2f3640' },
  headerSub: { fontSize: 14, color: '#7f8fa6', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f3640', margin: 16, marginBottom: 8 },
  stationContainer: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 8, elevation: 2 },
  stationRow: { flexDirection: 'row', minHeight: 60, paddingHorizontal: 12 },
  stationIndicator: { width: 30, alignItems: 'center' },
  stationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  dotPast: { backgroundColor: '#4cd137' },
  dotCurrent: { backgroundColor: '#00a8ff', width: 24, height: 24, borderRadius: 12 },
  dotFuture: { backgroundColor: '#ddd' },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  stationLine: { width: 2, flex: 1, marginTop: 2 },
  linePast: { backgroundColor: '#4cd137' },
  lineCurrent: { backgroundColor: '#00a8ff' },
  stationInfo: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  stationName: { fontSize: 15, fontWeight: '500', color: '#2f3640' },
  stationNameCurrent: { fontWeight: 'bold', color: '#00a8ff' },
  currentBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#00a8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    overflow: 'hidden',
  },
  stationTime: { fontSize: 12, color: '#7f8fa6', marginTop: 2 },
  actions: { margin: 16, gap: 10 },
  nextBtn: { backgroundColor: '#00a8ff', padding: 18, borderRadius: 12, alignItems: 'center' },
  finishBtn: { backgroundColor: '#e84118', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default TripScreen;
