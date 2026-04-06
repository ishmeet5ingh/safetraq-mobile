import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { AppStackParamList } from '../navigation/types';
import { fetchCirclesThunk } from '../store/slices/circlesSlice';
import { startSessionThunk } from '../store/slices/sessionsSlice';
import { SESSION_DURATIONS } from '../utils/constants';

type Props = NativeStackScreenProps<AppStackParamList, 'LiveShareSetup'>;

const LiveShareSetupScreen = ({ route, navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.circles);
  const { submitting } = useAppSelector((state) => state.sessions);
  const defaultMinutes = useAppSelector((state) => state.privacy.defaultShareMinutes);
  const [title, setTitle] = useState('Safe commute');
  const [selectedCircleId, setSelectedCircleId] = useState<string | undefined>(route.params?.preselectedCircleId);
  const [durationMinutes, setDurationMinutes] = useState<number>(defaultMinutes);

  useEffect(() => {
    void dispatch(fetchCirclesThunk());
  }, [dispatch]);

  const selectedCircle = useMemo(
    () => items.find((item) => item._id === selectedCircleId),
    [items, selectedCircleId],
  );

  const handleStart = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Session title is required');
      return;
    }

    const result = await dispatch(
      startSessionThunk({
        title: title.trim(),
        circleId: selectedCircleId,
        durationMinutes,
      }),
    );

    if (startSessionThunk.fulfilled.match(result)) {
      navigation.replace('ActiveSession', { sessionId: result.payload._id });
      return;
    }

    Alert.alert('Session', (result.payload as string) || 'Unable to start session');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Create a visible, revocable live session</Text>
          <Text style={styles.helperText}>Choose a circle, set a duration, and start sharing only for this moment.</Text>

          <TextInput
            style={styles.input}
            placeholder="Session title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.sectionLabel}>Choose a circle</Text>
          {items.length ? (
            items.map((circle) => {
              const selected = circle._id === selectedCircleId;
              return (
                <TouchableOpacity
                  key={circle._id}
                  style={[styles.circleRow, selected && styles.circleRowSelected]}
                  onPress={() => setSelectedCircleId(selected ? undefined : circle._id)}
                >
                  <View>
                    <Text style={[styles.circleName, selected && styles.circleNameSelected]}>{circle.name}</Text>
                    <Text style={styles.circleMeta}>{circle.memberCount} members • {circle.type}</Text>
                  </View>
                  <Text style={[styles.selectText, selected && styles.selectTextSelected]}>{selected ? 'Selected' : 'Select'}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Circles')}>
              <Text style={styles.linkText}>No circles yet. Create one first.</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionLabel}>Duration</Text>
          <View style={styles.durationWrap}>
            {SESSION_DURATIONS.map((option) => {
              const selected = option.minutes === durationMinutes;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.durationChip, selected && styles.durationChipSelected]}
                  onPress={() => setDurationMinutes(option.minutes)}
                >
                  <Text style={[styles.durationText, selected && styles.durationTextSelected]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedCircle ? <Text style={styles.summary}>Sharing with {selectedCircle.name}</Text> : <Text style={styles.summary}>Private self-session until you attach a circle later.</Text>}

          <TouchableOpacity style={styles.primaryButton} disabled={submitting} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Starting...' : 'Start Live Session'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LiveShareSetupScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 22, padding: 18 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  helperText: { marginTop: 8, color: '#64748b', lineHeight: 20 },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
  },
  sectionLabel: { marginTop: 18, fontWeight: '700', color: '#0f172a' },
  circleRow: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleRowSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  circleName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  circleNameSelected: { color: '#1d4ed8' },
  circleMeta: { marginTop: 4, fontSize: 13, color: '#64748b' },
  selectText: { fontWeight: '700', color: '#475569' },
  selectTextSelected: { color: '#1d4ed8' },
  durationWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  durationChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#e2e8f0' },
  durationChipSelected: { backgroundColor: '#dbeafe' },
  durationText: { color: '#334155', fontWeight: '700' },
  durationTextSelected: { color: '#1d4ed8' },
  summary: { marginTop: 16, color: '#475569', lineHeight: 20 },
  linkText: { marginTop: 12, color: '#2563eb', fontWeight: '700' },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});
