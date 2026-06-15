import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import api from '../../core/api/client';

const SubscriptionScreen = ({ navigation }) => {
  const [types, setTypes] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  const fetchData = async () => {
    try {
      const [typesRes, subsRes] = await Promise.all([
        api.get('/tickets/subscriptions/types/'),
        api.get('/tickets/subscriptions/history/'),
      ]);
      setTypes(typesRes.data.results || typesRes.data || []);
      setSubscriptions(subsRes.data.results || subsRes.data || []);
    } catch (err) {
      console.error('Subscription fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const handlePurchase = async (type) => {
    setPurchasing(type.id);
    try {
      const res = await api.post('/tickets/subscriptions/purchase/', {
        subscription_type_id: type.id,
      });
      Alert.alert('Success', `Subscribed to ${type.name || 'plan'}!`);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.error || 'Purchase failed';
      Alert.alert('Error', msg);
    } finally {
      setPurchasing(null);
    }
  };

  const renderType = ({ item }) => (
    <View style={styles.typeCard}>
      <View style={styles.typeHeader}>
        <Text style={styles.typeName}>{item.name || `Plan #${item.id}`}</Text>
        <Text style={styles.typePrice}>{parseFloat(item.price || 0).toFixed(3)} TND</Text>
      </View>
      <Text style={styles.typeDesc}>{item.description || `${item.duration_days || '?'} days validity`}</Text>
      <View style={styles.typeMeta}>
        <Text style={styles.typeDuration}>{item.duration_days || '?'} days</Text>
        {item.daily_trip_limit && (
          <Text style={styles.typeLimit}>{item.daily_trip_limit} trips/day</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.buyBtn}
        onPress={() => handlePurchase(item)}
        disabled={purchasing === item.id}
      >
        {purchasing === item.id ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buyText}>Subscribe</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSubscription = ({ item }) => (
    <View style={styles.subCard}>
      <Text style={styles.subName}>{item.type_name || item.subscription_type_name || 'Subscription'}</Text>
      <View style={styles.subDates}>
        <Text style={styles.subDate}>
          {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'} - {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
      <Text style={[styles.subStatus, item.status === 'ACTIVE' ? styles.activeStatus : styles.expiredStatus]}>
        {item.status || 'UNKNOWN'}
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
      <Text style={styles.sectionTitle}>Available Plans</Text>
      {types.length === 0 ? (
        <Text style={styles.emptyText}>No subscription plans available</Text>
      ) : (
        <FlatList
          data={types}
          renderItem={renderType}
          keyExtractor={(item, i) => String(item.id || i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 24 }}
        />
      )}

      <Text style={styles.sectionTitle}>My Subscriptions</Text>
      <FlatList
        data={subscriptions}
        renderItem={renderSubscription}
        keyExtractor={(item, i) => String(item.id || i)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No subscriptions yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3640', marginHorizontal: 16, marginBottom: 12, marginTop: 8 },
  emptyText: { textAlign: 'center', color: '#7f8fa6', marginVertical: 20, fontSize: 15 },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    width: 220,
    elevation: 3,
  },
  typeHeader: { marginBottom: 8 },
  typeName: { fontSize: 18, fontWeight: 'bold', color: '#2f3640' },
  typePrice: { fontSize: 24, fontWeight: 'bold', color: '#00a8ff', marginTop: 4 },
  typeDesc: { fontSize: 13, color: '#7f8fa6', marginBottom: 12 },
  typeMeta: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeDuration: { fontSize: 12, color: '#7f8fa6', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  typeLimit: { fontSize: 12, color: '#7f8fa6', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  buyBtn: { backgroundColor: '#4cd137', padding: 12, borderRadius: 10, alignItems: 'center' },
  buyText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  subCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  subName: { fontSize: 16, fontWeight: '600', color: '#2f3640', marginBottom: 4 },
  subDates: { marginBottom: 6 },
  subDate: { fontSize: 13, color: '#7f8fa6' },
  subStatus: { fontSize: 13, fontWeight: '600', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  activeStatus: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  expiredStatus: { backgroundColor: '#fbe9e7', color: '#c62828' },
});

export default SubscriptionScreen;
