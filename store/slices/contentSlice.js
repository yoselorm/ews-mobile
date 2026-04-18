import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';


export const fetchHealthTips = createAsyncThunk(
    'content/fetchHealthTips',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/health-tips', { params: filters });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch health tips');
        }
    }
);


export const fetchSafetyGuides = createAsyncThunk(
    'content/fetchSafetyGuides',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/safety-guides', { params: filters });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch safety guides');
        }
    }
);


const contentSlice = createSlice({
    name: 'content',
    initialState: {
        healthTips: [],
        safetyGuides: [],
        loading: false,
        error: null,
        meta: {
            healthTips: {},
            safetyGuides: {},
        }
    },
    reducers: {
        clearContentError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Health Tips
            .addCase(fetchHealthTips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHealthTips.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg.page === 1) {
                    state.healthTips = action.payload.data;
                } else {
                    state.healthTips = [...state.healthTips, ...action.payload.data];
                }
                state.meta.healthTips = action.payload.meta;
            })
            .addCase(fetchHealthTips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Safety Guides
            .addCase(fetchSafetyGuides.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSafetyGuides.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg.page === 1) {
                    state.safetyGuides = action.payload.data;
                } else {
                    state.safetyGuides = [...state.safetyGuides, ...action.payload.data];
                }
                state.meta.safetyGuides = action.payload.meta;
            })
            
            .addCase(fetchSafetyGuides.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearContentError } = contentSlice.actions;
export default contentSlice.reducer;