import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Sync outlets - fetches outlets updated/created since lastSync
 */
export const syncOutlets = createAsyncThunk(
  'vendorOutlets/sync',
  async ({ token }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const lastSync = state.vendorOutlets?.lastSync || 0;
      const since = new Date(lastSync).toISOString();
      
      const url = new URL(`${API_URL}/api/outlet/sync`);
      url.searchParams.set('since', since);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        return {
          outlets: data.outlets || [],
          syncedAt: data.syncedAt || new Date().toISOString(),
        };
      }
      return rejectWithValue(data.message || 'Failed to sync outlets');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch outlets for vendor (owner or manager)
 */
export const fetchVendorOutlets = createAsyncThunk(
  'vendorOutlets/fetch',
  async ({ token, userId, userType }, { rejectWithValue }) => {
    try {
      let url;
      if (userType === 'owner') {
        // Fetch all restaurants and their outlets
        url = `${API_URL}/api/restaurant/owner/all`;
      } else if (userType === 'manager') {
        // Fetch manager's outlets
        url = `${API_URL}/api/outlet/manager/${userId}`;
      } else {
        return rejectWithValue('Invalid user type');
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        // Normalize outlets from response
        const outlets = [];
        if (userType === 'owner' && data.restaurants) {
          data.restaurants.forEach(restaurant => {
            if (restaurant.outlets && Array.isArray(restaurant.outlets)) {
              restaurant.outlets.forEach(outlet => {
                outlets.push({
                  ...outlet,
                  restaurantId: restaurant._id,
                  restaurantName: restaurant.name,
                });
              });
            }
          });
        } else if (data.outlets) {
          outlets.push(...data.outlets);
        }
        
        return outlets;
      }
      return rejectWithValue(data.message || 'Failed to fetch outlets');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create outlet
 */
export const createOutlet = createAsyncThunk(
  'vendorOutlets/create',
  async ({ restaurantId, outletData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/outlet/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...outletData,
          restaurantId,
          token,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        return data.outlet;
      }
      return rejectWithValue(data.message || 'Failed to create outlet');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update outlet
 */
export const updateOutlet = createAsyncThunk(
  'vendorOutlets/update',
  async ({ outletId, outletData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/outlet/${outletId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...outletData,
          token,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        return data.outlet;
      }
      return rejectWithValue(data.message || 'Failed to update outlet');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch single outlet
 */
export const fetchOutlet = createAsyncThunk(
  'vendorOutlets/fetchOne',
  async ({ outletId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/outlet/${outletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        return data.outlet;
      }
      return rejectWithValue(data.message || 'Failed to fetch outlet');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Merge incoming outlets with existing outlets
 */
const mergeOutlets = (existingById, existingAllIds, incomingOutlets) => {
  const mergedById = { ...existingById };
  const mergedAllIds = [...existingAllIds];
  
  incomingOutlets.forEach(outlet => {
    const outletId = outlet._id || outlet.id;
    if (!outletId) return;
    
    if (mergedById[outletId]) {
      // Conflict resolution: use newer version
      const existing = mergedById[outletId];
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const newTime = new Date(outlet.updatedAt || outlet.createdAt || 0).getTime();
      
      if (newTime >= existingTime) {
        mergedById[outletId] = outlet;
      }
    } else {
      // New outlet
      mergedById[outletId] = outlet;
      if (!mergedAllIds.includes(outletId)) {
        mergedAllIds.push(outletId);
      }
    }
  });
  
  return { mergedById, mergedAllIds };
};

const initialState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
  selectedOutletId: null,
  lastSync: 0, // Timestamp of last successful sync
  syncing: false, // Whether a sync is in progress
};

const vendorOutletsSlice = createSlice({
  name: 'vendorOutlets',
  initialState,
  reducers: {
    /**
     * Set selected outlet
     */
    setSelectedOutlet: (state, action) => {
      state.selectedOutletId = action.payload;
    },
    
    /**
     * Add or update outlet (for socket updates)
     */
    addOrUpdateOutlet: (state, action) => {
      const outlet = action.payload;
      const outletId = outlet._id || outlet.id;
      
      if (!outletId) return;
      
      state.byId[outletId] = outlet;
      if (!state.allIds.includes(outletId)) {
        state.allIds.push(outletId);
      }
    },
    
    /**
     * Remove outlet
     */
    removeOutlet: (state, action) => {
      const outletId = action.payload;
      if (state.byId[outletId]) {
        delete state.byId[outletId];
        state.allIds = state.allIds.filter(id => id !== outletId);
        if (state.selectedOutletId === outletId) {
          state.selectedOutletId = null;
        }
      }
    },
    
    /**
     * Clear slice
     */
    clearSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Sync outlets
      .addCase(syncOutlets.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncOutlets.fulfilled, (state, action) => {
        state.syncing = false;
        const { outlets, syncedAt } = action.payload;
        
        // Merge incoming outlets
        const { mergedById, mergedAllIds } = mergeOutlets(state.byId, state.allIds, outlets);
        state.byId = mergedById;
        state.allIds = mergedAllIds;
        
        // Update lastSync timestamp
        if (syncedAt) {
          state.lastSync = new Date(syncedAt).getTime();
        } else {
          state.lastSync = Date.now();
        }
      })
      .addCase(syncOutlets.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      })
      
      // Fetch outlets
      .addCase(fetchVendorOutlets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOutlets.fulfilled, (state, action) => {
        state.loading = false;
        const outlets = action.payload;
        
        outlets.forEach(outlet => {
          const outletId = outlet._id || outlet.id;
          if (outletId) {
            state.byId[outletId] = outlet;
            if (!state.allIds.includes(outletId)) {
              state.allIds.push(outletId);
            }
          }
        });
      })
      .addCase(fetchVendorOutlets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create outlet
      .addCase(createOutlet.fulfilled, (state, action) => {
        const outlet = action.payload;
        const outletId = outlet._id || outlet.id;
        if (outletId) {
          state.byId[outletId] = outlet;
          if (!state.allIds.includes(outletId)) {
            state.allIds.push(outletId);
          }
        }
      })
      
      // Update outlet
      .addCase(updateOutlet.fulfilled, (state, action) => {
        const outlet = action.payload;
        const outletId = outlet._id || outlet.id;
        if (outletId && state.byId[outletId]) {
          state.byId[outletId] = { ...state.byId[outletId], ...outlet };
        }
      })
      
      // Fetch single outlet
      .addCase(fetchOutlet.fulfilled, (state, action) => {
        const outlet = action.payload;
        const outletId = outlet._id || outlet.id;
        if (outletId) {
          state.byId[outletId] = outlet;
          if (!state.allIds.includes(outletId)) {
            state.allIds.push(outletId);
          }
        }
      });
  },
});

export const {
  setSelectedOutlet,
  addOrUpdateOutlet,
  removeOutlet,
  clearSlice,
} = vendorOutletsSlice.actions;

// Selectors
export const selectOutletsById = (state) => state.vendorOutlets.byId;
export const selectAllOutletIds = (state) => state.vendorOutlets.allIds;
export const selectOutletsLoading = (state) => state.vendorOutlets.loading;
export const selectSelectedOutlet = (state) => {
  const selectedId = state.vendorOutlets.selectedOutletId;
  return selectedId ? state.vendorOutlets.byId[selectedId] : null;
};

/**
 * Select all outlets as array
 */
export const selectAllOutlets = (state) => {
  return state.vendorOutlets.allIds.map(id => state.vendorOutlets.byId[id]);
};

export default vendorOutletsSlice.reducer;

