import Navbar from '../components/Navbar'
import { Filter, RefreshCw } from 'react-feather'
import { staffOrders } from '../data/orders'

export default function Staff() {
  return (
    <>
      <Navbar title="QRMenu Staff" restaurant="The Urban Eatery" right={
        <button className="text-gray-600 hover:text-gray-900" title="Logout">⎋</button>
      } />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">New Orders</h1>
          <div className="flex items-center space-x-2">
            <button className="flex items-center text-gray-600 hover:text-gray-900">
              <Filter className="mr-1" />
              <span>Filter</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-gray-900">
              <RefreshCw className="mr-1" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Order Cards */}
          {staffOrders.map((o, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-800 text-white flex justify-between items-center">
                <div>
                  <span className="font-medium">Order #{o.id}</span>
                  <span className="text-gray-300 text-sm ml-2">{o.time}</span>
                </div>
                <span className={`${o.status.classes} text-xs font-medium px-2.5 py-0.5 rounded`}>{o.status.label}</span>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <span className="w-4 h-4 mr-1">👤</span>
                    <span>Table {o.table}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-4 h-4 mr-1">🕑</span>
                    <span>{o.minutesAgo} minutes ago</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {o.items.filter(i => i.name).map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{it.name}</span>
                        <span className="block text-xs text-gray-500">{it.meta}</span>
                      </div>
                      <span className="text-gray-900">{it.price}</span>
                    </div>
                  ))}

                  {o.items.find(i => i.note) && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-start">
                        <span className="w-4 h-4 text-gray-500 mr-2 mt-0.5">ℹ️</span>
                        <span className="text-sm text-gray-600">{o.items.find(i => i.note).note}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-medium text-gray-900">{o.total}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className={`mt-4 ${o.type === 'pending' ? 'grid grid-cols-2 gap-2' : ''}`}>
                  {o.type === 'pending' && (
                    <>
                      <button className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-800 bg-white hover:bg-gray-50">Reject</button>
                      <button className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700">Accept</button>
                    </>
                  )}
                  {o.type === 'preparing' && (
                    <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700">Mark as Ready</button>
                  )}
                  {o.type === 'ready' && (
                    <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700">Mark as Served</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
