import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'react-feather';
import { useAppSelector } from '../store/hooks.js';

const API_URL = import.meta.env.VITE_API_URL;

export default function KOT() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [kotData, setKotData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKOTData();
  }, [orderId]);

  const fetchKOTData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/order/${orderId}/kot`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setKotData(data.kot);
      } else {
        alert(data.message || 'Failed to fetch KOT data');
        navigate(-1);
      }
    } catch (error) {
      console.error('Error fetching KOT data:', error);
      alert('Failed to fetch KOT data');
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
        <div>Loading KOT...</div>
      </div>
    );
  }

  if (!kotData) {
    return null;
  }

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
          Print KOT
        </button>
      </div>

      {/* KOT Content */}
      <div className="max-w-md mx-auto bg-white border-2 border-black p-6">
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold mb-2">KITCHEN ORDER TICKET</h1>
          <p className="text-sm font-semibold">{kotData.restaurantName}</p>
          <p className="text-xs">{kotData.outletName}</p>
        </div>

        {/* Order Info */}
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Order #:</span>
            <span>{kotData.orderNumber}</span>
          </div>
          {kotData.tableNumber && (
            <div className="flex justify-between">
              <span className="font-semibold">Table #:</span>
              <span className="text-lg font-bold">{kotData.tableNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-semibold">Customer:</span>
            <span>{kotData.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Time:</span>
            <span>{new Date(kotData.kotGeneratedAt).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Date:</span>
            <span>{new Date(kotData.kotGeneratedAt).toLocaleDateString()}</span>
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
              {kotData.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="py-2">{item.itemName}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">₹{(item.itemPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-6 pt-4 border-t-2 border-black">
          <p>Thank you!</p>
          <p className="mt-2">Generated at {new Date(kotData.kotGeneratedAt).toLocaleString()}</p>
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

