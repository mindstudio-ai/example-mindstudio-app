# Update Todo

Updates one or more fields on an existing to-do item. Only the provided fields are changed.

## Parameters

- **id** (string, required): The todo's ID. Get this from list-todos first.
- **title** (string, optional): New title text.
- **aiNotes** (string | null, optional): New AI notes. Set to null to clear existing notes.

## When to Use

- User wants to rename a task
- User asks for advice/feedback on a task (generate aiNotes and attach them)
- User asks you to review their task list (update aiNotes on tasks that could use guidance)
- Do NOT use this to mark a task complete — use toggle-todo instead

## Workflow

1. If you don't already know the task's ID, call list-todos first
2. Call update-todo with the ID and only the fields that need changing

## Returns

{ success: boolean }
