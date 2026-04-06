import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PrivacyState {
  defaultShareMinutes: number;
  allowAuditVisibility: boolean;
  batteryAwareMode: boolean;
  arrivalPromptEnabled: boolean;
}

const initialState: PrivacyState = {
  defaultShareMinutes: 60,
  allowAuditVisibility: true,
  batteryAwareMode: true,
  arrivalPromptEnabled: true,
};

const privacySlice = createSlice({
  name: 'privacy',
  initialState,
  reducers: {
    setDefaultShareMinutes(state, action: PayloadAction<number>) {
      state.defaultShareMinutes = action.payload;
    },
    toggleAuditVisibility(state) {
      state.allowAuditVisibility = !state.allowAuditVisibility;
    },
    toggleBatteryAwareMode(state) {
      state.batteryAwareMode = !state.batteryAwareMode;
    },
    toggleArrivalPrompt(state) {
      state.arrivalPromptEnabled = !state.arrivalPromptEnabled;
    },
  },
});

export const {
  setDefaultShareMinutes,
  toggleAuditVisibility,
  toggleBatteryAwareMode,
  toggleArrivalPrompt,
} = privacySlice.actions;

export default privacySlice.reducer;
