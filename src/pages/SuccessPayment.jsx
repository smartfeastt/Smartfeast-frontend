import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CheckCircle, Package, Home, ShoppingBag } from "react-feather";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

export default function SuccessPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { orderId, orderNumber, totalPrice } = location.state || {};

  useEffect(() => {
    // Redirect to home if no order data
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={48} />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your order has been placed successfully. We'll send you a confirmation email shortly.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold text-gray-900">{orderNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm text-gray-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">₹{totalPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-blue-600 mt-0.5" size={16} />
                <span>You'll receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-blue-600 mt-0.5" size={16} />
                <span>Track your order status in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-blue-600 mt-0.5" size={16} />
                <span>Estimated delivery time: 30-45 minutes</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/user/orders"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              <Package size={20} />
              View My Orders
            </Link>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? <Link to="/contact" className="text-black hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

