import React, { useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logoutThunk } from '../store/slices/authSlice';
import { AppStackParamList } from '../navigation/types';
import { fetchCirclesThunk } from '../store/slices/circlesSlice';
import { fetchActiveSessionThunk } from '../store/slices/sessionsSlice';
import { fetchPendingInvitesThunk } from '../store/slices/inviteSlice';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { items: circles } = useAppSelector((state) => state.circles);
  const { activeSession } = useAppSelector((state) => state.sessions);
  const { invites } = useAppSelector((state) => state.invites);

  useEffect(() => {
    void dispatch(fetchCirclesThunk());
    void dispatch(fetchActiveSessionThunk());
    void dispatch(fetchPendingInvitesThunk());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Trusted Circle Safety</Text>
          <Text style={styles.title}>
            Hi {user?.name?.split(' ')[0] || 'there'}
          </Text>
          <Text style={styles.subtitle}>
            Share your commute with consent, stop anytime, and keep the
            people you trust informed.
          </Text>
        </View>

        {invites.length > 0 && (
          <TouchableOpacity
            style={styles.inviteCard}
            onPress={() => navigation.navigate('Invites')}
          >
            <Text style={styles.inviteLabel}>PENDING INVITES</Text>
            <Text style={styles.inviteTitle}>
              You have {invites.length} pending invite
              {invites.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.inviteMeta}>
              Tap here to review and accept or decline them.
            </Text>
          </TouchableOpacity>
        )}

        {activeSession ? (
          <TouchableOpacity
            style={styles.activeCard}
            onPress={() =>
              navigation.navigate('ActiveSession', {
                sessionId: activeSession._id,
              })
            }
          >
            <Text style={styles.activeLabel}>ACTIVE SESSION</Text>
            <Text style={styles.activeTitle}>{activeSession.title}</Text>
            <Text style={styles.activeMeta}>
              Status: {activeSession.status}
              {activeSession.expiresAt
                ? ` • Ends ${new Date(
                    activeSession.expiresAt,
                  ).toLocaleTimeString()}`
                : ' • No expiry'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No live session right now</Text>
            <Text style={styles.emptyText}>
              Start a quick share before your next commute or trip.
            </Text>
          </View>
        )}

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.navigate('LiveShareSetup')}
          >
            <Text style={styles.primaryActionText}>Start Live Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('Circles')}
          >
            <Text style={styles.secondaryActionText}>Manage Circles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('Invites')}
          >
            <Text style={styles.secondaryActionText}>
              Invites {invites.length > 0 ? `(${invites.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('PrivacyDashboard')}
          >
            <Text style={styles.secondaryActionText}>Privacy Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryAction, styles.sosAction]}
            onPress={() =>
              navigation.navigate('SOS', {
                sessionId: activeSession?._id,
              })
            }
          >
            <Text style={styles.sosActionText}>SOS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your circles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Circles')}>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </View>

          {circles.length > 0 ? (
            circles.slice(0, 3).map((circle) => (
              <TouchableOpacity
                key={circle._id}
                style={styles.circleRow}
                onPress={() =>
                  navigation.navigate('CircleDetail', {
                    circleId: circle._id,
                  })
                }
              >
                <View>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  <Text style={styles.circleMeta}>
                    {circle.memberCount} members • {circle.type}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Create your first trusted circle for family, partner, or friends.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => Alert.alert('Profile', JSON.stringify(user, null, 2))}
        >
          <Text style={styles.profileButtonText}>View profile JSON</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
  },
  eyebrow: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 6,
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  inviteCard: {
    marginTop: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    padding: 18,
  },
  inviteLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
  },
  inviteTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#78350f',
  },
  inviteMeta: {
    marginTop: 6,
    fontSize: 14,
    color: '#92400e',
  },
  activeCard: {
    marginTop: 16,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    padding: 18,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  activeTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  activeMeta: {
    marginTop: 6,
    fontSize: 14,
    color: '#334155',
  },
  emptyCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  primaryAction: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    flexGrow: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  sosAction: {
    backgroundColor: '#fee2e2',
  },
  sosActionText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  circleRow: {
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  circleMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
  },
  chevron: {
    fontSize: 22,
    color: '#94a3b8',
  },
  profileButton: {
    marginTop: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});