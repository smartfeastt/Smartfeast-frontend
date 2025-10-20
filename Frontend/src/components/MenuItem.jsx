export default function MenuItem({ title, desc, price }) {
  return (
    <div className="menu-item bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{desc}</p>
        </div>
        <div className="text-gray-900 font-medium">${price}</div>
      </div>
      <div className="mt-4">
        <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          Add to Cart
        </button>
      </div>
    </div>
  )
}
