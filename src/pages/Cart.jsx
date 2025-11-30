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

  const deliveryFee = 30;
  const tax = totalPrice * 0.05;
  const finalTotal = totalPrice + deliveryFee + tax;

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
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start gap-4">
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
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">₹{totalPrice.toFixed(2)}</span>
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
                
                <Link
                  to="/checkout"
                  className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

