import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks.js';
import { fetchCart, syncCartToBackend, setCartItems, selectCartItems } from '../store/slices/cartSlice.js';

/**
 * Component to sync cart between localStorage and backend
 * Automatically syncs on login/logout
 */
export default function CartSync() {
  const { token, user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (token && user?.type === 'user') {
      // User logged in - fetch cart from backend and merge with local
      handleLoginSync();
    } else if (!token) {
      // User logged out - cart stays in localStorage for guest
      // No action needed
    }
  }, [token, user]);

  const handleLoginSync = async () => {
    try {
      // Fetch cart from backend
      const backendCart = await dispatch(fetchCart(token)).unwrap();
      
      // Get local cart
      const localCart = JSON.parse(localStorage.getItem('smartfeast_cart') || '[]');
      
      if (backendCart.length > 0) {
        // Backend has cart - use it and sync local items to backend
        dispatch(setCartItems(backendCart));
        
        // Merge local cart items that aren't in backend
        if (localCart.length > 0) {
          const mergedItems = [...backendCart];
          localCart.forEach(localItem => {
            const exists = backendCart.find(bItem => bItem._id === localItem._id);
            if (!exists) {
              mergedItems.push(localItem);
            }
          });
          
          if (mergedItems.length > backendCart.length) {
            // Sync new items to backend
            const newItems = mergedItems.filter(item => 
              !backendCart.find(bItem => bItem._id === item._id)
            );
            if (newItems.length > 0) {
              await dispatch(syncCartToBackend({ token, items: newItems })).unwrap();
            }
            dispatch(setCartItems(mergedItems));
          }
        }
      } else if (localCart.length > 0) {
        // Backend empty but local has items - sync local to backend
        await dispatch(syncCartToBackend({ token, items: localCart })).unwrap();
        dispatch(setCartItems(localCart));
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      // On error, keep local cart
    }
  };

  // Sync cart changes to backend when user is logged in
  useEffect(() => {
    if (token && user?.type === 'user' && cartItems.length >= 0) {
      // Debounce sync to avoid too many API calls
      const timeoutId = setTimeout(() => {
        syncCartChanges();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, token, user]);

  const syncCartChanges = async () => {
    if (!token || user?.type !== 'user') return;
    
    try {
      // Sync entire cart to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/sync`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            itemId: item._id,
            quantity: item.quantity,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            itemPhoto: item.itemPhoto,
            outletId: item.outletId,
          })),
        }),
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error('Error syncing cart:', data.message);
      }
    } catch (error) {
      console.error('Error syncing cart changes:', error);
    }
  };

  return null; // This component doesn't render anything
}

