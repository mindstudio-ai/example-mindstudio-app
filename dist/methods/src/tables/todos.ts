import { db } from '@mindstudio-ai/agent';

export interface Todo {
  title: string;
  completed: boolean;
  aiNotes: string | null;
}

export const Todos = db.defineTable<Todo>('todos');
