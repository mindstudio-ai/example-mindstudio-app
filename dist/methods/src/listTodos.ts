import { Todos, Todo } from './tables/todos';

export interface ListTodosInput {
  completed?: boolean;
}

export interface ListTodosOutput {
  todos: Todo[];
}

export async function listTodos(
  input?: ListTodosInput,
): Promise<ListTodosOutput> {
  let todos = await Todos.sortBy((t) => t.created_at).reverse();

  if (input?.completed !== undefined) {
    todos = todos.filter((t) => t.completed === input.completed);
  }

  return { todos };
}
