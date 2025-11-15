import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen minimal-gradient px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="feature-card max-w-md w-full floating"
      >
        <motion.h1
          className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          401
        </motion.h1>
        <motion.h2
          className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Unauthorized Access
        </motion.h2>
        <motion.p
          className="text-slate-600 dark:text-slate-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          You do not have permission to view this page. Please log in to continue.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Link
            to="/"
            className="btn-primary inline-block"
          >
            Go to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
