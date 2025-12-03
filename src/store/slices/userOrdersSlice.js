import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Normalize order for user side
 */
const normalizeOrder = (order) => {
  return {
    orderId: order._id || order.orderId,
    orderNumber: order.orderNumber,
    orderType: order.orderType || 'DELIVERY',
    restaurantId: order.restaurantId?._id || order.restaurantId,
    outletId: order.outletId?._id || order.outletId,
    restaurantName: order.restaurantId?.name || order.restaurantName,
    outletName: order.outletId?.name || order.outletName,
    status: order.status || 'pending',
    totalPrice: order.totalPrice,
    items: order.items || [],
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || 'pending',
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
  };
};

/**
 * Fetch user orders
 */
export const fetchUserOrders = createAsyncThunk(
  'userOrders/fetch',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/order/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        return data.orders || [];
      }
      return rejectWithValue(data.message || 'Failed to fetch orders');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create order (user side)
 */
export const createUserOrder = createAsyncThunk(
  'userOrders/create',
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/order/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      if (data.success) {
        return normalizeOrder(data.order);
      }
      return rejectWithValue(data.message || 'Failed to create order');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  byId: {},
  allIds: [],
  activeOrderId: null, // Currently tracking order
  loading: false,
  error: null,
};

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {
    /**
     * Set active order (for live tracking)
     */
    setActiveOrder: (state, action) => {
      state.activeOrderId = action.payload;
    },
    
    /**
     * Add or update order (for socket updates)
     */
    addOrUpdateOrder: (state, action) => {
      const order = normalizeOrder(action.payload);
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
    },
    
    /**
     * Process socket event for user orders
     */
    processSocketEvent: (state, action) => {
      const event = action.payload;
      const { eventType, payload } = event;
      
      if (eventType === 'ORDER_UPDATED' || eventType === 'ORDER_STATUS_CHANGED') {
        if (payload) {
          const order = normalizeOrder(payload);
          const orderId = order.orderId;
          
          if (state.byId[orderId]) {
            state.byId[orderId] = { ...state.byId[orderId], ...order };
          }
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
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        const orders = action.payload;
        
        orders.forEach(order => {
          const normalized = normalizeOrder(order);
          const orderId = normalized.orderId;
          state.byId[orderId] = normalized;
          if (!state.allIds.includes(orderId)) {
            state.allIds.push(orderId);
          }
        });
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUserOrder.fulfilled, (state, action) => {
        const order = action.payload;
        const orderId = order.orderId;
        state.byId[orderId] = order;
        state.allIds.unshift(orderId); // Add to beginning
        state.activeOrderId = orderId; // Set as active
      });
  },
});

export const {
  setActiveOrder,
  addOrUpdateOrder,
  processSocketEvent,
  clearSlice,
} = userOrdersSlice.actions;

// Selectors
export const selectUserOrdersById = (state) => state.userOrders.byId;
export const selectAllUserOrderIds = (state) => state.userOrders.allIds;
export const selectUserOrdersLoading = (state) => state.userOrders.loading;
export const selectActiveOrder = (state) => {
  const activeId = state.userOrders.activeOrderId;
  return activeId ? state.userOrders.byId[activeId] : null;
};

/**
 * Select all user orders as array (sorted by createdAt desc)
 */
export const selectAllUserOrders = (state) => {
  return state.userOrders.allIds
    .map(id => state.userOrders.byId[id])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export default userOrdersSlice.reducer;

