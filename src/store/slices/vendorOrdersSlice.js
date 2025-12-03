import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Normalize order object to ensure it has all required fields
 */
const normalizeOrder = (order) => {
  return {
    orderId: order._id || order.orderId,
    orderNumber: order.orderNumber,
    orderType: order.orderType || 'DELIVERY', // DINE_IN, TAKEAWAY, DELIVERY
    restaurantId: order.restaurantId?._id || order.restaurantId || order.restaurantId?.toString(),
    outletId: order.outletId?._id || order.outletId || order.outletId?.toString(),
    status: order.status || 'pending',
    totalPrice: order.totalPrice,
    items: order.items || [],
    customerInfo: order.customerInfo,
    userId: order.userId?._id || order.userId,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || 'pending',
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
    sequenceId: order.sequenceId || null,
  };
};

/**
 * Fetch orders snapshot for reconciliation
 */
export const syncOrdersSnapshot = createAsyncThunk(
  'vendorOrders/syncSnapshot',
  async ({ outletId, since, token }, { rejectWithValue }) => {
    try {
      const url = new URL(`${API_URL}/api/order/outlet/${outletId}`);
      if (since) {
        url.searchParams.set('since', since);
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        return {
          orders: data.orders || [],
          lastSequenceId: data.lastSequenceId || null,
          outletId,
        };
      }
      return rejectWithValue(data.message || 'Failed to fetch snapshot');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch orders with filters
 */
export const fetchOrders = createAsyncThunk(
  'vendorOrders/fetchOrders',
  async ({ outletId, orderType, status, since, limit, token }, { rejectWithValue }) => {
    try {
      const url = new URL(`${API_URL}/api/order/outlet/${outletId}`);
      if (orderType) url.searchParams.set('orderType', orderType);
      if (status) url.searchParams.set('status', status);
      if (since) url.searchParams.set('since', since);
      if (limit) url.searchParams.set('limit', limit);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        return {
          orders: data.orders || [],
          lastSequenceId: data.lastSequenceId || null,
          outletId,
        };
      }
      return rejectWithValue(data.message || 'Failed to fetch orders');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update order status
 */
export const updateOrderStatus = createAsyncThunk(
  'vendorOrders/updateStatus',
  async ({ orderId, status, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      if (data.success) {
        return normalizeOrder(data.order);
      }
      return rejectWithValue(data.message || 'Failed to update order');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
  filters: {
    outletId: null,
    orderType: null, // DINE_IN, TAKEAWAY, DELIVERY, or null for all
    status: null, // pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled
  },
  lastSequenceId: null, // Highest processed socket sequence
  pendingFetchSince: null, // ISO timestamp for reconciliation
  subscribedOutlets: [], // Outlets we're subscribed to via socket
};

const vendorOrdersSlice = createSlice({
  name: 'vendorOrders',
  initialState,
  reducers: {
    /**
     * Set filters for orders
     */
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    /**
     * Add or update order (idempotent - used for socket events)
     */
    addOrUpdateOrder: (state, action) => {
      const order = normalizeOrder(action.payload);
      const orderId = order.orderId;
      
      // Update lastSequenceId if this event has one
      if (order.sequenceId && (!state.lastSequenceId || order.sequenceId > state.lastSequenceId)) {
        state.lastSequenceId = order.sequenceId;
      }
      
      // Idempotent: update if exists, insert otherwise
      if (state.byId[orderId]) {
        // Only update if new order is newer (by updatedAt)
        const existing = state.byId[orderId];
        const existingTime = new Date(existing.updatedAt).getTime();
        const newTime = new Date(order.updatedAt).getTime();
        
        if (newTime >= existingTime) {
          state.byId[orderId] = order;
        }
      } else {
        state.byId[orderId] = order;
        state.allIds.push(orderId);
      }
    },
    
    /**
     * Remove order
     */
    removeOrder: (state, action) => {
      const orderId = action.payload;
      if (state.byId[orderId]) {
        delete state.byId[orderId];
        state.allIds = state.allIds.filter(id => id !== orderId);
      }
    },
    
    /**
     * Process socket event
     */
    processSocketEvent: (state, action) => {
      const event = action.payload;
      const { eventType, sequenceId, payload, timestamp } = event;
      
      // Ignore if already processed
      if (sequenceId && state.lastSequenceId && sequenceId <= state.lastSequenceId) {
        return;
      }
      
      // Update lastSequenceId
      if (sequenceId && (!state.lastSequenceId || sequenceId > state.lastSequenceId)) {
        state.lastSequenceId = sequenceId;
      }
      
      // Process event by type
      switch (eventType) {
        case 'ORDER_CREATED':
        case 'ORDER_UPDATED':
          if (payload) {
            const order = normalizeOrder({ ...payload, sequenceId, updatedAt: timestamp });
            const orderId = order.orderId;
            
            if (state.byId[orderId]) {
              // Update if newer
              const existing = state.byId[orderId];
              const existingTime = new Date(existing.updatedAt).getTime();
              const newTime = new Date(order.updatedAt).getTime();
              
              if (newTime >= existingTime) {
                state.byId[orderId] = order;
              }
            } else {
              state.byId[orderId] = order;
              state.allIds.push(orderId);
            }
          }
          break;
          
        case 'ORDER_STATUS_CHANGED':
          if (payload && payload.orderId) {
            const orderId = payload.orderId;
            if (state.byId[orderId]) {
              state.byId[orderId] = {
                ...state.byId[orderId],
                status: payload.status,
                updatedAt: payload.updatedAt || timestamp,
                sequenceId,
              };
            }
          }
          break;
          
        case 'ORDER_DELETED':
          if (payload && payload.orderId) {
            const orderId = payload.orderId;
            if (state.byId[orderId]) {
              delete state.byId[orderId];
              state.allIds = state.allIds.filter(id => id !== orderId);
            }
          }
          break;
          
        case 'SNAPSHOT_REQUIRED':
          // Mark that we need to fetch a snapshot
          state.pendingFetchSince = timestamp || new Date().toISOString();
          break;
          
        default:
          break;
      }
    },
    
    /**
     * Set subscribed outlets
     */
    setSubscribedOutlets: (state, action) => {
      state.subscribedOutlets = action.payload;
    },
    
    /**
     * Clear slice (called on logout)
     */
    clearSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Sync snapshot
      .addCase(syncOrdersSnapshot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncOrdersSnapshot.fulfilled, (state, action) => {
        state.loading = false;
        const { orders, lastSequenceId, outletId } = action.payload;
        
        // Update lastSequenceId
        if (lastSequenceId) {
          state.lastSequenceId = lastSequenceId;
        }
        
        // Merge snapshot orders (replace if newer)
        orders.forEach(order => {
          const normalized = normalizeOrder(order);
          const orderId = normalized.orderId;
          
          if (state.byId[orderId]) {
            const existing = state.byId[orderId];
            const existingTime = new Date(existing.updatedAt).getTime();
            const newTime = new Date(normalized.updatedAt).getTime();
            
            if (newTime >= existingTime) {
              state.byId[orderId] = normalized;
            }
          } else {
            state.byId[orderId] = normalized;
            if (!state.allIds.includes(orderId)) {
              state.allIds.push(orderId);
            }
          }
        });
        
        // Update filters if outletId matches
        if (outletId && state.filters.outletId === outletId) {
          // Keep current filters
        }
      })
      .addCase(syncOrdersSnapshot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const { orders, lastSequenceId } = action.payload;
        
        if (lastSequenceId) {
          state.lastSequenceId = lastSequenceId;
        }
        
        // Replace orders for the filtered outlet
        const orderIds = [];
        orders.forEach(order => {
          const normalized = normalizeOrder(order);
          const orderId = normalized.orderId;
          state.byId[orderId] = normalized;
          orderIds.push(orderId);
        });
        
        // Update allIds to only include fetched orders (for filtered view)
        // In a real app, you might want to keep all orders and filter in selectors
        state.allIds = orderIds;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = action.payload;
        const orderId = order.orderId;
        
        if (state.byId[orderId]) {
          state.byId[orderId] = order;
        } else {
          state.byId[orderId] = order;
          state.allIds.push(orderId);
        }
      });
  },
});

export const {
  setFilters,
  addOrUpdateOrder,
  removeOrder,
  processSocketEvent,
  setSubscribedOutlets,
  clearSlice,
} = vendorOrdersSlice.actions;

// Selectors
export const selectOrdersById = (state) => state.vendorOrders.byId;
export const selectAllOrderIds = (state) => state.vendorOrders.allIds;
export const selectOrdersLoading = (state) => state.vendorOrders.loading;
export const selectOrdersError = (state) => state.vendorOrders.error;
export const selectOrdersFilters = (state) => state.vendorOrders.filters;
export const selectLastSequenceId = (state) => state.vendorOrders.lastSequenceId;

/**
 * Select filtered orders
 */
export const selectFilteredOrders = (state) => {
  const { byId, allIds, filters } = state.vendorOrders;
  let filtered = allIds.map(id => byId[id]);
  
  if (filters.outletId) {
    filtered = filtered.filter(order => order.outletId === filters.outletId);
  }
  
  if (filters.orderType) {
    filtered = filtered.filter(order => order.orderType === filters.orderType);
  }
  
  if (filters.status) {
    filtered = filtered.filter(order => order.status === filters.status);
  }
  
  return filtered;
};

/**
 * Select orders by outlet
 */
export const selectOrdersByOutlet = (outletId) => (state) => {
  const { byId, allIds } = state.vendorOrders;
  return allIds
    .map(id => byId[id])
    .filter(order => order.outletId === outletId);
};

export default vendorOrdersSlice.reducer;

