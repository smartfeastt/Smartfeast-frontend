import { createSlice } from '@reduxjs/toolkit';

let counter = 0;

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      const { msg, type = 'info' } = action.payload;
      const id = ++counter;
      state.toasts.push({ id, msg, type });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export const selectToasts = (state) => state.toast.toasts;

export default toastSlice.reducer;

