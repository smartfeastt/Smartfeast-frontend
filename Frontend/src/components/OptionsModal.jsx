import { useEffect, useState } from "react"

export default function OptionsModal({ open, onClose, item, onAdd }) {
  const [selected, setSelected] = useState({})

  useEffect(() => {
    if (open) setSelected({})
  }, [open])

  if (!open) return null

  const opt = item.options || {}
  const pick = (group, v) => setSelected(s => ({ ...s, [group]: v }))
  const toggleExtra = (ex) => setSelected(s => {
    const existing = s.extras || []
    const has = existing.find(e => e.label === ex.label)
    return { ...s, extras: has ? existing.filter(e => e.label !== ex.label) : [...existing, ex] }
  })

  const delta =
    (selected.size?.delta || 0) +
    (selected.doneness?.delta || 0) +
    (selected.side?.delta || 0) +
    (selected.extras?.reduce((sum, e) => sum + (e.delta || 0), 0) || 0)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-[520px] rounded-t-2xl md:rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Customize: {item.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"></button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-auto pr-1">
          {opt.size?.length > 0 && (
            <section>
              <h4 className="font-medium mb-2">Size</h4>
              <div className="grid grid-cols-2 gap-2">
                {opt.size.map(o => (
                  <button key={o.label}
                    onClick={() => pick('size', o)}
                    className={`border rounded-md px-3 py-2 text-sm ${selected.size?.label===o.label ? 'border-gray-900' : 'border-gray-300'}`}>
                    {o.label} {o.delta ? `(+$${o.delta})` : ''}
                  </button>
                ))}
              </div>
            </section>
          )}

          {opt.doneness?.length > 0 && (
            <section>
              <h4 className="font-medium mb-2">Doneness</h4>
              <div className="grid grid-cols-3 gap-2">
                {opt.doneness.map(o => (
                  <button key={o.label}
                    onClick={() => pick('doneness', o)}
                    className={`border rounded-md px-3 py-2 text-sm ${selected.doneness?.label===o.label ? 'border-gray-900' : 'border-gray-300'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {opt.side?.length > 0 && (
            <section>
              <h4 className="font-medium mb-2">Side</h4>
              <div className="grid grid-cols-3 gap-2">
                {opt.side.map(o => (
                  <button key={o.label}
                    onClick={() => pick('side', o)}
                    className={`border rounded-md px-3 py-2 text-sm ${selected.side?.label===o.label ? 'border-gray-900' : 'border-gray-300'}`}>
                    {o.label} {o.delta ? `(+$${o.delta})` : ''}
                  </button>
                ))}
              </div>
            </section>
          )}

          {opt.extras?.length > 0 && (
            <section>
              <h4 className="font-medium mb-2">Extras</h4>
              <div className="grid grid-cols-2 gap-2">
                {opt.extras.map(o => {
                  const active = selected.extras?.some(e => e.label === o.label)
                  return (
                    <button key={o.label}
                      onClick={() => toggleExtra(o)}
                      className={`border rounded-md px-3 py-2 text-sm ${active ? 'border-gray-900' : 'border-gray-300'}`}>
                      {o.label} {o.delta ? `(+$${o.delta})` : ''}
                    </button>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <div className="mt-5 flex justify-between items-center">
          <div className="text-sm text-gray-600">Add-ons: {delta > 0 ? `+$${delta.toFixed(2)}` : '$0.00'}</div>
          <button
            onClick={() => { onAdd({ optionsSelected: selected }); onClose() }}
            className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800">
            Add ${(item.price + delta).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}
