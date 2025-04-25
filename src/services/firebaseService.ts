import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { UserProfile, Match } from '@/types/user';

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>) {
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);
  return usersSnapshot.docs.map((doc) => doc.data() as UserProfile);
}

export async function saveMatch(match: Match) {
  const matchRef = doc(db, 'matches', match.id);
  await setDoc(matchRef, {
    ...match,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getMatchesForUser(userId: string): Promise<Match[]> {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('userIds', 'array-contains', userId),
    where('status', '==', 'pending')
  );
  const matchesSnapshot = await getDocs(q);
  return matchesSnapshot.docs.map((doc) => doc.data() as Match);
}

export async function updateMatchStatus(
  matchId: string,
  status: 'accepted' | 'rejected'
) {
  const matchRef = doc(db, 'matches', matchId);
  await updateDoc(matchRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getAcceptedMatches(userId: string): Promise<Match[]> {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('userIds', 'array-contains', userId),
    where('status', '==', 'accepted')
  );
  const matchesSnapshot = await getDocs(q);
  return matchesSnapshot.docs.map((doc) => doc.data() as Match);
}

export async function getPotentialMatches(
  userId: string,
  limit: number = 10
): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('id', '!=', userId));
  const usersSnapshot = await getDocs(q);
  return usersSnapshot.docs
    .map((doc) => doc.data() as UserProfile)
    .slice(0, limit);
} 