import { deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

export const deleteUserAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    // Step 1: Reauthenticate with Google
    await reauthenticateWithPopup(user, googleProvider);

    // Step 2: Delete user data from Firestore
    await deleteUserData(user.uid);

    // Step 3: Delete the Firebase Auth user
    await deleteUser(user);
  } catch (error: any) {
    console.error('Error deleting account:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Pro smazání účtu je potřeba se znovu přihlásit. Zkuste to znovu.');
    } else if (error.code === 'auth/user-cancelled') {
      throw new Error('Reauthentizace byla zrušena.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup byl zablokován. Povolte popupy a zkuste to znovu.');
    } else {
      throw new Error('Nepodařilo se smazat účet. Zkuste to znovu.');
    }
  }
};

const deleteUserData = async (uid: string): Promise<void> => {
  const batch = writeBatch(db);

  try {
    // Delete user profile
    const userDocRef = doc(db, 'users', uid);
    batch.delete(userDocRef);

    // Delete user preferences
    const prefsDocRef = doc(db, 'userPreferences', uid);
    batch.delete(prefsDocRef);

    // Delete user progress data (if exists)
    const progressDocRef = doc(db, 'userProgress', uid);
    batch.delete(progressDocRef);

    // Delete user statistics (if exists)
    const statsDocRef = doc(db, 'userStats', uid);
    batch.delete(statsDocRef);

    // Delete user's flashcard progress
    const flashcardProgressQuery = query(
      collection(db, 'flashcardProgress'),
      where('userId', '==', uid)
    );
    const flashcardProgressSnapshot = await getDocs(flashcardProgressQuery);
    flashcardProgressSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's textbook progress
    const textbookProgressQuery = query(
      collection(db, 'textbookProgress'),
      where('userId', '==', uid)
    );
    const textbookProgressSnapshot = await getDocs(textbookProgressQuery);
    textbookProgressSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's audiobook progress
    const audiobookProgressQuery = query(
      collection(db, 'audiobookProgress'),
      where('userId', '==', uid)
    );
    const audiobookProgressSnapshot = await getDocs(audiobookProgressQuery);
    audiobookProgressSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's gamification data
    const gamificationDocRef = doc(db, 'gamification', uid);
    batch.delete(gamificationDocRef);

    // Commit all deletions
    await batch.commit();
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('Nepodařilo se smazat uživatelská data');
  }
};