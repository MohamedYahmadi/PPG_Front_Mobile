import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../core/api/client';

const TABS = [
  { key: 'tickets', label: 'Tickets' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'transactions', label: 'Transactions' },
];

const HistoryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [ticketsRes, subsRes, txRes] = await Promise.all([
        api.get('/tickets/history/'),
        api.get('/tickets/subscriptions/history/'),
        api.get('/wallet/transactions/'),
      ]);
      setTickets(ticketsRes.data.results || ticketsRes.data || []);
      setSubscriptions(subsRes.data.results || subsRes.data || []);
      setTransactions(txRes.data.results || txRes.data || []);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchHistory);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderTicket = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <Text style={styles.itemType}>🎫 Ticket</Text>
        <Text style={[styles.itemStatus, { color: item.status === 'ACTIVE' ? '#2e7d32' : '#7f8fa6' }]}>
          {item.status || 'N/A'}
        </Text>
      </View>
      <Text style={styles.itemDetail}>Zone: {item.zone_validity || 'N/A'} · {item.price_paid?.toFixed(3) || '?'} TND</Text>
      <Text style={styles.itemDate}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
      </Text>
    </View>
  );

  const renderSubscription = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <Text style={styles.itemType}>📅 {item.type_name || 'Subscription'}</Text>
        <Text style={[styles.itemStatus, { color: item.status === 'ACTIVE' ? '#2e7d32' : '#7f8fa6' }]}>
          {item.status || 'N/A'}
        </Text>
      </View>
      <Text style={styles.itemDetail}>{item.price_paid?.toFixed(3) || '?'} TND</Text>
      <Text style={styles.itemDate}>
        {item.start_date ? new Date(item.start_date).toLocaleDateString() : ''} - {item.end_date ? new Date(item.end_date).toLocaleDateString() : ''}
      </Text>
    </View>
  );

  const renderTransaction = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <Text style={styles.itemType}>
          {item.transaction_type === 'TOP_UP' ? '💰 Top Up' : item.transaction_type === 'PURCHASE' ? '🎫 Purchase' : '💳 ' + (item.transaction_type || 'Transaction')}
        </Text>
        <Text style={[styles.itemAmount, { color: item.amount > 0 ? '#4cd137' : '#e84118' }]}>
          {item.amount > 0 ? '+' : ''}{item.amount?.toFixed(3) || '0'} TND
        </Text>
      </View>
      <Text style={styles.itemDate}>{item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    if (activeTab === 'tickets') return renderTicket({ item });
    if (activeTab === 'subscriptions') return renderSubscription({ item });
    return renderTransaction({ item });
  };

  const data =
    activeTab === 'tickets' ? tickets :
    activeTab === 'subscriptions' ? subscriptions :
    transactions;

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00a8ff" />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, i) => String(item.id || i)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {activeTab} yet</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, elevation: 2 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#e8f4fd' },
  tabText: { fontSize: 14, color: '#7f8fa6', fontWeight: '500' },
  tabTextActive: { color: '#00a8ff', fontWeight: 'bold' },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemType: { fontSize: 15, fontWeight: '600', color: '#2f3640' },
  itemStatus: { fontSize: 13, fontWeight: '600' },
  itemDetail: { fontSize: 14, color: '#7f8fa6' },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  itemDate: { fontSize: 12, color: '#7f8fa6', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#7f8fa6', marginTop: 60, fontSize: 16 },
});

export default HistoryScreen;
