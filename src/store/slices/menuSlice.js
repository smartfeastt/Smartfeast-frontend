import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch menu items for a specific restaurant/outlet
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
        return { 
          items: data.items || [], 
          outlet: data.outlet,
          restaurantName,
          outletName 
        };
      }
      return rejectWithValue(data.message || 'Failed to fetch menu items');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch categories for a specific outlet
export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async ({ outletId, restaurantName, outletName }, { rejectWithValue }) => {
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
        return { 
          categories: data.categories || [],
          restaurantName,
          outletName 
        };
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
    // Store menu data by "restaurantName/outletName" key
    outlets: {},
    // Current active outlet
    currentOutlet: null,
    loading: false,
    error: null,
    // Filters are per-outlet
    filters: {},
  },
  reducers: {
    setCurrentOutlet: (state, action) => {
      const { restaurantName, outletName } = action.payload;
      state.currentOutlet = `${restaurantName}/${outletName}`;
      
      // Initialize filters for this outlet if they don't exist
      if (!state.filters[state.currentOutlet]) {
        state.filters[state.currentOutlet] = {
          search: '',
          maxPrice: null,
          minRating: 0,
          spicy: null,
          diet: [],
          category: 'All',
        };
      }
    },
    
    setSearch: (state, action) => {
      if (state.currentOutlet) {
        state.filters[state.currentOutlet].search = action.payload;
      }
    },
    
    setMaxPrice: (state, action) => {
      if (state.currentOutlet) {
        state.filters[state.currentOutlet].maxPrice = action.payload;
      }
    },
    
    setMinRating: (state, action) => {
      if (state.currentOutlet) {
        state.filters[state.currentOutlet].minRating = action.payload;
      }
    },
    
    setSpicy: (state, action) => {
      if (state.currentOutlet) {
        state.filters[state.currentOutlet].spicy = action.payload;
      }
    },
    
    toggleDiet: (state, action) => {
      if (state.currentOutlet) {
        const diet = action.payload;
        const dietArray = state.filters[state.currentOutlet].diet;
        const index = dietArray.indexOf(diet);
        
        if (index > -1) {
          dietArray.splice(index, 1);
        } else {
          dietArray.push(diet);
        }
      }
    },
    
    setCategory: (state, action) => {
      if (state.currentOutlet) {
        state.filters[state.currentOutlet].category = action.payload;
      }
    },
    
    clearFilters: (state) => {
      if (state.currentOutlet) {
        state.filters[state.currentOutlet] = {
          search: '',
          maxPrice: null,
          minRating: 0,
          spicy: null,
          diet: [],
          category: 'All',
        };
      }
    },
    clearSlice: (state) => {
      state.outlets = {};
      state.currentOutlet = null;
      state.loading = false;
      state.error = null;
      state.filters = {};
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
        const { items, outlet, restaurantName, outletName } = action.payload;
        const key = `${restaurantName}/${outletName}`;
        
        // Store outlet data
        state.outlets[key] = {
          items: items.map(item => ({ ...item, outletId: outlet?._id })),
          outlet,
          categories: state.outlets[key]?.categories || [],
          lastFetched: Date.now(),
        };
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        const { categories, restaurantName, outletName } = action.payload;
        const key = `${restaurantName}/${outletName}`;
        
        if (state.outlets[key]) {
          state.outlets[key].categories = categories;
        }
      });
  },
});

export const {
  setCurrentOutlet,
  setSearch,
  setMaxPrice,
  setMinRating,
  setSpicy,
  toggleDiet,
  setCategory,
  clearFilters,
  clearSlice,
} = menuSlice.actions;

// Selectors
export const selectCurrentOutletKey = (state) => state.menu.currentOutlet;

export const selectCurrentOutletData = (state) => {
  const key = state.menu.currentOutlet;
  return key ? state.menu.outlets[key] : null;
};

export const selectMenuItems = (state) => {
  const data = selectCurrentOutletData(state);
  return data?.items || [];
};

export const selectCategories = (state) => {
  const data = selectCurrentOutletData(state);
  return data?.categories || [];
};

export const selectOutlet = (state) => {
  const data = selectCurrentOutletData(state);
  return data?.outlet || null;
};

export const selectMenuLoading = (state) => state.menu.loading;

export const selectMenuFilters = (state) => {
  const key = state.menu.currentOutlet;
  return key ? state.menu.filters[key] || {} : {};
};

export const selectFilteredItems = (state) => {
  const items = selectMenuItems(state);
  const filters = selectMenuFilters(state);
  
  if (!filters) return items;
  
  let filtered = items;

  // Filter by category
  if (filters.category && filters.category !== 'All') {
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
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    filtered = filtered.filter((item) => item.itemPrice <= filters.maxPrice);
  }

  // Filter by min rating
  if (filters.minRating > 0) {
    filtered = filtered.filter((item) => (item.rating || 0) >= filters.minRating);
  }

  // Filter by spicy
  if (filters.spicy !== null && filters.spicy !== undefined) {
    filtered = filtered.filter((item) => item.spicyLevel === filters.spicy);
  }

  // Filter by diet
  if (filters.diet && filters.diet.length > 0) {
    filtered = filtered.filter((item) =>
      filters.diet.includes(item.diet?.toLowerCase())
    );
  }

  // Filter available items
  filtered = filtered.filter((item) => item.isAvailable !== false);

  return filtered;
};

// Check if outlet data exists (for cache checking)
export const selectHasOutletData = (restaurantName, outletName) => (state) => {
  const key = `${restaurantName}/${outletName}`;
  return !!state.menu.outlets[key];
};

export default menuSlice.reducer;