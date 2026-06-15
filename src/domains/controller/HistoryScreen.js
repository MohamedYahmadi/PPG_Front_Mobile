import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../core/api/client';

const ValidationHistoryScreen = ({ navigation }) => {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchValidations = async () => {
    try {
      const res = await api.get('/tickets/history/');
      setValidations(res.data.results || res.data || []);
    } catch (err) {
      console.error('Validation fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchValidations);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchValidations();
  };

  const filtered = filter === 'all' ? validations : validations.filter((v) => {
    if (filter === 'active') return v.status === 'ACTIVE';
    if (filter === 'used') return v.status === 'USED';
    if (filter === 'expired') return v.status === 'EXPIRED';
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Ticket #{item.id || item.ticket_id || 'N/A'}</Text>
        <Text style={[styles.cardStatus, {
          color: item.status === 'ACTIVE' ? '#2e7d32' :
                 item.status === 'USED' ? '#1565c0' : '#c62828',
        }]}>
          {item.status || 'N/A'}
        </Text>
      </View>
      <Text style={styles.cardDetail}>Zone: {item.zone_validity || 'N/A'}</Text>
      <Text style={styles.cardDetail}>
        Scanned: {item.validated_at || item.updated_at
          ? new Date(item.validated_at || item.updated_at).toLocaleString()
          : 'N/A'}
      </Text>
    </View>
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
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'used', label: 'Used' },
          { key: 'expired', label: 'Expired' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, i) => String(item.id || i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No validations found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    margin: 16,
    borderRadius: 12,
    elevation: 1,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterBtnActive: { backgroundColor: '#00a8ff' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#7f8fa6' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#2f3640' },
  cardStatus: { fontSize: 13, fontWeight: '600' },
  cardDetail: { fontSize: 13, color: '#7f8fa6', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#7f8fa6', marginTop: 60, fontSize: 16 },
});

export default ValidationHistoryScreen;
