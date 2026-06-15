import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import api from '../../core/api/client';

const WalletScreen = ({ navigation }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('10');
  const [toppingUp, setToppingUp] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet/');
      setWallet(res.data);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchWallet);
    return unsubscribe;
  }, [navigation]);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setToppingUp(true);
    try {
      const res = await api.post('/wallet/top-up/', { amount });
      Alert.alert('Success', `Topped up ${amount.toFixed(3)} TND`);
      setWallet(res.data);
      setTopUpAmount('10');
    } catch (err) {
      Alert.alert('Error', 'Top up failed');
    } finally {
      setToppingUp(false);
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
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>
          {wallet?.balance?.toFixed(3) || '0.000'} TND
        </Text>
        <Text style={styles.walletMeta}>
          Wallet ID: {wallet?.id || 'N/A'}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#00a8ff' }]}
          onPress={() => navigation.navigate('TicketPurchase')}
        >
          <Text style={styles.actionIcon}>🎫</Text>
          <Text style={styles.actionLabel}>Buy Ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#9b59b6' }]}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionLabel}>Subscribe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e67e22' }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topUpCard}>
        <Text style={styles.topUpTitle}>Top Up Wallet</Text>
        <View style={styles.topUpRow}>
          <TextInput
            style={styles.topUpInput}
            value={topUpAmount}
            onChangeText={setTopUpAmount}
            keyboardType="decimal-pad"
            placeholder="Amount"
          />
          <TouchableOpacity
            style={styles.topUpBtn}
            onPress={handleTopUp}
            disabled={toppingUp}
          >
            {toppingUp ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.topUpBtnText}>Add Funds</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.quickAmounts}>
          {['5', '10', '20', '50'].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.quickAmt, topUpAmount === amt && styles.quickAmtActive]}
              onPress={() => setTopUpAmount(amt)}
            >
              <Text style={[styles.quickAmtText, topUpAmount === amt && styles.quickAmtTextActive]}>
                {amt} TND
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  balanceLabel: { fontSize: 16, color: '#7f8fa6', marginBottom: 8 },
  balanceValue: { fontSize: 40, fontWeight: 'bold', color: '#2f3640', marginBottom: 4 },
  walletMeta: { fontSize: 12, color: '#7f8fa6', marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#fff' },
  topUpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  topUpTitle: { fontSize: 16, fontWeight: '600', color: '#2f3640', marginBottom: 16 },
  topUpRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  topUpInput: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  topUpBtn: {
    backgroundColor: '#4cd137',
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  topUpBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  quickAmounts: { flexDirection: 'row', gap: 8 },
  quickAmt: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  quickAmtActive: { borderColor: '#00a8ff', backgroundColor: '#e8f4fd' },
  quickAmtText: { color: '#7f8fa6', fontWeight: '500' },
  quickAmtTextActive: { color: '#00a8ff', fontWeight: 'bold' },
});

export default WalletScreen;
