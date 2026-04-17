import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { api_url } from "../../services/config";

// --- Async Thunks ---

export const saveAuthData = createAsyncThunk(
  "auth/saveAuthData",
  async (data) => {
    const { token, ...user } = data;
    await SecureStore.setItemAsync("userToken", token);
    await SecureStore.setItemAsync("userData", JSON.stringify(user));
    return { token, user };
  }
);

export const loadAuthData = createAsyncThunk(
  "auth/loadAuthData",
  async () => {
    const token = await SecureStore.getItemAsync("userToken");
    const userString = await SecureStore.getItemAsync("userData");
    const user = userString ? JSON.parse(userString) : null;
    return { token, user };
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      // Use axios directly as requested
      await axios.post(`${api_url}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (err) {
      console.warn("Server logout failed:", err.message);
      return rejectWithValue(err.message);
    } finally {
      // Always clear local storage
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userData");
    }
  }
);

// --- Slice ---

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  },
  reducers: {
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Load Data
      .addCase(loadAuthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAuthData.fulfilled, (state, action) => {
        const { token, user } = action.payload;
        // VALIDATION: Ensure both exist to be considered "logged in"
        if (token && user) {
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
        } else {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
        }
        state.isLoading = false;
      })
      .addCase(loadAuthData.rejected, (state) => {
        state.isLoading = false;
      })

      // Save Data
      .addCase(saveAuthData.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        // We still wipe local state even if the server call fails
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setError, clearError } = authSlice.actions;
export default authSlice.reducer;