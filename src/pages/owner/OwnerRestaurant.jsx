import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks.js'
import { Plus, MapPin, Users, ArrowLeft, Trash2, Settings } from 'react-feather'
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerRestaurant() {
  const { restaurantId } = useParams()
  const { token } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newOutletName, setNewOutletName] = useState('')
  const [newOutletLocation, setNewOutletLocation] = useState('')
  const [deletingOutlet, setDeletingOutlet] = useState(null)
  const [newOutletAddress, setNewOutletAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [newOutletCoordinates, setNewOutletCoordinates] = useState({
    latitude: '',
    longitude: '',
  })
  const [autoGeocode, setAutoGeocode] = useState(true)
  const [geocoding, setGeocoding] = useState(false)
  const [outletImage, setOutletImage] = useState(null)
  const [outletImagePreview, setOutletImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState(null)
  const [editName, setEditName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editAddress, setEditAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [editCoordinates, setEditCoordinates] = useState({
    latitude: '',
    longitude: '',
  })
  const [editImagePreview, setEditImagePreview] = useState(null)

  useEffect(() => {
    fetchRestaurant()
    fetchOutlets()
  }, [restaurantId])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        setRestaurant(data.restaurant)
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error)
    }
  }

  const fetchOutlets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/outlet/restaurant/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        setOutlets(data.outlets || [])
      }
    } catch (error) {
      console.error('Error fetching outlets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeocode = async () => {
    if (!newOutletAddress.street || !newOutletAddress.city) {
      alert('Please enter at least street and city for geocoding')
      return
    }

    try {
      setGeocoding(true)
      const fullAddress = `${newOutletAddress.street}, ${newOutletAddress.city}, ${newOutletAddress.state} ${newOutletAddress.pincode}, ${newOutletAddress.country}`
      const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBf52RdrtPkb4hT_OYEU52q7eOMns4eHtg'
      const encodedAddress = encodeURIComponent(fullAddress)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        setNewOutletCoordinates({
          latitude: location.lat,
          longitude: location.lng,
        })
        alert('Location found! Coordinates updated.')
      } else {
        alert('Could not find location. Please enter coordinates manually.')
      }
    } catch (error) {
      console.error('Error geocoding:', error)
      alert('Error geocoding address. Please enter coordinates manually.')
    } finally {
      setGeocoding(false)
    }
  }

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
      setOutletImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setOutletImagePreview(reader.result);
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
          folder: 'outlets',
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

  const handleCreateOutlet = async (e) => {
    e.preventDefault()
    try {
      let imageUrl = "";
      if (outletImage) {
        try {
          imageUrl = await uploadImage(outletImage);
        } catch (error) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      const addressData = {
        street: newOutletAddress.street,
        city: newOutletAddress.city,
        state: newOutletAddress.state,
        pincode: newOutletAddress.pincode,
        country: newOutletAddress.country,
        fullAddress: `${newOutletAddress.street}, ${newOutletAddress.city}, ${newOutletAddress.state} ${newOutletAddress.pincode}, ${newOutletAddress.country}`.trim(),
      }

      const coordinatesData = newOutletCoordinates.latitude && newOutletCoordinates.longitude
        ? {
            latitude: parseFloat(newOutletCoordinates.latitude),
            longitude: parseFloat(newOutletCoordinates.longitude),
          }
        : null

      const response = await fetch(`${API_URL}/api/outlet/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          restaurantId,
          name: newOutletName,
          location: newOutletLocation || addressData.fullAddress,
          address: addressData,
          coordinates: coordinatesData,
          outletImage: imageUrl,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowCreateModal(false)
        setNewOutletName('')
        setNewOutletLocation('')
        setNewOutletAddress({
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        })
        setNewOutletCoordinates({
          latitude: '',
          longitude: '',
        })
        setOutletImage(null)
        setOutletImagePreview(null)
        fetchOutlets()
        fetchRestaurant()
      } else {
        alert(data.message || 'Failed to create outlet')
      }
    } catch (error) {
      console.error('Error creating outlet:', error)
      alert('Failed to create outlet')
    }
  }

  const handleDeleteOutlet = async (outletId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this outlet? This action cannot be undone."
    );
    
    if (!confirmed) return;

    try {
      setDeletingOutlet(outletId);
      const response = await fetch(`${API_URL}/api/outlet/delete/${outletId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchOutlets();
        fetchRestaurant();
        alert('Outlet deleted successfully.');
      } else {
        alert(data.message || 'Failed to delete outlet. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting outlet:', error);
      alert('An error occurred while deleting the outlet. Please try again.');
    } finally {
      setDeletingOutlet(null);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center">Restaurant not found</div>
  }

  const canCreateOutlet = outlets.length < restaurant.outlet_count

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outlets</h2>
            <p className="text-sm text-gray-600">
              {outlets.length} / {restaurant.outlet_count} outlets
            </p>
          </div>
          {canCreateOutlet ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <Plus size={20} />
              Create Outlet
            </button>
          ) : (
            <p className="text-sm text-gray-600">Outlet limit reached</p>
          )}
        </div>

        {outlets.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No outlets yet. Create your first outlet!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <div
                key={outlet._id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
              >
                {/* Outlet Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={outlet?.outletImage || outlet?.profilePhotoUrl || outlet?.image || "https://via.placeholder.com/300"}
                    alt={outlet?.name || "Outlet"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{outlet.name}</h3>
                    <button
                      onClick={() => {
                        setEditingOutlet(outlet);
                        setEditName(outlet.name);
                        setEditLocation(outlet.location || '');
                        setEditAddress({
                          street: outlet.address?.street || '',
                          city: outlet.address?.city || '',
                          state: outlet.address?.state || '',
                          pincode: outlet.address?.pincode || '',
                          country: outlet.address?.country || 'India',
                        });
                        setEditCoordinates({
                          latitude: outlet.coordinates?.latitude?.toString() || '',
                          longitude: outlet.coordinates?.longitude?.toString() || '',
                        });
                        setEditImagePreview(outlet?.outletImage || outlet?.profilePhotoUrl || outlet?.image || null);
                        setShowEditModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-900 transition"
                      title="Edit Outlet"
                    >
                      <Settings size={18} />
                    </button>
                  </div>
                  {outlet.location && (
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                      <MapPin size={14} />
                      {outlet.location}
                    </p>
                  )}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{outlet.managers?.length || 0} Manager(s)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/owner/outlet/${outlet._id}`)}
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => navigate(`/view/${restaurant.name}/${outlet.name}`)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteOutlet(outlet._id)}
                      disabled={deletingOutlet === outlet._id}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Outlet"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Outlet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 my-8">
            <h3 className="text-xl font-bold mb-6">Create New Outlet</h3>
            <form onSubmit={handleCreateOutlet}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Outlet Name *
                        </label>
                        <input
                          type="text"
                          value={newOutletName}
                          onChange={(e) => setNewOutletName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location (Optional)
                        </label>
                        <input
                          type="text"
                          value={newOutletLocation}
                          onChange={(e) => setNewOutletLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="Short location description"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Address Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={newOutletAddress.street}
                          onChange={(e) => setNewOutletAddress({ ...newOutletAddress, street: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="Street, Building, etc."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={newOutletAddress.city}
                            onChange={(e) => setNewOutletAddress({ ...newOutletAddress, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            value={newOutletAddress.state}
                            onChange={(e) => setNewOutletAddress({ ...newOutletAddress, state: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={newOutletAddress.pincode}
                            onChange={(e) => setNewOutletAddress({ ...newOutletAddress, pincode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={newOutletAddress.country}
                            onChange={(e) => setNewOutletAddress({ ...newOutletAddress, country: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGeocode}
                        disabled={geocoding}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {geocoding ? 'Getting Location...' : 'Auto-Get Location (Lat/Long)'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Coordinates */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Coordinates (Optional)</h4>
                    <p className="text-xs text-gray-500 mb-3">Auto-filled if address geocoded</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newOutletCoordinates.latitude}
                          onChange={(e) => setNewOutletCoordinates({ ...newOutletCoordinates, latitude: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="28.6139"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newOutletCoordinates.longitude}
                          onChange={(e) => setNewOutletCoordinates({ ...newOutletCoordinates, longitude: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="77.2090"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Outlet Image Upload */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Outlet Profile Image</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-gray-500 mt-1 mb-3">
                        Max size: 5MB. Accepted formats: JPEG, PNG, WebP
                      </p>
                      {outletImagePreview && (
                        <div className="mt-3">
                          <img
                            src={outletImagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setOutletImage(null);
                    setOutletImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading Image...' : 'Create Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Outlet Modal */}
      {showEditModal && editingOutlet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 my-8">
            <h3 className="text-xl font-bold mb-6">Edit Outlet</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              let imageUrl = editingOutlet.outletImage || editingOutlet.profilePhotoUrl || editingOutlet.image || "";
              
              if (outletImage) {
                try {
                  imageUrl = await uploadImage(outletImage);
                } catch (error) {
                  alert('Failed to upload image. Please try again.');
                  return;
                }
              }

              const addressData = {
                street: editAddress.street,
                city: editAddress.city,
                state: editAddress.state,
                pincode: editAddress.pincode,
                country: editAddress.country,
                fullAddress: `${editAddress.street}, ${editAddress.city}, ${editAddress.state} ${editAddress.pincode}, ${editAddress.country}`.trim(),
              };

              const coordinatesData = editCoordinates.latitude && editCoordinates.longitude
                ? {
                    latitude: parseFloat(editCoordinates.latitude),
                    longitude: parseFloat(editCoordinates.longitude),
                  }
                : null;

              try {
                const response = await fetch(`${API_URL}/api/outlet/update/${editingOutlet._id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    token,
                    name: editName,
                    location: editLocation || addressData.fullAddress,
                    address: addressData,
                    coordinates: coordinatesData,
                    outletImage: imageUrl,
                  }),
                });

                const data = await response.json();
                if (data.success) {
                  setShowEditModal(false);
                  setEditingOutlet(null);
                  setOutletImage(null);
                  setOutletImagePreview(null);
                  setEditImagePreview(null);
                  fetchOutlets();
                  fetchRestaurant();
                  alert('Outlet updated successfully!');
                } else {
                  alert(data.message || 'Failed to update outlet');
                }
              } catch (error) {
                console.error('Error updating outlet:', error);
                alert('Failed to update outlet. Please try again.');
              }
            }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Outlet Name *
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location (Optional)
                        </label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="Short location description"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Address Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={editAddress.street}
                          onChange={(e) => setEditAddress({ ...editAddress, street: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="Street, Building, etc."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={editAddress.city}
                            onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            value={editAddress.state}
                            onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={editAddress.pincode}
                            onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={editAddress.country}
                            onChange={(e) => setEditAddress({ ...editAddress, country: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Coordinates */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Coordinates (Optional)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={editCoordinates.latitude}
                          onChange={(e) => setEditCoordinates({ ...editCoordinates, latitude: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="28.6139"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={editCoordinates.longitude}
                          onChange={(e) => setEditCoordinates({ ...editCoordinates, longitude: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="77.2090"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Outlet Image Upload */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Outlet Profile Image</h4>
                    <div>
                      {editImagePreview && !outletImagePreview && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Current Image:</p>
                          <img
                            src={editImagePreview}
                            alt="Current"
                            className="w-full h-64 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload New Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-gray-500 mt-1 mb-3">
                        Max size: 5MB. Accepted formats: JPEG, PNG, WebP
                      </p>
                      {outletImagePreview && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">New Image Preview:</p>
                          <img
                            src={outletImagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOutlet(null);
                    setOutletImage(null);
                    setOutletImagePreview(null);
                    setEditImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading Image...' : 'Update Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

