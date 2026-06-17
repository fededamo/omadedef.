import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, setDoc, doc, updateDoc, deleteDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Project } from '../types';

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${userId}/projects`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : new Date().toISOString()
        } as Project;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/projects`);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addProject = async (projectData: Partial<Project>) => {
    if (!userId) return;
    const newId = crypto.randomUUID();
    const newProject: Partial<Project> = {
      id: newId,
      userId,
      title: projectData.title || '',
      urgency: projectData.urgency || 'medium',
      completed: false,
    };
    if (projectData.description) {
      newProject.description = projectData.description;
    }
    if (projectData.deadline) {
      newProject.deadline = projectData.deadline;
    }
    if (projectData.categoryId) {
      newProject.categoryId = projectData.categoryId;
    }
    try {
      const docRef = doc(db, `users/${userId}/projects`, newId);
      await setDoc(docRef, {
        ...newProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/projects`);
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    if (!userId) return;
    try {
      const docRef = doc(db, `users/${userId}/projects`, id);
      const sanitizedUpdates = Object.fromEntries(
        Object.entries({ ...data, updatedAt: serverTimestamp() })
        .map(([k, v]) => [k, v === undefined ? deleteField() : v])
      );
      await updateDoc(docRef, sanitizedUpdates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/projects/${id}`);
    }
  };

  const deleteProject = async (id: string) => {
    if (!userId) return;
    try {
      const docRef = doc(db, `users/${userId}/projects`, id);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/projects/${id}`);
    }
  };

  return { projects, loading, addProject, updateProject, deleteProject };
}

