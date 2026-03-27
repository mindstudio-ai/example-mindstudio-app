import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ThreadSummary,
  Message,
  AbortablePromise,
  SendMessageResult,
} from '@mindstudio-ai/interface';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { useStickToBottom } from 'use-stick-to-bottom';
import TextareaAutosize from 'react-textarea-autosize';
import { chat } from './api';
import Nav from './Nav';
import styles from './Chat.module.css';

const streamdownPlugins = { code };

const SUGGESTED_PROMPTS = [
  "What's on my list?",
  'Add a task for tomorrow',
  'Help me plan my week',
  'What should I focus on?',
];

function toolDisplayName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Chat() {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTools, setActiveTools] = useState<
    Map<string, { name: string; done: boolean }>
  >(new Map());

  const responseRef = useRef<AbortablePromise<SendMessageResult> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingTextRef = useRef(streamingText);
  streamingTextRef.current = streamingText;

  const { scrollRef, contentRef } = useStickToBottom();

  // Load threads on mount
  useEffect(() => {
    chat.listThreads().then((page) => setThreads(page.threads));
  }, []);

  const selectThread = useCallback(async (threadId: string) => {
    setActiveThreadId(threadId);
    setMessages([]);
    setStreamingText('');
    setIsThinking(false);
    const thread = await chat.getThread(threadId);
    setMessages(thread.messages);
  }, []);

  const createThread = useCallback(async () => {
    const thread = await chat.createThread();
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setMessages([]);
    setStreamingText('');
    setIsThinking(false);
    inputRef.current?.focus();
  }, []);

  const deleteThread = useCallback(
    async (e: React.MouseEvent, threadId: string) => {
      e.stopPropagation();
      await chat.deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
    },
    [activeThreadId],
  );

  const doSend = useCallback(
    async (content: string, threadIdOverride?: string) => {
      const trimmed = content.trim();
      const threadId = threadIdOverride ?? activeThreadId;
      if (!trimmed || !threadId || isStreaming) return;

      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      setStreamingText('');
      setActiveTools(new Map());
      setIsStreaming(true);
      setIsThinking(true);

      const response = chat.sendMessage(threadId, trimmed, {
        onText: (delta) => {
          setIsThinking(false);
          setStreamingText((prev) => prev + delta);
        },
        onToolCallStart: (id, name) => {
          setActiveTools((prev) =>
            new Map(prev).set(id, { name, done: false }),
          );
        },
        onToolCallResult: (id) =>
          setActiveTools((prev) => {
            const entry = prev.get(id);
            if (!entry) return prev;
            return new Map(prev).set(id, { ...entry, done: true });
          }),
        onError: (error) => console.error('Stream error:', error),
      });

      responseRef.current = response;

      try {
        await response;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: streamingTextRef.current },
        ]);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: streamingTextRef.current || 'Something went wrong.',
            },
          ]);
        }
      } finally {
        setStreamingText('');
        setActiveTools(new Map());
        setIsStreaming(false);
        setIsThinking(false);
        responseRef.current = null;
      }
    },
    [activeThreadId, isStreaming],
  );

  const ensureThreadAndSend = useCallback(
    async (content: string) => {
      let threadId = activeThreadId;
      if (!threadId) {
        const thread = await chat.createThread();
        setThreads((prev) => [thread, ...prev]);
        setActiveThreadId(thread.id);
        setMessages([]);
        setStreamingText('');
        threadId = thread.id;
      }
      doSend(content, threadId);
    },
    [activeThreadId, doSend],
  );

  const handleStop = useCallback(() => {
    responseRef.current?.abort();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ensureThreadAndSend(input);
    }
  };

  return (
    <div className={styles.page}>
      <Nav />
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <button className={styles.newThread} onClick={createThread}>
          + New chat
        </button>
        <div className={styles.threadList}>
          {threads.map((thread) => (
            <button
              key={thread.id}
              className={styles.threadItem}
              data-active={thread.id === activeThreadId || undefined}
              onClick={() => selectThread(thread.id)}
            >
              <span className={styles.threadTitle}>
                {thread.title || 'New conversation'}
              </span>
              <span
                className={styles.threadDelete}
                onClick={(e) => deleteThread(e, thread.id)}
              >
                ×
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className={styles.main}>
        {messages.length > 0 || isStreaming ? (
          <div ref={scrollRef} className={styles.messages}>
            <div ref={contentRef} className={styles.messagesInner}>
              {messages.map((msg, i) =>
                msg.toolCallId ? null : (
                  <div
                    key={i}
                    className={styles.message}
                    data-role={msg.role}
                  >
                    {msg.role === 'assistant' ? (
                      <Streamdown plugins={streamdownPlugins} mode="static">
                        {msg.content}
                      </Streamdown>
                    ) : (
                      <div className={styles.userBubble}>{msg.content}</div>
                    )}
                    {msg.toolCalls?.map((tc) => (
                      <div key={tc.id} className={styles.toolCall}>
                        {toolDisplayName(tc.name)}
                      </div>
                    ))}
                  </div>
                ),
              )}

              {/* Thinking indicator */}
              {isThinking && (
                <div className={styles.message} data-role="assistant">
                  <div className={styles.thinking}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {/* Active tool calls */}
              {activeTools.size > 0 && (
                <div className={styles.message} data-role="assistant">
                  {[...activeTools.entries()].map(([id, { name, done }]) => (
                    <div
                      key={id}
                      className={styles.toolCallActive}
                      data-done={done || undefined}
                    >
                      {done ? toolDisplayName(name) : `${toolDisplayName(name)}...`}
                    </div>
                  ))}
                </div>
              )}

              {/* Streaming response */}
              {streamingText && (
                <div className={styles.message} data-role="assistant">
                  <Streamdown plugins={streamdownPlugins}>
                    {streamingText}
                  </Streamdown>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>What needs to get done?</p>
            <p className={styles.emptySubtitle}>
              I can manage your tasks, add notes, and help you stay organized.
            </p>
            <div className={styles.chips}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className={styles.chip}
                  onClick={() => ensureThreadAndSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.inputArea}>
          <TextareaAutosize
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to get done?"
            maxRows={5}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button className={styles.stopButton} onClick={handleStop}>
              Stop
            </button>
          ) : (
            <button
              className={styles.sendButton}
              onClick={() => ensureThreadAndSend(input)}
              disabled={!input.trim()}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
