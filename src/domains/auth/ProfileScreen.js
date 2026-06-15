import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../core/auth/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const roleLabel = {
    PASSENGER: 'Passenger',
    DRIVER: 'Driver',
    CONTROLLER: 'Controller',
    ADMIN: 'Administrator',
    SUPER_ADMIN: 'Super Admin',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.phone_number || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.phone}>{user?.phone_number}</Text>
        <Text style={styles.role}>{roleLabel[user?.role] || user?.role}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user?.phone_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{roleLabel[user?.role] || user?.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{user?.id}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00a8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  phone: { fontSize: 24, fontWeight: 'bold', color: '#2f3640', marginBottom: 4 },
  role: { fontSize: 16, color: '#7f8fa6' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 16, color: '#7f8fa6' },
  infoValue: { fontSize: 16, color: '#2f3640', fontWeight: '500' },
  logoutButton: {
    backgroundColor: '#e84118',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ProfileScreen;
