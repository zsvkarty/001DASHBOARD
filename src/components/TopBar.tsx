import React, { useState, useRef, useEffect } from 'react';
import { TopBarProps } from '../types';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../AuthContext';

interface TopBarPropsExtended extends TopBarProps {
  onMobileMenuToggle?: () => void;
}

const TopBar: React.FC<TopBarPropsExtended> = ({ user, onSettingsClick, onMobileMenuToggle }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    setIsUserMenuOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      console.log('Settings clicked');
    }
  };

  const handleMobileMenuClick = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleMyBadges = () => {
    setIsUserMenuOpen(false);
    console.log('My badges clicked');
    // In a real app, this would navigate to badges page
  };

  const handleMyProgress = () => {
    setIsUserMenuOpen(false);
    console.log('My progress clicked');
    // In a real app, this would navigate to progress page
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 gap-2">
        {/* Left: Hamburger menu icon */}
        <button
          onClick={handleMobileMenuClick}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Spacer to push user controls to the right */}
        <div className="flex-1"></div>

        {/* Right: Dark mode toggle and user avatar */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title={isDarkMode ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
            aria-label={isDarkMode ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleUserMenuToggle}
              className="flex items-center p-1 rounded-full hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
            >
              <img
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm"
                src={user.avatar}
                alt={`${user.name} avatar`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback avatar with initials */}
              <div 
                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm hidden"
                style={{ display: 'none' }}
              >
                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
                <div className="py-1">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleMyBadges}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-base">🎖</span>
                    Moje odznaky
                  </button>

                  <button
                    onClick={handleMyProgress}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-base">📊</span>
                    Můj progres
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="mr-3 text-base">⚙️</span>
                    Nastavení
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <span className="mr-3 text-base">🚪</span>
                      Odhlásit se
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;