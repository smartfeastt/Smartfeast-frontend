import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { CheckCircle } from "react-feather";

export default function PaymentSuccess() {
  return (
    <>
      <Navbar title="Order Successful" />
      <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-lg shadow-sm">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your order has been placed and is now being prepared.
        </p>
        <Link
          to="/"
          className="inline-block bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700"
        >
          Return to Home
        </Link>
      </div>
    </>
  );
}
