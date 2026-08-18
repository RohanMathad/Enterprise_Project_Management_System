import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, TaskStatus, ChatMessage, User } from '../types/global.types';

/**
 * Fetches all tasks from the 'tasks' collection.
 */
export const fetchTasks = async (): Promise<Task[]> => {
  const querySnapshot = await getDocs(collection(db, 'tasks'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Task[];
};

/**
 * Subscribes to tasks in real-time.
 */
export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Task[];
    callback(tasks);
  }, (error) => {
    console.error("Error subscribing to tasks:", error);
  });
};

/**
 * Subscribes to real-time users list.
 */
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, 'users')); // We can order by firstName if we want, but users might not have a createdAt.

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    callback(users);
  }, (error) => {
    console.error("Error subscribing to users:", error);
  });
};

/**
 * Creates a new task document in the 'tasks' collection.
 */
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const data = {
    ...taskData,
    createdAt: new Date().toISOString()
  };
  
  const docRef = await addDoc(collection(db, 'tasks'), data);
  
  return {
    id: docRef.id,
    ...data
  } as Task;
};

/**
 * Updates a task's status.
 */
export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, { status });
};

/**
 * Updates task details (title, description, priority, dueDate).
 */
export const updateTaskDetails = async (taskId: string, data: Partial<Task>): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, data);
};

/**
 * Deletes a task document.
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};

/**
 * Subscribes to real-time chat messages for a specific channel.
 * Uses onSnapshot for live updates.
 */
export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

/**
 * Subscribes to real-time chat messages for a specific channel.
 * Uses onSnapshot for live updates.
 */
export const subscribeToMessages = (
  channelId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, 'channels', channelId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  }, (error) => {
    console.error("Error subscribing to messages:", error);
  });
};

/**
 * Sends a new chat message to a specific channel.
 */
export const sendMessage = async (
  channelId: string, 
  messageData: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<void> => {
  const messagesRef = collection(db, 'channels', channelId, 'messages');
  await addDoc(messagesRef, {
    ...messageData,
    timestamp: new Date().toISOString()
  });
};
