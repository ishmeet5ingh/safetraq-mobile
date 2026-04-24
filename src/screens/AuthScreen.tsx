import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginThunk, registerThunk } from '../store/slices/authSlice';
import { AuthMode, AuthStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<AuthStackParamList, 'Auth'>;

type AuthInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'next' | 'go';
  rightText?: string;
  onRightPress?: () => void;
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
};

const AUTH_IMAGE =
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=80';

const HERO_HEIGHT = 420;

const AuthInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  returnKeyType = 'next',
  rightText,
  onRightPress,
  onSubmitEditing,
  inputRef,
}: AuthInputProps) => {
  return (
    <View className="mb-3">
      <Text className="mb-2 text-[13px] font-semibold text-light-text dark:text-dark-text">
        {label}
      </Text>

      <View className="min-h-14 flex-row items-center rounded-2xl border border-light-border bg-light-surface dark:border-dark-border dark:bg-dark-surface">
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          className="flex-1 px-4 py-4 text-[15px] text-light-text dark:text-dark-text"
        />

        {rightText ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRightPress}
            className="px-3 py-2"
          >
            <Text className="text-[13px] font-semibold text-brand-primary">
              {rightText}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const AuthScreen = ({ navigation, route }: Props) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<AuthMode>(route.params?.mode ?? 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (route.params?.mode) {
      setMode(route.params.mode);
    }
  }, [route.params?.mode]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (e) => {
      const kbHeight = e.endCoordinates.height;
      setKeyboardHeight(kbHeight);

      setTimeout(() => {
        const focused = TextInput.State.currentlyFocusedInput();
        if (!focused) return;

        focused.measureLayout(
          scrollViewRef.current as any,
          (_x, y, _w, h) => {
            scrollViewRef.current?.scrollTo({
              y: y - h - 24,
              animated: true,
            });
          },
          () => { },
        );
      }, 100);
    });

    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const heroHeading = useMemo(() => {
    return mode === 'login'
      ? 'Log in and stay connected to your trusted circle.'
      : 'Create your SafeTraq account and simplify personal safety.';
  }, [mode]);

  const heroSubheading = useMemo(() => {
    return mode === 'login'
      ? 'Secure access to live sharing, travel safety, and real-time monitoring.'
      : 'Start with circles, real-time sessions, and scalable safety features.';
  }, [mode]);

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [HERO_HEIGHT / 2, 0, -HERO_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const overlayOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.6],
    outputRange: [0.8, 0.96],
    extrapolate: 'clamp',
  });

  const eyebrowTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, 90],
    extrapolate: 'clamp',
  });

  const heroTextTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, 120],
    extrapolate: 'clamp',
  });

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        Alert.alert('Validation', 'Please fill all fields');
        return;
      }

      const resultAction = await dispatch(
        registerThunk({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      );

      if (registerThunk.rejected.match(resultAction)) {
        Alert.alert(
          'Register Failed',
          (resultAction.payload as string) || 'Unable to register',
        );
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter email and password');
      return;
    }

    const resultAction = await dispatch(
      loginThunk({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      }),
    );

    if (loginThunk.rejected.match(resultAction)) {
      Alert.alert(
        'Login Failed',
        (resultAction.payload as string) || 'Unable to login',
      );
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    Keyboard.dismiss();
    setMode(nextMode);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.ScrollView
          ref={scrollViewRef as any}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: keyboardHeight,
          }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          className="bg-light-card dark:bg-dark-card"
        >
          {/* ── Hero ── */}
          <View
            className="overflow-hidden rounded-b-[34px]"
            style={{ height: HERO_HEIGHT }}
          >
            <Animated.Image
              source={{ uri: AUTH_IMAGE }}
              resizeMode="cover"
              style={{
                position: 'absolute',
                top: -(HERO_HEIGHT * 0.3),
                left: 0,
                right: 0,
                height: HERO_HEIGHT * 1.6,
                transform: [{ translateY: imageTranslateY }],
              }}
            />

            <Animated.View
              className="absolute inset-0 rounded-b-[34px] bg-light-overlay dark:bg-dark-overlay"
              style={{ opacity: overlayOpacity }}
            />

            <View className="absolute left-5 right-5 top-0 z-10 pt-14">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Landing')}
                className="self-end flex-row items-center rounded-full border border-light-badgeBorder bg-light-badge px-4 py-2 dark:border-dark-badgeBorder dark:bg-dark-badge"
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginLeft: 6 }}
                />
                <Text className="text-[13px] font-semibold text-light-heroText dark:text-dark-heroText">
                  Back
                </Text>


              </TouchableOpacity>
            </View>
            <Animated.Text
              className="absolute left-5 top-[68px] z-[5] text-[12px] font-extrabold tracking-[1.4px] text-light-heroText dark:text-dark-heroText"
              style={{ transform: [{ translateY: eyebrowTranslateY }] }}
            >
              SAFE TRAQ
            </Animated.Text>

            <Animated.View
              className="absolute bottom-[88px] left-5 right-5 z-[5]"
              style={{ transform: [{ translateY: heroTextTranslateY }] }}
            >
              <Text className="max-w-[92%] text-[32px] font-extrabold leading-[39px] text-light-heroText dark:text-dark-heroText">
                {heroHeading}
              </Text>

              <Text className="mt-3 max-w-[92%] text-[15px] leading-[23px] text-light-heroSubtext dark:text-dark-heroSubtext">
                {heroSubheading}
              </Text>

              <View className="mt-[18px] flex-row flex-wrap">
                <View className="mb-2 mr-2 rounded-full border border-light-badgeBorder bg-light-badge px-3 py-2 dark:border-dark-badgeBorder dark:bg-dark-badge">
                  <Text className="text-[12px] font-semibold text-light-heroText dark:text-dark-heroText">
                    Live Sessions
                  </Text>
                </View>

                <View className="mb-2 mr-2 rounded-full border border-light-badgeBorder bg-light-badge px-3 py-2 dark:border-dark-badgeBorder dark:bg-dark-badge">
                  <Text className="text-[12px] font-semibold text-light-heroText dark:text-dark-heroText">
                    Trusted Circles
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* ── Card ── */}
          <View className="-mt-[54px] rounded-[28px] bg-light-card dark:bg-dark-card">
            <View className="px-5 pt-5 pb-10">
              {/* Segment tabs only — no title or subtitle */}
              <View className="mb-5 flex-row rounded-2xl bg-light-muted p-1 dark:bg-dark-muted">
                <TouchableOpacity
                  activeOpacity={0.9}
                  className={`h-[46px] flex-1 items-center justify-center rounded-xl ${mode === 'login' ? 'bg-brand-primary' : ''
                    }`}
                  onPress={() => switchMode('login')}
                >
                  <Text
                    className={`text-[15px] font-semibold ${mode === 'login'
                      ? 'text-white'
                      : 'text-light-subtext dark:text-dark-subtext'
                      }`}
                  >
                    Login
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  className={`h-[46px] flex-1 items-center justify-center rounded-xl ${mode === 'register' ? 'bg-brand-primary' : ''
                    }`}
                  onPress={() => switchMode('register')}
                >
                  <Text
                    className={`text-[15px] font-semibold ${mode === 'register'
                      ? 'text-white'
                      : 'text-light-subtext dark:text-dark-subtext'
                      }`}
                  >
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Inputs — straight after tabs, no gap text */}
              {mode === 'register' ? (
                <AuthInput
                  inputRef={nameRef}
                  label="Full name"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              ) : null}

              <AuthInput
                inputRef={emailRef}
                label="Email address"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <AuthInput
                inputRef={passwordRef}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                rightText={showPassword ? 'Hide' : 'Show'}
                onRightPress={() => setShowPassword((prev) => !prev)}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                className={`mt-2 h-14 items-center justify-center rounded-[18px] bg-brand-primary ${loading ? 'opacity-70' : ''
                  }`}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-[16px] font-extrabold text-white">
                    {mode === 'login' ? 'Login' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                className="mt-4 items-center"
                onPress={() =>
                  switchMode(mode === 'login' ? 'register' : 'login')
                }
              >
                <Text className="text-[14px] font-medium text-light-subtext dark:text-dark-subtext">
                  {mode === 'login'
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                  <Text className="font-extrabold text-brand-primary">
                    {mode === 'login' ? 'Sign up' : 'Login'}
                  </Text>
                </Text>
              </TouchableOpacity>

              <Text className="mt-[18px] text-center text-[12px] leading-5 text-light-subtext dark:text-dark-subtext">
                SafeTraq is designed for personal safety, real-time sharing,
                and trusted-circle communication with a scalable mobile and
                backend architecture.
              </Text>
            </View>
          </View>
        </Animated.ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
    </View>
  );
};

export default AuthScreen;
