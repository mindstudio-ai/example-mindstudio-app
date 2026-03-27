# List Todos

Retrieves all to-do items, newest first. Optionally filters by completion status.

## Parameters

- **completed** (boolean, optional): If provided, filters to only completed (true) or pending (false) items. Omit to return all.

## When to Use

- User asks to see their tasks, list, or agenda
- User asks "what do I have left to do" → use completed: false
- User asks "what have I finished" → use completed: true
- Before performing an update/delete/toggle when you need to find a task's ID

## Returns

{ todos: Array<{ id, title, completed, aiNotes, created_at, updated_at }> }

## Notes

- Always use this to find a task's ID before updating, deleting, or toggling
- Results are sorted newest first
