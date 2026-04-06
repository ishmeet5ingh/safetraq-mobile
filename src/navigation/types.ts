export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Circles: undefined;
  CircleDetail: { circleId: string };
  LiveShareSetup: { preselectedCircleId?: string } | undefined;
  ActiveSession: { sessionId?: string } | undefined;
  PrivacyDashboard: undefined;
  SOS: { sessionId?: string } | undefined;
  Invites: undefined
};
