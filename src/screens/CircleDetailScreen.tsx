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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';
import { AppStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchCircleDetailThunk,
  inviteCircleMemberThunk,
} from '../store/slices/circlesSlice';

type Props = NativeStackScreenProps<AppStackParamList, 'CircleDetail'>;

const getCircleTypeColorClass = (type?: string) => {
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

const CircleDetailScreen = ({ route, navigation }: Props) => {
  const { circleId } = route.params;
  const dispatch = useAppDispatch();
  const { isDark } = useThemeContext();
  const { currentCircle, loading, submitting, error } = useAppSelector(
    (state) => state.circles,
  );
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
      Alert.alert(
        'Invite created',
        'Member has been added as active or pending based on availability.',
      );
    }
  };

  if (!circle && loading) {
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
                Loading circle...
              </Text>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 36 }}
        >
          <View className="px-5 pb-5 pt-4">
            <View className="rounded-[14px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="max-w-[76%]">
                  <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                    Circle overview
                  </Text>
                  <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                    {circle?.name || 'Circle'}
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    {circle?.description || 'A private group for live sharing.'}
                  </Text>
                </View>

                <View
                  className={`h-12 w-12 items-center justify-center rounded-[8px] ${getCircleTypeColorClass(
                    circle?.type,
                  )}`}
                >
                  <Text className="text-[15px] font-semibold text-white">
                    {(circle?.name || 'C').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              </View>

              <View className="rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Circle details
                </Text>
                <Text className="mt-2 text-[18px] font-semibold capitalize text-light-text dark:text-dark-text">
                  {circle?.type || 'circle'} • {circle?.memberCount || 0} members
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.92}
                className="mt-5 rounded-[10px] bg-brand-primary px-4 py-4"
                onPress={() =>
                  navigation.navigate('MainTabs', {
                    screen: 'LiveShareSetup',
                    params: { preselectedCircleId: circleId },
                  })
                }
              >
                <Text className="text-center text-[15px] font-semibold text-white">
                  Share with this circle
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Invite a member
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Invite someone by email.
              </Text>

              <TextInput
                className="mt-4 rounded-[10px] border border-light-border bg-light-bg px-4 py-4 text-[15px] text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                placeholder="friend@example.com"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TouchableOpacity
                activeOpacity={0.92}
                className="mt-4 rounded-[10px] border border-light-border bg-light-bg px-4 py-4 dark:border-dark-border dark:bg-dark-bg"
                disabled={submitting}
                onPress={handleInvite}
              >
                <Text className="text-center text-[15px] font-semibold text-light-text dark:text-dark-text">
                  {submitting ? 'Sending invite...' : 'Send invite'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Members
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                People in this circle.
              </Text>

              {circle?.members?.length ? (
                circle.members.map((member) => (
                  <View
                    key={member._id}
                    className="mt-4 rounded-[10px] border border-light-border px-4 py-4 dark:border-dark-border"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="max-w-[74%]">
                        <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                          {member.name || member.invitedEmail}
                        </Text>
                        <Text className="mt-1 text-[13px] leading-5 text-light-subtext dark:text-dark-subtext">
                          {member.email}
                        </Text>
                        <Text className="mt-2 text-[13px] capitalize text-light-subtext dark:text-dark-subtext">
                          {member.role} • {member.status}
                        </Text>
                      </View>

                      <View className="rounded-full bg-light-muted px-3 py-2 dark:bg-dark-muted">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-brand-primary">
                          {member.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="mt-4 rounded-[10px] bg-light-muted px-4 py-4 dark:bg-dark-muted">
                  <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                    No members yet
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default CircleDetailScreen;
