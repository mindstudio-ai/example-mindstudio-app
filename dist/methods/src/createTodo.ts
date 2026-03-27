import { Todos } from './tables/todos';

export interface CreateTodoInput {
  title: string;
  aiNotes?: string | null;
}

export interface CreateTodoOutput {
  id: string;
  title: string;
  completed: boolean;
  aiNotes: string | null;
}

export async function createTodo(
  input: CreateTodoInput,
): Promise<CreateTodoOutput> {
  const todo = await Todos.push({
    title: input.title,
    completed: false,
    aiNotes: input.aiNotes ?? null,
  });

  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    aiNotes: todo.aiNotes,
  };
}
