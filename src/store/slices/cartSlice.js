import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch cart from backend
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Transform backend cart items to match frontend format
        return (data.cart?.items || []).map(item => ({
          _id: item.itemId?._id || item.itemId,
          itemName: item.itemName,
          itemPrice: item.itemPrice,
          quantity: item.quantity,
          itemPhoto: item.itemPhoto,
          outletId: item.outletId,
        }));
      }
      return rejectWithValue(data.message || 'Failed to fetch cart');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to sync cart to backend
export const syncCartToBackend = createAsyncThunk(
  'cart/syncToBackend',
  async ({ token, items }, { rejectWithValue }) => {
    try {
      // For each item, add to backend cart
      for (const item of items) {
        await fetch(`${API_URL}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: item._id,
            quantity: item.quantity,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            itemPhoto: item.itemPhoto,
            outletId: item.outletId,
          }),
        });
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Load initial state from localStorage
const loadInitialState = () => {
  const savedCart = localStorage.getItem('smartfeast_cart');
  if (savedCart) {
    try {
      return {
        items: JSON.parse(savedCart),
        isOpen: false,
        syncing: false,
      };
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }
  return {
    items: [],
    isOpen: false,
    table: null,
    syncing: false,
  };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadInitialState(),
  reducers: {
    addToCart: (state, action) => {
      const { item, quantity = 1, outletId, syncToBackend = false } = action.payload;
      const existingItem = state.items.find(cartItem => cartItem._id === item._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...item, quantity, outletId: outletId || item.outletId });
      }
      
      // Save to localStorage
      localStorage.setItem('smartfeast_cart', JSON.stringify(state.items));
      
      // Note: Backend sync is handled by CartSync component to avoid race conditions
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      localStorage.setItem('smartfeast_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item._id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item._id !== itemId);
        } else {
          item.quantity = quantity;
        }
      }
      
      localStorage.setItem('smartfeast_cart', JSON.stringify(state.items));
      
      // Note: Backend sync is handled by CartSync component
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('smartfeast_cart');
    },
    setCartItems: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('smartfeast_cart', JSON.stringify(action.payload));
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setTable: (state, action) => {
      state.table = action.payload;
    },
    clearSlice: (state) => {
      state.items = [];
      state.isOpen = false;
      state.table = null;
      state.syncing = false;
      localStorage.removeItem('smartfeast_cart');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.syncing = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncing = false;
        localStorage.setItem('smartfeast_cart', JSON.stringify(action.payload));
      })
      .addCase(fetchCart.rejected, (state) => {
        state.syncing = false;
      })
      .addCase(syncCartToBackend.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncCartToBackend.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncCartToBackend.rejected, (state) => {
        state.syncing = false;
      });
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  setCartItems,
  toggleCart,
  setCartOpen,
  setTable,
  clearSlice
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartOpen = (state) => state.cart.isOpen;
export const selectTotalItems = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectTotalPrice = (state) => 
  state.cart.items.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);

export default cartSlice.reducer;

