import React, { useEffect, useState } from 'react';
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
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { AppStackParamList, AppTabParamList } from '../navigation/types';
import { CircleType } from '../types/circle';
import { createCircleThunk, fetchCirclesThunk } from '../store/slices/circlesSlice';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Circles'>,
  NativeStackScreenProps<AppStackParamList>
>;

const circleTypes: CircleType[] = ['family', 'partner', 'friends', 'team'];

const CirclesScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { items, loading, submitting, error } = useAppSelector((state) => state.circles);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CircleType>('family');

  useEffect(() => {
    void dispatch(fetchCirclesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Circles', error);
    }
  }, [error]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Circle name is required');
      return;
    }

    const result = await dispatch(
      createCircleThunk({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
      }),
    );

    if (createCircleThunk.fulfilled.match(result)) {
      setName('');
      setDescription('');
      navigation.navigate('CircleDetail', { circleId: result.payload._id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.createCard}>
          <Text style={styles.sectionTitle}>Create a trusted circle</Text>
          <Text style={styles.helperText}>Make one small private group for family, partner, friends, or your team.</Text>

          <TextInput
            style={styles.input}
            placeholder="Circle name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#94a3b8"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#94a3b8"
            multiline
          />

          <View style={styles.typeRow}>
            {circleTypes.map((item) => {
              const selected = item === type;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}
                  onPress={() => setType(item)}
                >
                  <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.primaryButton} disabled={submitting} onPress={handleCreate}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Creating...' : 'Create Circle'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Your circles</Text>
          <Text style={styles.helperText}>{loading ? 'Refreshing circles...' : 'Tap a circle to view members and share live.'}</Text>

          {items.length ? (
            items.map((circle) => (
              <TouchableOpacity
                key={circle._id}
                style={styles.circleRow}
                onPress={() => navigation.navigate('CircleDetail', { circleId: circle._id })}
              >
                <View>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  <Text style={styles.circleMeta}>{circle.memberCount} members • {circle.type}</Text>
                </View>
                <Text style={styles.rowAction}>Open</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No circles yet. Create your first circle above.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CirclesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 28 },
  createCard: { backgroundColor: '#ffffff', borderRadius: 22, padding: 18 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  helperText: { marginTop: 6, color: '#64748b', lineHeight: 20 },
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  typeChipSelected: { backgroundColor: '#dbeafe' },
  typeChipText: { color: '#334155', fontWeight: '700', textTransform: 'capitalize' },
  typeChipTextSelected: { color: '#1d4ed8' },
  primaryButton: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  listCard: { marginTop: 16, backgroundColor: '#ffffff', borderRadius: 22, padding: 18 },
  circleRow: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  circleMeta: { marginTop: 4, fontSize: 13, color: '#64748b' },
  rowAction: { color: '#2563eb', fontWeight: '700' },
  emptyText: { marginTop: 14, color: '#64748b', lineHeight: 20 },
});
