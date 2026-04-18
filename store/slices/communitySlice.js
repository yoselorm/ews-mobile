import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';


export const fetchCommunities = createAsyncThunk(
    'community/fetchCommunities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/communities');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch communities');
        }
    }
);

export const fetchRegions = createAsyncThunk(
    'community/fetchRegions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/regions');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch regions');
        }
    }
);

export const fetchDistricts = createAsyncThunk(
    'community/fetchDistricts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/districts');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch districts');
        }
    }
);

export const fetchLanguages = createAsyncThunk(
    'community/fetchLanguages',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/languages');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch languages');
        }
    }
);

// --- Slice ---

const communitySlice = createSlice({
    name: 'community',
    initialState: {
        communities: [],
        regions: [],
        districts: [],
        languages: [],
        loading: false,
        error: null,
    },
    reducers: {
        resetCommunityError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Pending Handlers for all fetches
            .addCase(fetchCommunities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRegions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDistricts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLanguages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // Rejected Handlers for all fetches
            .addCase(fetchCommunities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch communities';
            })
            .addCase(fetchRegions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch regions';
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch districts';
            })
            .addCase(fetchLanguages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch languages';
            })
            .addCase(fetchCommunities.fulfilled, (state, action) => {
                state.loading = false;
                state.communities = action.payload.data || action.payload;
            })
            .addCase(fetchRegions.fulfilled, (state, action) => {
                state.loading = false;
                state.regions = action.payload.data || action.payload;
            })
            .addCase(fetchDistricts.fulfilled, (state, action) => {
                state.loading = false;
                state.districts = action.payload.data || action.payload;
            })
            .addCase(fetchLanguages.fulfilled, (state, action) => {
                state.loading = false;
                state.languages = action.payload.data || action.payload;
            });

    },
})

export const { resetCommunityError } = communitySlice.actions;
export default communitySlice.reducer;