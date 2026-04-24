import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../context/ThemeContext';
import { AppStackParamList } from '../navigation/types';
import sosService from '../services/sos.service';
import locationService from '../services/location.service';

type Props = NativeStackScreenProps<AppStackParamList, 'SOS'>;

const SOSScreen = ({ route, navigation }: Props) => {
  const { isDark } = useThemeContext();
  const [message, setMessage] = useState(
    'I need help. Please check my live location.',
  );
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const location = await locationService.getCurrentLocation().catch(() => null);

      await sosService.trigger({
        sessionId: route.params?.sessionId,
        message: message.trim() || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      Alert.alert('SOS sent', 'Emergency alert sent to allowed viewers.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ||
          error.message
        : error instanceof Error
          ? error.message
          : 'Unable to send SOS';

      Alert.alert(
        'SOS',
        message,
      );
    } finally {
      setLoading(false);
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
        edges={['left', 'right', 'bottom']}
        className="flex-1 bg-light-bg dark:bg-dark-bg"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 36 }}
        >
          <View className="px-5 pb-5 pt-4">
            <View className="rounded-[14px] border border-red-200 bg-light-card px-5 py-5 shadow-soft dark:border-red-500/25 dark:bg-dark-card">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="max-w-[76%]">
                  <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-brand-danger">
                    Emergency alert
                  </Text>
                  <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                    Send an SOS alert
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    Share your latest location and note.
                  </Text>
                </View>

                <View className="h-12 w-12 items-center justify-center rounded-[8px] bg-brand-danger">
                  <Ionicons name="warning" size={22} color="#FFFFFF" />
                </View>
              </View>

              <View className="rounded-[10px] bg-red-50 px-4 py-4 dark:bg-red-500/10">
                <Text className="text-[13px] font-semibold text-brand-danger">
                  Use only for urgent help.
                </Text>
              </View>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Alert message
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Add a short note if needed.
              </Text>

              <TextInput
                className="mt-4 min-h-[140px] rounded-[10px] border border-red-200 bg-red-50 px-4 py-4 text-[15px] text-light-text dark:border-red-500/25 dark:bg-red-500/10 dark:text-dark-text"
                multiline
                value={message}
                onChangeText={setMessage}
                placeholder="Add a quick note"
                placeholderTextColor={isDark ? '#94A3B8' : '#94A3B8'}
                textAlignVertical="top"
              />

              <TouchableOpacity
                activeOpacity={0.92}
                className="mt-5 rounded-[10px] bg-brand-danger px-4 py-4"
                disabled={loading}
                onPress={handleSend}
              >
                <Text className="text-center text-[15px] font-semibold text-white">
                  {loading ? 'Sending SOS...' : 'Send SOS now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SOSScreen;
