import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks.js";
import { selectCartItems, selectTotalPrice, clearCart } from "../store/slices/cartSlice.js";
import { createOrder } from "../store/slices/ordersSlice.js";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle, Loader } from "react-feather";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(location.state?.paymentData || null);
  const [orderData, setOrderData] = useState(location.state?.orderData || null);

  // Redirect if no payment data
  useEffect(() => {
    if (!paymentData || !orderData) {
      navigate("/checkout");
    }
  }, [paymentData, orderData, navigate]);

  const deliveryFee = 30;
  const tax = totalPrice * 0.05;
  const finalTotal = totalPrice + deliveryFee + tax;

  const handlePayment = async (payNow = true) => {
    setIsProcessing(true);

    try {
      // Create order first (payment status will be pending)
      const orderPayload = {
        items: orderData.items,
        totalPrice: finalTotal,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: paymentData.paymentMethod,
        paymentType: orderData.paymentType || 'pay_now',
        customerInfo: paymentData.customerInfo,
        orderType: orderData.orderType, // Include order type
        token: token || null, // Token is optional for guest orders
      };

      const order = await dispatch(createOrder(orderPayload)).unwrap();
      
      if (payNow) {
        // Update payment status to paid
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/order/${order._id}/payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentStatus: 'paid' }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error('Failed to update payment status');
        }

        // Clear cart after successful payment
        dispatch(clearCart());
        
        // Redirect to payment verification page
        navigate(`/payment/verify/${order._id}`, {
          state: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            totalPrice: finalTotal,
          }
        });
      } else {
        // User chose not to pay - redirect to payment verification to check status
        navigate(`/payment/verify/${order._id}`, {
          state: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            totalPrice: finalTotal,
            paymentPending: true,
          }
        });
      }
    } catch (error) {
      alert(error || "Order creation failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!paymentData || !orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/checkout"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Checkout
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Payment</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={24} />
            Payment Details
          </h2>

          {/* Payment Method Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Payment Method</p>
            <p className="text-lg font-semibold capitalize">{paymentData.paymentMethod}</p>
          </div>

          {/* Mock Payment Form */}
          {paymentData.paymentMethod !== "cod" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  disabled={isProcessing}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    disabled={isProcessing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handlePayment(true)}
              disabled={isProcessing}
              className="w-full bg-black text-white py-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Pay ₹{finalTotal.toFixed(2)}
                </>
              )}
            </button>

            <button
              onClick={() => handlePayment(false)}
              disabled={isProcessing}
              className="w-full bg-gray-200 text-gray-800 py-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              Not Pay Now
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            This is a demo payment system. Click "Pay" to mark order as paid, or "Not Pay Now" to keep it pending.
          </p>
        </div>
      </div>
    </div>
  );
}

