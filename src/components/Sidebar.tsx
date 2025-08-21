import React from 'react';
import { SidebarProps, NavigationItem } from '../types';

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Domů', icon: '🏠', path: '/' },
  { id: 'courses', label: 'Moje Kurzy', icon: '📚', path: '/courses' },
  { id: 'flashcards', label: 'Flashkarty', icon: '🃏', path: '/flashcards' },
  { id: 'book', label: 'Kniha', icon: '📖', path: '/book' },
  { id: 'audiobook', label: 'Audiokniha', icon: '🎧', path: '/audiobook' },
  { id: 'exercises', label: 'Cvičení', icon: '✏️', path: '/exercises' },
  { id: 'profile', label: 'Můj Profil', icon: '👤', path: '/profile' }
];

interface SidebarPropsExtended extends SidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const Sidebar: React.FC<SidebarPropsExtended> = ({ 
  activeSection = 'home', 
  onNavigate, 
  isMobileMenuOpen = false, 
  onMobileMenuClose 
}) => {
  const handleNavigation = (item: NavigationItem) => {
    if (onNavigate) {
      // Map profile navigation to settings
      const navigationId = item.id === 'profile' ? 'settings' : item.id;
      onNavigate(navigationId);
    }
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative flex items-center justify-center h-16 px-4 bg-[#2F4F4F] dark:bg-[#2F4F4F]">
            <div className="flex items-baseline">
              <h1 className="text-3xl font-space-grotesk font-semibold text-white">opravech</h1>
              <span className="text-sm font-space-grotesk font-light text-white/80 ml-1">.cz</span>
            </div>
            <button 
              className="absolute right-4 lg:hidden text-white hover:text-gray-200 p-1 rounded transition-colors duration-200"
              onClick={onMobileMenuClose}
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  (activeSection === item.id || (item.id === 'profile' && activeSection === 'settings'))
                    ? 'relative overflow-hidden text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
                style={(activeSection === item.id || (item.id === 'profile' && activeSection === 'settings')) ? {
                  backgroundColor: '#2F4F4F',
                } : {}}
              >
                {(activeSection === item.id || (item.id === 'profile' && activeSection === 'settings')) && (
                  <div 
                    className="absolute inset-0 backdrop-blur-[20px] saturate-[180%] rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                )}
                <span className={`text-xl mr-3 relative z-10 ${(activeSection === item.id || (item.id === 'profile' && activeSection === 'settings')) ? 'drop-shadow-sm' : ''}`}>{item.icon}</span>
                <span className={`font-medium relative z-10 ${(activeSection === item.id || (item.id === 'profile' && activeSection === 'settings')) ? 'drop-shadow-sm' : ''}`}>{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Opravech v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;