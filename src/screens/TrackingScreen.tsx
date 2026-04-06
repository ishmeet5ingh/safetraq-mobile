import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../hooks/redux';
import LeafletMap, { MapMarker } from '../components/LeafletMap';
import locationService from '../services/location.service';
import socketService from '../services/socket.service';
import userService from '../services/user.service';
import { User } from '../types/user';

const mapUserToMarker = (user: User): MapMarker | null => {
  if (!user.currentLocation?.coordinates || user.currentLocation.coordinates.length < 2) {
    return null;
  }

  return {
    id: user._id,
    latitude: user.currentLocation.coordinates[1],
    longitude: user.currentLocation.coordinates[0],
    label: `${user.name} (${user.email})`,
  };
};

const TrackingScreen = () => {
  const { token, user } = useAppSelector((state) => state.auth);

  const [currentUserMarker, setCurrentUserMarker] = useState<MapMarker | null>(null);
  const [otherMarkers, setOtherMarkers] = useState<MapMarker[]>([]);
  const [statusText, setStatusText] = useState('Connecting...');

  useEffect(() => {
    if (!token || !user?._id) {
      return;
    }

    let isMounted = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    socketService.connect(token);

    const unsubscribeConnected = socketService.onConnected(() => {
      if (isMounted) {
        setStatusText('Socket connected');
      }
    });

    const unsubscribeError = socketService.onError((payload) => {
      if (isMounted) {
        Alert.alert('Socket Error', payload.message);
      }
    });

    const fetchLiveUsers = async (): Promise<void> => {
      try {
        const liveUsers = await userService.getLiveUsers();

        if (!isMounted) {
          return;
        }

        const otherUsersMarkers = liveUsers
          .filter((item) => item._id !== user._id)
          .map(mapUserToMarker)
          .filter(Boolean) as MapMarker[];

        setOtherMarkers(otherUsersMarkers);

        const currentUserFromServer = liveUsers.find((item) => item._id === user._id);
        const mappedCurrentUser = currentUserFromServer ? mapUserToMarker(currentUserFromServer) : null;

        setCurrentUserMarker((prev) => prev ?? mappedCurrentUser);
        setStatusText(`Live users synced: ${liveUsers.length}`);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatusText('Unable to sync live users');
        Alert.alert(
          'Tracking Error',
          error instanceof Error ? error.message : 'Unable to fetch live users',
        );
      }
    };

    const bootstrap = async (): Promise<void> => {
      await fetchLiveUsers();

      try {
        await locationService.startTracking(
          async (location) => {
            if (!isMounted) {
              return;
            }

            setCurrentUserMarker({
              id: user._id,
              latitude: location.latitude,
              longitude: location.longitude,
              label: 'You',
            });

            // Note:
            // Old socketService.emitLocationUpdate(...) was removed because
            // current socket service no longer exposes that method.
            // If your current location.service already syncs backend, this is enough.
            // Otherwise, add your backend location update API call here.
          },
          (error) => {
            if (isMounted) {
              console.log('Location tracking error:', error);
            }
          },
        );
      } catch (error) {
        if (isMounted) {
          Alert.alert(
            'Tracking Error',
            error instanceof Error ? error.message : 'Unable to start tracking',
          );
        }
      }

      pollInterval = setInterval(() => {
        void fetchLiveUsers();
      }, 8000);
    };

    void bootstrap();

    return () => {
      isMounted = false;

      if (pollInterval) {
        clearInterval(pollInterval);
      }

      unsubscribeConnected();
      unsubscribeError();
      locationService.stopTracking();
      socketService.disconnect();
    };
  }, [token, user?._id]);

  const markerCount = useMemo(() => {
    return otherMarkers.length + (currentUserMarker ? 1 : 0);
  }, [currentUserMarker, otherMarkers.length]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Tracking</Text>
        <Text style={styles.subtitle}>{statusText}</Text>
        <Text style={styles.subtitle}>Visible markers: {markerCount}</Text>
      </View>

      <View style={styles.mapWrapper}>
        <LeafletMap currentUserMarker={currentUserMarker} otherMarkers={otherMarkers} />
      </View>
    </SafeAreaView>
  );
};

export default TrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#4b5563',
  },
  mapWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
});