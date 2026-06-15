import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import api from '../../core/api/client';

const FARES = [
  { zone: 'ZONE_A', label: 'Zone A (Metro/Bus)', price: 1.5, icon: '🚌' },
  { zone: 'ZONE_B', label: 'Zone B (Regional)', price: 2.5, icon: '🚍' },
  { zone: 'ZONE_AB', label: 'Zone A+B (All Network)', price: 3.5, icon: '🚈' },
];

const TicketPurchaseScreen = ({ navigation }) => {
  const [selectedZone, setSelectedZone] = useState('ZONE_A');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fareInfo, setFareInfo] = useState(null);

  const selectedFare = FARES.find((f) => f.zone === selectedZone);
  const total = (selectedFare?.price || 0) * quantity;

  const calculateFare = async () => {
    try {
      const res = await api.post('/tickets/fares/calculate/', {
        zone: selectedZone,
        quantity,
      });
      setFareInfo(res.data);
    } catch {}
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        tickets.push({
          zone_validity: selectedZone,
          price: selectedFare.price,
        });
      }
      const res = await api.post('/tickets/purchase/', quantity > 1 ? tickets : tickets[0]);
      Alert.alert('Success', `Purchased ${quantity} ticket(s) for ${total.toFixed(3)} TND`, [
        { text: 'View Ticket', onPress: () => navigation.navigate('QRDisplay', { ticket: res.data }) },
        { text: 'OK' },
      ]);
    } catch (error) {
      const msg = error.response?.data?.error || 'Insufficient funds or system error';
      Alert.alert('Purchase Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Buy Tickets</Text>

      <Text style={styles.sectionLabel}>Select Zone</Text>
      {FARES.map((fare) => (
        <TouchableOpacity
          key={fare.zone}
          style={[styles.fareCard, selectedZone === fare.zone && styles.fareCardActive]}
          onPress={() => {
            setSelectedZone(fare.zone);
            calculateFare();
          }}
        >
          <Text style={styles.fareIcon}>{fare.icon}</Text>
          <View style={styles.fareInfo}>
            <Text style={styles.fareLabel}>{fare.label}</Text>
            <Text style={styles.farePrice}>{fare.price.toFixed(3)} TND</Text>
          </View>
          {selectedZone === fare.zone && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionLabel}>Quantity</Text>
      <View style={styles.quantityRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity(Math.min(10, quantity + 1))}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{total.toFixed(3)} TND</Text>
      </View>

      <TouchableOpacity
        style={styles.purchaseBtn}
        onPress={handlePurchase}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.purchaseText}>Pay with Wallet</Text>
        )}
      </TouchableOpacity>

      {fareInfo && (
        <View style={styles.fareInfoBox}>
          <Text style={styles.fareInfoText}>
            Fare breakdown: {fareInfo.base_fare} TND base + {fareInfo.taxes || 0} TND taxes
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2f3640', marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: '#2f3640', marginBottom: 10, marginTop: 8 },
  fareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
  },
  fareCardActive: { borderColor: '#00a8ff', backgroundColor: '#f0f9ff' },
  fareIcon: { fontSize: 28, marginRight: 14 },
  fareInfo: { flex: 1 },
  fareLabel: { fontSize: 16, fontWeight: '500', color: '#2f3640' },
  farePrice: { fontSize: 18, fontWeight: 'bold', color: '#00a8ff', marginTop: 2 },
  checkmark: { fontSize: 20, color: '#00a8ff', fontWeight: 'bold' },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 20,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00a8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  qtyValue: { fontSize: 28, fontWeight: 'bold', color: '#2f3640', minWidth: 40, textAlign: 'center' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  totalLabel: { fontSize: 20, color: '#7f8fa6' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#4cd137' },
  purchaseBtn: {
    backgroundColor: '#4cd137',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  fareInfoBox: { backgroundColor: '#e8f4fd', padding: 12, borderRadius: 8, marginTop: 8 },
  fareInfoText: { color: '#2f3640', fontSize: 13 },
});

export default TicketPurchaseScreen;
