/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { Home, Info } from 'lucide-react';
import { AnimatedThemeToggler } from '../../pages/global/animated-theme';
import logo from '../../assets/logo.png';

const LandingHeader = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home, reload: true },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <header className="fixed bg-white top-0 left-0 right-0 z-50 glass-nav rounded-none text-slate-900 dark:text-slate-100 transition-all duration-300">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => window.location.reload()}
          className="flex items-center space-x-3 group"
        >
        <div className="flex items-center">
          <img src={logo} alt="SmartFeast logo" className="h-10 auto" />
        </div>
          
        </Link>

        {/* Desktop Navigation */}
        <nav className="flex items-center space-x-4">
  {navItems.map((item) => (
    <Link
      key={item.name}
      to={item.path}
      className="flex items-center space-x-1 text-black hover:text-gray-200 transition-colors"
      onClick={(e) => {
        if (item.reload) {
          e.preventDefault();
          window.location.href = item.path;
        }
      }}
    >
      <item.icon className="h-4 w-4 text-black" />
      <span>{item.name}</span>
    </Link>
  ))}
</nav>


        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <AnimatedThemeToggler />
          <Link
            to="/user/signin"
            className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition text-sm"
          >
            Sign In as User
          </Link>
          <Link
            to="/signin"
            className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition text-sm"
          >
            Sign In as Vendor
          </Link>
          <Link
            to="/user/signup"
            className="bg-black text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-800 transition text-sm"
          >
            Sign Up as User
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;

