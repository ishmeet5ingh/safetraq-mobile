import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  acceptInviteThunk,
  declineInviteThunk,
  fetchPendingInvitesThunk,
} from '../store/slices/inviteSlice';

const InvitesScreen = () => {
  const dispatch = useAppDispatch();
  const { invites, loading, error } = useAppSelector((state) => state.invites);

  useEffect(() => {
    dispatch(fetchPendingInvitesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Invite Error', error);
    }
  }, [error]);

  const handleAccept = async (inviteId: string) => {
    const resultAction = await dispatch(acceptInviteThunk(inviteId));
    if (acceptInviteThunk.fulfilled.match(resultAction)) {
      Alert.alert('Success', 'Invite accepted successfully');
    } else {
      Alert.alert('Error', (resultAction.payload as string) || 'Failed to accept invite');
    }
  };

  const handleDecline = async (inviteId: string) => {
    const resultAction = await dispatch(declineInviteThunk(inviteId));
    if (declineInviteThunk.fulfilled.match(resultAction)) {
      Alert.alert('Done', 'Invite declined');
    } else {
      Alert.alert('Error', (resultAction.payload as string) || 'Failed to decline invite');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pending Invites</Text>

      {loading ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : invites.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>No pending invites</Text>
        </View>
      ) : (
        <FlatList
          data={invites}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.circleName}>{item.circleName}</Text>
              <Text style={styles.meta}>Type: {item.circleType}</Text>
              <Text style={styles.meta}>Role: {item.role}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={() => handleAccept(item._id)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.declineButton]}
                  onPress={() => handleDecline(item._id)}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default InvitesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  circleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    marginTop: 6,
    fontSize: 14,
    color: '#475569',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2563eb',
    marginRight: 8,
  },
  declineButton: {
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});