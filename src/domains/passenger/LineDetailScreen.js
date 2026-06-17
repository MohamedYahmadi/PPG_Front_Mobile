import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../../core/api/client';

const LineDetailScreen = ({ route, navigation }) => {
  const { line } = route.params;
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get(`/transit/trajets/${line.id}/`);
      setStations(res.data.stations || []);
    } catch (err) {
      console.error('Stations fetch error:', err);
    } finally {
      setLoading(false);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lineName}>{line.line?.name || `Route #${line.id}`}</Text>
        <Text style={styles.route}>
          {line.start_station?.name || 'Start'} → {line.end_station?.name || 'End'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Stations ({stations.length})</Text>

      <FlatList
        data={stations}
        keyExtractor={(item, i) => String(item.id || i)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <View style={styles.stationRow}>
            <View style={styles.stationIndicator}>
              <View style={[styles.dot, index === 0 && styles.dotFirst, index === stations.length - 1 && styles.dotLast]} />
              {index < stations.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{item.station?.name || `Station ${index + 1}`}</Text>
              <Text style={styles.stationMeta}>
                Order #{item.order_number || index + 1}
                {item.time_to_next_station ? ` · ${item.time_to_next_station} min to next` : ''}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No station information available</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', marginBottom: 8, elevation: 2 },
  lineName: { fontSize: 22, fontWeight: 'bold', color: '#2f3640', marginBottom: 4 },
  route: { fontSize: 15, color: '#7f8fa6' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2f3640', marginHorizontal: 20, marginVertical: 12 },
  stationRow: { flexDirection: 'row', paddingHorizontal: 20, minHeight: 60 },
  stationIndicator: { width: 24, alignItems: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ddd',
    marginTop: 4,
  },
  dotFirst: { backgroundColor: '#4cd137', width: 16, height: 16, borderRadius: 8 },
  dotLast: { backgroundColor: '#e84118', width: 16, height: 16, borderRadius: 8 },
  line: { width: 2, flex: 1, backgroundColor: '#ddd', marginTop: 2 },
  stationInfo: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  stationName: { fontSize: 15, fontWeight: '500', color: '#2f3640' },
  stationMeta: { fontSize: 12, color: '#7f8fa6', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#7f8fa6', marginTop: 40, fontSize: 15 },
});

export default LineDetailScreen;
