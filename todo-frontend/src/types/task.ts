export interface Task {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  category: string;
  tags: string[] | null;
  priority: number;
  userId: string;
  createdAt: string; // ISO Date string from backend
}
