import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader, ArrowLeft, RefreshCw } from "react-feather";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function PaymentVerify() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentPending, setPaymentPending] = useState(location.state?.paymentPending || false);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }
    verifyPayment();
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/order/${orderId}/verify`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setPaymentPending(data.order.paymentStatus !== 'paid');
      } else {
        setError(data.message || 'Failed to verify payment');
      }
    } catch (err) {
      setError('Error verifying payment. Please try again.');
      console.error('Payment verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/order/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
        setPaymentPending(false);
      } else {
        setError(data.message || 'Failed to update payment');
      }
    } catch (err) {
      setError('Error processing payment. Please try again.');
      console.error('Payment update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600">Verifying payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <XCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={verifyPayment}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
              <Link
                to="/"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order?.paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {/* Payment Status Icon */}
          <div className="flex justify-center mb-6">
            {isPaid ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={48} />
              </div>
            ) : (
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <XCircle className="text-yellow-600" size={48} />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isPaid ? 'Payment Successful!' : 'Payment Pending'}
            </h1>
            <p className="text-lg text-gray-600">
              {isPaid 
                ? 'Your order has been confirmed and will be reflected on the owner side.'
                : 'Your order has been created but payment is pending. Click "Pay Now" to complete the payment.'}
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₹{order.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-medium capitalize ${
                    isPaid ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Status:</span>
                  <span className="font-medium capitalize">{order.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!isPaid && (
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Pay Now
                  </>
                )}
              </button>
            )}

            {isPaid && (
              <Link
                to="/payment/success"
                state={{
                  orderId: order._id,
                  orderNumber: order.orderNumber,
                  totalPrice: order.totalPrice,
                }}
                className="block w-full bg-black text-white py-4 rounded-md hover:bg-gray-800 transition-colors text-center font-semibold"
              >
                View Order Details
              </Link>
            )}

            <Link
              to="/"
              className="block w-full border border-gray-300 text-gray-700 py-4 rounded-md hover:bg-gray-50 transition-colors text-center font-semibold"
            >
              Continue Shopping
            </Link>
          </div>

          {isPaid && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Your order will now be visible to the restaurant owner.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

