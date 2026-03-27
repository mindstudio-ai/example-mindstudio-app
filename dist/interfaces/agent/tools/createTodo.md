# Create Todo

Creates a new to-do item and returns the created record.

## Parameters

- **title** (string, required): The task description. Keep it concise but specific.
- **aiNotes** (string | null, optional): AI-generated feedback or suggestions about the task. Generate these proactively when the task is vague, complex, or would benefit from guidance.

## When to Use

- User describes a new task: "I need to buy milk"
- User explicitly asks to add/create a task
- User lists multiple things they need to do (call once per task)

## AI Notes Guidelines

Generate aiNotes when:
- The task is vague and could be broken into steps ("prepare for presentation" → suggest an outline)
- The task has implicit dependencies or ordering
- You can suggest a useful approach, resource, or time estimate

Skip aiNotes when:
- The task is already clear and specific ("buy milk")
- The user explicitly just wants a quick entry

## Examples

User: "Add buy milk to my list"
→ createTodo({ title: "Buy milk" })

User: "I need to prepare for my quarterly review next week"
→ createTodo({ title: "Prepare for quarterly review", aiNotes: "Start by gathering your key accomplishments and metrics from the past quarter. Draft 3-4 talking points about your contributions and 1-2 growth areas you want to discuss." })

## Returns

{ id, title, completed (always false), aiNotes }
