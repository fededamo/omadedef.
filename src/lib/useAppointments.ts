import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, orderBy, deleteField } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Appointment } from '../types';

export function useAppointments(userId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAppointments([]);
      setLoadingAppts(false);
      return;
    }

    setLoadingAppts(true);

    const apptsRef = collection(db, `users/${userId}/appointments`);
    const qAppts = query(apptsRef, orderBy('startTime', 'asc'));
    
    const unsubAppts = onSnapshot(qAppts, (snapshot) => {
      const appts: Appointment[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        appts.push({
           ...d,
           createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString(),
           updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : new Date().toISOString()
        } as Appointment);
      });
      setAppointments(appts);
      setLoadingAppts(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/appointments`));

    return () => {
      unsubAppts();
    };
  }, [userId]);

  const addAppointment = async (apptData: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    const appt = Object.fromEntries(Object.entries({
      ...apptData,
      id,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).filter(([_, v]) => v !== undefined));
    try {
      await setDoc(doc(db, `users/${userId}/appointments`, id), appt);
    } catch(e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/appointments/${id}`);
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!userId) return;
    try {
      const apptRef = doc(db, `users/${userId}/appointments`, id);
      const sanitizedUpdates = Object.fromEntries(
        Object.entries({ ...updates, updatedAt: serverTimestamp() })
        .map(([k, v]) => [k, v === undefined ? deleteField() : v])
      );
      await setDoc(apptRef, sanitizedUpdates, { merge: true });
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/appointments/${id}`);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/appointments`, id));
    } catch(e){
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/appointments/${id}`);
    }
  };

  return { appointments, loadingAppts, addAppointment, updateAppointment, deleteAppointment };
}
