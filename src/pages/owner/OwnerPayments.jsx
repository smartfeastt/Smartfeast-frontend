import { useState, useEffect } from "react";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter
} from "react-feather";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function OwnerPayments() {
  const { token } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    overview: {
      totalEarnings: 0,
      pendingPayouts: 0,
      completedPayouts: 0,
      nextPayout: null,
      nextPayoutAmount: 0
    },
    transactions: [],
    payouts: []
  });

  useEffect(() => {
    if (token) {
      fetchPaymentData();
    }
  }, [token]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call when payment system is ready
      // For now, show empty state
      setPaymentData({
        overview: {
          totalEarnings: 0,
          pendingPayouts: 0,
          completedPayouts: 0,
          nextPayout: null,
          nextPayoutAmount: 0
        },
        transactions: [],
        payouts: []
      });
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "processing":
        return <AlertCircle className="text-blue-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments & Payouts</h1>
            <p className="text-gray-600 mt-2">Manage your earnings and payment history</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Download size={16} />
            Export Report
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Earnings</h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{paymentData.overview.totalEarnings.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {paymentData.overview.totalEarnings === 0 ? 'No earnings yet' : 'This month'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Payouts</h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{paymentData.overview.pendingPayouts.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Awaiting processing</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Completed Payouts</h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{paymentData.overview.completedPayouts.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Next Payout</h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{paymentData.overview.nextPayoutAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {paymentData.overview.nextPayout 
                ? new Date(paymentData.overview.nextPayout).toLocaleDateString()
                : 'No scheduled payout'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: "overview", label: "Overview" },
                { key: "payouts", label: "Payouts" },
                { key: "transactions", label: "All Transactions" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                  ) : paymentData.transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No transactions yet</div>
                  ) : (
                    paymentData.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'payout' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'payout' ? '+' : ''}₹{transaction.amount}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>

            {/* Payout Schedule */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payout Schedule</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-blue-600" size={16} />
                      <span className="font-medium text-blue-900">Next Payout</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mb-1">
                      ₹{paymentData.overview.nextPayoutAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700">
                      {paymentData.overview.nextPayout 
                        ? `Scheduled for ${new Date(paymentData.overview.nextPayout).toLocaleDateString()}`
                        : 'No payout scheduled'}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Payout Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payout Frequency:</span>
                        <span className="text-gray-900">Weekly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payout Day:</span>
                        <span className="text-gray-900">Saturday</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="text-gray-900">1-2 business days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission Rate:</span>
                        <span className="text-gray-900">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>All Restaurants</option>
                    <option>Pizza Palace</option>
                    <option>Burger Hub</option>
                    <option>Cafe Delight</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Processing</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payout ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Loading payouts...
                      </td>
                    </tr>
                  ) : paymentData.payouts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No payouts yet
                      </td>
                    </tr>
                  ) : (
                    paymentData.payouts.map((payout) => (
                    <tr key={payout.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payout.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.restaurant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payout.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{payout.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {getStatusIcon(payout.status)}
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payout.paidDate 
                          ? new Date(payout.paidDate).toLocaleDateString()
                          : payout.scheduledDate 
                            ? `Scheduled: ${new Date(payout.scheduledDate).toLocaleDateString()}`
                            : 'Processing'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Eye size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>All Types</option>
                    <option>Orders</option>
                    <option>Payouts</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                ) : paymentData.transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No transactions found</div>
                ) : (
                  paymentData.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.reference} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'payout' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'payout' ? '+' : ''}₹{transaction.amount}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
