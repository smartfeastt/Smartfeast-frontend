import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, User } from "react-feather";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      alert("Order placed successfully! You will receive a confirmation email shortly.");
      clearCart();
      navigate("/");
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Checkout</h1>
          {!user && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <Link to="/user/signin" className="font-medium underline">Sign in</Link> to save your information and track your order, or continue as guest.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User size={20} />
              {user ? 'Delivery Information' : 'Customer Information'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={16} />
                  Delivery Address *
                </label>
                <textarea
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <CreditCard size={16} />
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Credit/Debit Card
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    UPI
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Cash on Delivery
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : `Place Order - ₹${getTotalPrice().toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 pb-4 border-b">
                  {item.itemPhoto && (
                    <img
                      src={item.itemPhoto}
                      alt={item.itemName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.itemName}</h3>
                    <p className="text-sm text-gray-600">₹{item.itemPrice} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ₹{(item.itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹30.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span>₹{(getTotalPrice() * 0.05).toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{(getTotalPrice() + 30 + (getTotalPrice() * 0.05)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
