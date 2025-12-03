/**
 * Middleware to clear all slices on logout
 * Dispatches clearSlice() for all feature slices when logout action is dispatched
 */
export const clearOnLogoutMiddleware = (store) => (next) => (action) => {
  // Check if this is a logout action
  if (action.type === 'auth/logout' || action.type === 'auth/clearSlice') {
    // Dispatch clearSlice for all slices that have it
    const slicesToClear = [
      'vendorOrders',
      'vendorOutlets',
      'vendorMenus',
      'vendorPayments',
      'userOrders',
      'cart',
      'socket',
      'menu',
      'restaurant',
      'publicRestaurant',
      'theme', // Optional: you might want to keep theme
      'toast', // Optional: you might want to keep toast
    ];
    
    slicesToClear.forEach(sliceName => {
      try {
        // Try to dispatch clearSlice for each slice
        // Each slice should export clearSlice action
        store.dispatch({ type: `${sliceName}/clearSlice` });
      } catch (error) {
        // Silently fail if slice doesn't have clearSlice
        console.warn(`Slice ${sliceName} does not have clearSlice action`);
      }
    });
    
    // Also reset RTK Query caches
    try {
      // Reset payments API cache
      store.dispatch({ type: 'paymentsApi/reset' });
      // Reset analytics API cache
      store.dispatch({ type: 'analyticsApi/reset' });
    } catch (error) {
      console.warn('Error resetting RTK Query caches:', error);
    }
  }
  
  return next(action);
};

