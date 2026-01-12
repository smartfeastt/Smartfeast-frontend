import { useState, useEffect } from "react";
import { 
  Package, 
  Plus,
  Edit,
  Trash2,
  Search,
  Loader,
  Save,
  X
} from "react-feather";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerInventory() {
  const { token, user } = useAppSelector((state) => state.auth);
  const [restaurants, setRestaurants] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    currentStock: 0,
    minStock: 0,
    unit: "pieces",
    costPerUnit: 0,
    supplier: "",
    lastRestocked: new Date().toISOString().split('T')[0],
    expiryDate: "",
    notes: ""
  });

  useEffect(() => {
    if (token && user?.type === 'owner') {
      fetchRestaurants();
    }
  }, [token, user]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchOutlets(selectedRestaurant);
      setSelectedOutlet(""); // Reset outlet when restaurant changes
      setInventoryItems([]); // Clear inventory when restaurant changes
    } else {
      setOutlets([]);
      setSelectedOutlet("");
      setInventoryItems([]);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (selectedOutlet) {
      fetchInventory();
    } else {
      setInventoryItems([]);
    }
  }, [selectedOutlet]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/restaurant/owner/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutlets = async (restaurantId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/outlet/restaurant/${restaurantId}`);
      const data = await response.json();
      
      if (data.success) {
        setOutlets(data.outlets || []);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    if (!selectedOutlet) return;
    
    try {
      setLoading(true);
      // Note: You'll need to create this endpoint in the backend
      // For now, we'll use local storage or fetch from menu items
      const response = await fetch(`${API_URL}/api/inventory/outlet/${selectedOutlet}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInventoryItems(data.inventory || []);
        }
      } else {
        // If endpoint doesn't exist, initialize with empty array
        // In a real app, you'd want to create this endpoint
        setInventoryItems([]);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      // Initialize with empty array if endpoint doesn't exist
      setInventoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      itemName: "",
      category: "",
      currentStock: 0,
      minStock: 0,
      unit: "pieces",
      costPerUnit: 0,
      supplier: "",
      lastRestocked: new Date().toISOString().split('T')[0],
      expiryDate: "",
      notes: ""
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setFormData({
      itemName: item.itemName || "",
      category: item.category || "",
      currentStock: item.currentStock || 0,
      minStock: item.minStock || 0,
      unit: item.unit || "pieces",
      costPerUnit: item.costPerUnit || 0,
      supplier: item.supplier || "",
      lastRestocked: item.lastRestocked ? new Date(item.lastRestocked).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
      notes: item.notes || ""
    });
    setEditingItem(item._id);
    setShowAddModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setInventoryItems(inventoryItems.filter(item => item._id !== itemId));
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      alert("Error deleting inventory item. Please try again.");
    }
  };

  const handleSaveItem = async () => {
    if (!formData.itemName || !selectedOutlet) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const url = editingItem 
        ? `${API_URL}/api/inventory/${editingItem}`
        : `${API_URL}/api/inventory`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          outletId: selectedOutlet
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowAddModal(false);
          fetchInventory();
        }
      } else {
        // If endpoint doesn't exist, save to local state (for demo purposes)
        // In production, you should create the backend endpoint
        const newItem = {
          _id: editingItem || Date.now().toString(),
          ...formData,
          outletId: selectedOutlet,
          updatedAt: new Date().toISOString(),
          createdAt: editingItem ? inventoryItems.find(i => i._id === editingItem)?.createdAt : new Date().toISOString()
        };

        if (editingItem) {
          setInventoryItems(inventoryItems.map(item => 
            item._id === editingItem ? newItem : item
          ));
        } else {
          setInventoryItems([...inventoryItems, newItem]);
        }
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Error saving inventory item:", error);
      // Fallback to local state management
      const newItem = {
        _id: editingItem || Date.now().toString(),
        ...formData,
        outletId: selectedOutlet,
        updatedAt: new Date().toISOString(),
        createdAt: editingItem ? inventoryItems.find(i => i._id === editingItem)?.createdAt : new Date().toISOString()
      };

      if (editingItem) {
        setInventoryItems(inventoryItems.map(item => 
          item._id === editingItem ? newItem : item
        ));
      } else {
        setInventoryItems([...inventoryItems, newItem]);
      }
      setShowAddModal(false);
    }
  };

  const getStockStatus = (currentStock, minStock) => {
    if (currentStock === 0) return { status: "out", color: "bg-red-100 text-red-700 border-red-200" };
    if (currentStock < minStock) return { status: "low", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    return { status: "good", color: "bg-green-100 text-green-700 border-green-200" };
  };

  const filteredItems = inventoryItems.filter(item =>
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Management</h1>
              <p className="text-gray-600">Track and manage your restaurant inventory</p>
            </div>
          </div>

          {/* Restaurant and Outlet Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Restaurant
                </label>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                  disabled={loading}
                >
                  <option value="">-- Select Restaurant --</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Outlet
                </label>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                  disabled={!selectedRestaurant || loading || outlets.length === 0}
                >
                  <option value="">-- Select Outlet --</option>
                  {outlets.map(outlet => (
                    <option key={outlet._id} value={outlet._id}>
                      {outlet.name} - {outlet.location || outlet.address || ''}
                    </option>
                  ))}
                </select>
                {selectedRestaurant && outlets.length === 0 && !loading && (
                  <p className="text-sm text-gray-500 mt-2">No outlets found for this restaurant</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          {selectedOutlet && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search inventory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <Plus size={18} />
                Add Inventory Item
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={48} />
          </div>
        )}

        {/* Inventory Items */}
        {selectedOutlet && !loading && (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const stockStatus = getStockStatus(item.currentStock, item.minStock);
                return (
                  <div
                    key={item._id}
                    className={`bg-white rounded-xl shadow-sm border ${stockStatus.color} p-6 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="text-gray-600" size={20} />
                          <h3 className="text-xl font-bold text-gray-900">{item.itemName}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${stockStatus.color}`}>
                            {stockStatus.status === "out" ? "Out of Stock" : stockStatus.status === "low" ? "Low Stock" : "In Stock"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-600">Category</p>
                            <p className="font-semibold text-gray-900">{item.category || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Current Stock</p>
                            <p className="font-bold text-gray-900">{item.currentStock} {item.unit || "pieces"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Min Stock Level</p>
                            <p className="font-semibold text-gray-900">{item.minStock} {item.unit || "pieces"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Cost per Unit</p>
                            <p className="font-semibold text-gray-900">₹{item.costPerUnit?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                        {item.supplier && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              Supplier: <span className="font-semibold">{item.supplier}</span>
                            </p>
                          </div>
                        )}
                        {item.lastRestocked && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Last Restocked: <span className="font-semibold">
                                {new Date(item.lastRestocked).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        )}
                        {item.expiryDate && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Expiry Date: <span className={`font-semibold ${
                                new Date(item.expiryDate) < new Date() ? 'text-red-600' : ''
                              }`}>
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        )}
                        {item.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{item.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit item"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No items found" : "No inventory items"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Start by adding your first inventory item"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus size={18} />
                    Add Inventory Item
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!selectedOutlet && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Outlet</h3>
            <p className="text-gray-600">
              Please select a restaurant and outlet to view inventory
            </p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="e.g., Tomatoes, Rice, Cooking Oil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="e.g., Vegetables, Grains, Beverages"
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Stock Level *
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="grams">Grams (g)</option>
                      <option value="liters">Liters (L)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="packets">Packets</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cost per Unit (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.costPerUnit}
                      onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Supplier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Restocked Date
                    </label>
                    <input
                      type="date"
                      value={formData.lastRestocked}
                      onChange={(e) => setFormData({ ...formData, lastRestocked: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expiry Date (if applicable)
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    rows="3"
                    placeholder="Additional notes or comments..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
