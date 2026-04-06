import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import inviteService from '../../services/invite.service';
import { Invite } from '../../types/invite';

interface InviteState {
  invites: Invite[];
  loading: boolean;
  error: string | null;
}

const initialState: InviteState = {
  invites: [],
  loading: false,
  error: null,
};

export const fetchPendingInvitesThunk = createAsyncThunk(
  'invites/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      return await inviteService.getPendingInvites();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invites');
    }
  },
);

export const acceptInviteThunk = createAsyncThunk(
  'invites/accept',
  async (inviteId: string, { rejectWithValue }) => {
    try {
      await inviteService.acceptInvite(inviteId);
      return inviteId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invite');
    }
  },
);

export const declineInviteThunk = createAsyncThunk(
  'invites/decline',
  async (inviteId: string, { rejectWithValue }) => {
    try {
      await inviteService.declineInvite(inviteId);
      return inviteId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to decline invite');
    }
  },
);

const inviteSlice = createSlice({
  name: 'invites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingInvitesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingInvitesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.invites = action.payload;
      })
      .addCase(fetchPendingInvitesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(acceptInviteThunk.fulfilled, (state, action) => {
        state.invites = state.invites.filter((invite) => invite._id !== action.payload);
      })
      .addCase(declineInviteThunk.fulfilled, (state, action) => {
        state.invites = state.invites.filter((invite) => invite._id !== action.payload);
      });
  },
});

export default inviteSlice.reducer;