import { Todos } from './tables/todos';

export interface ToggleTodoInput {
  id: string;
}

export interface ToggleTodoOutput {
  id: string;
  completed: boolean;
}

export async function toggleTodo(
  input: ToggleTodoInput,
): Promise<ToggleTodoOutput> {
  const todo = await Todos.get(input.id);
  if (!todo) {
    throw new Error('Todo not found');
  }

  await Todos.update(input.id, { completed: !todo.completed });
  return { id: input.id, completed: !todo.completed };
}
