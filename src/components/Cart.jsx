import { X, Plus, Minus, ShoppingBag } from "react-feather";
import { useCart } from "../context/CartContext.jsx";
import { Link } from "react-router-dom";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Cart ({cartItems.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    {item.itemPhoto && (
                      <img
                        src={item.itemPhoto}
                        alt={item.itemName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.itemName}</h3>
                      <p className="text-sm text-gray-600">₹{item.itemPrice}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="ml-auto text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-2">
                    <span className="font-medium">
                      ₹{(item.itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>₹{getTotalPrice().toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/checkout"
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors text-center block"
                onClick={() => setIsCartOpen(false)}
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={clearCart}
                className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
