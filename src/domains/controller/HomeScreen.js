import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import api from '../../core/api/client';
import { useAuth } from '../../core/auth/AuthContext';
import OfflineValidationSync from '../ticketing/OfflineValidationSync';

const ControllerHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [syncCount, setSyncCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ today: 0, week: 0, invalid: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tickets/history/');
      const tickets = res.data.results || res.data || [];
      const today = tickets.filter(
        (t) => new Date(t.created_at).toDateString() === new Date().toDateString()
      ).length;
      setStats({ today, total: tickets.length, invalid: 0 });
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchStats);
    return unsubscribe;
  }, [navigation]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await OfflineValidationSync.syncPendingLogs();
      Alert.alert('Sync Complete', 'Pending validations have been synced');
      fetchStats();
    } catch (err) {
      Alert.alert('Sync Error', 'Failed to sync offline data');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00a8ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Controller Panel</Text>
        <Text style={styles.phoneText}>{user?.phone_number}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fbe9e7' }]}>
          <Text style={[styles.statValue, { color: '#c62828' }]}>{stats.invalid || 0}</Text>
          <Text style={styles.statLabel}>Invalid</Text>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#00a8ff' }]}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Scan Ticket</Text>
          <Text style={styles.actionDesc}>Scan passenger QR codes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#9b59b6' }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>Validation History</Text>
          <Text style={styles.actionDesc}>View recent scans</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.syncBtn}
        onPress={handleSync}
        disabled={syncing}
      >
        {syncing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.syncIcon}>🔄</Text>
            <View>
              <Text style={styles.syncText}>Sync Offline Validations</Text>
              <Text style={styles.syncSubtext}>{syncCount} pending</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { padding: 20, backgroundColor: '#fff', marginBottom: 8 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#2f3640' },
  phoneText: { fontSize: 14, color: '#7f8fa6', marginTop: 2 },
  statsRow: { flexDirection: 'row', margin: 16, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#2f3640' },
  statLabel: { fontSize: 12, color: '#7f8fa6', marginTop: 4 },
  actionsCard: { marginHorizontal: 16, marginBottom: 16, gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },
  actionIcon: { fontSize: 28, marginRight: 14 },
  actionLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 },
  actionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    gap: 12,
  },
  syncIcon: { fontSize: 24 },
  syncText: { fontSize: 15, fontWeight: '600', color: '#2f3640' },
  syncSubtext: { fontSize: 12, color: '#7f8fa6' },
});

export default ControllerHomeScreen;
