import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../../core/api/client';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchBuses = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const params = { q: query.trim() };
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        params.lat = pos.coords.latitude;
        params.lng = pos.coords.longitude;
      }
      const res = await api.get('/transit/user/search-bus/', { params });
      setResults(res.data.trajets || res.data.results || res.data || []);
    } catch (err) {
      if (err.response?.status === 400) {
        Alert.alert('Search Error', 'Could not determine your location. Try using the map view.');
        navigation.navigate('MapView');
      } else {
        Alert.alert('Error', 'Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={[styles.badge, { backgroundColor: item.line?.color_code || '#00a8ff' }]}>
          <Text style={styles.badgeText}>{item.line?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.resultTitle}>{item.line?.name || item.name || `Route`}</Text>
      </View>
      <Text style={styles.resultDetail}>
        {item.start_station?.name || '?'} → {item.end_station?.name || '?'}
      </Text>
      <Text style={styles.resultTime}>
        {item.gtfs_route_id ? `Route: ${item.gtfs_route_id}` : 'N/A'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by line, station..."
          onSubmitEditing={searchBuses}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={searchBuses}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#00a8ff" style={{ marginTop: 40 }} />}

      {!loading && results.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Results ({results.length})</Text>
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item, i) => String(item.id || i)}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </>
      )}

      {!loading && results.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>
            Search for bus routes by line number, station name, or direction
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 16 },
  searchRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchBtn: {
    backgroundColor: '#00a8ff',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f3640', marginBottom: 12 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  badge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  resultTitle: { fontSize: 16, fontWeight: '600', color: '#2f3640' },
  resultDetail: { fontSize: 13, color: '#7f8fa6', marginBottom: 2 },
  resultTime: { fontSize: 13, color: '#00a8ff' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, color: '#7f8fa6', textAlign: 'center', paddingHorizontal: 40 },
});

export default SearchScreen;
