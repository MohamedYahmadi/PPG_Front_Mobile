import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../core/api/client';

const LinesScreen = ({ navigation }) => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLines = async () => {
    try {
      const res = await api.get('/transit/trajets/');
      setLines(res.data.results || res.data || []);
    } catch (err) {
      console.error('Lines fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchLines);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLines();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LineDetail', { line: item })}
    >
      <View style={[styles.colorBar, { backgroundColor: item.line?.color || '#00a8ff' }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.lineName}>{item.line?.name || `Route #${item.id}`}</Text>
          <Text style={[styles.lineBadge, { backgroundColor: item.line?.color || '#00a8ff' }]}>
            {item.line?.short_name || item.id}
          </Text>
        </View>
        <Text style={styles.routeDesc}>
          {item.start_station_name || 'Start'} → {item.end_station_name || 'End'}
        </Text>
        <Text style={styles.stopsCount}>
          {item.stations_count || '?'} stations · Est. {item.estimated_duration || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00a8ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Routes & Lines</Text>
      <FlatList
        data={lines}
        renderItem={renderItem}
        keyExtractor={(item, i) => String(item.id || i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No lines available</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#2f3640', margin: 16, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  colorBar: { width: 6 },
  cardContent: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  lineName: { fontSize: 16, fontWeight: '600', color: '#2f3640', flex: 1 },
  lineBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, color: '#fff', fontWeight: 'bold', fontSize: 12, overflow: 'hidden' },
  routeDesc: { fontSize: 14, color: '#7f8fa6', marginBottom: 4 },
  stopsCount: { fontSize: 12, color: '#00a8ff' },
  emptyText: { textAlign: 'center', color: '#7f8fa6', marginTop: 60, fontSize: 16 },
});

export default LinesScreen;
