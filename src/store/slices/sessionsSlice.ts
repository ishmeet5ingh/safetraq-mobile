import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ShareSession, StartSessionPayload } from '../../types/session';
import sessionService from '../../services/session.service';

interface SessionsState {
  activeSession: ShareSession | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: SessionsState = {
  activeSession: null,
  loading: false,
  submitting: false,
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error && 'response' in error) {
    return (error as any).response?.data?.message || 'Something went wrong';
  }
  return error instanceof Error ? error.message : 'Something went wrong';
};

export const fetchActiveSessionThunk = createAsyncThunk('sessions/fetchActive', async (_, thunkAPI) => {
  try {
    return await sessionService.getActiveSession();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const fetchSessionByIdThunk = createAsyncThunk('sessions/fetchById', async (sessionId: string, thunkAPI) => {
  try {
    return await sessionService.getSessionById(sessionId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const startSessionThunk = createAsyncThunk('sessions/start', async (payload: StartSessionPayload, thunkAPI) => {
  try {
    return await sessionService.startSession(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const pauseSessionThunk = createAsyncThunk('sessions/pause', async (sessionId: string, thunkAPI) => {
  try {
    return await sessionService.pauseSession(sessionId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const resumeSessionThunk = createAsyncThunk('sessions/resume', async (sessionId: string, thunkAPI) => {
  try {
    return await sessionService.resumeSession(sessionId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const stopSessionThunk = createAsyncThunk('sessions/stop', async (sessionId: string, thunkAPI) => {
  try {
    return await sessionService.stopSession(sessionId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload;
      })
      .addCase(fetchActiveSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to fetch active session';
      })
      .addCase(fetchSessionByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload;
      })
      .addCase(fetchSessionByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to fetch session';
      })
      .addCase(startSessionThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(startSessionThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.activeSession = action.payload;
      })
      .addCase(startSessionThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) || 'Unable to start session';
      })
      .addCase(pauseSessionThunk.fulfilled, (state, action) => {
        state.activeSession = action.payload;
      })
      .addCase(resumeSessionThunk.fulfilled, (state, action) => {
        state.activeSession = action.payload;
      })
      .addCase(stopSessionThunk.fulfilled, (state, action) => {
        state.activeSession = action.payload.status === 'ended' ? null : action.payload;
      });
  },
});

export default sessionsSlice.reducer;
