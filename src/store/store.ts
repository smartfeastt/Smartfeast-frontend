import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import menuReducer from './slices/menuSlice';
import ordersReducer from './slices/ordersSlice'; // Legacy - keep for backward compatibility
import themeReducer from './slices/themeSlice';
import toastReducer from './slices/toastSlice';
import restaurantReducer from './slices/restaurantSlice';
import publicRestaurantReducer from './slices/publicRestaurantSlice';

// New vendor slices
import vendorOrdersReducer from './slices/vendorOrdersSlice';
import vendorOutletsReducer from './slices/vendorOutletsSlice';
import socketReducer from './slices/socketSlice';

// User slices
import userOrdersReducer from './slices/userOrdersSlice';

// RTK Query APIs
import { paymentsApi } from './api/paymentsApi';
import { analyticsApi } from './api/analyticsApi';

// Middleware
import { clearOnLogoutMiddleware } from './middleware/clearOnLogout';

export const store = configureStore({
  reducer: {
    // Auth
    auth: authReducer,
    
    // Legacy slices (for backward compatibility)
    cart: cartReducer,
    menu: menuReducer,
    orders: ordersReducer,
    theme: themeReducer,
    toast: toastReducer,
    restaurant: restaurantReducer,
    publicRestaurant: publicRestaurantReducer,
    
    // New vendor slices
    vendorOrders: vendorOrdersReducer,
    vendorOutlets: vendorOutletsReducer,
    socket: socketReducer,
    
    // User slices
    userOrders: userOrdersReducer,
    
    // RTK Query APIs
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['menu.filters.diet'],
      },
    })
      .concat(paymentsApi.middleware)
      .concat(analyticsApi.middleware)
      .concat(clearOnLogoutMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

