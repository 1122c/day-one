import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

export interface Message {
  id?: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: Date | Timestamp;
  status: 'sent' | 'delivered' | 'read';
}

export async function sendMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
  const messagesRef = collection(db, 'messages');
  const newMessage = {
    ...message,
    createdAt: serverTimestamp(),
    status: 'sent',
  };
  
  const docRef = await addDoc(messagesRef, newMessage);
  return {
    ...newMessage,
    id: docRef.id,
    createdAt: new Date(),
  };
}

export async function getMessages(matchId: string): Promise<Message[]> {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('matchId', '==', matchId),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
  })) as Message[];
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const messageRef = collection(db, 'messages');
  const q = query(messageRef, where('id', '==', messageId));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    await docRef.update({
      status: 'read',
    });
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('receiverId', '==', userId),
    where('status', '==', 'sent')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size;
} 