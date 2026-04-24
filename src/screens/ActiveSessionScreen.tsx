import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';
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

const getStatusTone = (status?: string) => {
  if (status === 'active') {
    return 'bg-green-100 dark:bg-green-500/15 text-brand-live';
  }

  if (status === 'paused') {
    return 'bg-amber-100 dark:bg-amber-500/15 text-brand-warning';
  }

  return 'bg-light-muted dark:bg-dark-muted text-light-subtext dark:text-dark-subtext';
};

const ActiveSessionScreen = ({ route, navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { isDark } = useThemeContext();
  const { token, user } = useAppSelector((state) => state.auth);
  const { activeSession, loading } = useAppSelector((state) => state.sessions);
  const batteryAwareMode = useAppSelector(
    (state) => state.privacy.batteryAwareMode,
  );

  const [remoteMarkers, setRemoteMarkers] = useState<MapMarker[]>([]);
  const [currentUserMarker, setCurrentUserMarker] = useState<MapMarker | null>(
    null,
  );
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
        const activeSharers: ActiveSharer[] =
          await circleService.getActiveSharers(circleId);

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
            label:
              item.userId === user?._id
                ? 'You'
                : item.name || item.email || 'Circle member',
          }));

        const me = mappedMarkers.find((item) => item.id === user?._id) || null;
        const others = mappedMarkers.filter((item) => item.id !== user?._id);

        setCurrentUserMarker((prev) => me || prev);
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
    let refreshInterval: ReturnType<typeof setInterval> | null = null;
    const sessionId = activeSession._id;
    const isOwner = activeSession.ownerUserId === user._id;
    const circleId = activeSession.circle?._id;
    const shouldPublishLocation =
      activeSession.status === 'active' && (!!circleId || isOwner);

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
        socketService.emitJoinSession(sessionId);
        setStatusText((prev) =>
          prev === 'Connecting...' ? 'Live socket connected' : prev,
        );

        if (circleId) {
          void refreshCircleSharers(circleId);
        }
      }
    });

    const unsubError = socketService.onError((payload) => {
      if (isMounted) {
        Alert.alert('Session', payload.message);
      }
    });

    const unsubUpdated = socketService.onSessionUpdated(async (payload) => {
      if (!isMounted) {
        return;
      }

      const sameSession = payload.sessionId === sessionId;
      const sameCircle =
        !!payload.circleId && !!circleId && payload.circleId === circleId;

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

    const unsubCircleChanged = socketService.onCircleActiveSharersChanged(
      async (payload) => {
        if (!isMounted || !circleId || payload.circleId !== circleId) {
          return;
        }

        await refreshCircleSharers(circleId);
      },
    );

    const unsubLocation = socketService.onSessionLocation(
      (payload: SessionLocationPayload) => {
        if (!isMounted) {
          return;
        }

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
      },
    );

    const beginParticipantTracking = async () => {
      const hasPermission = await locationService.requestPermission();

      if (!isMounted) {
        return;
      }

      if (!hasPermission) {
        setStatusText(
          'Location permission is required to update your live position',
        );
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
            if (!isMounted) {
              return;
            }

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

    if (shouldPublishLocation) {
      void beginParticipantTracking();
    }

    if (circleId) {
      refreshInterval = setInterval(() => {
        void refreshCircleSharers(circleId);
      }, 5000);
    }

    const latestLocation = activeSession.latestLocation;

    if (latestLocation && isOwner) {
      setCurrentUserMarker((prev) => {
        if (prev) {
          return prev;
        }

        return {
          id: user._id,
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
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

      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

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
    console.log("pressed")
    if (!activeSession?._id) {
      return;
    }

    if (activeSession.status === 'active') {
      await dispatch(pauseSessionThunk(activeSession._id));
      locationService.stopTracking();
      return;
    }

    await dispatch(resumeSessionThunk(activeSession._id));
  };

  const handleStop = async () => {
    if (!activeSession?._id) {
      return;
    }

    await dispatch(stopSessionThunk(activeSession._id));
    locationService.stopTracking();
    navigation.goBack();
  };

  if (!activeSession && loading) {
    return (
      <View className="flex-1 bg-light-bg dark:bg-dark-bg">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
          <View className="flex-1 items-center justify-center px-6">
            <View className="rounded-[12px] border border-light-border bg-light-card px-5 py-6 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[16px] text-light-subtext dark:text-dark-subtext">
                Loading active session...
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!activeSession) {
    return (
      <View className="flex-1 bg-light-bg dark:bg-dark-bg">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-full rounded-[14px] border border-light-border bg-light-card px-5 py-6 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                No active session found
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Start a live share to continue.
              </Text>
              <TouchableOpacity
                activeOpacity={0.92}
                className="mt-5 rounded-[10px] bg-brand-primary px-4 py-4"
                onPress={() =>
                  navigation.replace('MainTabs', {
                    screen: 'LiveShareSetup',
                  })
                }
              >
                <Text className="text-center text-[15px] font-semibold text-white">
                  Start one now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
                  Active session
                </Text>
                <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                  {activeSession.title}
                </Text>
                <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                  {statusText}
                </Text>
              </View>

              <View
                className={`rounded-full px-3 py-2 ${getStatusTone(
                  activeSession.status,
                )}`}
              >
                <Text className="text-[11px] font-semibold uppercase tracking-[1px]">
                  {activeSession.status}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="w-[31.5%] rounded-[10px] bg-light-bg px-3 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Markers
                </Text>
                <Text className="mt-2 text-[18px] font-semibold text-light-text dark:text-dark-text">
                  {markerCount}
                </Text>
              </View>

              <View className="w-[31.5%] rounded-[10px] bg-light-bg px-3 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Circle
                </Text>
                <Text className="mt-2 text-[15px] font-semibold text-light-text dark:text-dark-text">
                  {activeSession.circle?.name || 'Private'}
                </Text>
              </View>

              <View className="w-[31.5%] rounded-[10px] bg-light-bg px-3 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Mode
                </Text>
                <Text className="mt-2 text-[15px] font-semibold text-light-text dark:text-dark-text">
                  {batteryAwareMode ? 'Balanced' : 'Precise'}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 flex-1 overflow-hidden rounded-[12px] border border-light-border bg-light-card shadow-soft dark:border-dark-border dark:bg-dark-card">
            <LeafletMap
              currentUserMarker={currentUserMarker}
              otherMarkers={remoteMarkers}
            />
          </View>

          <View className="mt-5 flex-row justify-between">
            <TouchableOpacity
              activeOpacity={0.9}
              className="w-[31.5%] rounded-[10px] border border-light-border bg-light-card px-3 py-4 dark:border-dark-border dark:bg-dark-card"
              onPress={handlePauseResume}
            >
              <View className="items-center">
                <Ionicons
                  name={activeSession.status === 'active' ? 'pause' : 'play'}
                  size={18}
                  color={isDark ? '#F8FAFC' : '#0F172A'}
                />
                <Text className="mt-2 text-[14px] font-semibold text-light-text dark:text-dark-text">
                  {activeSession.status === 'active' ? 'Pause' : 'Resume'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              className="w-[31.5%] rounded-[10px] bg-brand-danger px-3 py-4"
              onPress={() => navigation.navigate('SOS', { sessionId: activeSession._id })}
            >
              <View className="items-center">
                <Ionicons name="warning" size={18} color="#FFFFFF" />
                <Text className="mt-2 text-[14px] font-semibold text-white">
                  SOS
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              className="w-[31.5%] rounded-[10px] bg-light-text px-3 py-4 dark:bg-dark-muted"
              onPress={handleStop}
            >
              <View className="items-center">
                <Ionicons name="square" size={18} color="#FFFFFF" />
                <Text className="mt-2 text-[14px] font-semibold text-white">
                  Stop
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ActiveSessionScreen;
