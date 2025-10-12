import { Link } from 'react-router-dom'

export default function Signup() {
  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">⬛</span>
            <span className="text-xl font-medium text-gray-800">QRMenu</span>
          </div>

          <div className="mt-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Or <Link to="/login" className="font-medium text-gray-800 hover:text-gray-900">sign in to your existing account</Link>
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">Full name</label>
                <div className="mt-1">
                  <input id="full-name" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1">
                  <input id="email" type="email" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input id="password" type="password" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1">
                  <input id="confirm-password" type="password" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
                </div>
              </div>

              <label className="flex items-center">
                <input id="terms" type="checkbox" className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded" />
                <span className="ml-2 block text-sm text-gray-700">
                  I agree to the <a className="text-gray-800 hover:text-gray-900" href="#">Terms</a> and <a className="text-gray-800 hover:text-gray-900" href="#">Privacy Policy</a>
                </span>
              </label>

              <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Create Account</button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue without account</span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Browse Restaurants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block relative w-0 flex-1 auth-container" style={{ backgroundImage: `url('http://static.photos/minimal/1200x630/2')` }}>
        <div className="absolute inset-0 bg-gray-800 opacity-20"></div>
        <div className="absolute bottom-10 left-10 text-white">
          <h3 className="text-xl font-bold mb-2">Scan & Order</h3>
          <p className="text-sm">Experience seamless digital ordering with QR technology</p>
        </div>
      </div>
    </div>
  )
}
