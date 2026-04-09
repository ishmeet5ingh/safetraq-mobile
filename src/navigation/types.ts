import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthMode = 'login' | 'register';

export type AuthStackParamList = {
  Landing: undefined;
  Auth: { mode?: AuthMode } | undefined;
};

export type AppTabParamList = {
  Home: undefined;
  LiveShareSetup: { preselectedCircleId?: string } | undefined;
  Circles: undefined;
  Invites: undefined;
  PrivacyDashboard: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>;
  CircleDetail: { circleId: string };
  ActiveSession: { sessionId: string };
  SOS: { sessionId?: string } | undefined;
};
