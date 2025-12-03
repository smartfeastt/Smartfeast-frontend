import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch all restaurants for the owner
export const fetchOwnerRestaurants = createAsyncThunk(
  'restaurant/fetchOwnerRestaurants',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/owner/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

// Async thunk to create a new restaurant
export const createRestaurant = createAsyncThunk(
  'restaurant/createRestaurant',
  async ({ token, name, outlet_count }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, outlet_count }),
      });
      const data = await response.json();
      if (data.success) {
        return data.restaurant;
      }
      return rejectWithValue(data.message || 'Failed to create restaurant');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete a restaurant
export const deleteRestaurant = createAsyncThunk(
  'restaurant/deleteRestaurant',
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/${restaurantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return restaurantId;
      }
      return rejectWithValue(data.message || 'Failed to delete restaurant');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState: {
    restaurants: [],
    loading: false,
    error: null,
    createLoading: false,
    createError: null,
    deleteLoading: false,
    lastFetched: null,
  },
  reducers: {
    clearRestaurantError: (state) => {
      state.error = null;
      state.createError = null;
    },
    // Manually update a restaurant in the list (useful for real-time updates)
    updateRestaurant: (state, action) => {
      const index = state.restaurants.findIndex(
        (r) => r._id === action.payload._id
      );
      if (index !== -1) {
        state.restaurants[index] = {
          ...state.restaurants[index],
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch restaurants
      .addCase(fetchOwnerRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchOwnerRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create restaurant
      .addCase(createRestaurant.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.createLoading = false;
        state.restaurants.push(action.payload);
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Delete restaurant
      .addCase(deleteRestaurant.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.restaurants = state.restaurants.filter(
          (r) => r._id !== action.payload
        );
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRestaurantError, updateRestaurant } = restaurantSlice.actions;

// Selectors
export const selectRestaurants = (state) => state.restaurant.restaurants;
export const selectRestaurantLoading = (state) => state.restaurant.loading;
export const selectRestaurantError = (state) => state.restaurant.error;
export const selectCreateLoading = (state) => state.restaurant.createLoading;
export const selectCreateError = (state) => state.restaurant.createError;
export const selectDeleteLoading = (state) => state.restaurant.deleteLoading;
export const selectLastFetched = (state) => state.restaurant.lastFetched;

// Get restaurant by ID
export const selectRestaurantById = (restaurantId) => (state) => {
  return state.restaurant.restaurants.find((r) => r._id === restaurantId);
};

// Check if data is stale (older than 5 minutes)
export const selectIsDataStale = (state) => {
  if (!state.restaurant.lastFetched) return true;
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - state.restaurant.lastFetched > fiveMinutes;
};

export default restaurantSlice.reducer;