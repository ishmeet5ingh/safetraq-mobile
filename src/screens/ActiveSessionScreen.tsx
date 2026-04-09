import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LeafletMap, { MapMarker } from '../components/LeafletMap';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { AppStackParamList } from '../navigation/types';
import locationService from '../services/location.service';
import socketService from '../services/socket.service';
import circleService from '../services/circle.service';
import {
  fetchActiveSessionThunk,
  fetchSessionByIdThunk,
  pauseSessionThunk,
  resumeSessionThunk,
  stopSessionThunk,
} from '../store/slices/sessionsSlice';
import { SessionLocationPayload } from '../types/socket';

type Props = NativeStackScreenProps<AppStackParamList, 'ActiveSession'>;

type ActiveSharer = {
  sessionId: string;
  userId: string;
  circleId: string;
  title: string;
  name: string;
  email: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  updatedAt: string;
};

const ActiveSessionScreen = ({ route, navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { activeSession, loading } = useAppSelector((state) => state.sessions);
  const batteryAwareMode = useAppSelector((state) => state.privacy.batteryAwareMode);

  const [remoteMarkers, setRemoteMarkers] = useState<MapMarker[]>([]);
  const [currentUserMarker, setCurrentUserMarker] = useState<MapMarker | null>(null);
  const [statusText, setStatusText] = useState('Connecting...');

  useEffect(() => {
    if (route.params?.sessionId) {
      void dispatch(fetchSessionByIdThunk(route.params.sessionId));
      return;
    }

    void dispatch(fetchActiveSessionThunk());
  }, [dispatch, route.params?.sessionId]);

  const refreshCircleSharers = useCallback(
    async (circleId?: string) => {
      if (!circleId) {
        return;
      }

      try {
        const activeSharers: ActiveSharer[] = await circleService.getActiveSharers(circleId);

        const mappedMarkers = activeSharers
          .filter(
            (item) =>
              typeof item.latitude === 'number' &&
              typeof item.longitude === 'number',
          )
          .map((item) => ({
            id: item.userId,
            latitude: item.latitude,
            longitude: item.longitude,
            label: item.userId === user?._id ? 'You' : item.name || item.email || 'Circle member',
          }));

        const me = mappedMarkers.find((item) => item.id === user?._id) || null;
        const others = mappedMarkers.filter((item) => item.id !== user?._id);

        setCurrentUserMarker(me);
        setRemoteMarkers(others);
        setStatusText(`Active sharers: ${mappedMarkers.length}`);
      } catch (error) {
        console.log('Failed to refresh active sharers', error);
      }
    },
    [user?._id],
  );

  useEffect(() => {
    if (!token || !user?._id || !activeSession?._id) {
      return;
    }

    let isMounted = true;
    const sessionId = activeSession._id;
    const isOwner = activeSession.ownerUserId === user._id;
    const circleId = activeSession.circle?._id;

    const socket = socketService.connect(token);
    socketService.emitJoinSession(sessionId);

    const bootstrapCircleSharers = async () => {
      try {
        if (!circleId) {
          if (isOwner && activeSession.latestLocation) {
            setCurrentUserMarker({
              id: user._id,
              latitude: activeSession.latestLocation.latitude,
              longitude: activeSession.latestLocation.longitude,
              label: 'You',
            });
          }
          setStatusText('Private self-session');
          return;
        }

        await refreshCircleSharers(circleId);

        if (!isMounted) {
          return;
        }
      } catch (error) {
        if (isMounted) {
          console.log('Failed to fetch active sharers', error);
          setStatusText('Live session connected');
        }
      }
    };

    void bootstrapCircleSharers();

    const unsubConnected = socketService.onConnected(() => {
      if (isMounted) {
        setStatusText((prev) =>
          prev === 'Connecting...' ? 'Live socket connected' : prev,
        );
      }
    });

    const unsubError = socketService.onError((payload) => {
      if (isMounted) {
        Alert.alert('Session', payload.message);
      }
    });

    const unsubUpdated = socketService.onSessionUpdated(async (payload) => {
      if (!isMounted) return;

      const sameSession = payload.sessionId === sessionId;
      const sameCircle =
        !!payload.circleId &&
        !!circleId &&
        payload.circleId === circleId;

      if (!sameSession && !sameCircle) {
        return;
      }

      setStatusText(`Session ${payload.status}`);

      if (sameSession) {
        if (route.params?.sessionId) {
          await dispatch(fetchSessionByIdThunk(route.params.sessionId));
        } else {
          await dispatch(fetchActiveSessionThunk());
        }
      }

      if (circleId) {
        await refreshCircleSharers(circleId);
      }
    });

    const unsubCircleChanged = socketService.onCircleActiveSharersChanged(async (payload) => {
      if (!isMounted) return;
      if (!circleId) return;
      if (payload.circleId !== circleId) return;

      await refreshCircleSharers(circleId);
    });

    const unsubLocation = socketService.onSessionLocation((payload: SessionLocationPayload) => {
      if (!isMounted) return;

      if (circleId) {
        const isSameCircleMemberUpdate =
          payload.circleId && payload.circleId === circleId;

        const isCurrentSessionUpdate = payload.sessionId === sessionId;

        if (!isSameCircleMemberUpdate && !isCurrentSessionUpdate) {
          return;
        }
      } else if (payload.sessionId !== sessionId) {
        return;
      }

      if (payload.userId === user._id) {
        setCurrentUserMarker({
          id: payload.userId,
          latitude: payload.latitude,
          longitude: payload.longitude,
          label: 'You',
        });
        return;
      }

      setRemoteMarkers((prev) => {
        const filtered = prev.filter((item) => item.id !== payload.userId);

        return [
          ...filtered,
          {
            id: payload.userId,
            latitude: payload.latitude,
            longitude: payload.longitude,
            label: payload.name || payload.email || 'Circle member',
          },
        ];
      });
    });

    const beginOwnerTracking = async () => {
      const hasPermission = await locationService.requestPermission();

      if (!isMounted) {
        return;
      }

      if (!hasPermission) {
        setStatusText('Location permission is required to update your live position');
        Alert.alert(
          'Location Required',
          'Allow location access so your trusted viewers can see your live position during this session.',
        );
        return;
      }

      try {
        const initialLocation = await locationService.getCurrentLocation();

        if (!isMounted) {
          return;
        }

        setCurrentUserMarker({
          id: user._id,
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          label: 'You',
        });

        socketService.emitSessionLocationUpdate({
          sessionId,
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          accuracy: initialLocation.accuracy,
          speed: initialLocation.speed,
        });
      } catch (error) {
        if (isMounted) {
          console.log('Failed to fetch initial session location', error);
          setStatusText('Waiting for location fix...');
        }
      }

      try {
        await locationService.startTracking(
          async (location) => {
            if (!isMounted) return;

            setCurrentUserMarker({
              id: user._id,
              latitude: location.latitude,
              longitude: location.longitude,
              label: 'You',
            });

            setStatusText('Live location active');

            socketService.emitSessionLocationUpdate({
              sessionId,
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              speed: location.speed,
            });
          },
          (error) => {
            console.log('Active session location error', error);
            if (isMounted) {
              setStatusText('Location updates unavailable');
            }
          },
          batteryAwareMode ? 'balanced' : 'high',
        );
      } catch (error) {
        console.log('Unable to start session tracking', error);
        if (isMounted) {
          setStatusText('Unable to start location tracking');
        }
      }
    };

    if (isOwner && activeSession.status === 'active') {
      void beginOwnerTracking();
    }

    if (activeSession.latestLocation && isOwner) {
      setCurrentUserMarker((prev) => {
        if (prev) return prev;

        return {
          id: user._id,
          latitude: activeSession.latestLocation!.latitude,
          longitude: activeSession.latestLocation!.longitude,
          label: 'You',
        };
      });
    }

    return () => {
      isMounted = false;
      unsubConnected();
      unsubError();
      unsubUpdated();
      unsubCircleChanged();
      unsubLocation();
      socketService.emitLeaveSession(sessionId);
      locationService.stopTracking();

      if (socket && !route.params?.sessionId) {
        socketService.disconnect();
      }
    };
  }, [
    token,
    user?._id,
    activeSession?._id,
    activeSession?.status,
    activeSession?.circle?._id,
    activeSession?.ownerUserId,
    activeSession?.latestLocation,
    batteryAwareMode,
    dispatch,
    refreshCircleSharers,
    route.params?.sessionId,
  ]);

  const markerCount = useMemo(() => {
    return remoteMarkers.length + (currentUserMarker ? 1 : 0);
  }, [remoteMarkers.length, currentUserMarker]);

  const handlePauseResume = async () => {
    if (!activeSession?._id) return;

    if (activeSession.status === 'active') {
      await dispatch(pauseSessionThunk(activeSession._id));
      locationService.stopTracking();
      return;
    }

    await dispatch(resumeSessionThunk(activeSession._id));
  };

  const handleStop = async () => {
    if (!activeSession?._id) return;
    await dispatch(stopSessionThunk(activeSession._id));
    locationService.stopTracking();
    navigation.goBack();
  };

  if (!activeSession && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.helper}>Loading active session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No active session found</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.replace('MainTabs', {
                screen: 'LiveShareSetup',
              })
            }
          >
            <Text style={styles.primaryButtonText}>Start one now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{activeSession.title}</Text>
        <Text style={styles.helper}>
          Status: {activeSession.status} • Markers: {markerCount}
        </Text>
        <Text style={styles.helper}>{statusText}</Text>
        {activeSession.circle?.name ? (
          <Text style={styles.helper}>Circle: {activeSession.circle.name}</Text>
        ) : null}
      </View>

      <View style={styles.mapWrapper}>
        <LeafletMap
          currentUserMarker={currentUserMarker}
          otherMarkers={remoteMarkers}
        />
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePauseResume}>
          <Text style={styles.secondaryButtonText}>
            {activeSession.status === 'active' ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => navigation.navigate('SOS', { sessionId: activeSession._id })}
        >
          <Text style={styles.sosButtonText}>SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ActiveSessionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 14 },
  headerCard: { margin: 16, marginBottom: 0, backgroundColor: '#ffffff', borderRadius: 20, padding: 18 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  helper: { marginTop: 6, fontSize: 14, color: '#64748b' },
  mapWrapper: { flex: 1, margin: 16, borderRadius: 20, overflow: 'hidden' },
  controlsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
  secondaryButton: { flex: 1, backgroundColor: '#e2e8f0', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#0f172a', fontWeight: '700' },
  sosButton: { flex: 1, backgroundColor: '#fee2e2', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  sosButtonText: { color: '#b91c1c', fontWeight: '800' },
  stopButton: { flex: 1, backgroundColor: '#111827', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  stopButtonText: { color: '#ffffff', fontWeight: '700' },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});
