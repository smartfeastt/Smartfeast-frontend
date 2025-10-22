import Navbar from "../components/Navbar"
import { ShoppingCart, Star, Clock, Search } from "react-feather"
import MenuItem from "../components/MenuItem"
import { useMemo, useState } from "react"
import { menuItems } from "../data/menu"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import useMenuFilters from "../hooks/useMenuFilters"

export default function Menu() {
  const [active, setActive] = useState("All")
  const tabs = ["All","Starters","Mains","Desserts","Drinks","Specials"]
  const { count, total } = useCart()

  const base = useMemo(
    () => menuItems.filter(m => active === "All" || m.category === active),
    [active]
  )

  const {
    q, setQ, maxPrice, setMaxPrice, minRating, setMinRating,
    diet, setDiet, spicy, setSpicy, visible
  } = useMenuFilters(base)

  const toggleDiet = (key) => setDiet(s => {
    const next = new Set(s)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

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
                <div className="text-sm text-gray-500">$$  American  Modern</div>
              </div>
              <p className="mt-4 text-gray-600">
                Contemporary dining with locally sourced ingredients and craft cocktails. Our menu changes seasonally
                to bring you the freshest flavors.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Open now  11:00 AM - 10:00 PM</span>
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
                className={`category-tab py-4 px-1 text-sm font-medium ${active === t ? "active" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-24">Max Price</label>
            <input type="number" min="0" step="1"
              value={maxPrice ?? ""}
              onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
              className="w-full border rounded-md px-2 py-2"
              placeholder="$"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-24">Min Rating</label>
            <input type="number" min="0" max="5" step="0.1"
              value={minRating}
              onChange={e => setMinRating(Number(e.target.value))}
              className="w-full border rounded-md px-2 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-24">Spicy</label>
            <select
              value={spicy ?? ""}
              onChange={e => setSpicy(e.target.value === "" ? null : Number(e.target.value))}
              className="w-full border rounded-md px-2 py-2"
            >
              <option value="">Any</option>
              <option value="0">0 - Mild</option>
              <option value="1">1 - Low</option>
              <option value="2">2 - Medium</option>
              <option value="3">3 - Hot</option>
            </select>
          </div>

          <div className="md:col-span-4 flex flex-wrap gap-2 pt-1">
            {["vegetarian","vegan","gluten-free"].map(d => (
              <button
                key={d}
                onClick={() => toggleDiet(d)}
                className={`text-sm px-3 py-1.5 rounded-full border ${diet.has(d) ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((m, i) => (
            <MenuItem key={i} title={m.title} desc={m.desc} price={m.price} img={m.img} options={m.options} />
          ))}
        </div>
      </div>

      {/* Mobile Cart button */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden p-4 border-t border-gray-200">
          <Link to="/cart" className="w-full flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart className="text-gray-600 mr-2" />
              <span className="text-gray-800 font-medium">{count} {count === 1 ? "item" : "items"}</span>
            </div>
            <div className="text-gray-800 font-medium">${total.toFixed(2)}</div>
          </Link>
        </div>
      )}
    </>
  )
}
