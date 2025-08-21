import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { useDarkMode, ThemeMode } from '../../contexts/DarkModeContext';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'cs' | 'en';
  notifications: {
    studyReminders: boolean;
    achievementAlerts: boolean;
    weeklyProgress: boolean;
  };
  studySettings: {
    autoPlayAudio: boolean;
    showHints: boolean;
    cardAnimations: boolean;
  };
}

interface PreferencesSectionProps {
  preferences: UserPreferences;
  onPreferencesUpdate: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  preferences,
  onPreferencesUpdate
}) => {
  const { themeMode, setThemeMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Sync theme mode with preferences
  useEffect(() => {
    if (preferences.theme !== themeMode) {
      setThemeMode(preferences.theme as ThemeMode);
    }
  }, [preferences.theme, themeMode, setThemeMode]);

  const handlePreferenceChange = async (
    key: keyof UserPreferences,
    value: any,
    subKey?: string
  ) => {
    setIsLoading(`${key}${subKey ? `.${subKey}` : ''}`);
    
    try {
      let updateData: Partial<UserPreferences>;
      
      if (subKey && typeof preferences[key] === 'object') {
        updateData = {
          [key]: {
            ...(preferences[key] as any),
            [subKey]: value
          }
        } as Partial<UserPreferences>;
      } else {
        updateData = { [key]: value } as Partial<UserPreferences>;
      }

      // Apply theme change immediately for better UX
      if (key === 'theme') {
        setThemeMode(value as ThemeMode);
      }
      
      await onPreferencesUpdate(updateData);
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert theme change if save failed
      if (key === 'theme') {
        setThemeMode(preferences.theme as ThemeMode);
      }
      // The error will be handled by the parent component
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Vzhled
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Barevný režim
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Světlý', icon: '☀️' },
                { value: 'dark', label: 'Tmavý', icon: '🌙' },
                { value: 'system', label: 'Systém', icon: '💻' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('theme', option.value)}
                  disabled={isLoading === 'theme'}
                  className={`
                    p-3 rounded-lg border text-sm font-medium transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                    ${themeMode === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }
                    ${isLoading === 'theme' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Jazyk
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jazyk aplikace
          </label>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            disabled={isLoading === 'language'}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors duration-200
              border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              ${isLoading === 'language' ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
            `}
          >
            <option value="cs">Čeština</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Oznámení
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            id="studyReminders"
            label="Připomínky studia"
            description="Dostávejte denní připomínky k učení"
            checked={preferences.notifications.studyReminders}
            onChange={(checked) => handlePreferenceChange('notifications', checked, 'studyReminders')}
            disabled={isLoading === 'notifications.studyReminders'}
          />
          
          <ToggleSwitch
            id="achievementAlerts"
            label="Oznámení o úspěších"
            description="Dostávejte oznámení o nových odznacích a milnících"
            checked={preferences.notifications.achievementAlerts}
            onChange={(checked) => handlePreferenceChange('notifications', checked, 'achievementAlerts')}
            disabled={isLoading === 'notifications.achievementAlerts'}
          />
          
          <ToggleSwitch
            id="weeklyProgress"
            label="Týdenní přehled"
            description="Dostávejte týdenní souhrn vašeho pokroku"
            checked={preferences.notifications.weeklyProgress}
            onChange={(checked) => handlePreferenceChange('notifications', checked, 'weeklyProgress')}
            disabled={isLoading === 'notifications.weeklyProgress'}
          />
        </div>
      </div>

      {/* Study Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Nastavení studia
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            id="autoPlayAudio"
            label="Automatické přehrávání audia"
            description="Automaticky přehrávat audio při otevření audioknih"
            checked={preferences.studySettings.autoPlayAudio}
            onChange={(checked) => handlePreferenceChange('studySettings', checked, 'autoPlayAudio')}
            disabled={isLoading === 'studySettings.autoPlayAudio'}
          />
          
          <ToggleSwitch
            id="showHints"
            label="Zobrazovat nápovědy"
            description="Zobrazovat nápovědy během studia"
            checked={preferences.studySettings.showHints}
            onChange={(checked) => handlePreferenceChange('studySettings', checked, 'showHints')}
            disabled={isLoading === 'studySettings.showHints'}
          />
          
          <ToggleSwitch
            id="cardAnimations"
            label="Animace karet"
            description="Povolit animace při otáčení flashkaret"
            checked={preferences.studySettings.cardAnimations}
            onChange={(checked) => handlePreferenceChange('studySettings', checked, 'cardAnimations')}
            disabled={isLoading === 'studySettings.cardAnimations'}
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;