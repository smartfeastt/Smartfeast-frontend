import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import { useAuth } from '../context/AuthContext.jsx'


const API_URL = import.meta.env.VITE_API_URL;

export default function ViewOutlet() {
  const { restaurantName, outletName } = useParams()
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [outlet, setOutlet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token && outletName && restaurantName) {
      fetchMenuItems()
    }
  }, [token,restaurantName, outletName]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/item/view/${restaurantName}/${outletName}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ include token here
        },
      });
      const data = await response.json()
      if (data.success) {
        setItems(data.items || [])
        setOutlet(data.outlet)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
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
      <header className="bg-black text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to={`/view/${restaurantName}`}
            className="text-sm text-gray-300 hover:text-white mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to {restaurantName}
          </Link>
          <h1 className="text-3xl font-bold">{outlet?.name || outletName}</h1>
          {outlet?.location && (
            <p className="text-gray-300 mt-2">{outlet.location}</p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No menu items available</p>
          </div>
        ) : (
          Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems
                  .filter(item => item.isAvailable)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                    >
                      {item.itemPhoto && (
                        <img
                          src={item.itemPhoto}
                          alt={item.itemName}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.itemName}
                        </h3>
                        {item.itemDescription && (
                          <p className="text-sm text-gray-600 mb-2">{item.itemDescription}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{item.itemPrice}
                          </span>
                          {item.itemQuantity !== undefined && (
                            <span className="text-sm text-gray-500">
                              Qty: {item.itemQuantity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

