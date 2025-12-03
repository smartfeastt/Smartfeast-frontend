import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks.js';
import { syncOrders } from '../store/slices/vendorOrdersSlice.js';
import { syncPayments } from '../store/slices/vendorPaymentsSlice.js';
import { syncMenus } from '../store/slices/vendorMenusSlice.js';
import { syncOutlets } from '../store/slices/vendorOutletsSlice.js';

/**
 * Custom hook to handle automatic syncing for vendor data
 * Triggers sync on:
 * - Tab visibility change (becomes visible)
 * - Online event (reconnects to internet)
 * - WebSocket reconnect
 * - Initial load (if user is logged in)
 */
export const useVendorSync = () => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const isVendor = user?.type === 'owner' || user?.type === 'manager';
  const syncTriggeredRef = useRef(false);

  /**
   * Trigger sync for all vendor data
   */
  const triggerSync = () => {
    if (!token || !isVendor) return;
    
    console.log('[VendorSync] Triggering sync...');
    
    // Sync all vendor data
    dispatch(syncOrders({ token }));
    dispatch(syncPayments({ token }));
    dispatch(syncMenus({ token }));
    dispatch(syncOutlets({ token }));
  };

  // Sync on initial load (if vendor is logged in)
  useEffect(() => {
    if (token && isVendor && !syncTriggeredRef.current) {
      syncTriggeredRef.current = true;
      triggerSync();
    }
  }, [token, isVendor]);

  // Sync when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && token && isVendor) {
        console.log('[VendorSync] Tab became visible, syncing...');
        triggerSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, isVendor]);

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (token && isVendor) {
        console.log('[VendorSync] Came back online, syncing...');
        triggerSync();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [token, isVendor]);

  return { triggerSync };
};

