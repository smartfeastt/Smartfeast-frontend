import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to create order
export const createOrder = createAsyncThunk(
  'orders/create',
  async ({ items, totalPrice, deliveryAddress, paymentMethod, paymentType, customerInfo, orderType, tableNumber, token }, { rejectWithValue }) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add token only if provided (for logged-in users)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/order/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items,
          totalPrice,
          deliveryAddress,
          paymentMethod,
          paymentType: paymentType || 'pay_now', // pay_now or pay_later
          customerInfo, // Required for guest orders
          orderType, // Order type: dine_in, takeaway, or delivery
          tableNumber: orderType === 'dine_in' ? tableNumber : null, // Table number for dine-in orders
        }),
      });
      const data = await response.json();
      if (data.success) {
        return data.order;
      }
      return rejectWithValue(data.message || 'Failed to create order');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch user orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/order/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

// Async thunk to fetch outlet orders
export const fetchOutletOrders = createAsyncThunk(
  'orders/fetchOutletOrders',
  async ({ outletId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/order/outlet/${outletId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

// Async thunk to update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        return data.order;
      }
      return rejectWithValue(data.message || 'Failed to update order');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const savedOutletOrders = localStorage.getItem('smartfeast_outlet_orders');
    const savedUserOrders = localStorage.getItem('smartfeast_user_orders');
    const savedOutletOrdersMap = savedOutletOrders ? JSON.parse(savedOutletOrders) : {};
    const savedUserOrdersList = savedUserOrders ? JSON.parse(savedUserOrders) : [];
    
    return {
      userOrders: savedUserOrdersList,
      outletOrders: [], // Will be loaded per outlet
      outletOrdersMap: savedOutletOrdersMap, // Map of outletId -> orders[]
      loading: false,
      error: null,
      creating: false,
      lastSync: null,
      currentOutletId: null,
    };
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return {
      userOrders: [],
      outletOrders: [],
      outletOrdersMap: {},
      loading: false,
      error: null,
      creating: false,
      lastSync: null,
      currentOutletId: null,
    };
  }
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState: loadInitialState(),
  reducers: {
    addOrder: (state, action) => {
      state.userOrders.unshift(action.payload);
    },
    addOrUpdateOutletOrder: (state, action) => {
      const order = action.payload;
      const orderId = order._id || order.id;
      const outletId = order.outletId?._id?.toString() || order.outletId?.toString() || state.currentOutletId;
      
      if (!outletId) {
        console.warn('Cannot add order: no outletId found');
        return;
      }

      // Update outletOrders array (for current outlet)
      const outletIndex = state.outletOrders.findIndex((o) => (o._id || o.id) === orderId);
      if (outletIndex !== -1) {
        // Update existing order
        state.outletOrders[outletIndex] = { ...state.outletOrders[outletIndex], ...order };
      } else {
        // Add new order to the beginning of the array
        state.outletOrders.unshift(order);
      }

      // Update outletOrdersMap (persistent storage)
      if (!state.outletOrdersMap[outletId]) {
        state.outletOrdersMap[outletId] = [];
      }
      const mapIndex = state.outletOrdersMap[outletId].findIndex((o) => (o._id || o.id) === orderId);
      if (mapIndex !== -1) {
        state.outletOrdersMap[outletId][mapIndex] = { ...state.outletOrdersMap[outletId][mapIndex], ...order };
      } else {
        state.outletOrdersMap[outletId].unshift(order);
      }

      // Persist to localStorage
      try {
        localStorage.setItem('smartfeast_outlet_orders', JSON.stringify(state.outletOrdersMap));
      } catch (error) {
        console.error('Error saving orders to localStorage:', error);
      }
    },
    setCurrentOutlet: (state, action) => {
      const outletId = action.payload;
      state.currentOutletId = outletId;
      // Load orders for this outlet from map
      if (state.outletOrdersMap[outletId]) {
        state.outletOrders = state.outletOrdersMap[outletId];
      } else {
        state.outletOrders = [];
      }
    },
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;
      const userIndex = state.userOrders.findIndex((o) => o._id === updatedOrder._id);
      const outletIndex = state.outletOrders.findIndex((o) => o._id === updatedOrder._id);
      
      if (userIndex !== -1) {
        state.userOrders[userIndex] = updatedOrder;
      }
      if (outletIndex !== -1) {
        state.outletOrders[outletIndex] = updatedOrder;
      }
    },
    clearOrders: (state) => {
      state.userOrders = [];
      state.outletOrders = [];
      state.outletOrdersMap = {};
      try {
        localStorage.removeItem('smartfeast_outlet_orders');
        localStorage.removeItem('smartfeast_user_orders');
      } catch (error) {
        console.error('Error clearing orders from localStorage:', error);
      }
    },
    clearOutletOrders: (state, action) => {
      const outletId = action.payload;
      if (outletId && state.outletOrdersMap[outletId]) {
        delete state.outletOrdersMap[outletId];
        if (state.currentOutletId === outletId) {
          state.outletOrders = [];
        }
        try {
          localStorage.setItem('smartfeast_outlet_orders', JSON.stringify(state.outletOrdersMap));
        } catch (error) {
          console.error('Error saving orders to localStorage:', error);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        state.userOrders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        const orders = action.payload || [];
        state.userOrders = orders;
        
        // Persist to localStorage
        try {
          localStorage.setItem('smartfeast_user_orders', JSON.stringify(orders));
        } catch (error) {
          console.error('Error saving user orders to localStorage:', error);
        }
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // On error, try to load from cache
        try {
          const saved = localStorage.getItem('smartfeast_user_orders');
          if (saved) {
            state.userOrders = JSON.parse(saved);
          }
        } catch (error) {
          console.error('Error loading user orders from cache:', error);
        }
      })
      // Fetch outlet orders
      .addCase(fetchOutletOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutletOrders.fulfilled, (state, action) => {
        state.loading = false;
        const orders = action.payload || [];
        const outletId = action.meta.arg.outletId;
        
        // Update current outlet orders
        state.outletOrders = orders;
        state.currentOutletId = outletId;
        
        // Update outletOrdersMap for persistence
        state.outletOrdersMap[outletId] = orders;
        state.lastSync = new Date().toISOString();
        
        // Persist to localStorage
        try {
          localStorage.setItem('smartfeast_outlet_orders', JSON.stringify(state.outletOrdersMap));
        } catch (error) {
          console.error('Error saving orders to localStorage:', error);
        }
      })
      .addCase(fetchOutletOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // On error, try to load from cache
        const outletId = action.meta.arg?.outletId;
        if (outletId && state.outletOrdersMap[outletId]) {
          state.outletOrders = state.outletOrdersMap[outletId];
        }
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const orderId = updatedOrder._id || updatedOrder.id;
        const outletId = updatedOrder.outletId?._id?.toString() || updatedOrder.outletId?.toString() || state.currentOutletId;
        
        // Update user orders
        const userIndex = state.userOrders.findIndex((o) => o._id === orderId);
        if (userIndex !== -1) {
          state.userOrders[userIndex] = updatedOrder;
        }
        
        // Update outlet orders
        const outletIndex = state.outletOrders.findIndex((o) => o._id === orderId);
        if (outletIndex !== -1) {
          state.outletOrders[outletIndex] = updatedOrder;
        }
        
        // Update outletOrdersMap if outletId is known
        if (outletId && state.outletOrdersMap[outletId]) {
          const mapIndex = state.outletOrdersMap[outletId].findIndex((o) => (o._id || o.id) === orderId);
          if (mapIndex !== -1) {
            state.outletOrdersMap[outletId][mapIndex] = updatedOrder;
          }
        }
        
        // Persist to localStorage
        try {
          localStorage.setItem('smartfeast_outlet_orders', JSON.stringify(state.outletOrdersMap));
          if (state.userOrders.length > 0) {
            localStorage.setItem('smartfeast_user_orders', JSON.stringify(state.userOrders));
          }
        } catch (error) {
          console.error('Error saving orders to localStorage:', error);
        }
      });
  },
});

export const { addOrder, addOrUpdateOutletOrder, updateOrder, clearOrders, clearOutletOrders, setCurrentOutlet } = ordersSlice.actions;

// Selectors
export const selectUserOrders = (state) => state.orders.userOrders;
export const selectOutletOrders = (state) => state.orders.outletOrders;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrderCreating = (state) => state.orders.creating;
export const selectOrdersError = (state) => state.orders.error;

export default ordersSlice.reducer;

