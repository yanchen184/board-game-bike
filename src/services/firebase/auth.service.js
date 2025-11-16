import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Sign in anonymously for guest users
 * @returns {Promise<UserCredential>}
 */
export const signInAnonymous = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('Anonymous sign in successful:', userCredential.user.uid);
    return userCredential;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

/**
 * Create new user with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<UserCredential>}
 */
export const createUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential;
  } catch (error) {
    console.error('User creation error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get current user
 * @returns {User|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback
 * @returns {Unsubscribe}
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user ID or create anonymous user
 * @returns {Promise<string>}
 */
export const ensureAuth = async () => {
  const user = getCurrentUser();

  if (user) {
    return user.uid;
  }

  // Create anonymous user if not authenticated
  const userCredential = await signInAnonymous();
  return userCredential.user.uid;
};

export default {
  signInAnonymous,
  signInWithEmail,
  createUser,
  logout,
  getCurrentUser,
  onAuthChange,
  ensureAuth,
};
