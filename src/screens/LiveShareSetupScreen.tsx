import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import {
  BottomTabScreenProps,
  useBottomTabBarHeight,
} from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { AppStackParamList, AppTabParamList } from '../navigation/types';
import { fetchCirclesThunk } from '../store/slices/circlesSlice';
import { startSessionThunk } from '../store/slices/sessionsSlice';
import { SESSION_DURATIONS } from '../utils/constants';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'LiveShareSetup'>,
  NativeStackScreenProps<AppStackParamList>
>;

const LiveShareSetupScreen = ({ route, navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { isDark } = useThemeContext();
  const tabBarHeight = useBottomTabBarHeight();
  const { items } = useAppSelector((state) => state.circles);
  const { submitting } = useAppSelector((state) => state.sessions);
  const defaultMinutes = useAppSelector(
    (state) => state.privacy.defaultShareMinutes,
  );
  const [title, setTitle] = useState('Safe commute');
  const [selectedCircleId, setSelectedCircleId] = useState<string | undefined>(
    route.params?.preselectedCircleId,
  );
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
      navigation.navigate('ActiveSession', { sessionId: result.payload._id });
      return;
    }

    Alert.alert('Session', (result.payload as string) || 'Unable to start session');
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView
        edges={['left', 'right']}
        className="flex-1 bg-light-bg dark:bg-dark-bg"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 28 }}
        >
          <View className="px-5 pb-5 pt-4">
            <View className="rounded-[14px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="max-w-[76%]">
                  <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                    Live share setup
                  </Text>
                  <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                    Start a live session
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    Set a title, viewers, and duration.
                  </Text>
                </View>

                <View className="h-12 w-12 items-center justify-center rounded-[8px] bg-brand-primary">
                  <Ionicons name="navigate" size={22} color="#FFFFFF" />
                </View>
              </View>

              <View className="rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Sharing summary
                </Text>
                <Text className="mt-2 text-[18px] font-semibold text-light-text dark:text-dark-text">
                  {selectedCircle ? `Sharing with ${selectedCircle.name}` : 'Private self-session'}
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-light-subtext dark:text-dark-subtext">
                  Default duration: {durationMinutes} minutes
                </Text>
              </View>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Session details
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Give this share a clear title.
              </Text>

              <TextInput
                className="mt-4 rounded-[10px] border border-light-border bg-light-bg px-4 py-4 text-[15px] text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                placeholder="Session title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Choose viewers
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Pick a circle or keep it private.
              </Text>

              {items.length ? (
                items.map((circle) => {
                  const selected = circle._id === selectedCircleId;

                  return (
                    <TouchableOpacity
                      key={circle._id}
                      activeOpacity={0.9}
                      onPress={() => setSelectedCircleId(selected ? undefined : circle._id)}
                      className={`mt-4 rounded-[10px] border px-4 py-4 ${
                        selected
                          ? 'border-brand-primary bg-light-muted dark:bg-dark-muted'
                          : 'border-light-border bg-light-card dark:border-dark-border dark:bg-dark-card'
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="max-w-[72%]">
                          <Text
                            className={`text-[15px] font-semibold ${
                              selected
                                ? 'text-brand-primary'
                                : 'text-light-text dark:text-dark-text'
                            }`}
                          >
                            {circle.name}
                          </Text>
                          <Text className="mt-1 text-[13px] text-light-subtext dark:text-dark-subtext">
                            {circle.memberCount} members • {circle.type}
                          </Text>
                        </View>

                        <View
                          className={`h-10 w-10 items-center justify-center rounded-[8px] ${
                            selected ? 'bg-brand-primary' : 'bg-light-bg dark:bg-dark-bg'
                          }`}
                        >
                          <Ionicons
                            name={selected ? 'checkmark' : 'add'}
                            size={18}
                            color={selected ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569'}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('Circles')}
                  className="mt-4 rounded-[10px] bg-light-muted px-4 py-4 dark:bg-dark-muted"
                >
                  <Text className="text-[15px] font-semibold text-brand-primary">
                    No circles yet. Create one first.
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Duration
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Choose how long the share stays live.
              </Text>

              <View className="mt-4 flex-row flex-wrap">
                {SESSION_DURATIONS.map((option, index) => {
                  const selected = option.minutes === durationMinutes;

                  return (
                    <TouchableOpacity
                      key={option.label}
                      activeOpacity={0.88}
                      onPress={() => setDurationMinutes(option.minutes)}
                      className={`mb-3 mr-3 rounded-full border px-4 py-3 ${
                        selected
                          ? 'border-brand-primary bg-light-muted dark:bg-dark-muted'
                          : 'border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg'
                      } ${index === SESSION_DURATIONS.length - 1 ? 'mr-0' : ''}`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${
                          selected
                            ? 'text-brand-primary'
                            : 'text-light-subtext dark:text-dark-subtext'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                {selectedCircle
                  ? `Sharing with ${selectedCircle.name}.`
                  : 'This session is private.'}
              </Text>

              <TouchableOpacity
                activeOpacity={0.92}
                className="mt-5 rounded-[10px] bg-brand-primary px-4 py-4"
                disabled={submitting}
                onPress={handleStart}
              >
                <Text className="text-center text-[15px] font-semibold text-white">
                  {submitting ? 'Starting live session...' : 'Start live session'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default LiveShareSetupScreen;
