import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch paginated list of patients assigned to the health worker
export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      // Matches GET /api/user/patients
      const response = await api.get('/user/patients', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

// Register a new pregnant woman patient
export const registerPregnantWoman = createAsyncThunk(
  'patients/registerPregnant',
  async (patientData, { rejectWithValue }) => {
    try {
      // Matches POST /api/user/pregnant-women
      const response = await api.post('/user/pregnant-women', patientData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register pregnant woman');
    }
  }
);

// Register a new lactating mother patient
export const registerLactatingMother = createAsyncThunk(
  'patients/registerLactating',
  async (patientData, { rejectWithValue }) => {
    try {
      // Matches POST /api/user/lactating-mothers
      const response = await api.post('/user/lactating-mothers', patientData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register lactating mother');
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState: {
    list: [],
    loading: false,
    actionLoading: false,
    error: null,
    meta: {
      current_page: 1,
      last_page: 1,
      total: 0,
      per_page: 15 // Default value from API
    }
  },
  reducers: {
    clearPatientError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Registration Actions (Pregnant & Lactating)
      .addMatcher(
        (action) => [registerPregnantWoman.pending, registerLactatingMother.pending].includes(action.type),
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [registerPregnantWoman.fulfilled, registerLactatingMother.fulfilled].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          // Add new patient to the top of the list
          state.list.unshift(action.payload.data);
        }
      )
      .addMatcher(
        (action) => [registerPregnantWoman.rejected, registerLactatingMother.rejected].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;