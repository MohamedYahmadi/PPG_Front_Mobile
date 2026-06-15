import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Vibration,
} from 'react-native';
import { Camera } from 'react-native-camera';
import api from '../../core/api/client';
import CryptoEngine from '../ticketing/CryptoEngine';

const ScanScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [validating, setValidating] = useState(false);

  const handleBarCodeRead = async (qrData) => {
    if (!scanning || validating) return;
    setScanning(false);
    setValidating(true);
    Vibration.vibrate(100);

    try {
      let ticketData;
      try {
        ticketData = JSON.parse(qrData.data || qrData);
      } catch {
        ticketData = { raw: qrData.data || qrData };
      }

      const isValidSig = CryptoEngine.verifySignatureOffline(
        JSON.stringify(ticketData),
        'controller_public_key'
      );

      if (!isValidSig) {
        setResult({ valid: false, message: 'Invalid QR code signature' });
        setValidating(false);
        return;
      }

      const ticketId = ticketData.t || ticketData.ticketId || ticketData.id;
      if (!ticketId) {
        setResult({ valid: false, message: 'Invalid ticket data format' });
        setValidating(false);
        return;
      }

      const res = await api.post('/tickets/validate/mark-used/', {
        ticket_id: ticketId,
        scan_location_lat: 36.8065,
        scan_location_lng: 10.1815,
        is_cryptographically_valid: true,
        device_id: 'controller-mobile',
      });

      setResult({
        valid: true,
        message: res.data.message || 'Ticket is valid',
        ticket: res.data,
      });
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || 'Invalid ticket';
      setResult({ valid: false, message: detail });
    } finally {
      setValidating(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setScanning(true);
  };

  if (result) {
    return (
      <View style={[styles.resultContainer, { backgroundColor: result.valid ? '#e8f5e9' : '#fbe9e7' }]}>
        <Text style={styles.resultIcon}>{result.valid ? '✅' : '❌'}</Text>
        <Text style={[styles.resultTitle, { color: result.valid ? '#2e7d32' : '#c62828' }]}>
          {result.valid ? 'Ticket Valid' : 'Invalid'}
        </Text>
        <Text style={styles.resultMessage}>{result.message}</Text>
        {result.ticket && (
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketField}>ID: {result.ticket.id || result.ticket.ticket_id}</Text>
            <Text style={styles.ticketField}>
              Valid Until: {result.ticket.valid_until
                ? new Date(result.ticket.valid_until).toLocaleString()
                : 'N/A'}
            </Text>
            <Text style={styles.ticketField}>Zone: {result.ticket.zone_validity || 'N/A'}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.scanAgainBtn} onPress={resetScan}>
          <Text style={styles.scanAgainText}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Point the camera at the passenger's QR code</Text>
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          onBarCodeRead={handleBarCodeRead}
          captureAudio={false}
          type={Camera.Constants.Type.back}
        >
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame} />
          </View>
        </Camera>
      </View>
      {validating && (
        <View style={styles.validatingOverlay}>
          <ActivityIndicator size="large" color="#00a8ff" />
          <Text style={styles.validatingText}>Validating...</Text>
        </View>
      )}
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  instructions: {
    color: '#fff',
    textAlign: 'center',
    padding: 16,
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  scanOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#00a8ff',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  validatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validatingText: { color: '#fff', marginTop: 12, fontSize: 16 },
  cancelBtn: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#e84118',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultIcon: { fontSize: 64, marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  resultMessage: { fontSize: 16, color: '#2f3640', textAlign: 'center', marginBottom: 20 },
  ticketInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  ticketField: { fontSize: 14, color: '#2f3640', marginBottom: 6 },
  scanAgainBtn: {
    backgroundColor: '#00a8ff',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  scanAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ScanScreen;
