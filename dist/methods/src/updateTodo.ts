import { Todos } from './tables/todos';

export interface UpdateTodoInput {
  id: string;
  title?: string;
  aiNotes?: string | null;
}

export interface UpdateTodoOutput {
  success: boolean;
}

export async function updateTodo(
  input: UpdateTodoInput,
): Promise<UpdateTodoOutput> {
  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.aiNotes !== undefined) updates.aiNotes = input.aiNotes;

  await Todos.update(input.id, updates);
  return { success: true };
}
