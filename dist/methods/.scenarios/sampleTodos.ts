import { Todos } from '../src/tables/todos';

export async function sampleTodos() {
  await Todos.push([
    {
      title: 'Buy groceries',
      completed: false,
      aiNotes:
        'Consider making a specific list: milk, eggs, bread, etc. Grouping by store aisle saves time.',
    },
    {
      title: 'Read "Designing Data-Intensive Applications"',
      completed: false,
      aiNotes:
        'This is a dense book — try one chapter per week. Start with Chapter 1 (Reliable, Scalable, Maintainable Applications) for a solid foundation.',
    },
    {
      title: 'Fix the leaky faucet',
      completed: true,
      aiNotes:
        'Completed. If it starts leaking again, the washer may need replacing — a 10-minute fix with a $2 part.',
    },
    {
      title: 'Write blog post about MindStudio agents',
      completed: false,
      aiNotes:
        'Outline first: intro (what agents are), example use case, code walkthrough, conclusion. Aim for 800-1200 words.',
    },
    {
      title: 'Schedule dentist appointment',
      completed: false,
      aiNotes: null,
    },
  ]);
}
