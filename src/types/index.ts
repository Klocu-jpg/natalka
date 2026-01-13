export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  category?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'date' | 'anniversary' | 'other';
}

export interface DateIdea {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}
