import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'react-feather';
import { useAppSelector } from '../store/hooks.js';

const API_URL = import.meta.env.VITE_API_URL;

export default function Bill() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      // Fetch order details - we'll need to get it from the orders endpoint
      // For now, using a simple fetch to get order by ID
      const response = await fetch(`${API_URL}/api/order/${orderId}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Need to fetch full order details
        // For billing, we need all order info
        // Let's create a proper endpoint or use existing one
        setOrder(data.order);
      } else {
        alert(data.message || 'Failed to fetch order data');
        navigate(-1);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      alert('Failed to fetch order data');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Bill...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  // Calculate totals
  const subtotal = order.totalPrice || 0;
  const deliveryFee = 30;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header - hidden in print */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          <Printer size={20} />
          Print Bill
        </button>
      </div>

      {/* Bill Content */}
      <div className="max-w-md mx-auto bg-white border-2 border-black p-6">
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold mb-2">BILL</h1>
          <p className="text-sm font-semibold">{order.restaurantName || 'Restaurant Name'}</p>
          <p className="text-xs">{order.outletName || 'Outlet Name'}</p>
        </div>

        {/* Order Info */}
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Order #:</span>
            <span>{order.orderNumber}</span>
          </div>
          {order.tableNumber && (
            <div className="flex justify-between">
              <span className="font-semibold">Table #:</span>
              <span className="text-lg font-bold">{order.tableNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-semibold">Date:</span>
            <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Time:</span>
            <span>{new Date(order.createdAt || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t-2 border-b-2 border-black py-4 my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black font-semibold">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="py-2">{item.itemName || item.name}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">₹{((item.itemPrice || item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-4 space-y-2 text-sm border-t-2 border-black pt-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2 mt-2">
            <span>TOTAL:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Payment Method:</span>
            <span className="uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Payment Status:</span>
            <span className="uppercase">{order.paymentStatus}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-6 pt-4 border-t-2 border-black">
          <p>Thank you for your visit!</p>
          <p className="mt-2">Generated at {new Date().toLocaleString()}</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden,
          .print\\:hidden * {
            visibility: hidden;
          }
          .max-w-md,
          .max-w-md * {
            visibility: visible;
          }
          .max-w-md {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

