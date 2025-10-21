import { useCart } from '../context/CartContext'

export default function MenuItem({ title, desc, price, img }) {
  const { add } = useCart()
  return (
    <div className="menu-item bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition">
      {img && <img src={img} alt={title} className="w-full h-48 object-cover" loading="lazy" />}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-gray-900 font-medium">${price.toFixed(2)}</div>
          <button
            onClick={() => add({ title, desc, price, img })}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
