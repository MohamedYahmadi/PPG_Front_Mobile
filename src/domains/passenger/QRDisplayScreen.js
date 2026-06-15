import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import CryptoEngine from '../ticketing/CryptoEngine';

const QRDisplayScreen = ({ route }) => {
  const { ticket } = route.params;
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    const updateQR = () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const payload = CryptoEngine.generateDynamicQRData(
        ticket.id || ticket.ticket_id,
        secret,
        'simulated_private_key'
      );
      setQrData(payload);
    };
    updateQR();
    const interval = setInterval(updateQR, 30000);
    return () => clearInterval(interval);
  }, [ticket.id, ticket.ticket_id]);

  return (
    <View style={styles.container}>
      <Text style={styles.warning}>Show this code to the controller</Text>
      <View style={styles.qrContainer}>
        {qrData ? <QRCode value={qrData} size={260} /> : null}
      </View>
      <Text style={styles.ticketId}>ID: {ticket.id || ticket.ticket_id}</Text>
      <Text style={styles.info}>
        Zone: {ticket.zone_validity || ticket.zone || 'N/A'} · {ticket.price_paid || ticket.price || '?'} TND
      </Text>
      <Text style={styles.info}>
        Valid until: {ticket.valid_until
          ? new Date(ticket.valid_until).toLocaleTimeString()
          : 'N/A'}
      </Text>
      <Text style={styles.status}>{ticket.status === 'ACTIVE' ? '✅ Active' : '⚪ ' + (ticket.status || 'Unknown')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f6fa', padding: 20 },
  warning: { fontSize: 16, color: '#e84118', fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  qrContainer: { padding: 20, backgroundColor: '#fff', borderRadius: 20, elevation: 5 },
  ticketId: { marginTop: 30, fontSize: 12, color: '#7f8fa6' },
  info: { marginTop: 8, fontSize: 16, color: '#2f3640', textAlign: 'center' },
  status: { marginTop: 16, fontSize: 18, fontWeight: 'bold' },
});

export default QRDisplayScreen;
