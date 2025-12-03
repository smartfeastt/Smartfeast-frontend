import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, X } from "react-feather";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserAddresses() {
  const { token, user } = useAppSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    if (token && user?.type === 'user') {
      fetchAddresses();
    }
  }, [token, user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      // For now, using localStorage as placeholder
      const saved = localStorage.getItem('userAddresses');
      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAddress) {
      // Update address
      const updated = addresses.map(addr =>
        addr.id === editingAddress.id ? { ...editingAddress, ...formData } : addr
      );
      setAddresses(updated);
      localStorage.setItem('userAddresses', JSON.stringify(updated));
    } else {
      // Add new address
      const newAddress = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      const updated = [...addresses, newAddress];
      setAddresses(updated);
      localStorage.setItem('userAddresses', JSON.stringify(updated));
    }
    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      label: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    });
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updated = addresses.filter(addr => addr.id !== id);
      setAddresses(updated);
      localStorage.setItem('userAddresses', JSON.stringify(updated));
    }
  };

  const setDefault = (id) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem('userAddresses', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
            <p className="text-gray-600 mt-2">Manage your delivery addresses</p>
          </div>
          <button
            onClick={() => {
              setEditingAddress(null);
              setFormData({
                label: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                phone: "",
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-500 mb-6">
              Add your first delivery address to get started!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  address.isDefault ? 'border-2 border-black' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="text-xs text-black font-medium">Default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                  <p>Phone: {address.phone}</p>
                </div>
                {!address.isDefault && (
                  <button
                    onClick={() => setDefault(address.id)}
                    className="mt-4 text-sm text-black hover:underline"
                  >
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAddress(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label (Home, Work, etc.)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="Home"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    rows="3"
                    placeholder="Street address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    {editingAddress ? 'Update' : 'Add'} Address
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingAddress(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

