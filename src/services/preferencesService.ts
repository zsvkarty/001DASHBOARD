import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserPreferences } from '../components/settings/PreferencesSection';

export const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'cs',
  notifications: {
    studyReminders: true,
    achievementAlerts: true,
    weeklyProgress: true
  },
  studySettings: {
    autoPlayAudio: false,
    showHints: true,
    cardAnimations: true
  }
};

export const getUserPreferences = async (uid: string): Promise<UserPreferences> => {
  try {
    const prefsDocRef = doc(db, 'userPreferences', uid);
    const prefsDoc = await getDoc(prefsDocRef);
    
    if (prefsDoc.exists()) {
      const data = prefsDoc.data();
      // Merge with defaults to ensure all properties exist
      return {
        ...defaultPreferences,
        ...data,
        notifications: {
          ...defaultPreferences.notifications,
          ...(data.notifications || {})
        },
        studySettings: {
          ...defaultPreferences.studySettings,
          ...(data.studySettings || {})
        }
      };
    }
    
    return defaultPreferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return defaultPreferences;
  }
};

export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    const prefsDocRef = doc(db, 'userPreferences', user.uid);
    const updateData = {
      ...preferences,
      updatedAt: new Date()
    };

    await setDoc(prefsDocRef, updateData, { merge: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw new Error('Failed to update preferences. Please try again.');
  }
};