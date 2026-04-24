import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../hooks/redux';
import { useThemeContext } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import CirclesScreen from '../screens/CirclesScreen';
import LiveShareSetupScreen from '../screens/LiveShareSetupScreen';
import PrivacyDashboardScreen from '../screens/PrivacyDashboardScreen';
import InvitesScreen from '../screens/InvitesScreen';
import { AppTabParamList } from './types';

const AppTabs = createBottomTabNavigator<AppTabParamList>();

const getTabIconName = (
  routeName: keyof AppTabParamList,
  focused: boolean,
): string => {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'LiveShareSetup':
      return focused ? 'navigate-circle' : 'navigate-circle-outline';
    case 'Circles':
      return focused ? 'people' : 'people-outline';
    case 'Invites':
      return focused ? 'mail' : 'mail-outline';
    case 'PrivacyDashboard':
      return focused ? 'shield-checkmark' : 'shield-checkmark-outline';
    default:
      return focused ? 'ellipse' : 'ellipse-outline';
  }
};

const getTabLabel = (routeName: keyof AppTabParamList): string => {
  switch (routeName) {
    case 'Home':
      return 'Home';
    case 'LiveShareSetup':
      return 'Share';
    case 'Circles':
      return 'Circles';
    case 'Invites':
      return 'Invites';
    case 'PrivacyDashboard':
      return 'Privacy';
    default:
      return routeName;
  }
};

const getTabTitle = (routeName: keyof AppTabParamList): string => {
  switch (routeName) {
    case 'Home':
      return 'SafeTraq';
    case 'LiveShareSetup':
      return 'Live Share';
    case 'Circles':
      return 'Trusted Circles';
    case 'Invites':
      return 'Invites';
    case 'PrivacyDashboard':
      return 'Privacy Dashboard';
    default:
      return routeName;
  }
};

const MainTabsNavigator = () => {
  const { isDark } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { invites } = useAppSelector((state) => state.invites);

  const activeTint = '#1D4ED8';
  const inactiveTint = isDark ? '#94A3B8' : '#64748B';
  const tabBarBackground = isDark ? '#111827' : '#FFFFFF';
  const activePill = isDark
    ? 'rgba(29, 78, 216, 0.22)'
    : 'rgba(29, 78, 216, 0.12)';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#F8FAFC' }}>
      <AppTabs.Navigator
        screenOptions={({ route }) => ({
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#F8FAFC' : '#0F172A',
          headerTitleStyle: {
            fontWeight: '600',
            color: isDark ? '#F8FAFC' : '#0F172A',
          },
          title: getTabTitle(route.name),
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarStyle: {
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 14,
            height: 74,
            paddingTop: 10,
            paddingBottom: Platform.OS === 'ios' ? 10 : 8,
            borderTopWidth: 0,
            borderRadius: 18,
            backgroundColor: tabBarBackground,
            elevation: 0,
            shadowColor: '#0F172A',
            shadowOpacity: isDark ? 0.28 : 0.12,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            zIndex: 3,
          },
          tabBarItemStyle: {
            borderRadius: 12,
            marginHorizontal: 2,
          },
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                minWidth: route.name === 'LiveShareSetup' ? 52 : 42,
                height: route.name === 'LiveShareSetup' ? 36 : 32,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? activePill : 'transparent',
              }}
            >
              <Ionicons
                name={getTabIconName(route.name, focused)}
                size={route.name === 'LiveShareSetup' ? 23 : 21}
                color={color}
              />
            </View>
          ),
          tabBarLabel: getTabLabel(route.name),
        })}
      >
        <AppTabs.Screen name="Home" component={HomeScreen} />
        <AppTabs.Screen name="LiveShareSetup" component={LiveShareSetupScreen} />
        <AppTabs.Screen name="Circles" component={CirclesScreen} />
        <AppTabs.Screen
          name="Invites"
          component={InvitesScreen}
          options={{
            tabBarBadge: invites.length > 0 ? invites.length : undefined,
            tabBarBadgeStyle: {
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: '600',
            },
          }}
        />
        <AppTabs.Screen
          name="PrivacyDashboard"
          component={PrivacyDashboardScreen}
        />
      </AppTabs.Navigator>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + 14,
          backgroundColor: tabBarBackground,
          zIndex: 2,
        }}
      />
    </View>
  );
};

export default MainTabsNavigator;
