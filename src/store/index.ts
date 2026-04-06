import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import circlesReducer from './slices/circlesSlice';
import sessionsReducer from './slices/sessionsSlice';
import privacyReducer from './slices/privacySlice';
import invitesReducer from './slices/inviteSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    circles: circlesReducer,
    sessions: sessionsReducer,
    privacy: privacyReducer,
    invites: invitesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
