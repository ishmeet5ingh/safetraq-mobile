import React from 'react';
import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

const LANDING_IMAGE =
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80';
const APP_LOGO = require('../../assets/branding/generated/safetraq-logo.svg.png');

const LandingScreen = ({ navigation }: Props) => {
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        className="flex-1 bg-light-card dark:bg-dark-card"
      >
        <View className="flex-1 bg-light-card dark:bg-dark-card">
          <View className="flex-1 overflow-hidden bg-brand-primary dark:bg-dark-surface">
            <View className="flex-1 overflow-hidden rounded-b-[36px]">
              <ImageBackground
                source={{ uri: LANDING_IMAGE }}
                resizeMode="cover"
                style={StyleSheet.absoluteFillObject}
                imageStyle={styles.heroImage}
              />

              <View className="flex-1 justify-between rounded-b-[36px] bg-light-overlay px-6 pb-20 pt-14 dark:bg-dark-overlay">
                <View className="flex-row items-start justify-between">
                  <View className="self-start rounded-full border border-light-badgeBorder bg-light-badge px-4 py-2 dark:border-dark-badgeBorder dark:bg-dark-badge">
                    <Text className="text-[11px] font-extrabold tracking-[1px] text-light-heroText dark:text-dark-heroText">
                      PERSONAL SAFETY • LIVE TRACKING
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={toggleTheme}
                    className="rounded-full border border-light-badgeBorder bg-light-badge px-4 py-2 dark:border-dark-badgeBorder dark:bg-dark-badge"
                  >
                    <Text className="text-[12px] font-bold text-light-heroText dark:text-dark-heroText">
                      {isDark ? 'Light' : 'Dark'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-6">
                  <Text className="text-[34px] font-extrabold leading-10 text-light-heroText dark:text-dark-heroText">
                    Stay connected.
                  </Text>
                  <Text className="text-[34px] font-extrabold leading-10 text-light-heroText dark:text-dark-heroText">
                    Stay protected.
                  </Text>
                  <Text className="mt-4 w-[88%] text-[15px] leading-6 text-light-heroSubtext dark:text-dark-heroSubtext">
                    Live location sharing, trusted circles, and safer journeys with
                    SafeTraq.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            className="-mt-11 mb-4 rounded-[28px] bg-light-card px-6 pb-6 pt-6 dark:bg-dark-card"
          >
            <View className="mb-4 flex-row items-center">
              <Image
                source={APP_LOGO}
                resizeMode="contain"
                className="h-14 w-14 rounded-[14px]"
              />
              <Text className="ml-3 text-3xl font-extrabold tracking-[0.2px] text-brand-primary">
                SafeTraq
              </Text>
            </View>

            <Text className=" text-2xl font-extrabold leading-9 text-light-text dark:text-dark-text">
              Personal safety built for real life
            </Text>

            <Text className="mt-3 text-center text-[15px] leading-6 text-light-subtext dark:text-dark-subtext">
              Create trusted circles, start live sharing anytime, and let the
              right people follow your journey in real time.
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              className="mt-6 h-14 items-center justify-center rounded-2xl bg-brand-primary"
              onPress={() => navigation.navigate('Auth', { mode: 'register' })}
            >
              <Text className="text-[17px] font-extrabold text-white">
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              className="mt-3 h-14 items-center justify-center rounded-2xl border border-light-border bg-light-surface dark:border-dark-border dark:bg-dark-surface"
              onPress={() => navigation.navigate('Auth', { mode: 'login' })}
            >
              <Text className="text-[15px] font-bold text-light-text dark:text-dark-text">
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  heroImage: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

});

export default LandingScreen;
