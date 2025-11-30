import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch menu items
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async ({ restaurantName, outletName }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/item/view/${restaurantName}/${outletName}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      if (data.success) {
        return { items: data.items || [], outlet: data.outlet };
      }
      return rejectWithValue(data.message || 'Failed to fetch menu items');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch categories
export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async (outletId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/category/outlet/${outletId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      if (data.success) {
        return data.categories || [];
      }
      return rejectWithValue(data.message || 'Failed to fetch categories');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    categories: [],
    outlet: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      maxPrice: null,
      minRating: 0,
      spicy: null,
      diet: new Set(),
      category: 'All',
    },
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.filters.maxPrice = action.payload;
    },
    setMinRating: (state, action) => {
      state.filters.minRating = action.payload;
    },
    setSpicy: (state, action) => {
      state.filters.spicy = action.payload;
    },
    toggleDiet: (state, action) => {
      const diet = action.payload;
      if (state.filters.diet.has(diet)) {
        state.filters.diet.delete(diet);
      } else {
        state.filters.diet.add(diet);
      }
    },
    setCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        maxPrice: null,
        minRating: 0,
        spicy: null,
        diet: new Set(),
        category: 'All',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.outlet = action.payload.outlet;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const {
  setSearch,
  setMaxPrice,
  setMinRating,
  setSpicy,
  toggleDiet,
  setCategory,
  clearFilters,
} = menuSlice.actions;

// Selectors
export const selectMenuItems = (state) => state.menu.items;
export const selectCategories = (state) => state.menu.categories;
export const selectOutlet = (state) => state.menu.outlet;
export const selectMenuLoading = (state) => state.menu.loading;
export const selectMenuFilters = (state) => state.menu.filters;

export const selectFilteredItems = (state) => {
  const { items, filters } = state.menu;
  let filtered = items;

  // Filter by category
  if (filters.category !== 'All') {
    filtered = filtered.filter(
      (item) => (item.category || '').trim().toLowerCase() === filters.category.toLowerCase()
    );
  }

  // Filter by search
  if (filters.search) {
    filtered = filtered.filter((item) =>
      item.itemName.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  // Filter by max price
  if (filters.maxPrice !== null) {
    filtered = filtered.filter((item) => item.itemPrice <= filters.maxPrice);
  }

  // Filter by min rating
  if (filters.minRating > 0) {
    filtered = filtered.filter((item) => (item.rating || 0) >= filters.minRating);
  }

  // Filter by spicy
  if (filters.spicy !== null) {
    filtered = filtered.filter((item) => item.spicyLevel === filters.spicy);
  }

  // Filter by diet
  if (filters.diet.size > 0) {
    filtered = filtered.filter((item) =>
      filters.diet.has(item.diet?.toLowerCase())
    );
  }

  // Filter available items
  filtered = filtered.filter((item) => item.isAvailable !== false);

  return filtered;
};

export default menuSlice.reducer;

