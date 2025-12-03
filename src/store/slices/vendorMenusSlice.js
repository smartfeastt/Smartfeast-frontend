import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Sync menu items - fetches items updated/created since lastSync
 */
export const syncMenus = createAsyncThunk(
  'vendorMenus/sync',
  async ({ token }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const lastSync = state.vendorMenus?.lastSync || 0;
      const since = new Date(lastSync).toISOString();
      
      const url = new URL(`${API_URL}/api/item/sync`);
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
          items: data.items || [],
          syncedAt: data.syncedAt || new Date().toISOString(),
        };
      }
      return rejectWithValue(data.message || 'Failed to sync menu items');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Merge incoming menu items with existing items
 */
const mergeMenuItems = (existingById, existingAllIds, incomingItems) => {
  const mergedById = { ...existingById };
  const mergedAllIds = [...existingAllIds];
  
  incomingItems.forEach(item => {
    const itemId = item._id || item.id;
    if (!itemId) return;
    
    if (mergedById[itemId]) {
      // Conflict resolution: use newer version
      const existing = mergedById[itemId];
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const newTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
      
      if (newTime >= existingTime) {
        mergedById[itemId] = item;
      }
    } else {
      // New item
      mergedById[itemId] = item;
      if (!mergedAllIds.includes(itemId)) {
        mergedAllIds.push(itemId);
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
  lastSync: 0, // Timestamp of last successful sync
  syncing: false, // Whether a sync is in progress
  itemsByOutlet: {}, // { outletId: [itemIds] }
};

const vendorMenusSlice = createSlice({
  name: 'vendorMenus',
  initialState,
  reducers: {
    /**
     * Add or update menu item (for socket updates)
     */
    addOrUpdateMenuItem: (state, action) => {
      const item = action.payload;
      const itemId = item._id || item.id;
      const outletId = item.outletId?._id || item.outletId;
      
      if (!itemId) return;
      
      state.byId[itemId] = item;
      if (!state.allIds.includes(itemId)) {
        state.allIds.push(itemId);
      }
      
      // Update itemsByOutlet index
      if (outletId) {
        if (!state.itemsByOutlet[outletId]) {
          state.itemsByOutlet[outletId] = [];
        }
        if (!state.itemsByOutlet[outletId].includes(itemId)) {
          state.itemsByOutlet[outletId].push(itemId);
        }
      }
    },
    
    /**
     * Remove menu item
     */
    removeMenuItem: (state, action) => {
      const itemId = action.payload;
      if (state.byId[itemId]) {
        const item = state.byId[itemId];
        const outletId = item.outletId?._id || item.outletId;
        
        delete state.byId[itemId];
        state.allIds = state.allIds.filter(id => id !== itemId);
        
        // Update itemsByOutlet index
        if (outletId && state.itemsByOutlet[outletId]) {
          state.itemsByOutlet[outletId] = state.itemsByOutlet[outletId].filter(id => id !== itemId);
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
      // Sync menu items
      .addCase(syncMenus.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncMenus.fulfilled, (state, action) => {
        state.syncing = false;
        const { items, syncedAt } = action.payload;
        
        // Merge incoming items
        const { mergedById, mergedAllIds } = mergeMenuItems(state.byId, state.allIds, items);
        state.byId = mergedById;
        state.allIds = mergedAllIds;
        
        // Update itemsByOutlet index
        items.forEach(item => {
          const itemId = item._id || item.id;
          const outletId = item.outletId?._id || item.outletId;
          if (itemId && outletId) {
            if (!state.itemsByOutlet[outletId]) {
              state.itemsByOutlet[outletId] = [];
            }
            if (!state.itemsByOutlet[outletId].includes(itemId)) {
              state.itemsByOutlet[outletId].push(itemId);
            }
          }
        });
        
        // Update lastSync timestamp
        if (syncedAt) {
          state.lastSync = new Date(syncedAt).getTime();
        } else {
          state.lastSync = Date.now();
        }
      })
      .addCase(syncMenus.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      });
  },
});

export const {
  addOrUpdateMenuItem,
  removeMenuItem,
  clearSlice,
} = vendorMenusSlice.actions;

/**
 * Select all menu items
 */
export const selectAllMenuItems = (state) => {
  const { byId, allIds } = state.vendorMenus;
  return allIds.map(id => byId[id]).filter(Boolean);
};

/**
 * Select menu items by outlet
 */
export const selectMenuItemsByOutlet = (outletId) => (state) => {
  const { byId, itemsByOutlet } = state.vendorMenus;
  const itemIds = itemsByOutlet[outletId] || [];
  return itemIds.map(id => byId[id]).filter(Boolean);
};

export default vendorMenusSlice.reducer;

