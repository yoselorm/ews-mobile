import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';


export const createPregnantWoman = createAsyncThunk(
  'users/createPregnantWoman',
  async (userData, { rejectWithValue }) => {
    try {
      // Endpoint matches your backend structure for maternal registration
      const response = await api.post('/user/pregnant-women', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register pregnant woman');
    }
  }
);

// 2. Register Lactating Mother
export const createLactatingMother = createAsyncThunk(
  'users/createLactatingMother',
  async (userData, { rejectWithValue }) => {
    try {
      // Endpoint matches your backend structure for postnatal registration
      const response = await api.post('/user/lactating-mothers', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register lactating mother');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    patients: [], 
    userActionLoading: false, 
    error: null,
    success: false,
  },
  reducers: {
    // Reset status when leaving a form or on component mount
    clearUserStatus: (state) => {
      state.error = null;
      state.success = false;
      state.userActionLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- PREGNANT WOMAN CASES --- */
      .addCase(createPregnantWoman.pending, (state) => {
        state.userActionLoading = true;
        state.error = null;
      })
      .addCase(createPregnantWoman.fulfilled, (state, action) => {
        state.userActionLoading = false;
        state.success = true;
        // Prepend to the local list so the HW sees the new patient immediately
        state.patients.unshift(action.payload.data || action.payload);
      })
      .addCase(createPregnantWoman.rejected, (state, action) => {
        state.userActionLoading = false;
        state.error = action.payload;
      })

      /* --- LACTATING MOTHER CASES --- */
      .addCase(createLactatingMother.pending, (state) => {
        state.userActionLoading = true;
        state.error = null;
      })
      .addCase(createLactatingMother.fulfilled, (state, action) => {
        state.userActionLoading = false;
        state.success = true;
        state.patients.unshift(action.payload.data || action.payload);
      })
      .addCase(createLactatingMother.rejected, (state, action) => {
        state.userActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserStatus } = userSlice.actions;
export default userSlice.reducer;