import { useRef, useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import api from './api';
import styles from './App.module.css';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  aiNotes: string | null;
}

const TODOS_KEY = 'todos';

function useTodos() {
  return useSWR<Todo[]>(TODOS_KEY, () =>
    api.listTodos({}).then((r: any) => r.todos),
  );
}

function useCreateTodo() {
  const [isLoading, setIsLoading] = useState(false);

  const trigger = useCallback(async (title: string) => {
    setIsLoading(true);
    try {
      const result = (await api.createTodo({ title })) as Todo;
      await mutate<Todo[]>(
        TODOS_KEY,
        (prev) => [result, ...(prev ?? [])],
        { revalidate: false },
      );
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { trigger, isLoading };
}

export default function App() {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: todos = [] } = useTodos();
  const { trigger, isLoading } = useCreateTodo();

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || isLoading) return;
    await trigger(trimmed);
    setTitle('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleToggle = async (id: string) => {
    await api.toggleTodo({ id });
    await mutate<Todo[]>(
      TODOS_KEY,
      (prev) =>
        (prev ?? []).map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t,
        ),
      { revalidate: false },
    );
  };

  const handleDelete = async (id: string) => {
    await api.deleteTodo({ id });
    await mutate<Todo[]>(
      TODOS_KEY,
      (prev) => (prev ?? []).filter((t) => t.id !== id),
      { revalidate: false },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Todos</h1>
          <p className={styles.subtitle}>Keep track of what matters</p>
        </div>

        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            className={styles.nameInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            disabled={isLoading}
            autoFocus
          />
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!title.trim() || isLoading}
            data-loading={isLoading || undefined}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {todos.length > 0 ? (
          <div className={styles.listSection}>
            {todos.map((todo, i) => (
              <div key={todo.id}>
                {i > 0 && <div className={styles.divider} />}
                <div className={styles.card}>
                  <div className={styles.cardRow}>
                    <button
                      className={styles.checkbox}
                      data-checked={todo.completed || undefined}
                      onClick={() => handleToggle(todo.id)}
                    >
                      {todo.completed ? '✓' : ''}
                    </button>
                    <div className={styles.cardContent}>
                      <p
                        className={styles.cardTitle}
                        data-completed={todo.completed || undefined}
                      >
                        {todo.title}
                      </p>
                      {todo.aiNotes && (
                        <p className={styles.cardNotes}>{todo.aiNotes}</p>
                      )}
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(todo.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>No todos yet</div>
        )}
      </div>
    </div>
  );
}
