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
import { AppStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCircleDetailThunk, inviteCircleMemberThunk } from '../store/slices/circlesSlice';

type Props = NativeStackScreenProps<AppStackParamList, 'CircleDetail'>;

const CircleDetailScreen = ({ route, navigation }: Props) => {
  const { circleId } = route.params;
  const dispatch = useAppDispatch();
  const { currentCircle, loading, submitting, error } = useAppSelector((state) => state.circles);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    void dispatch(fetchCircleDetailThunk(circleId));
  }, [dispatch, circleId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Circle', error);
    }
  }, [error]);

  const circle = useMemo(() => {
    if (currentCircle?._id === circleId) {
      return currentCircle;
    }
    return null;
  }, [currentCircle, circleId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Validation', 'Invite email is required');
      return;
    }

    const result = await dispatch(
      inviteCircleMemberThunk({
        circleId,
        email: inviteEmail.trim().toLowerCase(),
      }),
    );

    if (inviteCircleMemberThunk.fulfilled.match(result)) {
      setInviteEmail('');
      Alert.alert('Invite created', 'Member has been added as active or pending based on availability.');
    }
  };

  if (!circle && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading circle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>{circle?.name || 'Circle'}</Text>
          <Text style={styles.meta}>{circle?.type} • {circle?.memberCount || 0} members</Text>
          <Text style={styles.description}>{circle?.description || 'Private consent-based group for sharing live sessions safely.'}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'LiveShareSetup',
                params: { preselectedCircleId: circleId },
              })
            }
          >
            <Text style={styles.primaryButtonText}>Share with this circle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Invite member</Text>
          <Text style={styles.helperText}>Invite by email. Existing users become active members, others stay pending.</Text>
          <TextInput
            style={styles.input}
            placeholder="friend@example.com"
            placeholderTextColor="#94a3b8"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.secondaryButton} disabled={submitting} onPress={handleInvite}>
            <Text style={styles.secondaryButtonText}>{submitting ? 'Inviting...' : 'Send Invite'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Members</Text>
          {circle?.members?.length ? (
            circle.members.map((member) => (
              <View key={member._id} style={styles.memberRow}>
                <View>
                  <Text style={styles.memberName}>{member.name || member.invitedEmail}</Text>
                  <Text style={styles.memberMeta}>{member.email} • {member.role} • {member.status}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.helperText}>No members yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CircleDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 28 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#475569', fontSize: 16 },
  heroCard: { backgroundColor: '#111827', borderRadius: 24, padding: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  meta: { color: '#93c5fd', marginTop: 8, textTransform: 'capitalize' },
  description: { color: '#d1d5db', marginTop: 10, lineHeight: 20 },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: { marginTop: 16, backgroundColor: '#fff', borderRadius: 22, padding: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  helperText: { marginTop: 6, color: '#64748b', lineHeight: 20 },
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#111827', fontWeight: '700' },
  memberRow: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
  },
  memberName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  memberMeta: { marginTop: 4, fontSize: 13, color: '#64748b' },
});
