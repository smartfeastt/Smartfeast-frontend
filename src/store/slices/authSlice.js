import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to parse JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Load initial state from localStorage
const loadInitialState = () => {
  const savedToken = localStorage.getItem('smartfeast_token');
  const savedUser = localStorage.getItem('smartfeast_user');
  
  if (savedToken && savedUser) {
    try {
      return {
        user: JSON.parse(savedUser),
        token: savedToken,
        loading: false,
      };
    } catch (error) {
      console.error('Error parsing saved user data:', error);
    }
  }
  
  return {
    user: null,
    token: null,
    loading: false,
  };
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, type }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type }),
      });

      const data = await response.json();
      
      if (data.success) {
        const decoded = parseJwt(data.token);
        const userData = {
          userId: decoded.userId,
          email: decoded.email,
          type: decoded.type,
          name: decoded.name,
          ownedRestaurants: decoded.ownedRestaurants || [],
          managedOutlets: decoded.managedOutlets || [],
        };
        
        // Save to localStorage
        localStorage.setItem('smartfeast_token', data.token);
        localStorage.setItem('smartfeast_user', JSON.stringify(userData));
        
        return { token: data.token, user: userData };
      } else {
        return rejectWithValue(data.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('smartfeast_token');
      localStorage.removeItem('smartfeast_user');
    },
    setAuth: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      if (token && user) {
        localStorage.setItem('smartfeast_token', token);
        localStorage.setItem('smartfeast_user', JSON.stringify(user));
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('smartfeast_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;

