import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Sync payments - fetches payments updated/created since lastSync
 * Note: This uses RTK Query paymentsApi, but we add sync capability here
 */
export const syncPayments = createAsyncThunk(
  'vendorPayments/sync',
  async ({ token }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const lastSync = state.vendorPayments?.lastSync || 0;
      const since = new Date(lastSync).toISOString();
      
      // For now, we'll use the existing paymentsApi endpoint with since param
      // If a dedicated sync endpoint is created, use that instead
      const url = new URL(`${API_URL}/api/payment/vendor`);
      url.searchParams.set('since', since);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Handle 404 gracefully - endpoint might not exist yet
      if (response.status === 404) {
        console.warn('[VendorPayments] Payment sync endpoint not found, skipping sync');
        return {
          payments: [],
          syncedAt: new Date().toISOString(),
        };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to sync payments' }));
        return rejectWithValue(errorData.message || 'Failed to sync payments');
      }
      
      const data = await response.json();
      if (data.success) {
        return {
          payments: data.payments || [],
          syncedAt: data.syncedAt || new Date().toISOString(),
        };
      }
      return rejectWithValue(data.message || 'Failed to sync payments');
    } catch (error) {
      // Handle network errors gracefully
      console.warn('[VendorPayments] Payment sync failed:', error.message);
      return {
        payments: [],
        syncedAt: new Date().toISOString(),
      };
    }
  }
);

/**
 * Merge incoming payments with existing payments
 */
const mergePayments = (existingById, existingAllIds, incomingPayments) => {
  const mergedById = { ...existingById };
  const mergedAllIds = [...existingAllIds];
  
  incomingPayments.forEach(payment => {
    const paymentId = payment._id || payment.id;
    if (!paymentId) return;
    
    if (mergedById[paymentId]) {
      // Conflict resolution: use newer version
      const existing = mergedById[paymentId];
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const newTime = new Date(payment.updatedAt || payment.createdAt || 0).getTime();
      
      if (newTime >= existingTime) {
        mergedById[paymentId] = payment;
      }
    } else {
      // New payment
      mergedById[paymentId] = payment;
      if (!mergedAllIds.includes(paymentId)) {
        mergedAllIds.push(paymentId);
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
  paymentsByOutlet: {}, // { outletId: [paymentIds] }
};

const vendorPaymentsSlice = createSlice({
  name: 'vendorPayments',
  initialState,
  reducers: {
    /**
     * Add or update payment (for socket updates)
     */
    addOrUpdatePayment: (state, action) => {
      const payment = action.payload;
      const paymentId = payment._id || payment.id;
      const outletId = payment.outletId?._id || payment.outletId;
      
      if (!paymentId) return;
      
      state.byId[paymentId] = payment;
      if (!state.allIds.includes(paymentId)) {
        state.allIds.push(paymentId);
      }
      
      // Update paymentsByOutlet index
      if (outletId) {
        if (!state.paymentsByOutlet[outletId]) {
          state.paymentsByOutlet[outletId] = [];
        }
        if (!state.paymentsByOutlet[outletId].includes(paymentId)) {
          state.paymentsByOutlet[outletId].push(paymentId);
        }
      }
    },
    
    /**
     * Remove payment
     */
    removePayment: (state, action) => {
      const paymentId = action.payload;
      if (state.byId[paymentId]) {
        const payment = state.byId[paymentId];
        const outletId = payment.outletId?._id || payment.outletId;
        
        delete state.byId[paymentId];
        state.allIds = state.allIds.filter(id => id !== paymentId);
        
        // Update paymentsByOutlet index
        if (outletId && state.paymentsByOutlet[outletId]) {
          state.paymentsByOutlet[outletId] = state.paymentsByOutlet[outletId].filter(id => id !== paymentId);
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
      // Sync payments
      .addCase(syncPayments.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncPayments.fulfilled, (state, action) => {
        state.syncing = false;
        const { payments, syncedAt } = action.payload;
        
        // Merge incoming payments
        const { mergedById, mergedAllIds } = mergePayments(state.byId, state.allIds, payments);
        state.byId = mergedById;
        state.allIds = mergedAllIds;
        
        // Update paymentsByOutlet index
        payments.forEach(payment => {
          const paymentId = payment._id || payment.id;
          const outletId = payment.outletId?._id || payment.outletId;
          if (paymentId && outletId) {
            if (!state.paymentsByOutlet[outletId]) {
              state.paymentsByOutlet[outletId] = [];
            }
            if (!state.paymentsByOutlet[outletId].includes(paymentId)) {
              state.paymentsByOutlet[outletId].push(paymentId);
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
      .addCase(syncPayments.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      });
  },
});

export const {
  addOrUpdatePayment,
  removePayment,
  clearSlice,
} = vendorPaymentsSlice.actions;

/**
 * Select all payments
 */
export const selectAllPayments = (state) => {
  const { byId, allIds } = state.vendorPayments;
  return allIds.map(id => byId[id]).filter(Boolean);
};

/**
 * Select payments by outlet
 */
export const selectPaymentsByOutlet = (outletId) => (state) => {
  const { byId, paymentsByOutlet } = state.vendorPayments;
  const paymentIds = paymentsByOutlet[outletId] || [];
  return paymentIds.map(id => byId[id]).filter(Boolean);
};

export default vendorPaymentsSlice.reducer;

