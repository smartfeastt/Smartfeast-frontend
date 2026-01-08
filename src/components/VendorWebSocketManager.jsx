import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks.js';
import io from 'socket.io-client';
import { syncOrders } from '../store/slices/vendorOrdersSlice.js';
import { syncPayments } from '../store/slices/vendorPaymentsSlice.js';
import { syncMenus } from '../store/slices/vendorMenusSlice.js';
import { syncOutlets } from '../store/slices/vendorOutletsSlice.js';
import { addOrUpdateOrder } from '../store/slices/vendorOrdersSlice.js';
import { connected, disconnected, reconnecting } from '../store/slices/socketSlice.js';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get socket.io base URL from API_URL
 * Removes /api suffix if present and converts http/https to ws/wss
 */
const getSocketUrl = () => {
  let baseUrl = API_URL;
  
  // Remove /api suffix if present
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
  
  // Convert http/https to ws/wss for socket.io
  // Socket.io handles this automatically, but we need the base URL
  return baseUrl;
};

/**
 * WebSocket Manager Component for Vendor Dashboard
 * Handles:
 * - Auto-reconnection
 * - Real-time order updates
 * - Sync on reconnect
 * - Room subscriptions
 */
export default function VendorWebSocketManager() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const socketRef = useRef(null);
  const isVendor = user?.type === 'owner' || user?.type === 'manager';
  const subscribedOutletsRef = useRef(new Set());

  /**
   * Trigger sync for all vendor data
   */
  const triggerSync = () => {
    if (!token || !isVendor) return;
    
    console.log('[VendorWebSocket] Triggering sync after reconnect...');
    dispatch(syncOrders({ token }));
    dispatch(syncPayments({ token }));
    dispatch(syncMenus({ token }));
    dispatch(syncOutlets({ token }));
  };

  useEffect(() => {
    if (!token || !isVendor) {
      // Disconnect if not vendor
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Get correct socket URL
    const socketUrl = getSocketUrl();
    
    // Initialize socket with auto-reconnection
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Allow fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[VendorWebSocket] Connected:', socket.id);
      dispatch(connected({ socketId: socket.id }));
      
      // Trigger sync on reconnect (handles missed events)
      triggerSync();
      
      // Re-subscribe to previously subscribed outlets
      subscribedOutletsRef.current.forEach(outletId => {
        socket.emit('join-outlet', outletId);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[VendorWebSocket] Disconnected:', reason);
      dispatch(disconnected({ error: reason }));
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[VendorWebSocket] Reconnected after', attemptNumber, 'attempts');
      dispatch(connected({ socketId: socket.id }));
      triggerSync();
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[VendorWebSocket] Reconnection attempt', attemptNumber);
      dispatch(reconnecting());
    });

    socket.on('reconnect_error', (error) => {
      console.error('[VendorWebSocket] Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('[VendorWebSocket] Reconnection failed');
      dispatch(disconnected({ error: 'Reconnection failed' }));
    });

    // Real-time order events
    socket.on('new-order', (order) => {
      console.log('[VendorWebSocket] New order received:', order);
      dispatch(addOrUpdateOrder(order));
    });

    socket.on('order-updated', (order) => {
      console.log('[VendorWebSocket] Order updated:', order);
      dispatch(addOrUpdateOrder(order));
    });

    socket.on('order-status-updated', (data) => {
      console.log('[VendorWebSocket] Order status updated:', data);
      if (data.order) {
        dispatch(addOrUpdateOrder(data.order));
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, isVendor, dispatch]);

  /**
   * Subscribe to outlet room (called from pages)
   */
  const subscribeToOutlet = (outletId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join-outlet', outletId);
      subscribedOutletsRef.current.add(outletId);
    }
  };

  /**
   * Unsubscribe from outlet room
   */
  const unsubscribeFromOutlet = (outletId) => {
    if (socketRef.current) {
      socketRef.current.leave(`outlet-${outletId}`);
      subscribedOutletsRef.current.delete(outletId);
    }
  };

  // Expose methods via window for debugging (optional)
  if (typeof window !== 'undefined') {
    window.vendorWebSocket = {
      subscribe: subscribeToOutlet,
      unsubscribe: unsubscribeFromOutlet,
      triggerSync,
    };
  }

  return null; // This component doesn't render anything
}

