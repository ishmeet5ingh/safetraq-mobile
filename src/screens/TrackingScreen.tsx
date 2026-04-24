import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StatusBar, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';
import { useAppSelector } from '../hooks/redux';
import LeafletMap, { MapMarker } from '../components/LeafletMap';
import locationService from '../services/location.service';
import socketService from '../services/socket.service';
import userService from '../services/user.service';
import { User } from '../types/user';

const mapUserToMarker = (user: User): MapMarker | null => {
  if (
    !user.currentLocation?.coordinates ||
    user.currentLocation.coordinates.length < 2
  ) {
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
  const { isDark } = useThemeContext();

  const [currentUserMarker, setCurrentUserMarker] = useState<MapMarker | null>(
    null,
  );
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
        const mappedCurrentUser = currentUserFromServer
          ? mapUserToMarker(currentUserFromServer)
          : null;

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
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        className="flex-1 bg-light-bg dark:bg-dark-bg"
      >
        <View className="flex-1 px-5 pb-5 pt-4">
          <View className="rounded-[14px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
            <View className="mb-4 flex-row items-start justify-between">
              <View className="max-w-[76%]">
                <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Live tracking
                </Text>
                <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                  Live user visibility
                </Text>
                <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                  Check markers and connection status.
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-[8px] bg-brand-primary">
                <Ionicons name="map" size={22} color="#FFFFFF" />
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="w-[48.5%] rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Status
                </Text>
                <Text className="mt-2 text-[15px] font-semibold text-light-text dark:text-dark-text">
                  {statusText}
                </Text>
              </View>

              <View className="w-[48.5%] rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Markers
                </Text>
                <Text className="mt-2 text-[20px] font-semibold text-light-text dark:text-dark-text">
                  {markerCount}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 flex-1 overflow-hidden rounded-[12px] border border-light-border bg-light-card shadow-soft dark:border-dark-border dark:bg-dark-card">
            <LeafletMap
              currentUserMarker={currentUserMarker}
              otherMarkers={otherMarkers}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default TrackingScreen;
