import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg
        bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm
        hover:bg-slate-200/80 dark:hover:bg-slate-700/80
        border border-slate-200/50 dark:border-slate-700/50
        hover:scale-105 active:scale-95
        transition-all duration-200 ease-out ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <FaSun 
          className={`absolute inset-0 w-5 h-5 text-amber-500 dark:text-slate-400
            transition-all duration-300 ease-out
            ${isDark ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`}
        />
        <FaMoon 
          className={`absolute inset-0 w-5 h-5 text-slate-600 dark:text-slate-300
            transition-all duration-300 ease-out
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;