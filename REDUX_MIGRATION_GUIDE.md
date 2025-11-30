# Redux Toolkit Migration Guide

## ✅ Completed Files
- `App.jsx` - Updated to use Redux Provider
- `store/store.js` - Redux store configuration
- `store/slices/authSlice.js` - Auth state management
- `store/slices/cartSlice.js` - Cart state management
- `store/hooks.js` - Typed Redux hooks
- `components/global/PrivateRoute.jsx` - Updated to use Redux
- `components/headers/DynamicHeader.jsx` - Updated to use Redux
- `components/Cart.jsx` - Updated to use Redux
- `pages/user/UserSignIn.jsx` - Updated to use Redux
- `pages/ViewOutlet.jsx` - Updated to use Redux

## 🔄 Migration Pattern

### For Auth Context → Redux:

**Before:**
```jsx
import { useAuth } from "../../context/AuthContext.jsx";
const { user, token, login, logout, setAuth } = useAuth();
```

**After:**
```jsx
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import { logout, loginUser, setAuth } from "../../store/slices/authSlice.js";

const { user, token } = useAppSelector((state) => state.auth);
const dispatch = useAppDispatch();

// Login
await dispatch(loginUser({ email, password, type })).unwrap();

// Logout
dispatch(logout());

// Set Auth
dispatch(setAuth({ token, user }));
```

### For Cart Context → Redux:

**Before:**
```jsx
import { useCart } from "../context/CartContext.jsx";
const { cartItems, addToCart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, toggleCart } = useCart();
```

**After:**
```jsx
import { useAppSelector, useAppDispatch } from "../store/hooks.js";
import { 
  addToCart, 
  removeFromCart, 
  updateQuantity,
  toggleCart,
  selectCartItems,
  selectTotalItems,
  selectTotalPrice
} from "../store/slices/cartSlice.js";

const cartItems = useAppSelector(selectCartItems);
const totalItems = useAppSelector(selectTotalItems);
const totalPrice = useAppSelector(selectTotalPrice);
const dispatch = useAppDispatch();

// Add to cart
dispatch(addToCart({ item, quantity: 1 }));

// Remove from cart
dispatch(removeFromCart(itemId));

// Update quantity
dispatch(updateQuantity({ itemId, quantity: 5 }));

// Toggle cart
dispatch(toggleCart());
```

## 📋 Files Still Needing Migration

1. `pages/user/UserSignUp.jsx` - Uses `setAuth`
2. `pages/user/UserHome.jsx` - Uses `useAuth`
3. `pages/user/UserProfile.jsx` - Uses `useAuth`
4. `pages/user/UserOrders.jsx` - Uses `useAuth`
5. `pages/user/UserSettings.jsx` - Uses `useAuth`
6. `pages/ViewRestaurant.jsx` - Uses `useCart`
7. `pages/Checkout.jsx` - Uses `useCart`, `useAuth`
8. `pages/owner/*.jsx` - All owner pages use `useAuth`
9. `pages/manager/*.jsx` - All manager pages use `useAuth`
10. `pages/global/Landing.jsx` - Uses `useAuth`
11. `components/MenuItem.jsx` - Uses `useCart`
12. `pages/owner/SignIn.jsx` - Uses `useAuth`
13. `pages/owner/SignUp.jsx` - Uses `useAuth`

## 🗑️ Files to Delete After Migration

- `context/AuthContext.jsx`
- `context/CartContext.jsx`

## 🎯 Benefits

1. **Better Performance**: Redux uses memoization and selective subscriptions
2. **Caching**: Redux DevTools provides time-travel debugging
3. **Predictable State**: Single source of truth
4. **Better Testing**: Easier to test with Redux
5. **Type Safety**: Can add TypeScript later easily

