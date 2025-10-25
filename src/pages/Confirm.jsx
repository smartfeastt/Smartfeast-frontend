import Navbar from '../components/Navbar'
import { Check } from 'react-feather'
import { Link } from 'react-router-dom'

export default function Confirm() {
  return (
    <>
      <Navbar title="QRMenu" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Order Confirmed!</h1>
        <p className="mt-4 text-lg text-gray-600">
          Your order has been placed successfully at <span className="font-medium text-gray-900">The Urban Eatery</span>.
        </p>
        <div className="mt-10">
          <Link to="/" className="inline-flex items-center px-6 py-3 rounded-md text-white bg-gray-800 hover:bg-gray-700">
            Back to Home
          </Link>
        </div>
      </div>
    </>
  )
}
