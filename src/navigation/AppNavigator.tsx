import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../hooks/redux';
import AuthLoaderScreen from '../screens/AuthLoaderScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CirclesScreen from '../screens/CirclesScreen';
import CircleDetailScreen from '../screens/CircleDetailScreen';
import LiveShareSetupScreen from '../screens/LiveShareSetupScreen';
import ActiveSessionScreen from '../screens/ActiveSessionScreen';
import PrivacyDashboardScreen from '../screens/PrivacyDashboardScreen';
import SOSScreen from '../screens/SOSScreen';
import { AppStackParamList, AuthStackParamList } from './types';
import InvitesScreen from '../screens/InvitesScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  const { isAppReady, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAppReady) {
    return <AuthLoaderScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppStack.Navigator screenOptions={{ headerShadowVisible: false }}>
          <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'CloseLoop' }} />
          <AppStack.Screen name="Circles" component={CirclesScreen} options={{ title: 'Trusted Circles' }} />
          <AppStack.Screen name="CircleDetail" component={CircleDetailScreen} options={{ title: 'Circle Detail' }} />
          <AppStack.Screen name="LiveShareSetup" component={LiveShareSetupScreen} options={{ title: 'Start Sharing' }} />
          <AppStack.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ title: 'Active Session' }} />
          <AppStack.Screen name="PrivacyDashboard" component={PrivacyDashboardScreen} options={{ title: 'Privacy Dashboard' }} />
          <AppStack.Screen name="SOS" component={SOSScreen} options={{ title: 'Emergency SOS' }} />
          <AppStack.Screen name="Invites" component={InvitesScreen} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShadowVisible: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
