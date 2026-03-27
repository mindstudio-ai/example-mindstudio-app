---
name: Todo List Agent
description: A to-do list manager with a web UI and a conversational agent interface.
version: 1
---

# Todo List Agent

A to-do list app that lets users manage tasks through both a web interface and a conversational AI agent.

## Data

One table: **todos**. Fields: title (string), completed (boolean), aiNotes (string, nullable). System columns (id, timestamps) are automatic.

The aiNotes field stores AI-generated feedback — task breakdowns, suggested approaches, dependency notes. The agent populates this proactively when creating or reviewing tasks.

## Methods

CRUD operations: create, list, update, delete, and toggle completion. All methods are pure data operations. The agent interface provides the conversational and analytical layer on top.

## Interfaces

### Web

A dark-themed React app for managing todos. List view with inline toggle, add form, delete buttons, and AI notes display.

### Agent

A conversational interface powered by an LLM. The agent calls the CRUD methods as tools and generates AI notes to help users think through their tasks. The system prompt guides it to be concise, proactive, and helpful.
