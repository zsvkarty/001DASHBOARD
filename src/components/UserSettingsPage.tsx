import React, { useState, useEffect } from 'react';
import { User } from '../types';
import SettingsCard from './settings/SettingsCard';
import ProfileSection from './settings/ProfileSection';
import PreferencesSection, { UserPreferences } from './settings/PreferencesSection';
import SecuritySection from './settings/SecuritySection';
import StatsSection, { UserStats } from './settings/StatsSection';
import SettingsErrorBoundary from './settings/SettingsErrorBoundary';
import { updateUserProfile, ProfileData } from '../services/profileService';
import { getUserPreferences, updateUserPreferences, defaultPreferences } from '../services/preferencesService';
import { deleteUserAccount } from '../services/accountService';
import { getCachedUserStatistics, generateMockStats } from '../services/statisticsService';
import { useAuth } from '../AuthContext';

interface UserSettingsPageProps {
  user: User;
  onNavigate?: (section: string) => void;
}

const UserSettingsPage: React.FC<UserSettingsPageProps> = ({ user, onNavigate }) => {
  const { currentUser } = useAuth();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalStudyTime: 0,
    completedModules: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalXP: 0,
    badgesEarned: 0,
    averageSessionTime: 0,
    studyHistory: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load user preferences and stats on component mount
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        try {
          // Load preferences
          const userPrefs = await getUserPreferences(currentUser.uid);
          setPreferences(userPrefs);
        } catch (error) {
          console.error('Error loading preferences:', error);
        } finally {
          setPreferencesLoading(false);
        }

        try {
          // Try to load real stats, fallback to mock data
          let userStats: UserStats;
          try {
            userStats = await getCachedUserStatistics(currentUser.uid);
          } catch (error) {
            console.warn('Failed to load real stats, using mock data:', error);
            userStats = generateMockStats();
          }
          setStats(userStats);
        } catch (error) {
          console.error('Error loading stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    loadData();
  }, [currentUser]);

  const handleProfileUpdate = async (data: Partial<ProfileData>) => {
    try {
      await updateUserProfile(data);
      setNotification({ type: 'success', message: 'Profil byl úspěšně aktualizován' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Nepodařilo se aktualizovat profil' 
      });
      setTimeout(() => setNotification(null), 5000);
      throw error; // Re-throw to let ProfileSection handle it
    }
  };

  const handlePreferencesUpdate = async (data: Partial<UserPreferences>) => {
    try {
      await updateUserPreferences(data);
      // Update local state immediately for better UX
      setPreferences(prev => ({
        ...prev,
        ...data,
        notifications: {
          ...prev.notifications,
          ...(data.notifications || {})
        },
        studySettings: {
          ...prev.studySettings,
          ...(data.studySettings || {})
        }
      }));
      setNotification({ type: 'success', message: 'Předvolby byly úspěšně aktualizovány' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Preferences update error:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Nepodařilo se aktualizovat předvolby' 
      });
      setTimeout(() => setNotification(null), 5000);
      throw error;
    }
  };

  const handleAccountDelete = async () => {
    try {
      await deleteUserAccount();
      // User will be automatically logged out and redirected to login
      setNotification({ type: 'success', message: 'Účet byl úspěšně smazán' });
    } catch (error) {
      console.error('Account deletion error:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Nepodařilo se smazat účet' 
      });
      setTimeout(() => setNotification(null), 5000);
      throw error; // Re-throw to let SecuritySection handle it
    }
  };
  return (
    <SettingsErrorBoundary>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nastavení
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Spravujte svůj profil, předvolby a nastavení účtu
        </p>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg border ${
          notification.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Section */}
        <SettingsCard
          title="Profil"
          description="Upravte své osobní údaje a studijní cíle"
          icon="👤"
        >
          <ProfileSection user={user} onProfileUpdate={handleProfileUpdate} />
        </SettingsCard>

        {/* Preferences Section */}
        <SettingsCard
          title="Předvolby"
          description="Přizpůsobte si aplikaci podle svých potřeb"
          icon="⚙️"
        >
          {preferencesLoading ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              Načítám předvolby...
            </div>
          ) : (
            <PreferencesSection 
              preferences={preferences} 
              onPreferencesUpdate={handlePreferencesUpdate} 
            />
          )}
        </SettingsCard>

        {/* Security Section */}
        <SettingsCard
          title="Zabezpečení"
          description="Spravujte zabezpečení svého účtu"
          icon="🔒"
        >
          <SecuritySection user={user} onAccountDelete={handleAccountDelete} />
        </SettingsCard>

        {/* Statistics Section */}
        <SettingsCard
          title="Statistiky"
          description="Sledujte svůj pokrok a úspěchy"
          icon="📊"
        >
          <StatsSection 
            stats={stats} 
            isLoading={statsLoading}
            onRetry={async () => {
              if (currentUser) {
                setStatsLoading(true);
                try {
                  const userStats = await getCachedUserStatistics(currentUser.uid);
                  setStats(userStats);
                } catch (error) {
                  console.error('Error reloading stats:', error);
                  const mockStats = generateMockStats();
                  setStats(mockStats);
                } finally {
                  setStatsLoading(false);
                }
              }
            }}
          />
        </SettingsCard>
      </div>
    </div>
    </SettingsErrorBoundary>
  );
};

export default UserSettingsPage;