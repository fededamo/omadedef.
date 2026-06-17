import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, setDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, deleteField } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Task, Category } from '../types';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    const qTasks = query(collection(db, `users/${userId}/tasks`));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
           ...d,
           createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString(),
           updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : new Date().toISOString()
        } as Task;
      });
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/tasks`);
      setLoading(false);
    });

    const qCats = query(collection(db, `users/${userId}/categories`));
    const unsubscribeCats = onSnapshot(qCats, (snapshot) => {
      const catsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : new Date().toISOString()
      } as Category));
      setCategories(catsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/categories`));

    return () => {
      unsubscribeTasks();
      unsubscribeCats();
    };
  }, [userId]);

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    const newId = crypto.randomUUID();
    const task = Object.fromEntries(Object.entries({
      ...taskData,
      id: newId,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).filter(([_, v]) => v !== undefined));

    try {
      await setDoc(doc(db, `users/${userId}/tasks`, newId), task);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/tasks`);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!userId) return;
    try {
      const sanitizedUpdates = Object.fromEntries(
        Object.entries({ ...updates, updatedAt: serverTimestamp() })
        .map(([k, v]) => [k, v === undefined ? deleteField() : v])
      );
      await updateDoc(doc(db, `users/${userId}/tasks`, id), sanitizedUpdates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/tasks`, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/tasks/${id}`);
    }
  };

  const addCategory = async (name: string, color: string) => {
    if (!userId) return null;
    const newId = crypto.randomUUID();
    try {
      await setDoc(doc(db, `users/${userId}/categories`, newId), {
        id: newId,
        userId,
        name,
        color,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newId;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/categories`);
      return null;
    }
  };
  
  const deleteCategory = async (id: string) => {
    if(!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/categories`, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/categories/${id}`);
    }
  };

  const deleteTasksBatch = async (ids: string[]) => {
    if (!userId || ids.length === 0) return;
    try {
      // Chunk into batches of 500
      for (let i = 0; i < ids.length; i += 500) {
        const batch = writeBatch(db);
        const chunk = ids.slice(i, i + 500);
        for (const id of chunk) {
          batch.delete(doc(db, `users/${userId}/tasks`, id));
        }
        await batch.commit();
      }
    } catch(e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/tasks`);
    }
  };

  return { tasks, categories, loading, addTask, updateTask, deleteTask, deleteTasksBatch, addCategory, deleteCategory };
}
