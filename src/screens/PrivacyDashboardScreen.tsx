import React from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  setDefaultShareMinutes,
  toggleArrivalPrompt,
  toggleAuditVisibility,
  toggleBatteryAwareMode,
} from '../store/slices/privacySlice';

const options = [15, 60, 240];

const PrivacyDashboardScreen = () => {
  const dispatch = useAppDispatch();
  const { isDark } = useThemeContext();
  const tabBarHeight = useBottomTabBarHeight();
  const privacy = useAppSelector((state) => state.privacy);

  const switchTrackColor = {
    false: isDark ? '#334155' : '#CBD5E1',
    true: '#1D4ED8',
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
                    Privacy controls
                  </Text>
                  <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                    Clear defaults. Safer sharing.
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    Control how new sessions start.
                  </Text>
                </View>

                <View className="h-12 w-12 items-center justify-center rounded-[8px] bg-brand-secondary">
                  <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
                </View>
              </View>

              <View className="rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                  Default session duration
                </Text>
                <Text className="mt-2 text-[20px] font-semibold text-light-text dark:text-dark-text">
                  {privacy.defaultShareMinutes} min
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-light-subtext dark:text-dark-subtext">
                  Used for new shares.
                </Text>
              </View>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Share defaults
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Pick your usual share length.
              </Text>

              <View className="mt-4 flex-row flex-wrap">
                {options.map((minutes, index) => {
                  const selected = privacy.defaultShareMinutes === minutes;

                  return (
                    <TouchableOpacity
                      key={minutes}
                      activeOpacity={0.88}
                      onPress={() => {
                        dispatch(setDefaultShareMinutes(minutes));
                      }}
                      className={`mb-3 mr-3 rounded-full border px-4 py-3 ${
                        selected
                          ? 'border-brand-primary bg-light-muted dark:bg-dark-muted'
                          : 'border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg'
                      } ${index === options.length - 1 ? 'mr-0' : ''}`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${
                          selected
                            ? 'text-brand-primary'
                            : 'text-light-subtext dark:text-dark-subtext'
                        }`}
                      >
                        {minutes} min
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-2 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="pb-3 pt-3 text-[18px] font-semibold text-light-text dark:text-dark-text">
                Session behavior
              </Text>

              <View className="border-b border-light-border py-4 dark:border-dark-border">
                <View className="flex-row items-start justify-between">
                  <View className="max-w-[78%]">
                    <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                      Battery-aware mode
                    </Text>
                    <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                      Reduce battery use on longer sessions.
                    </Text>
                  </View>

                  <Switch
                    value={privacy.batteryAwareMode}
                    onValueChange={() => {
                      dispatch(toggleBatteryAwareMode());
                    }}
                    trackColor={switchTrackColor}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={isDark ? '#334155' : '#CBD5E1'}
                  />
                </View>
              </View>

              <View className="border-b border-light-border py-4 dark:border-dark-border">
                <View className="flex-row items-start justify-between">
                  <View className="max-w-[78%]">
                    <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                      Arrival prompt
                    </Text>
                    <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                      Confirm when a trip ends.
                    </Text>
                  </View>

                  <Switch
                    value={privacy.arrivalPromptEnabled}
                    onValueChange={() => {
                      dispatch(toggleArrivalPrompt());
                    }}
                    trackColor={switchTrackColor}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={isDark ? '#334155' : '#CBD5E1'}
                  />
                </View>
              </View>

              <View className="py-4">
                <View className="flex-row items-start justify-between">
                  <View className="max-w-[78%]">
                    <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                      Audit visibility
                    </Text>
                    <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                      Keep session viewing visible.
                    </Text>
                  </View>

                  <Switch
                    value={privacy.allowAuditVisibility}
                    onValueChange={() => {
                      dispatch(toggleAuditVisibility());
                    }}
                    trackColor={switchTrackColor}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={isDark ? '#334155' : '#CBD5E1'}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PrivacyDashboardScreen;
