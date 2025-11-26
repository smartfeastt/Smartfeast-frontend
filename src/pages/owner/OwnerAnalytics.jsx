import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Download,
  Filter,
  BarChart
} from "react-feather";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function OwnerAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 125000,
      previous: 110000,
      data: [
        { date: "2024-01-01", amount: 3200 },
        { date: "2024-01-02", amount: 4100 },
        { date: "2024-01-03", amount: 3800 },
        { date: "2024-01-04", amount: 4500 },
        { date: "2024-01-05", amount: 3900 },
        { date: "2024-01-06", amount: 5200 },
        { date: "2024-01-07", amount: 4800 }
      ]
    },
    orders: {
      current: 1250,
      previous: 1100,
      data: [
        { date: "2024-01-01", count: 45 },
        { date: "2024-01-02", count: 52 },
        { date: "2024-01-03", count: 48 },
        { date: "2024-01-04", count: 58 },
        { date: "2024-01-05", count: 51 },
        { date: "2024-01-06", count: 62 },
        { date: "2024-01-07", count: 55 }
      ]
    },
    topItems: [
      { name: "Margherita Pizza", orders: 145, revenue: 43500 },
      { name: "Classic Burger", orders: 132, revenue: 26400 },
      { name: "Chicken Wings", orders: 98, revenue: 19600 },
      { name: "Caesar Salad", orders: 87, revenue: 13050 },
      { name: "Chocolate Cake", orders: 76, revenue: 13680 }
    ],
    customerInsights: {
      newCustomers: 156,
      returningCustomers: 324,
      averageOrderValue: 385,
      customerSatisfaction: 4.6
    }
  });

  const calculateGrowth = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const MetricCard = ({ title, current, previous, icon: Icon, format = "number" }) => {
    const growth = calculateGrowth(current, previous);
    const isPositive = growth >= 0;
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="text-blue-600" size={24} />
          </div>
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{growth}%
          </span>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">
          {format === "currency" ? `₹${current.toLocaleString()}` : current.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          vs {format === "currency" ? `₹${previous.toLocaleString()}` : previous.toLocaleString()} last period
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Track your business performance and insights</p>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="all">All Restaurants</option>
              <option value="pizza-palace">Pizza Palace</option>
              <option value="burger-hub">Burger Hub</option>
              <option value="cafe-delight">Cafe Delight</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            current={analytics.revenue.current}
            previous={analytics.revenue.previous}
            icon={DollarSign}
            format="currency"
          />
          <MetricCard
            title="Total Orders"
            current={analytics.orders.current}
            previous={analytics.orders.previous}
            icon={Package}
          />
          <MetricCard
            title="New Customers"
            current={analytics.customerInsights.newCustomers}
            previous={120}
            icon={Users}
          />
          <MetricCard
            title="Avg Order Value"
            current={analytics.customerInsights.averageOrderValue}
            previous={350}
            icon={TrendingUp}
            format="currency"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                Last 7 days
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {analytics.revenue.data.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600">
                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.amount / 6000) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">₹{item.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Orders Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart size={16} />
                Daily orders
              </div>
            </div>
            
            <div className="space-y-3">
              {analytics.orders.data.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600">
                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.count / 70) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Items</h2>
            <div className="space-y-4">
              {analytics.topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Insights</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Customers</span>
                <span className="text-2xl font-bold text-green-600">
                  {analytics.customerInsights.newCustomers}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Returning Customers</span>
                <span className="text-2xl font-bold text-blue-600">
                  {analytics.customerInsights.returningCustomers}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Order Value</span>
                <span className="text-2xl font-bold text-purple-600">
                  ₹{analytics.customerInsights.averageOrderValue}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Satisfaction</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-600">
                    {analytics.customerInsights.customerSatisfaction}
                  </span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
