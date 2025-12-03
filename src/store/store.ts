import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import menuReducer from './slices/menuSlice';
import ordersReducer from './slices/ordersSlice';
import themeReducer from './slices/themeSlice';
import toastReducer from './slices/toastSlice';
import restaurantReducer from './slices/restaurantSlice'
import publicRestaurantReducer from "./slices/publicRestaurantSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    menu: menuReducer,
    orders: ordersReducer,
    theme: themeReducer,
    toast: toastReducer,
    restaurant:restaurantReducer,
    publicRestaurant:publicRestaurantReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['menu.filters.diet'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

