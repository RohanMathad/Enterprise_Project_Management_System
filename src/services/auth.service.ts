import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Role } from '../types/global.types';

/**
 * Creates a new user in Firebase Auth and stores their profile in Firestore.
 */
export const registerUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  role: Role = 'VIEWER'
): Promise<User> => {
  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // 2. Prepare the user profile data
  const userData: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || email,
    firstName,
    lastName,
    role,
    avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
  };

  // 3. Save the profile to the 'users' collection in Firestore
  await setDoc(doc(db, 'users', firebaseUser.uid), userData);

  return userData;
};

/**
 * Signs in the user and fetches their complete profile from Firestore.
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  // 1. Sign in with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // 2. Fetch the user profile from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  
  if (!userDoc.exists()) {
    throw new Error('User profile not found in database.');
  }

  return userDoc.data() as User;
};

/**
 * Signs out the current user.
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Subscribes to Firebase auth state changes.
 * Used to keep the session persistent and dispatch Redux actions.
 */
export const onAuthStateListener = (
  callback: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // User is logged in, fetch their profile
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const token = await firebaseUser.getIdToken();
        
        if (userDoc.exists()) {
          callback(userDoc.data() as User, token);
        } else {
          callback(null, null);
        }
      } catch (error) {
        console.error('Error fetching user profile during auth state change:', error);
        callback(null, null);
      }
    } else {
      // User is logged out
      callback(null, null);
    }
  });
};
