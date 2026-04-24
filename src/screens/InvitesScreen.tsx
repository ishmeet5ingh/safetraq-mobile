import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  acceptInviteThunk,
  declineInviteThunk,
  fetchPendingInvitesThunk,
} from '../store/slices/inviteSlice';

const InvitesScreen = () => {
  const dispatch = useAppDispatch();
  const { isDark } = useThemeContext();
  const tabBarHeight = useBottomTabBarHeight();
  const { invites, loading, error } = useAppSelector((state) => state.invites);

  useEffect(() => {
    void dispatch(fetchPendingInvitesThunk());
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
      Alert.alert(
        'Error',
        (resultAction.payload as string) || 'Failed to accept invite',
      );
    }
  };

  const handleDecline = async (inviteId: string) => {
    const resultAction = await dispatch(declineInviteThunk(inviteId));
    if (declineInviteThunk.fulfilled.match(resultAction)) {
      Alert.alert('Done', 'Invite declined');
    } else {
      Alert.alert(
        'Error',
        (resultAction.payload as string) || 'Failed to decline invite',
      );
    }
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
        <View className="px-5 pb-5 pt-4">
          <View className="rounded-[14px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
            <View className="mb-4 flex-row items-start justify-between">
              <View className="max-w-[76%]">
                <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Invite center
                </Text>
                <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                  Review new requests
                </Text>
                <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                  Approve or decline before they join.
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-[8px] bg-brand-accent">
                <Ionicons name="mail-open" size={22} color="#FFFFFF" />
              </View>
            </View>

            <View className="rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
              <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                Pending invites
              </Text>
              <Text className="mt-2 text-[20px] font-semibold text-light-text dark:text-dark-text">
                {invites.length}
              </Text>
            </View>
          </View>

          {loading ? (
            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-10 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <ActivityIndicator size="large" color="#1D4ED8" />
              <Text className="mt-4 text-center text-[14px] text-light-subtext dark:text-dark-subtext">
                Loading pending invites...
              </Text>
            </View>
          ) : invites.length === 0 ? (
            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-8 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                No pending invites
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                New requests will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={invites}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: tabBarHeight + 18,
              }}
              renderItem={({ item }) => (
                <View className="mb-4 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
                  <View className="flex-row items-start justify-between">
                    <View className="max-w-[76%]">
                      <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                        {item.circleName}
                      </Text>
                      <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                        Circle type: {item.circleType} {'\n'}Role: {item.role}
                      </Text>
                    </View>

                    <View className="rounded-full bg-light-muted px-3 py-2 dark:bg-dark-muted">
                      <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-brand-primary">
                        Pending
                      </Text>
                    </View>
                  </View>

                  <View className="mt-5 flex-row justify-between">
                    <TouchableOpacity
                      activeOpacity={0.9}
                      className="w-[48.5%] rounded-[10px] bg-brand-primary px-4 py-4"
                      onPress={() => handleAccept(item._id)}
                    >
                      <Text className="text-center text-[15px] font-semibold text-white">
                        Accept
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      className="w-[48.5%] rounded-[10px] border border-light-border bg-light-bg px-4 py-4 dark:border-dark-border dark:bg-dark-bg"
                      onPress={() => handleDecline(item._id)}
                    >
                      <Text className="text-center text-[15px] font-semibold text-light-text dark:text-dark-text">
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default InvitesScreen;
