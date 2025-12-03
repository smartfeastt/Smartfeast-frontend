import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Download,
  Filter,
  BarChart,
  Loader
} from "react-feather";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerAnalytics() {
  const { token, user } = useAppSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 0,
      previous: 0,
      data: []
    },
    orders: {
      current: 0,
      previous: 0,
      data: []
    },
    topItems: [],
    customerInsights: {
      newCustomers: 0,
      returningCustomers: 0,
      averageOrderValue: 0,
      customerSatisfaction: 0
    }
  });

  useEffect(() => {
    if (token && user?.type === 'owner') {
      fetchAnalytics();
    }
  }, [token, user, timeRange, selectedRestaurant]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurants
      const restaurantsResponse = await fetch(`${API_URL}/api/restaurant/owner/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const restaurantsData = await restaurantsResponse.json();
      
      if (restaurantsData.success) {
        setRestaurants(restaurantsData.restaurants || []);
        
        // Calculate analytics from orders
        let totalRevenue = 0;
        let totalOrders = 0;
        const itemStats = {};
        const customerSet = new Set();
        const returningCustomers = new Set();
        const orderValues = [];
        const dateRevenueMap = {};
        const dateOrderMap = {};
        
        // Get all outlets and their orders
        for (const restaurant of restaurantsData.restaurants || []) {
          if (selectedRestaurant !== "all" && restaurant.name !== selectedRestaurant) {
            continue;
          }
          
          const outletsResponse = await fetch(`${API_URL}/api/outlet/restaurant/${restaurant._id}`);
          const outletsData = await outletsResponse.json();
          
          if (outletsData.success) {
            for (const outlet of outletsData.outlets || []) {
              try {
                const ordersResponse = await fetch(`${API_URL}/api/order/outlet/${outlet._id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                const ordersData = await ordersResponse.json();
                
                if (ordersData.success) {
                  const paidOrders = (ordersData.orders || []).filter(o => o.paymentStatus === 'paid');
                  
                  paidOrders.forEach(order => {
                    totalRevenue += order.totalPrice || 0;
                    totalOrders += 1;
                    orderValues.push(order.totalPrice || 0);
                    
                    // Track customers
                    const customerId = order.userId?._id || order.customerInfo?.email;
                    if (customerId) {
                      if (customerSet.has(customerId)) {
                        returningCustomers.add(customerId);
                      } else {
                        customerSet.add(customerId);
                      }
                    }
                    
                    // Track items
                    (order.items || []).forEach(item => {
                      const itemName = item.itemName || item.name;
                      if (!itemStats[itemName]) {
                        itemStats[itemName] = { orders: 0, revenue: 0 };
                      }
                      itemStats[itemName].orders += item.quantity || 1;
                      itemStats[itemName].revenue += (item.itemPrice || item.price || 0) * (item.quantity || 1);
                    });
                    
                    // Track by date
                    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                    dateRevenueMap[orderDate] = (dateRevenueMap[orderDate] || 0) + (order.totalPrice || 0);
                    dateOrderMap[orderDate] = (dateOrderMap[orderDate] || 0) + 1;
                  });
                }
              } catch (error) {
                console.error(`Error fetching orders for outlet ${outlet._id}:`, error);
              }
            }
          }
        }
        
        // Calculate date range data
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
        const revenueData = [];
        const ordersData = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          revenueData.push({ date: dateStr, amount: dateRevenueMap[dateStr] || 0 });
          ordersData.push({ date: dateStr, count: dateOrderMap[dateStr] || 0 });
        }
        
        // Get top items
        const topItems = Object.entries(itemStats)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        // Calculate average order value
        const avgOrderValue = orderValues.length > 0 
          ? orderValues.reduce((sum, val) => sum + val, 0) / orderValues.length 
          : 0;
        
        // Calculate previous period for comparison
        const previousDays = days;
        let previousRevenue = 0;
        let previousOrders = 0;
        
        setAnalytics({
          revenue: {
            current: totalRevenue,
            previous: previousRevenue,
            data: revenueData
          },
          orders: {
            current: totalOrders,
            previous: previousOrders,
            data: ordersData
          },
          topItems,
          customerInsights: {
            newCustomers: customerSet.size - returningCustomers.size,
            returningCustomers: returningCustomers.size,
            averageOrderValue: Math.round(avgOrderValue),
            customerSatisfaction: 4.5 // Placeholder - would need reviews/ratings system
          }
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

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
              {restaurants.map(restaurant => (
                <option key={restaurant._id} value={restaurant.name}>
                  {restaurant.name}
                </option>
              ))}
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
            previous={0}
            icon={Users}
          />
          <MetricCard
            title="Avg Order Value"
            current={analytics.customerInsights.averageOrderValue}
            previous={0}
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
              {analytics.revenue.data.length > 0 ? (
                analytics.revenue.data.map((item, index) => {
                  const maxAmount = Math.max(...analytics.revenue.data.map(d => d.amount), 1);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-600">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.max((item.amount / maxAmount) * 100, 5)}%` }}
                        >
                          {item.amount > 0 && (
                            <span className="text-xs text-white font-medium">₹{item.amount.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No revenue data available</p>
              )}
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
              {analytics.orders.data.length > 0 ? (
                analytics.orders.data.map((item, index) => {
                  const maxCount = Math.max(...analytics.orders.data.map(d => d.count), 1);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-600">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.max((item.count / maxCount) * 100, 5)}%` }}
                        >
                          {item.count > 0 && (
                            <span className="text-xs text-white font-medium">{item.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No orders data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Items</h2>
            <div className="space-y-4">
              {analytics.topItems.length > 0 ? (
                analytics.topItems.map((item, index) => (
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
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No items data available</p>
              )}
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
