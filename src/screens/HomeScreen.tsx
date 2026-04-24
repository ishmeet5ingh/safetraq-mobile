import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BottomTabScreenProps,
  useBottomTabBarHeight,
} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useThemeContext } from '../context/ThemeContext';
import { AppStackParamList, AppTabParamList } from '../navigation/types';
import { logoutThunk } from '../store/slices/authSlice';
import { fetchCirclesThunk } from '../store/slices/circlesSlice';
import { fetchPendingInvitesThunk } from '../store/slices/inviteSlice';
import { fetchActiveSessionThunk } from '../store/slices/sessionsSlice';
import { CircleType } from '../types/circle';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  iconBgClassName: string;
};

type QuickActionProps = {
  title: string;
  subtitle: string;
  icon: string;
  iconBgClassName: string;
  onPress: () => void;
};

const StatCard = ({ label, value, icon, iconBgClassName }: StatCardProps) => {
  return (
    <View className="w-[31.5%] rounded-[10px] border border-light-border bg-light-card px-3 py-4 dark:border-dark-border dark:bg-dark-card">
      <View
        className={`mb-4 h-10 w-10 items-center justify-center rounded-[8px] ${iconBgClassName}`}
      >
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>

      <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
        {label}
      </Text>
      <Text className="mt-2 text-[20px] font-semibold text-light-text dark:text-dark-text">
        {value}
      </Text>
    </View>
  );
};

const QuickActionCard = ({
  title,
  subtitle,
  icon,
  iconBgClassName,
  onPress,
}: QuickActionProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-3 w-[48.3%] rounded-[10px] border border-light-border bg-light-card px-4 py-4 shadow-soft dark:border-dark-border dark:bg-dark-card"
    >
      <View
        className={`mb-5 h-11 w-11 items-center justify-center rounded-[8px] ${iconBgClassName}`}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>

      <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
        {title}
      </Text>
      <Text className="mt-2 text-[13px] leading-5 text-light-subtext dark:text-dark-subtext">
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

const getCircleTypeClassName = (type: CircleType) => {
  switch (type) {
    case 'family':
      return 'bg-brand-primary';
    case 'partner':
      return 'bg-brand-secondary';
    case 'friends':
      return 'bg-brand-accent';
    case 'team':
      return 'bg-brand-warning';
    default:
      return 'bg-brand-primary';
  }
};

const formatSessionTime = (expiresAt?: string) => {
  if (!expiresAt) {
    return 'No automatic end time';
  }

  return new Date(expiresAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const HomeScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { isDark, activeTheme, setThemeMode } = useThemeContext();
  const tabBarHeight = useBottomTabBarHeight();

  const { user } = useAppSelector((state) => state.auth);
  const { items: circles } = useAppSelector((state) => state.circles);
  const { activeSession } = useAppSelector((state) => state.sessions);
  const { invites } = useAppSelector((state) => state.invites);

  useEffect(() => {
    void dispatch(fetchCirclesThunk());
    void dispatch(fetchActiveSessionThunk());
    void dispatch(fetchPendingInvitesThunk());
  }, [dispatch]);

  const firstName = useMemo(() => {
    return user?.name?.split(' ')[0] || 'there';
  }, [user?.name]);

  const initials = useMemo(() => {
    const letters = user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    return letters || 'ST';
  }, [user?.name]);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
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
          <View className="px-5 pb-4 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="max-w-[74%]">
                <Text className="text-[13px] font-medium uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Safety Control Center
                </Text>
                <Text className="mt-2 text-[28px] font-semibold leading-[32px] text-light-text dark:text-dark-text">
                  Good evening, {firstName}
                </Text>
                <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                  Live share, circles, and privacy in one place.
                </Text>
              </View>

              <View className="items-end">
                <View className="mb-3 flex-row rounded-[10px] border border-light-border bg-light-card p-1 shadow-soft dark:border-dark-border dark:bg-dark-card">
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      void setThemeMode('light');
                    }}
                    className={`h-10 w-10 items-center justify-center rounded-[8px] ${
                      activeTheme === 'light'
                        ? 'bg-brand-primary'
                        : 'bg-transparent'
                    }`}
                  >
                    <Ionicons
                      name="sunny"
                      size={18}
                      color={activeTheme === 'light' ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      void setThemeMode('dark');
                    }}
                    className={`ml-1 h-10 w-10 items-center justify-center rounded-[8px] ${
                      activeTheme === 'dark'
                        ? 'bg-brand-primary'
                        : 'bg-transparent'
                    }`}
                  >
                    <Ionicons
                      name="moon"
                      size={18}
                      color={activeTheme === 'dark' ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569'}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => Alert.alert('Profile', JSON.stringify(user, null, 2))}
                  className="h-14 w-14 items-center justify-center rounded-[10px] border border-light-border bg-light-card shadow-soft dark:border-dark-border dark:bg-dark-card"
                >
                  <Text className="text-[15px] font-semibold text-brand-primary">
                    {initials}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="overflow-hidden rounded-[14px] border border-light-border bg-light-card px-5 pb-5 pt-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <View className="absolute -right-12 -top-10 h-32 w-32 rounded-full bg-light-muted dark:bg-dark-muted" />
              <View className="absolute right-12 top-16 h-20 w-20 rounded-full bg-light-muted dark:bg-dark-muted" />

              <View className="mb-4 flex-row items-start justify-between">
                <View className="rounded-full bg-light-muted px-3 py-2 dark:bg-dark-muted">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-brand-primary">
                    Daily overview
                  </Text>
                </View>

                <View
                  className={`rounded-full px-3 py-2 ${
                    activeSession ? 'bg-green-100 dark:bg-green-500/15' : 'bg-light-muted dark:bg-dark-muted'
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      activeSession ? 'text-brand-live' : 'text-light-subtext dark:text-dark-subtext'
                    }`}
                  >
                    {activeSession ? 'Live protection on' : 'Standby protection'}
                  </Text>
                </View>
              </View>

              <Text className="max-w-[84%] text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                Clear safety for every trip.
              </Text>

              <Text className="mt-3 max-w-[92%] text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Check status, circles, and privacy fast.
              </Text>

              <View className="mt-5 flex-row items-center rounded-[10px] border border-light-border bg-light-bg px-4 py-4 dark:border-dark-border dark:bg-dark-bg">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-[8px] bg-brand-primary">
                  <Ionicons
                    name={activeSession ? 'radio' : 'shield-checkmark'}
                    size={22}
                    color="#FFFFFF"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                    Current state
                  </Text>
                  <Text className="mt-1 text-[16px] font-semibold text-light-text dark:text-dark-text">
                    {activeSession ? activeSession.title : 'No active share right now'}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-light-subtext dark:text-dark-subtext">
                    {activeSession
                      ? `Ends at ${formatSessionTime(activeSession.expiresAt)}`
                      : 'Start a share when you need it.'}
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row justify-between">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    activeSession
                      ? navigation.navigate('ActiveSession', {
                          sessionId: activeSession._id,
                        })
                      : navigation.navigate('LiveShareSetup')
                  }
                  className="w-[48.5%] rounded-[10px] bg-brand-primary px-4 py-4"
                >
                  <Text className="text-[15px] font-semibold text-white">
                    {activeSession ? 'Open live session' : 'Start live share'}
                  </Text>
                  <Text className="mt-1 text-[12px] leading-5 text-white/80">
                    {activeSession
                      ? 'Open map and controls'
                      : 'Start a new session'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('SOS')}
                  className="w-[48.5%] rounded-[10px] border border-light-border bg-light-bg px-4 py-4 dark:border-dark-border dark:bg-dark-bg"
                >
                  <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                    Emergency SOS
                  </Text>
                  <Text className="mt-1 text-[12px] leading-5 text-light-subtext dark:text-dark-subtext">
                    Send an alert fast
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-5 flex-row justify-between">
              <StatCard
                label="Circles"
                value={`${circles.length}`}
                icon="people"
                iconBgClassName="bg-brand-primary"
              />
              <StatCard
                label="Invites"
                value={`${invites.length}`}
                icon="mail"
                iconBgClassName="bg-brand-accent"
              />
              <StatCard
                label="Status"
                value={activeSession ? 'Live' : 'Ready'}
                icon={activeSession ? 'pulse' : 'shield-half'}
                iconBgClassName={activeSession ? 'bg-brand-live' : 'bg-brand-secondary'}
              />
            </View>

            {invites.length > 0 ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Invites')}
                className="mt-5 rounded-[12px] border border-amber-200 bg-amber-50 px-5 py-5 shadow-soft dark:border-amber-500/20 dark:bg-dark-card"
              >
                <View className="flex-row items-start justify-between">
                  <View className="max-w-[82%]">
                    <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-amber-700 dark:text-amber-300">
                      Invite queue
                    </Text>
                    <Text className="mt-2 text-[18px] font-semibold text-amber-950 dark:text-dark-text">
                      {invites.length} request{invites.length > 1 ? 's' : ''} waiting
                    </Text>
                    <Text className="mt-2 text-[14px] leading-6 text-amber-800 dark:text-dark-subtext">
                      Review before they join.
                    </Text>
                  </View>

                  <View className="h-12 w-12 items-center justify-center rounded-[8px] bg-brand-warning">
                    <Ionicons name="mail-open-outline" size={22} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            ) : null}

            <View className="mt-6 flex-row items-center justify-between">
              <View>
                <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                  Quick actions
                </Text>
                <Text className="mt-1 text-[14px] text-light-subtext dark:text-dark-subtext">
                  Your main actions.
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              <QuickActionCard
                title="Live Share"
                subtitle="Start or manage a session."
                icon="navigate"
                iconBgClassName="bg-brand-primary"
                onPress={() => navigation.navigate('LiveShareSetup')}
              />
              <QuickActionCard
                title="Trusted Circles"
                subtitle="Manage your groups."
                icon="people"
                iconBgClassName="bg-brand-secondary"
                onPress={() => navigation.navigate('Circles')}
              />
              <QuickActionCard
                title="Invites"
                subtitle="Review requests."
                icon="mail"
                iconBgClassName="bg-brand-accent"
                onPress={() => navigation.navigate('Invites')}
              />
              <QuickActionCard
                title="Privacy"
                subtitle="Manage privacy settings."
                icon="shield-checkmark"
                iconBgClassName="bg-brand-live"
                onPress={() => navigation.navigate('PrivacyDashboard')}
              />
            </View>

            <View className="mt-2 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                    Trusted circles
                  </Text>
                  <Text className="mt-1 text-[14px] text-light-subtext dark:text-dark-subtext">
                    Your sharing groups.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Circles')}
                >
                  <Text className="text-[14px] font-semibold text-brand-primary">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {circles.length > 0 ? (
                circles.slice(0, 3).map((circle, index) => (
                  <TouchableOpacity
                    key={circle._id}
                    activeOpacity={0.88}
                    onPress={() =>
                      navigation.navigate('CircleDetail', {
                        circleId: circle._id,
                      })
                    }
                    className={`rounded-[10px] border border-light-border px-4 py-4 dark:border-dark-border ${
                      index < circles.slice(0, 3).length - 1
                        ? 'mb-3'
                        : ''
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className={`mr-3 h-12 w-12 items-center justify-center rounded-[8px] ${getCircleTypeClassName(circle.type)}`}
                        >
                          <Text className="text-[14px] font-semibold text-white">
                            {circle.name.slice(0, 1).toUpperCase()}
                          </Text>
                        </View>

                        <View>
                          <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                            {circle.name}
                          </Text>
                          <Text className="mt-1 text-[13px] text-light-subtext dark:text-dark-subtext">
                            {circle.memberCount} members
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View className="mr-3 rounded-full bg-light-muted px-3 py-2 dark:bg-dark-muted">
                          <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                            {circle.type}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={isDark ? '#94A3B8' : '#475569'}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="rounded-[10px] bg-light-muted px-4 py-4 dark:bg-dark-muted">
                  <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                    Build your first circle
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    Create a circle to share faster.
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                Account
              </Text>
              <Text className="mt-2 text-[18px] font-semibold text-light-text dark:text-dark-text">
                {user?.name || 'SafeTraq member'}
              </Text>
              <Text className="mt-1 text-[14px] text-light-subtext dark:text-dark-subtext">
                {user?.email || 'No email available'}
              </Text>

              <View className="mt-4 flex-row justify-between">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => Alert.alert('Profile', JSON.stringify(user, null, 2))}
                  className="w-[48.5%] rounded-[10px] border border-light-border bg-light-bg px-4 py-4 dark:border-dark-border dark:bg-dark-bg"
                >
                  <Text className="text-[14px] font-semibold text-light-text dark:text-dark-text">
                    View details
                  </Text>
                  <Text className="mt-1 text-[12px] leading-5 text-light-subtext dark:text-dark-subtext">
                    View your profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleLogout}
                  className="w-[48.5%] rounded-[10px] bg-brand-danger px-4 py-4"
                >
                  <Text className="text-[14px] font-semibold text-white">
                    Logout
                  </Text>
                  <Text className="mt-1 text-[12px] leading-5 text-white/80">
                    Sign out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
