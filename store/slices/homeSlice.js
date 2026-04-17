import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchHomeData = createAsyncThunk(
  'home/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/home');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load home data');
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    data: null, 
    loading: false,
    error: null,
  },
  reducers: {
    clearHomeState: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearHomeState } = homeSlice.actions;
export default homeSlice.reducer;