import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import axios from 'axios';
import { api_url } from '../../services/config';
import * as SecureStore from 'expo-secure-store';


// --- THUNKS ---

// 1. Get Profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/profile');
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
    }
  }
);

// 2. Update Profile (Name, etc.)
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/user/profile', profileData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

// 3. Upload Avatar Image
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Avatar upload failed');
    }
  }
);

export const registerPushToken = createAsyncThunk(
  'profile/registerPushToken',
  async (expoToken, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await axios.post(`${api_url}/profile/expo-token`, { expo_push_token: expoToken }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error("Push token registration failed:", err.response?.data?.message || 'Token registration failed');
      return rejectWithValue(err.response?.data?.message || 'Token registration failed');
    }
  }
);


export const removePushToken = createAsyncThunk(
  'profile/removePushToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      console.log(token)
      const response = await axios.delete(`${api_url}/profile/expo-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error("Push token removal failed:", err.response?.data?.message || 'Failed to remove token');
      return rejectWithValue(err.response?.data?.message || 'Failed to remove token');
    }
  }
);

// 5. Delete Account
export const deleteAccount = createAsyncThunk(
  'profile/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/account');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Account deletion failed');
    }
  }
);

// --- SLICE ---

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    loading: false,
    uploadingAvatar: false,
    error: null,
  },
  reducers: {
    resetProfileState: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetching Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Uploading Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.user) state.user.avatar_url = action.payload.data.avatar_url;
      })
      .addCase(uploadAvatar.rejected, (state) => {
        state.uploadingAvatar = false;
      })

      //Expo Push Token Registration
      .addCase(registerPushToken.rejected, (state, action) => {
        console.error("Push token registration failed:", action.payload);
      })

      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(removePushToken.rejected, (state, action) => {
        console.error("Push token removal failed:", action.payload);
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;