import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../../core/api/client';

const INCIDENT_TYPES = [
  { key: 'DELAY', label: 'Delay', icon: '⏰', color: '#f39c12' },
  { key: 'BREAKDOWN', label: 'Vehicle Breakdown', icon: '🔧', color: '#e84118' },
  { key: 'ACCIDENT', label: 'Accident', icon: '💥', color: '#c0392b' },
  { key: 'TRAFFIC', label: 'Traffic Jam', icon: '🚦', color: '#e67e22' },
  { key: 'SECURITY', label: 'Security Issue', icon: '🚨', color: '#8e44ad' },
  { key: 'OTHER', label: 'Other', icon: '📝', color: '#7f8fa6' },
];

const IncidentScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select an incident type');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transit/driver/incidents/', {
        type: selectedType,
        description: description.trim(),
        location_lat: location?.latitude || 36.8065,
        location_lng: location?.longitude || 10.1815,
      });
      Alert.alert('Reported', 'Incident has been reported successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report Incident</Text>
      <Text style={styles.subtitle}>Select the type of incident</Text>

      <View style={styles.typeGrid}>
        {INCIDENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeCard,
              selectedType === type.key && { borderColor: type.color, backgroundColor: type.color + '15' },
            ]}
            onPress={() => setSelectedType(type.key)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={styles.typeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Description</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the incident in detail..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {location && (
        <View style={styles.locationBox}>
          <Text style={styles.locationLabel}>📍 Current Location</Text>
          <Text style={styles.locationCoords}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, (!selectedType || !description.trim()) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!selectedType || !description.trim() || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2f3640', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7f8fa6', marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  typeCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  typeIcon: { fontSize: 28, marginBottom: 6 },
  typeLabel: { fontSize: 11, fontWeight: '600', color: '#2f3640', textAlign: 'center' },
  fieldLabel: { fontSize: 15, fontWeight: '600', color: '#2f3640', marginBottom: 8 },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    marginBottom: 16,
  },
  locationBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  locationLabel: { fontSize: 14, fontWeight: '600', color: '#2f3640', marginBottom: 4 },
  locationCoords: { fontSize: 13, color: '#7f8fa6', fontFamily: 'monospace' },
  submitBtn: {
    backgroundColor: '#e84118',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default IncidentScreen;
