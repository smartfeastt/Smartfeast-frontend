import Navbar from '../components/Navbar'
import { ShoppingCart, Star, Clock } from 'react-feather'
import MenuItem from '../components/MenuItem'
import { useState } from 'react'
import { menuItems } from '../data/menu'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Menu() {
  const [active, setActive] = useState('All')
  const tabs = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks', 'Specials']
  const { count, total } = useCart()

  const filtered = menuItems.filter(m => active === 'All' || m.category === active)

  return (
    <>
      <Navbar
        title="The Urban Eatery"
        right={
          <Link to="/cart" className="text-gray-600 hover:text-gray-900 relative">
            <ShoppingCart />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        }
        backTo="/"
      />

      {/* Restaurant Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="http://static.photos/restaurant/640x360/1"
                  alt="Restaurant"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4 md:pl-8">
              <h1 className="text-2xl font-bold text-gray-900">The Urban Eatery</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.5 (128 reviews)</span>
                </div>
                <div className="text-sm text-gray-500">$$ • American • Modern</div>
              </div>
              <p className="mt-4 text-gray-600">
                Contemporary dining with locally sourced ingredients and craft cocktails. Our menu changes seasonally
                to bring you the freshest flavors.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Open now • 11:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-8">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`category-tab py-4 px-1 text-sm font-medium ${
                  active === t ? 'active' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m, i) => (
            <MenuItem
              key={i}
              title={m.title}
              desc={m.desc}
              price={m.price}
              img={m.img}
            />
          ))}
        </div>
      </div>

      {/* Mobile Cart button */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden p-4 border-t border-gray-200">
          <Link to="/cart" className="w-full flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart className="text-gray-600 mr-2" />
              <span className="text-gray-800 font-medium">{count} {count === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="text-gray-800 font-medium">${total.toFixed(2)}</div>
          </Link>
        </div>
      )}
    </>
  )
}
