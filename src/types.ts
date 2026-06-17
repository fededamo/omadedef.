export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string; // ISO String
  telegramOn?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  whatsappOn?: boolean;
  whatsappPhone?: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  categoryId?: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string; // ISO string
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  categoryId: string;
  projectId?: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadline: string; // ISO string
  completed: boolean;
  completedAt?: string;
  parentId?: string; // For subtasks
  recurrence?: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'none'; // For recurring tasks
  nextRecurrenceCreated?: boolean;
  reminders?: number[]; // minutes before deadline
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  categoryId?: string;
  reminders?: number[]; // minutes before start to remind
  createdAt: string;
  updatedAt: string;
}
