import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ThreadSummary,
  Message,
  AbortablePromise,
  SendMessageResult,
} from '@mindstudio-ai/interface';
import { chat } from './api';
import styles from './Chat.module.css';

export default function Chat() {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTools, setActiveTools] = useState<Map<string, string>>(
    new Map(),
  );

  const responseRef = useRef<AbortablePromise<SendMessageResult> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages, streamingText, scrollToBottom]);

  // Load threads on mount
  useEffect(() => {
    chat.listThreads().then((page) => setThreads(page.threads));
  }, []);

  const selectThread = useCallback(async (threadId: string) => {
    setActiveThreadId(threadId);
    setMessages([]);
    setStreamingText('');
    const thread = await chat.getThread(threadId);
    setMessages(thread.messages);
  }, []);

  const createThread = useCallback(async () => {
    const thread = await chat.createThread();
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setMessages([]);
    setStreamingText('');
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

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || !activeThreadId || isStreaming) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setStreamingText('');
    setActiveTools(new Map());
    setIsStreaming(true);

    const response = chat.sendMessage(activeThreadId, content, {
      onText: (text) => setStreamingText(text),
      onToolCallStart: (id, name) =>
        setActiveTools((prev) => new Map(prev).set(id, name)),
      onToolCallResult: (id) =>
        setActiveTools((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
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
      responseRef.current = null;
    }
  }, [input, activeThreadId, isStreaming]);

  // Keep a ref to streamingText so the sendMessage closure can read the latest value
  const streamingTextRef = useRef(streamingText);
  streamingTextRef.current = streamingText;

  const handleStop = useCallback(() => {
    responseRef.current?.abort();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.page}>
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
        {activeThreadId ? (
          <>
            <div className={styles.messages}>
              {messages.map((msg, i) =>
                msg.toolCallId ? null : (
                  <div
                    key={i}
                    className={styles.message}
                    data-role={msg.role}
                  >
                    <div className={styles.bubble}>{msg.content}</div>
                    {msg.toolCalls?.map((tc) => (
                      <div key={tc.id} className={styles.toolCall}>
                        Called {tc.name}
                      </div>
                    ))}
                  </div>
                ),
              )}

              {/* Active tool calls */}
              {activeTools.size > 0 && (
                <div className={styles.message} data-role="assistant">
                  {[...activeTools.values()].map((name, i) => (
                    <div key={i} className={styles.toolCallActive}>
                      Running {name}...
                    </div>
                  ))}
                </div>
              )}

              {/* Streaming response */}
              {streamingText && (
                <div className={styles.message} data-role="assistant">
                  <div className={styles.bubble}>
                    {streamingText}
                    <span className={styles.cursor} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                rows={1}
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button className={styles.stopButton} onClick={handleStop}>
                  Stop
                </button>
              ) : (
                <button
                  className={styles.sendButton}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  Send
                </button>
              )}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Todo Assistant</p>
            <p className={styles.emptySubtitle}>
              Start a conversation to manage your to-do list
            </p>
            <button className={styles.startButton} onClick={createThread}>
              New chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
