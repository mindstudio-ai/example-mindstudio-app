# Delete Todo

Permanently removes a to-do item by ID.

## Parameters

- **id** (string, required): The todo's ID. Get this from list-todos first.

## When to Use

- User explicitly wants to remove/delete a task
- User says "get rid of" or "remove" a task
- Do NOT use for marking tasks complete — use toggle-todo instead

## Workflow

1. If you don't know the exact task, call list-todos to find it
2. If multiple tasks match the user's description, ask which one
3. Call delete-todo with the ID

## Returns

{ success: boolean }
