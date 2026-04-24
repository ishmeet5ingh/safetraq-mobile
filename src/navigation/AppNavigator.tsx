import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../hooks/redux';
import AuthLoaderScreen from '../screens/AuthLoaderScreen';
import CircleDetailScreen from '../screens/CircleDetailScreen';
import ActiveSessionScreen from '../screens/ActiveSessionScreen';
import SOSScreen from '../screens/SOSScreen';
import LandingScreen from '../screens/LandingScreen';
import AuthScreen from '../screens/AuthScreen';
import { useThemeContext } from '../context/ThemeContext';
import MainTabsNavigator from './MainTabsNavigator';
import { AppStackParamList, AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  const { isAppReady, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isDark } = useThemeContext();

  return (
    <NavigationContainer>
      {!isAppReady ? (
        <AuthLoaderScreen />
      ) : isAuthenticated ? (
        <AppStack.Navigator
          screenOptions={{
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
            },
            contentStyle: {
              backgroundColor: isDark ? '#020617' : '#F8FAFC',
            },
            headerTintColor: isDark ? '#F8FAFC' : '#0F172A',
            headerTitleStyle: {
              fontWeight: '600',
              color: isDark ? '#F8FAFC' : '#0F172A',
            },
          }}
        >
          <AppStack.Screen
            name="MainTabs"
            component={MainTabsNavigator}
            options={{ headerShown: false }}
          />
          <AppStack.Screen
            name="CircleDetail"
            component={CircleDetailScreen}
            options={{ title: 'Circle Detail' }}
          />
          <AppStack.Screen
            name="ActiveSession"
            component={ActiveSessionScreen}
            options={{ title: 'Active Session' }}
          />
          <AppStack.Screen
            name="SOS"
            component={SOSScreen}
            options={{ title: 'Emergency SOS' }}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator
          initialRouteName="Landing"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <AuthStack.Screen name="Landing" component={LandingScreen} />
          <AuthStack.Screen name="Auth" component={AuthScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
