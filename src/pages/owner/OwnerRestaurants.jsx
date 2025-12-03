import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks.js';
import { Plus, MapPin, Settings, Trash2 } from 'react-feather';
import { Building2 } from 'lucide-react';
import DynamicHeader from '../../components/headers/DynamicHeader.jsx';

const API_URL = import.meta.env.VITE_API_URL;
import {
  fetchOwnerRestaurants,
  createRestaurant,
  selectRestaurants,
  selectRestaurantLoading,
  selectRestaurantError,
  selectCreateLoading,
  selectCreateError,
  clearRestaurantError,
  selectIsDataStale,
} from '../../store/slices/restaurantSlice.js';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const restaurants = useAppSelector(selectRestaurants);
  const loading = useAppSelector(selectRestaurantLoading);
  const error = useAppSelector(selectRestaurantError);
  const createLoading = useAppSelector(selectCreateLoading);
  const createError = useAppSelector(selectCreateError);
  const isDataStale = useAppSelector(selectIsDataStale);
  
  const { user, token, loading: authLoading } = useAppSelector((state) => state.auth);

  // Local state for modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [outletCount, setOutletCount] = useState(3);
  const [deletingRestaurant, setDeletingRestaurant] = useState(null);
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [restaurantImagePreview, setRestaurantImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editName, setEditName] = useState('');
  const [editOutletCount, setEditOutletCount] = useState(3);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Auth check and data fetching
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.type !== 'owner') {
      console.log('User is not an owner');
      navigate('/login');
      return;
    }

    // Fetch restaurants if data is stale or doesn't exist
    if (isDataStale || restaurants.length === 0) {
      dispatch(fetchOwnerRestaurants(token));
    }
  }, [user, token, authLoading, dispatch, navigate, isDataStale, restaurants.length]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setRestaurantImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setRestaurantImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Supabase
  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);
      // Get presigned URL
      const presignResponse = await fetch(`${API_URL}/api/upload/presign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder: 'restaurants',
        }),
      });

      const presignData = await presignResponse.json();
      if (!presignData.success) {
        throw new Error(presignData.message || 'Failed to get upload URL');
      }

      // Upload file to Supabase
      const uploadResponse = await fetch(presignData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      return presignData.fileUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle create restaurant
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    
    let imageUrl = "";
    if (restaurantImage) {
      try {
        imageUrl = await uploadImage(restaurantImage);
      } catch (error) {
        alert('Failed to upload image. Please try again.');
        return;
      }
    }

    const result = await dispatch(
      createRestaurant({
        token,
        name: newRestaurantName,
        outlet_count: outletCount,
        restaurantImage: imageUrl,
      })
    );

    if (createRestaurant.fulfilled.match(result)) {
      // Success
      setShowCreateModal(false);
      setNewRestaurantName('');
      setOutletCount(3);
      setRestaurantImage(null);
      setRestaurantImagePreview(null);
    } else {
      // Error is already stored in Redux state
      console.error('Failed to create restaurant:', result.payload);
    }
  };

  // Clear errors and form when modal closes
  useEffect(() => {
    if (!showCreateModal) {
      dispatch(clearRestaurantError());
      setNewRestaurantName('');
      setOutletCount(3);
      setRestaurantImage(null);
      setRestaurantImagePreview(null);
    }
  }, [showCreateModal, dispatch]);

  const handleDeleteRestaurant = async (restaurantId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this restaurant? This will also delete all associated outlets. This action cannot be undone."
    );
    
    if (!confirmed) return;

    try {
      setDeletingRestaurant(restaurantId);
      const response = await fetch(`${API_URL}/api/restaurant/delete/${restaurantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh restaurants list
        dispatch(fetchOwnerRestaurants(token));
        alert('Restaurant deleted successfully.');
      } else {
        alert(data.message || 'Failed to delete restaurant. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('An error occurred while deleting the restaurant. Please try again.');
    } finally {
      setDeletingRestaurant(null);
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Restaurants</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            <Plus size={20} />
            Create Restaurant
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No restaurants yet. Create your first restaurant!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
              >
                {/* Restaurant Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={restaurant?.restaurantImage || restaurant?.profilePhotoUrl || restaurant?.image || "https://via.placeholder.com/300"}
                    alt={restaurant?.name || "Restaurant"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingRestaurant(restaurant);
                          setEditName(restaurant.name);
                          setEditOutletCount(restaurant.outlet_count || 3);
                          setEditImagePreview(restaurant?.restaurantImage || restaurant?.profilePhotoUrl || restaurant?.image || null);
                          setShowEditModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 transition"
                        title="Edit Restaurant"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/owner/restaurant/${restaurant._id}`)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Manage Outlets"
                      >
                        <MapPin size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant._id)}
                        disabled={deletingRestaurant === restaurant._id}
                        className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                        title="Delete Restaurant"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{restaurant.outlets?.length || 0} Outlets</span>
                    </div>
                    <div>
                      <span>Limit: {restaurant.outlet_count} outlets</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/owner/restaurant/${restaurant._id}`)}
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => navigate(`/view/${restaurant.name}`)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Restaurant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New Restaurant</h3>
            
            {/* Create Error Message */}
            {createError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {createError}
              </div>
            )}
            
            <form onSubmit={handleCreateRestaurant}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={newRestaurantName}
                  onChange={(e) => setNewRestaurantName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter restaurant name"
                  required
                  disabled={createLoading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outlet Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={outletCount}
                  onChange={(e) => setOutletCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                  disabled={createLoading}
                />
              </div>

              {/* Restaurant Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Profile Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  disabled={createLoading || uploadingImage}
                />
                {restaurantImagePreview && (
                  <div className="mt-3">
                    <img
                      src={restaurantImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 5MB. Accepted formats: JPEG, PNG, WebP
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={createLoading || uploadingImage}
                >
                  {uploadingImage ? 'Uploading Image...' : createLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditModal && editingRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Restaurant</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              let imageUrl = editingRestaurant.restaurantImage || editingRestaurant.profilePhotoUrl || editingRestaurant.image || "";
              
              if (restaurantImage) {
                try {
                  imageUrl = await uploadImage(restaurantImage);
                } catch (error) {
                  alert('Failed to upload image. Please try again.');
                  return;
                }
              }

              try {
                const response = await fetch(`${API_URL}/api/restaurant/update/${editingRestaurant._id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    token,
                    name: editName,
                    outlet_count: editOutletCount,
                    restaurantImage: imageUrl,
                  }),
                });

                const data = await response.json();
                if (data.success) {
                  setShowEditModal(false);
                  setEditingRestaurant(null);
                  setRestaurantImage(null);
                  setRestaurantImagePreview(null);
                  setEditImagePreview(null);
                  dispatch(fetchOwnerRestaurants(token));
                  alert('Restaurant updated successfully!');
                } else {
                  alert(data.message || 'Failed to update restaurant');
                }
              } catch (error) {
                console.error('Error updating restaurant:', error);
                alert('Failed to update restaurant. Please try again.');
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outlet Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={editOutletCount}
                  onChange={(e) => setEditOutletCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Profile Image
                </label>
                {editImagePreview && !restaurantImagePreview && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Current Image:</p>
                    <img
                      src={editImagePreview}
                      alt="Current"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  disabled={uploadingImage}
                />
                {restaurantImagePreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">New Image Preview:</p>
                    <img
                      src={restaurantImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 5MB. Accepted formats: JPEG, PNG, WebP
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRestaurant(null);
                    setRestaurantImage(null);
                    setRestaurantImagePreview(null);
                    setEditImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}