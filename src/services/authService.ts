import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from './firebaseService';
import { UserProfile } from '@/types/user';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  profileData?: Partial<UserProfile>;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}

// ============================================================================
// USER REGISTRATION
// ============================================================================

export async function signUpUser(signUpData: SignUpData): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  try {
    console.log('🚀 Starting user registration...');
    
    // Create Firebase auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      signUpData.email,
      signUpData.password
    );
    
    const user = userCredential.user;
    console.log('✅ Firebase user created:', user.uid);

    // Update display name
    await updateProfile(user, {
      displayName: signUpData.name
    });
    console.log('✅ Display name updated');

    // Create user profile in Firestore
    const profileData: Partial<UserProfile> = {
      email: signUpData.email,
      name: signUpData.name,
      ...signUpData.profileData
    };

    await createUserProfile(user.uid, profileData);
    console.log('✅ User profile created in Firestore');

    // Fetch the created profile
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      throw new Error('Failed to retrieve created profile');
    }

    console.log('🎉 User registration completed successfully!');
    return { user, profile };

  } catch (error: any) {
    console.error('❌ User registration failed:', error);
    
    // Handle specific Firebase auth errors
    let authError: AuthError;
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        authError = {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists. Please sign in instead.'
        };
        break;
      case 'auth/invalid-email':
        authError = {
          code: 'INVALID_EMAIL',
          message: 'Please enter a valid email address.'
        };
        break;
      case 'auth/weak-password':
        authError = {
          code: 'WEAK_PASSWORD',
          message: 'Password should be at least 6 characters long.'
        };
        break;
      case 'auth/operation-not-allowed':
        authError = {
          code: 'SIGNUP_DISABLED',
          message: 'Email/password sign up is not enabled. Please contact support.'
        };
        break;
      default:
        authError = {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred. Please try again.'
        };
    }
    
    throw authError;
  }
}

// ============================================================================
// USER SIGN IN
// ============================================================================

export async function signInUser(signInData: SignInData): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  try {
    console.log('🔐 Starting user sign in...');
    
    // Sign in with Firebase
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      signInData.email,
      signInData.password
    );
    
    const user = userCredential.user;
    console.log('✅ User signed in successfully:', user.uid);

    // Fetch user profile from Firestore
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      throw new Error('User profile not found. Please contact support.');
    }

    console.log('✅ User profile retrieved');
    return { user, profile };

  } catch (error: any) {
    console.error('❌ User sign in failed:', error);
    
    // Handle specific Firebase auth errors
    let authError: AuthError;
    
    switch (error.code) {
      case 'auth/user-not-found':
        authError = {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email address. Please sign up instead.'
        };
        break;
      case 'auth/wrong-password':
        authError = {
          code: 'WRONG_PASSWORD',
          message: 'Incorrect password. Please try again.'
        };
        break;
      case 'auth/invalid-email':
        authError = {
          code: 'INVALID_EMAIL',
          message: 'Please enter a valid email address.'
        };
        break;
      case 'auth/user-disabled':
        authError = {
          code: 'USER_DISABLED',
          message: 'This account has been disabled. Please contact support.'
        };
        break;
      case 'auth/too-many-requests':
        authError = {
          code: 'TOO_MANY_ATTEMPTS',
          message: 'Too many failed attempts. Please try again later.'
        };
        break;
      default:
        authError = {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred. Please try again.'
        };
    }
    
    throw authError;
  }
}

// ============================================================================
// USER SIGN OUT
// ============================================================================

export async function signOutUser(): Promise<void> {
  try {
    console.log('🚪 Starting user sign out...');
    
    await signOut(auth);
    console.log('✅ User signed out successfully');
    
  } catch (error: any) {
    console.error('❌ User sign out failed:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export async function resetPassword(email: string): Promise<void> {
  try {
    console.log('🔑 Starting password reset...');
    
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
    
  } catch (error: any) {
    console.error('❌ Password reset failed:', error);
    
    let authError: AuthError;
    
    switch (error.code) {
      case 'auth/user-not-found':
        authError = {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email address.'
        };
        break;
      case 'auth/invalid-email':
        authError = {
          code: 'INVALID_EMAIL',
          message: 'Please enter a valid email address.'
        };
        break;
      case 'auth/too-many-requests':
        authError = {
          code: 'TOO_MANY_ATTEMPTS',
          message: 'Too many reset attempts. Please try again later.'
        };
        break;
      default:
        authError = {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred. Please try again.'
        };
    }
    
    throw authError;
  }
}

// ============================================================================
// PROFILE UPDATE
// ============================================================================

export async function updateUserDisplayName(user: FirebaseUser, displayName: string): Promise<void> {
  try {
    console.log('✏️ Updating user display name...');
    
    await updateProfile(user, { displayName });
    console.log('✅ Display name updated successfully');
    
  } catch (error: any) {
    console.error('❌ Failed to update display name:', error);
    throw new Error('Failed to update display name. Please try again.');
  }
}

// ============================================================================
// AUTH STATE UTILITIES
// ============================================================================

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export function isUserSignedIn(): boolean {
  return !!auth.currentUser;
}

export function getUserId(): string | null {
  return auth.currentUser?.uid || null;
}

export function getUserEmail(): string | null {
  return auth.currentUser?.email || null;
}

export function getUserDisplayName(): string | null {
  return auth.currentUser?.displayName || null;
}

// ============================================================================
// ERROR HELPERS
// ============================================================================

export function isAuthError(error: any): error is AuthError {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
}

export function getAuthErrorMessage(error: any): string {
  if (isAuthError(error)) {
    return error.message;
  }
  
  if (error && typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export function getAuthErrorCode(error: any): string {
  if (isAuthError(error)) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
}
