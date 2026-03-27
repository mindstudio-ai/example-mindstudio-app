# Toggle Todo

Flips the completed status of a to-do item — pending becomes completed, completed becomes pending.

## Parameters

- **id** (string, required): The todo's ID. Get this from list-todos first.

## When to Use

- User says they finished/completed/done with a task
- User wants to un-complete a task ("actually I didn't finish that")
- User says "check off" or "mark done"

## Workflow

1. If you don't know the exact task, call list-todos to find it
2. Call toggle-todo with the ID

## Returns

{ id, completed (the new value) }
