import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks.js'
import { Plus, Edit, Trash2, ArrowLeft, Upload } from 'react-feather'
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL;

export default function ManageMenu() {
  const { outletId } = useParams()
  const { token } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    itemName: '',
    itemPrice: '',
    itemQuantity: '',
    itemDescription: '',
    category: '',
    isAvailable: true,
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    sortOrder: 0,
  })

  useEffect(() => {
  if (token && outletId) {
    fetchItems()
    fetchCategories()
  }
}, [token, outletId])

  const fetchItems = async () => {
    try {
      console.log(token);
      const response = await fetch(`${API_URL}/api/item/outlet/${outletId}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ include token here
        },
      });
      const data = await response.json()
      if (data.success) {
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/category/outlet/${outletId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let itemId = null
      let filePath = null

      // Create item first
      const createPayload = {
        token,
        outletId,
        ...formData,
        itemPrice: parseFloat(formData.itemPrice),
        itemQuantity: parseInt(formData.itemQuantity) || 0,
      }

      const createResponse = await fetch(`${API_URL}/api/item/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ include token here
        },
        body: JSON.stringify(createPayload),
      })

      const createData = await createResponse.json()
      if (createData.success) {
        itemId = createData.item._id

        // If we have a signed URL, upload the file
        if (createData.signedUrl && selectedFile) {
          const uploadResponse = await fetch(createData.signedUrl.signedUrl, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type,
            },
          });

        }

        setShowCreateModal(false)
        setEditingItem(null)
        resetForm()
        fetchItems()
      } else {
        alert(createData.message || 'Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create item')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/item/update/${editingItem._id}`, {
        method: 'PUT',
         headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ include token here
        },
        body: JSON.stringify({
          token,
          ...formData,
          itemPrice: parseFloat(formData.itemPrice),
          itemQuantity: parseInt(formData.itemQuantity) || 0,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowCreateModal(false)
        setEditingItem(null)
        resetForm()
        fetchItems()
      } else {
        alert(data.message || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`${API_URL}/api/item/delete/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ include token here
        },
        body: JSON.stringify({ token }),
      })
      const data = await response.json()
      if (data.success) {
        fetchItems()
      } else {
        alert(data.message || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const resetForm = () => {
    setFormData({
      itemName: '',
      itemPrice: '',
      itemQuantity: '',
      itemDescription: '',
      category: '',
      isAvailable: true,
    })
    setSelectedFile(null)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      itemName: item.itemName,
      itemPrice: item.itemPrice.toString(),
      itemQuantity: item.itemQuantity?.toString() || '',
      itemDescription: item.itemDescription || '',
      category: item.category || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    })
    setShowCreateModal(true)
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/category/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          outletId,
          ...categoryForm,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowCategoryModal(false)
        setCategoryForm({ name: '', description: '', sortOrder: 0 })
        fetchCategories()
      } else {
        alert(data.message || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Failed to create category')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Manage Menu</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Plus size={20} />
              Add Category
            </button>
            <button
              onClick={() => {
                resetForm()
                setEditingItem(null)
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No menu items yet. Add your first item!</p>
          </div>
        ) : (
          Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                  >
                    {item.itemPhoto && (
                      <img
                        src={item.itemPhoto}
                        alt={item.itemName}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-1">{item.itemName}</h4>
                    <p className="text-sm text-gray-600 mb-2">₹{item.itemPrice}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 px-3 py-1 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 flex items-center justify-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'Create New Item'}
            </h3>
            <form onSubmit={editingItem ? handleUpdate : handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.itemPrice}
                    onChange={(e) => setFormData({ ...formData, itemPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.itemQuantity}
                    onChange={(e) => setFormData({ ...formData, itemQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    rows="3"
                  />
                </div>
                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    />
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                    Available
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Category</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    required
                    placeholder="e.g., Beverages, Desserts"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    rows="2"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false)
                    setCategoryForm({ name: '', description: '', sortOrder: 0 })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

