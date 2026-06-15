import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../../core/api/client';
import { useAuth } from '../../core/auth/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [scheduleRes, sessionRes, incidentsRes] = await Promise.all([
        api.get('/transit/driver/schedule/').catch(() => ({ data: null })),
        api.get('/transit/driver/current/').catch(() => ({ data: null })),
        api.get('/transit/driver/incidents/'),
      ]);
      setSchedule(scheduleRes.data);
      setCurrentSession(sessionRes.data);
      setIncidents(incidentsRes.data.results || incidentsRes.data || []);
    } catch (err) {
      console.error('Driver fetch error:', err);
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

  const handleSetup = async () => {
    Alert.alert('Setup Session', 'Contact your dispatcher to initialize your driving session.');
  };

  const handleStartTrip = async () => {
    try {
      const res = await api.post('/transit/driver/trips/start-station/', {});
      Alert.alert('Trip Started', `Trip #${res.data.id} is now active`);
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to start trip. Do you have an active session?');
    }
  };

  const handleEndTrip = async () => {
    if (!currentSession?.current_trip_id) {
      Alert.alert('No Active Trip', 'There is no active trip to end');
      return;
    }
    try {
      await api.post(`/transit/driver/trips/${currentSession.current_trip_id}/end/`, {});
      Alert.alert('Success', 'Trip completed');
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to end trip');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00a8ff" />
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Welcome, Driver</Text>
        <Text style={styles.phoneText}>{user?.phone_number}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Session</Text>
        <Text style={[styles.statusValue, { color: currentSession ? '#4cd137' : '#7f8fa6' }]}>
          {currentSession ? 'Active' : 'No Active Session'}
        </Text>
        {currentSession && (
          <>
            <Text style={styles.sessionDetail}>Line: {currentSession.line_name || 'N/A'}</Text>
            <Text style={styles.sessionDetail}>
              Vehicle: {currentSession.plate_number || currentSession.vehicle_id || 'N/A'}
            </Text>
            <Text style={styles.sessionDetail}>
              Station: {currentSession.current_station_name || 'N/A'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#00a8ff' }]}
          onPress={() =>
            currentSession
              ? navigation.navigate('Trip')
              : handleSetup()
          }
        >
          <Text style={styles.actionIcon}>🚌</Text>
          <Text style={styles.actionLabel}>Manage Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#4cd137' }]}
          onPress={() =>
            currentSession
              ? navigation.navigate('GPSLive')
              : Alert.alert('No Session', 'Start a session first')
          }
        >
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionLabel}>GPS Live</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#e84118' }]}
          onPress={() => navigation.navigate('Incident')}
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <Text style={styles.actionLabel}>Report Incident</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scheduleCard}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {schedule ? (
          <View>
            <Text style={styles.scheduleRow}>Route: {schedule.route || 'N/A'}</Text>
            <Text style={styles.scheduleRow}>Start: {schedule.start_time || 'N/A'}</Text>
            <Text style={styles.scheduleRow}>End: {schedule.end_time || 'N/A'}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No schedule assigned</Text>
        )}
      </View>

      {currentSession && (
        <View style={styles.tripActions}>
          <TouchableOpacity style={styles.startBtn} onPress={handleStartTrip}>
            <Text style={styles.btnText}>Start Trip at Next Station</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.endBtn} onPress={handleEndTrip}>
            <Text style={styles.btnText}>End Current Trip</Text>
          </TouchableOpacity>
        </View>
      )}

      {incidents.length > 0 && (
        <View style={styles.incidentCard}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          {incidents.slice(0, 3).map((inc, i) => (
            <View key={inc.id || i} style={styles.incidentRow}>
              <Text style={styles.incidentType}>{inc.incident_type || 'Unknown'}</Text>
              <Text style={styles.incidentStatus}>{inc.status || 'N/A'}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7f8fa6', fontSize: 15 },
  greeting: { padding: 20, backgroundColor: '#fff', marginBottom: 8 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#2f3640' },
  phoneText: { fontSize: 14, color: '#7f8fa6', marginTop: 2 },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  statusLabel: { fontSize: 14, color: '#7f8fa6' },
  statusValue: { fontSize: 22, fontWeight: 'bold', marginVertical: 4 },
  sessionDetail: { fontSize: 14, color: '#2f3640', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 },
  actionCard: { flex: 1, padding: 18, borderRadius: 14, alignItems: 'center', elevation: 2 },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#fff', textAlign: 'center' },
  scheduleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f3640', marginBottom: 12 },
  scheduleRow: { fontSize: 14, color: '#2f3640', marginBottom: 4 },
  emptyText: { color: '#7f8fa6', fontSize: 14, textAlign: 'center' },
  tripActions: { marginHorizontal: 16, marginBottom: 16, gap: 8 },
  startBtn: { backgroundColor: '#4cd137', padding: 16, borderRadius: 12, alignItems: 'center' },
  endBtn: { backgroundColor: '#e84118', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  incidentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  incidentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  incidentType: { fontSize: 14, color: '#2f3640' },
  incidentStatus: { fontSize: 14, color: '#7f8fa6' },
});

export default HomeScreen;
