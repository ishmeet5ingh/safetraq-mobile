import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  setDefaultShareMinutes,
  toggleArrivalPrompt,
  toggleAuditVisibility,
  toggleBatteryAwareMode,
} from '../store/slices/privacySlice';

const options = [15, 60, 240];

const PrivacyDashboardScreen = () => {
  const dispatch = useAppDispatch();
  const privacy = useAppSelector((state) => state.privacy);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Your privacy stays visible</Text>
          <Text style={styles.subtitle}>
            Every share is temporary, visible, and revocable. These defaults shape new sessions.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Default share duration</Text>
          <View style={styles.optionsRow}>
            {options.map((minutes) => {
              const selected = privacy.defaultShareMinutes === minutes;
              return (
                <TouchableOpacity
                  key={minutes}
                  style={[styles.optionChip, selected && styles.optionChipSelected]}
                  onPress={() => {
                    dispatch(setDefaultShareMinutes(minutes));
                  }}
                >
                  <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                    {minutes} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Battery-aware mode</Text>
              <Text style={styles.toggleDescription}>
                Uses balanced update intervals to reduce drain during long sessions.
              </Text>
            </View>
            <Switch
              value={privacy.batteryAwareMode}
              onValueChange={(_value) => {
                dispatch(toggleBatteryAwareMode());
              }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Arrival prompt</Text>
              <Text style={styles.toggleDescription}>
                Ask for a quick “reached safely?” confirmation in future trip flows.
              </Text>
            </View>
            <Switch
              value={privacy.arrivalPromptEnabled}
              onValueChange={(_value) => {
                dispatch(toggleArrivalPrompt());
              }}
            />
          </View>

          <View style={[styles.toggleRow, styles.lastRow]}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Audit visibility</Text>
              <Text style={styles.toggleDescription}>
                Keep a visible trail of who viewed a live session in future builds.
              </Text>
            </View>
            <Switch
              value={privacy.allowAuditVisibility}
              onValueChange={(_value) => {
                dispatch(toggleAuditVisibility());
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  heroCard: { backgroundColor: '#111827', borderRadius: 24, padding: 20 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#d1d5db', marginTop: 8, lineHeight: 20 },
  card: { marginTop: 16, backgroundColor: '#ffffff', borderRadius: 22, padding: 18 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  optionChip: { backgroundColor: '#e2e8f0', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  optionChipSelected: { backgroundColor: '#dbeafe' },
  optionChipText: { color: '#334155', fontWeight: '700' },
  optionChipTextSelected: { color: '#1d4ed8', fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  lastRow: { borderBottomWidth: 0, paddingBottom: 0 },
  toggleContent: { flex: 1, paddingRight: 12 },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  toggleDescription: { marginTop: 4, color: '#64748b', lineHeight: 19 },
});