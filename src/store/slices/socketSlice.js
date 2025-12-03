import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  connecting: false,
  disconnected: true,
  lastEventId: null,
  lastSequenceId: null, // Per outlet sequence tracking
  sequenceByOutlet: {}, // { outletId: sequenceId }
  pendingEvents: [], // Events received while offline
  reconnectionAttempts: 0,
  lastReconnectAt: null,
  subscribedRooms: [], // ['vendor:outletId1', 'vendor:outletId2']
  connectionError: null,
  heartbeatInterval: null,
  lastHeartbeat: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    /**
     * Socket connection started
     */
    connecting: (state) => {
      state.connecting = true;
      state.disconnected = false;
      state.connectionError = null;
    },
    
    /**
     * Socket connected
     */
    connected: (state, action) => {
      state.connected = true;
      state.connecting = false;
      state.disconnected = false;
      state.reconnectionAttempts = 0;
      state.connectionError = null;
      state.lastReconnectAt = new Date().toISOString();
      
      // Set initial sequence IDs from server
      if (action.payload?.sequenceByOutlet) {
        state.sequenceByOutlet = { ...state.sequenceByOutlet, ...action.payload.sequenceByOutlet };
      }
      
      if (action.payload?.lastSequenceId) {
        state.lastSequenceId = action.payload.lastSequenceId;
      }
    },
    
    /**
     * Socket disconnected
     */
    disconnected: (state, action) => {
      state.connected = false;
      state.connecting = false;
      state.disconnected = true;
      if (action.payload?.error) {
        state.connectionError = action.payload.error;
      }
    },
    
    /**
     * Reconnection attempt
     */
    reconnecting: (state) => {
      state.connecting = true;
      state.reconnectionAttempts += 1;
    },
    
    /**
     * Update last sequence ID for an outlet
     */
    updateSequenceId: (state, action) => {
      const { outletId, sequenceId } = action.payload;
      if (outletId) {
        state.sequenceByOutlet[outletId] = sequenceId;
      }
      if (sequenceId && (!state.lastSequenceId || sequenceId > state.lastSequenceId)) {
        state.lastSequenceId = sequenceId;
      }
    },
    
    /**
     * Add pending event (received while offline)
     */
    addPendingEvent: (state, action) => {
      state.pendingEvents.push({
        ...action.payload,
        receivedAt: new Date().toISOString(),
      });
    },
    
    /**
     * Clear pending events (after processing)
     */
    clearPendingEvents: (state) => {
      state.pendingEvents = [];
    },
    
    /**
     * Set subscribed rooms
     */
    setSubscribedRooms: (state, action) => {
      state.subscribedRooms = action.payload;
    },
    
    /**
     * Add subscribed room
     */
    addSubscribedRoom: (state, action) => {
      const room = action.payload;
      if (!state.subscribedRooms.includes(room)) {
        state.subscribedRooms.push(room);
      }
    },
    
    /**
     * Remove subscribed room
     */
    removeSubscribedRoom: (state, action) => {
      const room = action.payload;
      state.subscribedRooms = state.subscribedRooms.filter(r => r !== room);
    },
    
    /**
     * Set heartbeat
     */
    setHeartbeat: (state, action) => {
      state.lastHeartbeat = action.payload || new Date().toISOString();
    },
    
    /**
     * Set connection error
     */
    setConnectionError: (state, action) => {
      state.connectionError = action.payload;
    },
    
    /**
     * Clear slice (on logout)
     */
    clearSlice: () => initialState,
  },
});

export const {
  connecting,
  connected,
  disconnected,
  reconnecting,
  updateSequenceId,
  addPendingEvent,
  clearPendingEvents,
  setSubscribedRooms,
  addSubscribedRoom,
  removeSubscribedRoom,
  setHeartbeat,
  setConnectionError,
  clearSlice,
} = socketSlice.actions;

// Selectors
export const selectSocketConnected = (state) => state.socket.connected;
export const selectSocketConnecting = (state) => state.socket.connecting;
export const selectSocketDisconnected = (state) => state.socket.disconnected;
export const selectLastSequenceId = (state) => state.socket.lastSequenceId;
export const selectSequenceByOutlet = (state) => state.socket.sequenceByOutlet;
export const selectPendingEvents = (state) => state.socket.pendingEvents;
export const selectSubscribedRooms = (state) => state.socket.subscribedRooms;
export const selectConnectionError = (state) => state.socket.connectionError;
export const selectReconnectionAttempts = (state) => state.socket.reconnectionAttempts;

/**
 * Get sequence ID for a specific outlet
 */
export const selectSequenceIdByOutlet = (outletId) => (state) => {
  return state.socket.sequenceByOutlet[outletId] || null;
};

export default socketSlice.reducer;

