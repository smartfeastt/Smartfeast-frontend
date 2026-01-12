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
  Loader,
  PieChart,
  Coffee,
  Activity
} from "react-feather";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerAnalytics() {
  const { token, user } = useAppSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all"); // all, pay_now, pay_later
  const [orderTypeFilter, setOrderTypeFilter] = useState("all"); // all, dine_in, takeaway, delivery
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
    categoryRevenue: {},
    paymentTypeBreakdown: {
      pay_now: { revenue: 0, orders: 0 },
      pay_later: { revenue: 0, orders: 0 }
    },
    orderTypeBreakdown: {
      dine_in: { revenue: 0, orders: 0 },
      takeaway: { revenue: 0, orders: 0 },
      delivery: { revenue: 0, orders: 0 }
    },
    beverages: {
      revenue: 0,
      quantity: 0,
      topBeverages: []
    },
    predictions: {
      items: []
    },
    customerInsights: {
      newCustomers: 0,
      returningCustomers: 0,
      averageOrderValue: 0
    }
  });

  useEffect(() => {
    if (token && user?.type === 'owner') {
      fetchAnalytics();
    }
  }, [token, user, timeRange, selectedRestaurant, paymentFilter, orderTypeFilter]);

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
        const itemStats = {}; // For predictions: { itemName: { dailyQuantities: [], category: '' } }
        const categoryRevenueMap = {};
        const customerSet = new Set();
        const returningCustomers = new Set();
        const orderValues = [];
        const dateRevenueMap = {};
        const dateOrderMap = {};
        const paymentTypeBreakdown = {
          pay_now: { revenue: 0, orders: 0 },
          pay_later: { revenue: 0, orders: 0 }
        };
        const orderTypeBreakdown = {
          dine_in: { revenue: 0, orders: 0 },
          takeaway: { revenue: 0, orders: 0 },
          delivery: { revenue: 0, orders: 0 }
        };
        const beveragesData = {
          revenue: 0,
          quantity: 0,
          items: {}
        };
        
        // Get item details for categories
        const itemDetailsMap = {};
        
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
                // Fetch menu items for this outlet to get categories
                const itemsResponse = await fetch(`${API_URL}/api/item/outlet/${outlet._id}`);
                const itemsData = await itemsResponse.json();
                
                if (itemsData.success) {
                  (itemsData.items || []).forEach(item => {
                    itemDetailsMap[item.itemName] = {
                      category: item.category || 'Other',
                      itemId: item._id
                    };
                  });
                }
                
                const ordersResponse = await fetch(`${API_URL}/api/order/outlet/${outlet._id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                const ordersData = await ordersResponse.json();
                
                if (ordersData.success) {
                  let paidOrders = (ordersData.orders || []).filter(o => o.paymentStatus === 'paid');
                  
                  // Apply payment filter
                  if (paymentFilter !== "all") {
                    paidOrders = paidOrders.filter(o => o.paymentType === paymentFilter);
                  }
                  
                  // Apply order type filter
                  if (orderTypeFilter !== "all") {
                    paidOrders = paidOrders.filter(o => o.orderType === orderTypeFilter);
                  }
                  
                  paidOrders.forEach(order => {
                    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                    
                    totalRevenue += order.totalPrice || 0;
                    totalOrders += 1;
                    orderValues.push(order.totalPrice || 0);
                    
                    // Payment type breakdown
                    const paymentType = order.paymentType || 'pay_now';
                    if (paymentTypeBreakdown[paymentType]) {
                      paymentTypeBreakdown[paymentType].revenue += order.totalPrice || 0;
                      paymentTypeBreakdown[paymentType].orders += 1;
                    }
                    
                    // Order type breakdown
                    const orderType = order.orderType;
                    if (orderTypeBreakdown[orderType]) {
                      orderTypeBreakdown[orderType].revenue += order.totalPrice || 0;
                      orderTypeBreakdown[orderType].orders += 1;
                    }
                    
                    // Track customers
                    const customerId = order.userId?._id || order.customerInfo?.email;
                    if (customerId) {
                      if (customerSet.has(customerId)) {
                        returningCustomers.add(customerId);
                      } else {
                        customerSet.add(customerId);
                      }
                    }
                    
                    // Track items with categories
                    (order.items || []).forEach(item => {
                      const itemName = item.itemName || item.name;
                      const category = itemDetailsMap[itemName]?.category || 'Other';
                      const quantity = item.quantity || 1;
                      const price = (item.itemPrice || item.price || 0) * quantity;
                      
                      // Initialize item stats
                      if (!itemStats[itemName]) {
                        itemStats[itemName] = { 
                          orders: 0, 
                          revenue: 0,
                          quantity: 0,
                          category: category,
                          dailyQuantities: {}
                        };
                      }
                      
                      itemStats[itemName].orders += quantity;
                      itemStats[itemName].revenue += price;
                      itemStats[itemName].quantity += quantity;
                      
                      // Track daily quantities for predictions
                      if (!itemStats[itemName].dailyQuantities[orderDate]) {
                        itemStats[itemName].dailyQuantities[orderDate] = 0;
                      }
                      itemStats[itemName].dailyQuantities[orderDate] += quantity;
                      
                      // Category revenue
                      categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + price;
                      
                      // Beverages tracking
                      if (category.toLowerCase().includes('beverage') || 
                          category.toLowerCase().includes('drink') ||
                          category.toLowerCase() === 'beverages') {
                        beveragesData.revenue += price;
                        beveragesData.quantity += quantity;
                        if (!beveragesData.items[itemName]) {
                          beveragesData.items[itemName] = { quantity: 0, revenue: 0 };
                        }
                        beveragesData.items[itemName].quantity += quantity;
                        beveragesData.items[itemName].revenue += price;
                      }
                    });
                    
                    // Track by date
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
          .slice(0, 10);
        
        // Get top beverages
        const topBeverages = Object.entries(beveragesData.items)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        // Calculate predictions for next day
        const predictions = calculatePredictions(itemStats, days);
        
        // Calculate average order value
        const avgOrderValue = orderValues.length > 0 
          ? orderValues.reduce((sum, val) => sum + val, 0) / orderValues.length 
          : 0;
        
        setAnalytics({
          revenue: {
            current: totalRevenue,
            previous: 0,
            data: revenueData
          },
          orders: {
            current: totalOrders,
            previous: 0,
            data: ordersData
          },
          topItems,
          categoryRevenue: categoryRevenueMap,
          paymentTypeBreakdown,
          orderTypeBreakdown,
          beverages: {
            revenue: beveragesData.revenue,
            quantity: beveragesData.quantity,
            topBeverages
          },
          predictions,
          customerInsights: {
            newCustomers: Math.max(0, customerSet.size - returningCustomers.size),
            returningCustomers: returningCustomers.size,
            averageOrderValue: Math.round(avgOrderValue)
          }
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictions = (itemStats, days) => {
    const predictions = [];
    
    Object.entries(itemStats).forEach(([itemName, stats]) => {
      const quantities = Object.values(stats.dailyQuantities);
      if (quantities.length === 0) return;
      
      // Calculate average daily quantity
      const avgDailyQuantity = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
      
      // Calculate trend (simple linear regression slope)
      let trend = 0;
      if (quantities.length > 1) {
        const midPoint = Math.floor(quantities.length / 2);
        const firstHalf = quantities.slice(0, midPoint);
        const secondHalf = quantities.slice(midPoint);
        const firstAvg = firstHalf.reduce((sum, q) => sum + q, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, q) => sum + q, 0) / secondHalf.length;
        trend = (secondAvg - firstAvg) / days;
      }
      
      // Predict next day quantity (average + trend adjustment)
      const predictedQuantity = Math.max(0, Math.round(avgDailyQuantity + trend));
      
      predictions.push({
        itemName,
        currentAvg: Math.round(avgDailyQuantity),
        predictedQuantity,
        category: stats.category,
        totalSold: stats.quantity
      });
    });
    
    // Sort by predicted quantity descending
    return { items: predictions.sort((a, b) => b.predictedQuantity - a.predictedQuantity).slice(0, 20) };
  };

  const MetricCard = ({ title, value, icon: Icon, format = "number", subtitle, trend }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <Icon className="text-blue-600" size={24} />
          </div>
          {trend && (
            <span className={`text-sm font-semibold px-2 py-1 rounded ${trend >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">
          {format === "currency" ? `₹${value.toLocaleString()}` : value.toLocaleString()}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DynamicHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
            <p className="text-gray-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Business Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into your restaurant performance</p>
            </div>
            
            <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              <Download size={18} />
              Export Report
            </button>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant</label>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                >
                  <option value="all">All Restaurants</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant._id} value={restaurant.name}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                >
                  <option value="all">All Payments</option>
                  <option value="pay_now">Pay Now</option>
                  <option value="pay_later">Pay Later</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="dine_in">Dine In</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={analytics.revenue.current}
            icon={DollarSign}
            format="currency"
            subtitle="Total income from orders"
          />
          <MetricCard
            title="Total Orders"
            value={analytics.orders.current}
            icon={Package}
            subtitle="All completed orders"
          />
          <MetricCard
            title="Avg Order Value"
            value={analytics.customerInsights.averageOrderValue}
            icon={TrendingUp}
            format="currency"
            subtitle="Average per order"
          />
          <MetricCard
            title="Customers"
            value={analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers}
            icon={Users}
            subtitle={`${analytics.customerInsights.returningCustomers} returning`}
          />
        </div>

        {/* Payment & Order Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Type Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity size={20} />
              Payment Type Breakdown
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Pay Now</span>
                  <span className="text-lg font-bold text-green-700">
                    ₹{analytics.paymentTypeBreakdown.pay_now.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{analytics.paymentTypeBreakdown.pay_now.orders} orders</span>
                  <span>
                    {analytics.revenue.current > 0 
                      ? ((analytics.paymentTypeBreakdown.pay_now.revenue / analytics.revenue.current) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Pay Later</span>
                  <span className="text-lg font-bold text-blue-700">
                    ₹{analytics.paymentTypeBreakdown.pay_later.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{analytics.paymentTypeBreakdown.pay_later.orders} orders</span>
                  <span>
                    {analytics.revenue.current > 0 
                      ? ((analytics.paymentTypeBreakdown.pay_later.revenue / analytics.revenue.current) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Type Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart size={20} />
              Order Type Breakdown
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Dine In</span>
                  <span className="text-lg font-bold text-purple-700">
                    ₹{analytics.orderTypeBreakdown.dine_in.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{analytics.orderTypeBreakdown.dine_in.orders} orders</span>
                  <span>
                    {analytics.revenue.current > 0 
                      ? ((analytics.orderTypeBreakdown.dine_in.revenue / analytics.revenue.current) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Takeaway</span>
                  <span className="text-lg font-bold text-orange-700">
                    ₹{analytics.orderTypeBreakdown.takeaway.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{analytics.orderTypeBreakdown.takeaway.orders} orders</span>
                  <span>
                    {analytics.revenue.current > 0 
                      ? ((analytics.orderTypeBreakdown.takeaway.revenue / analytics.revenue.current) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Delivery</span>
                  <span className="text-lg font-bold text-pink-700">
                    ₹{analytics.orderTypeBreakdown.delivery.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{analytics.orderTypeBreakdown.delivery.orders} orders</span>
                  <span>
                    {analytics.revenue.current > 0 
                      ? ((analytics.orderTypeBreakdown.delivery.revenue / analytics.revenue.current) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Category & Beverages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart size={20} />
              Revenue by Category
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(analytics.categoryRevenue)
                .sort(([,a], [,b]) => b - a)
                .map(([category, revenue]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{category || 'Uncategorized'}</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${analytics.revenue.current > 0 
                              ? (revenue / analytics.revenue.current) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-gray-900">₹{revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {analytics.revenue.current > 0 
                          ? ((revenue / analytics.revenue.current) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              {Object.keys(analytics.categoryRevenue).length === 0 && (
                <p className="text-gray-500 text-center py-8">No category data available</p>
              )}
            </div>
          </div>

          {/* Beverages Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Coffee size={20} />
              Beverages Analysis
            </h2>
            <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-amber-700">₹{analytics.beverages.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
                  <p className="text-2xl font-bold text-orange-700">{analytics.beverages.quantity}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Top Selling Beverages</h3>
              <div className="space-y-3">
                {analytics.beverages.topBeverages.length > 0 ? (
                  analytics.beverages.topBeverages.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.quantity} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No beverage data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Items & Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Selling Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Items</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.topItems.length > 0 ? (
                analytics.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <div className="flex gap-4 mt-1">
                          <p className="text-sm text-gray-600">{item.quantity} units sold</p>
                          <p className="text-xs text-gray-500">{item.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No items data available</p>
              )}
            </div>
          </div>

          {/* Next Day Predictions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={20} />
              Next Day Inventory Predictions
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Predicted quantities needed based on historical sales data
            </p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.predictions.items.length > 0 ? (
                analytics.predictions.items.map((pred, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{pred.itemName}</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-xs text-gray-600">Category: {pred.category || 'Other'}</p>
                        <p className="text-xs text-gray-600">Avg: {pred.currentAvg}/day</p>
                      </div>
                      <div className="mt-2 bg-blue-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((pred.predictedQuantity / Math.max(...analytics.predictions.items.map(p => p.predictedQuantity), 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-blue-700 text-lg">{pred.predictedQuantity}</p>
                      <p className="text-xs text-gray-500">Predicted</p>
                      <p className="text-xs text-gray-400 mt-1">Total: {pred.totalSold}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No prediction data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue & Orders Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : timeRange === "90d" ? "Last 90 days" : "Last year"}
              </div>
            </div>
            
            <div className="space-y-3">
              {analytics.revenue.data.length > 0 ? (
                analytics.revenue.data.slice(-14).map((item, index) => {
                  const maxAmount = Math.max(...analytics.revenue.data.map(d => d.amount), 1);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-gray-600 font-medium">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                          style={{ width: `${Math.max((item.amount / maxAmount) * 100, 2)}%` }}
                        >
                          {item.amount > 0 && (
                            <span className="text-xs text-white font-semibold">₹{item.amount.toLocaleString()}</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Orders Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart size={16} />
                Daily orders
              </div>
            </div>
            
            <div className="space-y-3">
              {analytics.orders.data.length > 0 ? (
                analytics.orders.data.slice(-14).map((item, index) => {
                  const maxCount = Math.max(...analytics.orders.data.map(d => d.count), 1);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-gray-600 font-medium">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                          style={{ width: `${Math.max((item.count / maxCount) * 100, 2)}%` }}
                        >
                          {item.count > 0 && (
                            <span className="text-xs text-white font-semibold">{item.count} orders</span>
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
      </div>
    </div>
  );
}