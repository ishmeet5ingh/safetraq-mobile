import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import sosService from '../services/sos.service';
import locationService from '../services/location.service';

type Props = NativeStackScreenProps<AppStackParamList, 'SOS'>;

const SOSScreen = ({ route, navigation }: Props) => {
  const [message, setMessage] = useState('I need help. Please check my live location.');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const location = await locationService.getCurrentLocation().catch(() => null);

      await sosService.trigger({
        sessionId: route.params?.sessionId,
        message: message.trim() || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      Alert.alert('SOS sent', 'Emergency alert sent to allowed viewers.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('SOS', error instanceof Error ? error.message : 'Unable to send SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Emergency SOS</Text>
        <Text style={styles.subtitle}>This sends a visible alert with your latest known location to trusted viewers.</Text>

        <TextInput
          style={styles.input}
          multiline
          value={message}
          onChangeText={setMessage}
          placeholder="Add a quick note"
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity style={styles.primaryButton} disabled={loading} onPress={handleSend}>
          <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Send SOS'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SOSScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#b91c1c' },
  subtitle: { marginTop: 8, color: '#64748b', lineHeight: 20 },
  input: {
    marginTop: 18,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
    textAlignVertical: 'top',
    backgroundColor: '#fff5f5',
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
