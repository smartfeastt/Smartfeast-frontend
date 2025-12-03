import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch all public restaurants (no auth required)
export const fetchPublicRestaurants = createAsyncThunk(
  'publicRestaurant/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        return data.restaurants || [];
      }
      return rejectWithValue(data.message || 'Failed to fetch restaurants');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const publicRestaurantSlice = createSlice({
  name: 'publicRestaurant',
  initialState: {
    restaurants: [],
    loading: false,
    error: null,
    lastFetched: null,
    searchQuery: '',
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchPublicRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, clearSearchQuery, clearError } = publicRestaurantSlice.actions;

// Selectors
export const selectPublicRestaurants = (state) => state.publicRestaurant.restaurants;
export const selectPublicRestaurantLoading = (state) => state.publicRestaurant.loading;
export const selectPublicRestaurantError = (state) => state.publicRestaurant.error;
export const selectSearchQuery = (state) => state.publicRestaurant.searchQuery;
export const selectLastFetched = (state) => state.publicRestaurant.lastFetched;

// Filtered restaurants based on search query
export const selectFilteredRestaurants = (state) => {
  const { restaurants, searchQuery } = state.publicRestaurant;
  
  if (!searchQuery.trim()) {
    return restaurants;
  }
  
  const query = searchQuery.toLowerCase();
  return restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(query)
  );
};

// Check if data is stale (older than 5 minutes)
export const selectIsDataStale = (state) => {
  if (!state.publicRestaurant.lastFetched) return true;
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - state.publicRestaurant.lastFetched > fiveMinutes;
};

// Get restaurant by ID
export const selectPublicRestaurantById = (restaurantId) => (state) => {
  return state.publicRestaurant.restaurants.find((r) => r._id === restaurantId);
};

// Get restaurant by name
export const selectPublicRestaurantByName = (restaurantName) => (state) => {
  return state.publicRestaurant.restaurants.find(
    (r) => r.name.toLowerCase() === restaurantName.toLowerCase()
  );
};

export default publicRestaurantSlice.reducer;