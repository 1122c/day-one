import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  type: 'match' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date | Timestamp;
  data?: {
    matchId?: string;
    messageId?: string;
  };
}

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
  const notificationsRef = collection(db, 'notifications');
  const newNotification = {
    ...notification,
    createdAt: serverTimestamp(),
    read: false,
  };
  
  const docRef = await addDoc(notificationsRef, newNotification);
  return {
    ...newNotification,
    id: docRef.id,
    createdAt: new Date(),
  };
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
  })) as Notification[];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );
  
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });
  
  await batch.commit();
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size;
} 