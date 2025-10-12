import { User, Clock } from 'react-feather'

export default function OrderCard({ id, time, table, minutesAgo, status, color, items, total, actions }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 text-white flex justify-between items-center">
        <div>
          <span className="font-medium">Order #{id}</span>
          <span className="text-gray-300 text-sm ml-2">{time}</span>
        </div>
        <span className={`bg-${color}-100 text-${color}-800 text-xs font-medium px-2.5 py-0.5 rounded`}>{status}</span>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <User className="w-4 h-4 mr-1" />
            <span>Table {table}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{minutesAgo} minutes ago</span>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="flex justify-between">
              <div>
                <span className="font-medium text-gray-900">{it.name}</span>
                <span className="block text-xs text-gray-500">{it.meta}</span>
              </div>
              <span className="text-gray-900">{it.price}</span>
            </div>
          ))}

          {items.some(i => i.note) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-start">
                <span className="w-4 h-4 text-gray-500 mr-2 mt-0.5">i</span>
                <span className="text-sm text-gray-600">{items.find(i => i.note)?.note}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
            <span className="font-medium text-gray-900">Total</span>
            <span className="font-medium text-gray-900">{total}</span>
          </div>
        </div>

        {actions}
      </div>
    </div>
  )
}
