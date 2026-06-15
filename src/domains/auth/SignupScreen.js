import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../core/auth/AuthContext';

const SignupScreen = ({ navigation }) => {
  const { signup } = useAuth();
  const [phone, setPhone] = useState('+216');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PASSENGER');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!phone || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(phone, password, role);
      Alert.alert('Success', 'Account created! You can now sign in.');
      navigation.navigate('Login');
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'PASSENGER', label: 'Passenger' },
    { key: 'DRIVER', label: 'Driver' },
    { key: 'CONTROLLER', label: 'Controller' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        secureTextEntry
      />
      <Text style={styles.label}>Role</Text>
      <View style={styles.roleRow}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
            onPress={() => setRole(r.key)}
          >
            <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f6fa' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#2f3640' },
  input: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  label: { fontSize: 16, fontWeight: '600', color: '#2f3640', marginBottom: 8 },
  roleRow: { flexDirection: 'row', marginBottom: 24, gap: 8 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#00a8ff', borderColor: '#00a8ff' },
  roleText: { color: '#7f8fa6', fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  button: { backgroundColor: '#4cd137', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#00a8ff', fontSize: 16 },
});

export default SignupScreen;
