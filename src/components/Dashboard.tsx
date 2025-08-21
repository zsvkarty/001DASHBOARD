import React, { useState } from 'react';
import { DashboardProps } from '../types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WelcomeSection from './WelcomeSection';
import ProgressCards from './ProgressCards';
import FlashcardModule from './FlashcardModule';
import DigitalTextbookModule from './DigitalTextbookModule';
import AudiobooksSection from './AudiobooksSection';
import UserSettingsPage from './UserSettingsPage';

const Dashboard: React.FC<DashboardProps> = ({ user, progressData }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (section: string, flashcardSetId?: string) => {
    setActiveSection(section);
    if (section === 'flashcards' && flashcardSetId) {
      setSelectedFlashcardSet(flashcardSetId);
    } else if (section !== 'flashcards') {
      setSelectedFlashcardSet(null);
    }
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
    // In a real app, this would handle routing
    console.log(`Navigating to: ${section}${flashcardSetId ? ` with set: ${flashcardSetId}` : ''}`);
  };

  const handleSettingsClick = () => {
    handleNavigation('settings');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={handleNavigation}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-col lg:ml-64">
        {/* Top Bar */}
        <TopBar 
          user={user} 
          onSettingsClick={handleSettingsClick}
          onMobileMenuToggle={handleMobileMenuToggle}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'home' && (
              <>
                <WelcomeSection userName={user.name} />
                <ProgressCards progressData={progressData} onNavigate={handleNavigation} />
              </>
            )}
            
            {activeSection === 'flashcards' && (
              <FlashcardModule preSelectedTopicId={selectedFlashcardSet} />
            )}
            
            {activeSection === 'courses' && (
              <DigitalTextbookModule onNavigate={handleNavigation} />
            )}
            
            {activeSection === 'audiobook' && (
              <AudiobooksSection />
            )}
            
            {activeSection === 'settings' && (
              <UserSettingsPage user={user} onNavigate={handleNavigation} />
            )}
            
            {activeSection !== 'home' && activeSection !== 'flashcards' && activeSection !== 'courses' && activeSection !== 'audiobook' && activeSection !== 'settings' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Sekce v přípravě
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Tato sekce bude brzy dostupná.
                </p>
              </div>
            )}
          </div>
        </main>
        
        {/* Mobile bottom padding to account for potential mobile navigation */}
        <div className="h-16 lg:hidden"></div>
      </div>
    </div>
  );
};

export default Dashboard;