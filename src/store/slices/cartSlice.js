import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadInitialState = () => {
  const savedCart = localStorage.getItem('smartfeast_cart');
  if (savedCart) {
    try {
      return {
        items: JSON.parse(savedCart),
        isOpen: false,
      };
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }
  return {
    items: [],
    isOpen: false,
    table: null,
  };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadInitialState(),
  reducers: {
    addToCart: (state, action) => {
      const { item, quantity = 1, outletId } = action.payload;
      const existingItem = state.items.find(cartItem => cartItem._id === item._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...item, quantity, outletId: outletId || item.outletId });
      }
      
      // Save to localStorage
      localStorage.setItem('smartfeast_cart', JSON.stringify(state.items));
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
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('smartfeast_cart');
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
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  toggleCart,
  setCartOpen,
  setTable
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartOpen = (state) => state.cart.isOpen;
export const selectTotalItems = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectTotalPrice = (state) => 
  state.cart.items.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);

export default cartSlice.reducer;

