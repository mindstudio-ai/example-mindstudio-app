import { Todos } from './tables/todos';

export interface DeleteTodoInput {
  id: string;
}

export interface DeleteTodoOutput {
  success: boolean;
}

export async function deleteTodo(
  input: DeleteTodoInput,
): Promise<DeleteTodoOutput> {
  await Todos.remove(input.id);
  return { success: true };
}
