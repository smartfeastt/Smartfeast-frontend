import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "react-feather";
import { useAuth } from "../../context/AuthContext.jsx";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    // Load user profile data from localStorage or API
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setFormData(prev => ({ ...prev, ...profileData }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Save to localStorage (in real app, would save to backend)
    localStorage.setItem("user_profile", JSON.stringify(formData));
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      setFormData(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <div className="md:col-span-2 flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={48} className="text-gray-400" />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition-colors">
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">12</div>
            <div className="text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">₹2,450</div>
            <div className="text-gray-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-gray-600">Favorite Restaurants</div>
          </div>
        </div>
      </div>
    </div>
  );
}
