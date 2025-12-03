import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to create order
export const createOrder = createAsyncThunk(
  'orders/create',
  async ({ items, totalPrice, deliveryAddress, paymentMethod, customerInfo, orderType, token }, { rejectWithValue }) => {
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
          customerInfo, // Required for guest orders
          orderType, // Order type: dine_in, takeaway, or delivery
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

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    userOrders: [],
    outletOrders: [],
    loading: false,
    error: null,
    creating: false,
  },
  reducers: {
    addOrder: (state, action) => {
      state.userOrders.unshift(action.payload);
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
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch outlet orders
      .addCase(fetchOutletOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutletOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.outletOrders = action.payload;
      })
      .addCase(fetchOutletOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const userIndex = state.userOrders.findIndex((o) => o._id === updatedOrder._id);
        const outletIndex = state.outletOrders.findIndex((o) => o._id === updatedOrder._id);
        
        if (userIndex !== -1) {
          state.userOrders[userIndex] = updatedOrder;
        }
        if (outletIndex !== -1) {
          state.outletOrders[outletIndex] = updatedOrder;
        }
      });
  },
});

export const { addOrder, updateOrder, clearOrders } = ordersSlice.actions;

// Selectors
export const selectUserOrders = (state) => state.orders.userOrders;
export const selectOutletOrders = (state) => state.orders.outletOrders;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrderCreating = (state) => state.orders.creating;
export const selectOrdersError = (state) => state.orders.error;

export default ordersSlice.reducer;

