import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadInitialState = () => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    return { isDark: saved === 'dark' };
  }
  return { isDark: window.matchMedia('(prefers-color-scheme: dark)').matches };
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: loadInitialState(),
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      const root = window.document.documentElement;
      if (state.isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    },
    setTheme: (state, action) => {
      state.isDark = action.payload;
      const root = window.document.documentElement;
      if (state.isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    },
  },
});

// Initialize theme on load
const initialState = loadInitialState();
const root = window.document.documentElement;
if (initialState.isDark) {
  root.classList.add('dark');
} else {
  root.classList.remove('dark');
}

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectIsDark = (state) => state.theme.isDark;

export default themeSlice.reducer;

