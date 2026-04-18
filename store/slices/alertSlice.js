import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// 1. Fetch all alerts for the user
export const fetchUserAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/alerts');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

// 2. Mark a single alert as read
export const markAlertAsRead = createAsyncThunk(
  'alerts/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/user/alerts/${id}/read`);
      return { id, data: response.data }; // Return ID to update local state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark alert as read');
    }
  }
);

// 3. Mark all alerts as read
export const markAllAlertsAsRead = createAsyncThunk(
  'alerts/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch('/user/alerts/read-all');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState: {
    alerts: [],
    loading: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    clearAlertError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- FETCH ALERTS --- */
      .addCase(fetchUserAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.data || action.payload;
        // Calculate unread count locally
        state.unreadCount = state.alerts.filter(a => !a.isRead).length;
      })
      .addCase(fetchUserAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- MARK SINGLE READ --- */
      .addCase(markAlertAsRead.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(a => a.id === action.payload.id);
        if (index !== -1 && !state.alerts[index].isRead) {
          state.alerts[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      /* --- MARK ALL READ --- */
      .addCase(markAllAlertsAsRead.fulfilled, (state) => {
        state.alerts = state.alerts.map(alert => ({ ...alert, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export const { clearAlertError } = alertSlice.actions;
export default alertSlice.reducer;