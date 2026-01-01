import { useState, useEffect, useRef } from "react";
import { Plus, Minus, ShoppingBag, ArrowLeft } from "react-feather";
import { useAppSelector, useAppDispatch } from "../store/hooks.js";
import { 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  selectCartItems,
  selectTotalPrice
} from "../store/slices/cartSlice.js";
import { Link } from "react-router-dom";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

export default function Cart() {
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const dispatch = useAppDispatch();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const initializedRef = useRef(false);

  // Initialize: select all items by default (only once)
  useEffect(() => {
    if (!initializedRef.current && cartItems.length > 0) {
      setSelectedItems(new Set(cartItems.map(item => item._id)));
      initializedRef.current = true;
    } else if (cartItems.length === 0) {
      // Reset when cart is empty
      setSelectedItems(new Set());
      initializedRef.current = false;
    }
  }, [cartItems]);

  // Calculate totals for selected items only
  const selectedItemsList = cartItems.filter(item => selectedItems.has(item._id));
  const selectedTotalPrice = selectedItemsList.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);
  const deliveryFee = 30;
  const tax = selectedTotalPrice * 0.05;
  const finalTotal = selectedTotalPrice + deliveryFee + tax;

  const handleToggleItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item._id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={32} />
            Your Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All / Deselect All */}
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="font-medium text-gray-900">
                    {selectedItems.size === cartItems.length ? 'Deselect All' : 'Select All'}
                  </span>
                </label>
                <span className="text-sm text-gray-600">
                  {selectedItems.size} of {cartItems.length} selected
                </span>
              </div>

              {cartItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item._id)}
                      onChange={() => handleToggleItem(item._id)}
                      className="w-5 h-5 mt-1 text-black border-gray-300 rounded focus:ring-black"
                    />
                    {item.itemPhoto && (
                      <img
                        src={item.itemPhoto}
                        alt={item.itemName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.itemName}</h3>
                      <p className="text-gray-600 mb-3">₹{item.itemPrice}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-md">
                          <button
                            onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity - 1 }))}
                            className="p-2 hover:bg-gray-100 rounded-l-md transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity + 1 }))}
                            className="p-2 hover:bg-gray-100 rounded-r-md transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{(item.itemPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({selectedItems.size} items):</span>
                    <span className="text-gray-900">₹{selectedTotalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%):</span>
                    <span className="text-gray-900">₹{tax.toFixed(2)}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {selectedItems.size > 0 ? (
                  <Link
                    to="/checkout"
                    state={{ selectedItemIds: Array.from(selectedItems) }}
                    className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors text-center block"
                  >
                    Proceed to Checkout ({selectedItems.size} items)
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-md cursor-not-allowed text-center block"
                  >
                    Select items to checkout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

