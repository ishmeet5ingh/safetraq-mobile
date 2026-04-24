import React from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';

const AuthLoaderScreen = () => {
  const { isDark } = useThemeContext();

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-[320px] rounded-[14px] border border-light-border bg-light-card px-6 py-8 shadow-soft dark:border-dark-border dark:bg-dark-card">
            <View className="h-14 w-14 items-center justify-center rounded-[10px] bg-brand-primary">
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>

            <Text className="mt-5 text-[20px] font-semibold text-light-text dark:text-dark-text">
              Loading SafeTraq
            </Text>
            <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
              Restoring your session.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AuthLoaderScreen;
