import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Circle, CreateCirclePayload, InviteCircleMemberPayload } from '../../types/circle';
import circleService from '../../services/circle.service';
interface CirclesState {
  items: Circle[];
  currentCircle: Circle | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: CirclesState = {
  items: [],
  currentCircle: null,
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

export const fetchCirclesThunk = createAsyncThunk('circles/fetchAll', async (_, thunkAPI) => {
  try {
    return await circleService.getCircles();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCircleDetailThunk = createAsyncThunk('circles/fetchOne', async (circleId: string, thunkAPI) => {
  try {
    return await circleService.getCircleById(circleId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const createCircleThunk = createAsyncThunk('circles/create', async (payload: CreateCirclePayload, thunkAPI) => {
  try {
    return await circleService.createCircle(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const inviteCircleMemberThunk = createAsyncThunk(
  'circles/invite',
  async (payload: InviteCircleMemberPayload, thunkAPI) => {
    try {
      return await circleService.inviteMember(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

const circlesSlice = createSlice({
  name: 'circles',
  initialState,
  reducers: {
    clearCirclesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCirclesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCirclesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCirclesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to fetch circles';
      })
      .addCase(fetchCircleDetailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCircleDetailThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCircle = action.payload;
        state.items = state.items.some((item) => item._id === action.payload._id)
          ? state.items.map((item) => (item._id === action.payload._id ? action.payload : item))
          : [action.payload, ...state.items];
      })
      .addCase(fetchCircleDetailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to fetch circle';
      })
      .addCase(createCircleThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCircleThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = [action.payload, ...state.items];
        state.currentCircle = action.payload;
      })
      .addCase(createCircleThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) || 'Unable to create circle';
      })
      .addCase(inviteCircleMemberThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(inviteCircleMemberThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentCircle = action.payload;
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(inviteCircleMemberThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) || 'Unable to invite member';
      });
  },
});

export const { clearCirclesError } = circlesSlice.actions;
export default circlesSlice.reducer;
