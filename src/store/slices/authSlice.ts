import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/auth.service';
import { LoginPayload, RegisterPayload } from '../../types/auth';
import { User } from '../../types/user';
import { STORAGE_KEYS } from '../../utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAppReady: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  isAppReady: false,
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.message || 'Something went wrong';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, thunkAPI) => {
    try {
      const data = await authService.register(payload);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, thunkAPI) => {
    try {
      const data = await authService.login(payload);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSession',
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        return null;
      }

      const user = await authService.getProfile();

      return {
        token,
        user,
      };
    } catch (error) {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const user = await authService.getProfile();
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await authService.logout();
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    return true;
  } catch (error) {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isAppReady = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAppReady = true;
        state.error = (action.payload as string) || 'Register failed';
      })

      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isAppReady = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAppReady = true;
        state.error = (action.payload as string) || 'Login failed';
      })

      .addCase(restoreSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAppReady = true;

        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(restoreSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAppReady = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = (action.payload as string) || 'Session restore failed';
      })

      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;