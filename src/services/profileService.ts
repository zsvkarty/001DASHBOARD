import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface ProfileData {
  displayName: string;
  email: string;
  photoURL: string;
  studyGoals: {
    dailyFlashcards: number;
    weeklyHours: number;
  };
}

export interface UserProfileDocument {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  studyGoals: {
    dailyFlashcards: number;
    weeklyHours: number;
  };
  updatedAt: Date;
}

export const updateUserProfile = async (profileData: Partial<ProfileData>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    // Update Firebase Auth profile if display name or photo URL changed
    if (profileData.displayName !== undefined || profileData.photoURL !== undefined) {
      await updateProfile(user, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL
      });
    }

    // Update Firestore document with all profile data
    const userDocRef = doc(db, 'users', user.uid);
    const updateData: Partial<UserProfileDocument> = {
      uid: user.uid,
      displayName: profileData.displayName || user.displayName || '',
      email: user.email || '',
      photoURL: profileData.photoURL || user.photoURL || '',
      updatedAt: new Date()
    };

    // Add study goals if provided
    if (profileData.studyGoals) {
      updateData.studyGoals = profileData.studyGoals;
    }

    await setDoc(userDocRef, updateData, { merge: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfileDocument | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfileDocument;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

export const createUserProfile = async (user: any): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Only create if doesn't exist
    if (!userDoc.exists()) {
      const profileData: UserProfileDocument = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        studyGoals: {
          dailyFlashcards: 20,
          weeklyHours: 5
        },
        updatedAt: new Date()
      };
      
      await setDoc(userDocRef, profileData);
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};