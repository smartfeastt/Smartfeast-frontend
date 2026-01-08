import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks.js";
import { selectCartItems, selectTotalPrice, clearCart } from "../store/slices/cartSlice.js";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, User } from "react-feather";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

export default function Checkout() {
  const allCartItems = useAppSelector(selectCartItems);
  const location = useLocation();
  const { user, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get selected items from location state (passed from Cart page)
  const selectedItemIdsFromState = location.state?.selectedItemIds || null;
  const [selectedItems, setSelectedItems] = useState(new Set());
  const initializedRef = useRef(false);

  // Initialize selected items (only once)
  useEffect(() => {
    if (!initializedRef.current) {
      if (selectedItemIdsFromState && selectedItemIdsFromState.length > 0) {
        // Use items passed from Cart page
        setSelectedItems(new Set(selectedItemIdsFromState));
      } else if (allCartItems.length > 0) {
        // Default: select all items
        setSelectedItems(new Set(allCartItems.map(item => item._id)));
      }
      initializedRef.current = true;
    }
  }, [selectedItemIdsFromState, allCartItems]);

  // Filter to only selected items (memoized to prevent infinite loops)
  const cartItems = useMemo(() => {
    return allCartItems.filter(item => selectedItems.has(item._id));
  }, [allCartItems, selectedItems]);
  
  // Calculate total for selected items only
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);
  }, [cartItems]);
  
  // Get outletId from cart items (memoized)
  const outletId = useMemo(() => {
    return cartItems.length > 0 ? cartItems[0]?.outletId : null;
  }, [cartItems]);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentType, setPaymentType] = useState("pay_later"); // pay_now or pay_later - default to pay_later
  const [orderType, setOrderType] = useState("dine_in"); // Required field - default to dine_in
  const [tableNumber, setTableNumber] = useState(""); // Table number for dine-in orders
  const [outletData, setOutletData] = useState(null);
  const [loadingOutlet, setLoadingOutlet] = useState(true);
  const fetchedOutletIdRef = useRef(null);

  // Fetch outlet data to check delivery settings (only when outletId changes)
  useEffect(() => {
    const fetchOutletData = async () => {
      if (!outletId || fetchedOutletIdRef.current === outletId) {
        // Already fetched for this outlet or no outlet ID
        if (!outletId) {
          setLoadingOutlet(false);
        }
        return;
      }

      try {
        setLoadingOutlet(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/outlet/${outletId}`);
        const data = await response.json();
        if (data.success) {
          setOutletData(data.outlet);
          fetchedOutletIdRef.current = outletId;
        }
      } catch (error) {
        console.error("Error fetching outlet data:", error);
      } finally {
        setLoadingOutlet(false);
      }
    };
    fetchOutletData();
  }, [outletId]);

  // Reset orderType if delivery is disabled and user selected delivery
  useEffect(() => {
    if (!outletData?.deliveryEnabled && orderType === "delivery") {
      setOrderType("dine_in"); // Reset to dine_in if delivery is disabled
    }
  }, [outletData, orderType]);

  // Reset paymentType if payNow is disabled and user selected pay_now
  useEffect(() => {
    if (outletData?.payNowEnabled === false && paymentType === "pay_now") {
      setPaymentType("pay_later");
    }
  }, [outletData, paymentType]);

  // Reset paymentType if payLater is disabled and user selected pay_later
  useEffect(() => {
    if (outletData?.payLaterEnabled === false && paymentType === "pay_later") {
      setPaymentType("pay_now");
    }
  }, [outletData, paymentType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === allCartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allCartItems.map(item => item._id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Validate required fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert("Please fill in all required fields (Name, Email, and Phone)");
      return;
    }

    // Validate delivery address only if delivery is selected
    if (orderType === "delivery" && !customerInfo.address) {
      alert("Please enter a delivery address");
      return;
    }

    // Validate order type
    if (!orderType) {
      alert("Please select an order type (Dine-In, Takeaway, or Delivery)");
      return;
    }

    // Validate table number for dine-in orders
    if (orderType === "dine_in" && !tableNumber.trim()) {
      alert("Please enter a table number for dine-in orders");
      return;
    }

    // Validate that delivery is not selected if disabled
    if (orderType === "delivery" && !outletData?.deliveryEnabled) {
      alert("Delivery is currently disabled for this outlet. Please select Dine-In or Takeaway.");
      return;
    }

    // Validate payment type settings
    if (paymentType === "pay_now" && (outletData?.payNowEnabled === false)) {
      alert("Pay Now is currently disabled for this outlet. Please select Pay Later.");
      return;
    }

    if (paymentType === "pay_later" && (outletData?.payLaterEnabled === false)) {
      alert("Pay Later is currently disabled for this outlet. Please select Pay Now.");
      return;
    }

    // Calculate final total with delivery and tax
    const deliveryFee = 30;
    const tax = totalPrice * 0.05;
    const finalTotal = totalPrice + deliveryFee + tax;
    
    // Get outletId from first item
    const outletId = cartItems[0]?.outletId;
    if (!outletId) {
      alert("Invalid cart items. Please add items to cart again.");
      return;
    }
    
    const orderData = {
      items: cartItems.map(item => ({
        itemId: item._id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        quantity: item.quantity,
        itemPhoto: item.itemPhoto,
        outletId: item.outletId || outletId,
      })),
      totalPrice: finalTotal,
      deliveryAddress: orderType === "delivery" ? customerInfo.address : "N/A",
      paymentMethod: paymentMethod,
      paymentType: paymentType,
      orderType: orderType,
      tableNumber: orderType === "dine_in" ? tableNumber.trim() : null,
    };

    const paymentData = {
      paymentMethod: paymentMethod,
      paymentType: paymentType,
      customerInfo: customerInfo,
    };

    // If Pay Later, create order directly and skip payment page
    if (paymentType === "pay_later") {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/order/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({
            ...orderData,
            customerInfo: user ? undefined : customerInfo,
          }),
        });

        const data = await response.json();
        if (data.success) {
          // Clear cart
          dispatch(clearCart());
          // Redirect to order confirmation
          navigate(`/payment/verify/${data.order._id}`, {
            state: {
              orderId: data.order._id,
              orderNumber: data.order.orderNumber,
              totalPrice: finalTotal,
              paymentPending: true,
            }
          });
        } else {
          alert(data.message || "Failed to create order");
        }
      } catch (error) {
        console.error("Error creating order:", error);
        alert("Failed to create order. Please try again.");
      }
      return;
    }

    // If Pay Now, redirect to payment page
    navigate("/payment", {
      state: {
        orderData,
        paymentData,
      }
    });
  };

  if (allCartItems.length === 0) {
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No items selected</h2>
          <p className="text-gray-600 mb-4">Please select at least one item to proceed with checkout.</p>
          <Link to="/cart" className="text-blue-600 hover:underline">
            Back to Cart
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

              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Order Type *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="orderType"
                      value="dine_in"
                      checked={orderType === "dine_in"}
                      onChange={(e) => {
                        setOrderType(e.target.value);
                        if (e.target.value !== "dine_in") {
                          setTableNumber(""); // Clear table number if not dine-in
                        }
                      }}
                      className="mr-2"
                      required
                    />
                    Dine-In
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="orderType"
                      value="takeaway"
                      checked={orderType === "takeaway"}
                      onChange={(e) => {
                        setOrderType(e.target.value);
                        if (e.target.value !== "dine_in") {
                          setTableNumber(""); // Clear table number if not dine-in
                        }
                      }}
                      className="mr-2"
                      required
                    />
                    Takeaway / Pick-Up
                  </label>
                  <label className={`flex items-center ${!outletData?.deliveryEnabled ? 'opacity-60' : ''}`}>
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={orderType === "delivery"}
                      onChange={(e) => {
                        setOrderType(e.target.value);
                        if (e.target.value !== "dine_in") {
                          setTableNumber(""); // Clear table number if not dine-in
                        }
                      }}
                      className="mr-2"
                      disabled={!outletData?.deliveryEnabled}
                      required
                    />
                    <span className="flex-1">
                      Delivery
                      {!outletData?.deliveryEnabled && (
                        <span className="text-xs text-gray-500 ml-2">(Currently unavailable)</span>
                      )}
                    </span>
                  </label>
                </div>
                
                {/* Table Number Input (only for Dine-In) */}
                {orderType === "dine_in" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Table Number *
                    </label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Enter table number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Address (only for Delivery orders) */}
              {orderType === "delivery" && (
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
                    placeholder="Enter your delivery address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              )}

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <CreditCard size={16} />
                  Payment Type
                </label>
                <div className="space-y-3 mb-4">
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${outletData?.payNowEnabled === false ? 'opacity-60' : ''}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="pay_now"
                      checked={paymentType === "pay_now"}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="mr-3"
                      disabled={outletData?.payNowEnabled === false}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Pay Now</span>
                      <p className="text-xs text-gray-600">Pay immediately via payment method</p>
                      {outletData?.payNowEnabled === false && (
                        <p className="text-xs text-red-500 mt-1">(Currently unavailable)</p>
                      )}
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${outletData?.payLaterEnabled === false ? 'opacity-60' : ''}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="pay_later"
                      checked={paymentType === "pay_later"}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="mr-3"
                      disabled={outletData?.payLaterEnabled === false}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Pay Later</span>
                      <p className="text-xs text-gray-600">Pay at the restaurant/counter</p>
                      {outletData?.payLaterEnabled === false && (
                        <p className="text-xs text-red-500 mt-1">(Currently unavailable)</p>
                      )}
                    </div>
                  </label>
                </div>

                {/* Payment Method (only show if Pay Now is selected) */}
                {paymentType === "pay_now" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-2"
                        />
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={selectedItems.size === 0}
                className={`w-full py-3 rounded-md transition-colors ${
                  selectedItems.size === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {selectedItems.size === 0 
                  ? 'Select items to proceed'
                  : `Proceed to Payment - ₹${(totalPrice + 30 + (totalPrice * 0.05)).toFixed(2)}`
                }
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              {allCartItems.length > 1 && (
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === allCartItems.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-gray-600">
                    {selectedItems.size === allCartItems.length ? 'Deselect All' : 'Select All'}
                  </span>
                </label>
              )}
            </div>
            
            <div className="space-y-4 mb-6">
              {allCartItems.map((item) => {
                const isSelected = selectedItems.has(item._id);
                return (
                  <div key={item._id} className={`flex items-center gap-3 pb-4 border-b ${!isSelected ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem(item._id)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
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
                );
              })}
            </div>
            
            {selectedItems.size === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Please select at least one item to proceed.</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({selectedItems.size} items):</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹30.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span>₹{(totalPrice * 0.05).toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{(totalPrice + 30 + (totalPrice * 0.05)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
