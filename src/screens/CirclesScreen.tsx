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
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useThemeContext } from '../context/ThemeContext';
import { AppStackParamList, AppTabParamList } from '../navigation/types';
import { CircleType } from '../types/circle';
import {
  createCircleThunk,
  fetchCirclesThunk,
} from '../store/slices/circlesSlice';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Circles'>,
  NativeStackScreenProps<AppStackParamList>
>;

const circleTypes: CircleType[] = ['family', 'partner', 'friends', 'team'];

const getCircleTypeClasses = (type: CircleType) => {
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

const getCircleTypeLabel = (type: CircleType) => {
  switch (type) {
    case 'family':
      return 'Family';
    case 'partner':
      return 'Partner';
    case 'friends':
      return 'Friends';
    case 'team':
      return 'Team';
    default:
      return 'Circle';
  }
};

const CirclesScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { isDark } = useThemeContext();
  const tabBarHeight = useBottomTabBarHeight();
  const { items, loading, submitting, error } = useAppSelector(
    (state) => state.circles,
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CircleType>('family');

  useEffect(() => {
    void dispatch(fetchCirclesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Circles', error);
    }
  }, [error]);

  const totalMembers = useMemo(() => {
    return items.reduce((count, circle) => count + circle.memberCount, 0);
  }, [items]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Circle name is required');
      return;
    }

    const result = await dispatch(
      createCircleThunk({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
      }),
    );

    if (createCircleThunk.fulfilled.match(result)) {
      setName('');
      setDescription('');
      navigation.navigate('CircleDetail', { circleId: result.payload._id });
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 28 }}
        >
          <View className="px-5 pb-5 pt-4">
            <View className="rounded-[14px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="max-w-[74%]">
                  <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                    Trusted circles
                  </Text>
                  <Text className="mt-2 text-[24px] font-semibold leading-[29px] text-light-text dark:text-dark-text">
                    Keep the right people close
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    Build private groups for each share.
                  </Text>
                </View>

                <View className="h-12 w-12 items-center justify-center rounded-[8px] bg-brand-primary">
                  <Ionicons name="people" size={22} color="#FFFFFF" />
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="w-[48.5%] rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                    Circles
                  </Text>
                  <Text className="mt-2 text-[20px] font-semibold text-light-text dark:text-dark-text">
                    {items.length}
                  </Text>
                </View>

                <View className="w-[48.5%] rounded-[10px] bg-light-bg px-4 py-4 dark:bg-dark-bg">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                    Members
                  </Text>
                  <Text className="mt-2 text-[20px] font-semibold text-light-text dark:text-dark-text">
                    {totalMembers}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                Create a circle
              </Text>
              <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                Create one small, focused group.
              </Text>

              <TextInput
                className="mt-4 rounded-[10px] border border-light-border bg-light-bg px-4 py-4 text-[15px] text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                placeholder="Circle name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />

              <TextInput
                className="mt-3 min-h-[100px] rounded-[10px] border border-light-border bg-light-bg px-4 py-4 text-[15px] text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                multiline
                textAlignVertical="top"
              />

              <Text className="mt-5 text-[13px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                Circle type
              </Text>
              <View className="mt-3 flex-row flex-wrap">
                {circleTypes.map((item, index) => {
                  const selected = item === type;

                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.88}
                      onPress={() => setType(item)}
                      className={`mb-3 mr-3 rounded-full border px-4 py-3 ${
                        selected
                          ? 'border-brand-primary bg-light-muted dark:bg-dark-muted'
                          : 'border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg'
                      } ${index === circleTypes.length - 1 ? 'mr-0' : ''}`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${
                          selected
                            ? 'text-brand-primary'
                            : 'text-light-subtext dark:text-dark-subtext'
                        }`}
                      >
                        {getCircleTypeLabel(item)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.92}
                className="mt-2 rounded-[10px] bg-brand-primary px-4 py-4"
                disabled={submitting}
                onPress={handleCreate}
              >
                <Text className="text-center text-[15px] font-semibold text-white">
                  {submitting ? 'Creating circle...' : 'Create trusted circle'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5 rounded-[12px] border border-light-border bg-light-card px-5 py-5 shadow-soft dark:border-dark-border dark:bg-dark-card">
              <View className="flex-row items-start justify-between">
                <View className="max-w-[76%]">
                  <Text className="text-[18px] font-semibold text-light-text dark:text-dark-text">
                    Your groups
                  </Text>
                  <Text className="mt-1 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    {loading
                      ? 'Refreshing circles.'
                      : 'Open a circle to manage members and shares.'}
                  </Text>
                </View>

                <View className="rounded-full bg-light-muted px-3 py-2 dark:bg-dark-muted">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                    {items.length} total
                  </Text>
                </View>
              </View>

              {items.length ? (
                items.map((circle, index) => (
                  <TouchableOpacity
                    key={circle._id}
                    activeOpacity={0.9}
                    onPress={() =>
                      navigation.navigate('CircleDetail', {
                        circleId: circle._id,
                      })
                    }
                    className={`mt-4 rounded-[10px] border border-light-border px-4 py-4 dark:border-dark-border ${
                      index === items.length - 1 ? '' : ''
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className={`mr-3 h-12 w-12 items-center justify-center rounded-[8px] ${getCircleTypeClasses(circle.type)}`}
                        >
                          <Text className="text-[14px] font-semibold text-white">
                            {circle.name.slice(0, 1).toUpperCase()}
                          </Text>
                        </View>

                        <View className="max-w-[72%]">
                          <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                            {circle.name}
                          </Text>
                          <Text className="mt-1 text-[13px] text-light-subtext dark:text-dark-subtext">
                            {circle.memberCount} members
                            {circle.description ? ` • ${circle.description}` : ''}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end">
                        <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-light-subtext dark:text-dark-subtext">
                          {getCircleTypeLabel(circle.type)}
                        </Text>
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
                <View className="mt-4 rounded-[10px] bg-light-muted px-4 py-4 dark:bg-dark-muted">
                  <Text className="text-[15px] font-semibold text-light-text dark:text-dark-text">
                    No circles yet
                  </Text>
                  <Text className="mt-2 text-[14px] leading-6 text-light-subtext dark:text-dark-subtext">
                    Create your first circle above.
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

export default CirclesScreen;
