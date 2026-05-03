import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  auth,
  handleFirestoreError,
  OperationType,
  fetchUsers,
  fetchConversation,
  clearConversation,
  deleteMessageById,
  markConversationRead,
  normalizeIdDocument,
  normalizeDate,
} from '../apiClient';
import { getSocket, emitSocketEvent } from '../socketClient';
import { Message, UserProfile } from '../types';
import { Send, MessageSquare, Search, ArrowLeft, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TypingIndicator from './ui/TypingIndicator';
import PageLoader from './ui/PageLoader';
import Avatar from './ui/Avatar';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const peerTypingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    let mounted = true;
    const loadUsers = async () => {
      try {
        const usersData = ((await fetchUsers()) as UserProfile[]).filter((u) => u.uid !== auth.currentUser?.uid);
        if (mounted) setUsers(usersData);
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
        if (mounted) setLoading(false);
      }
    };
    void loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !selectedUser) return;
    let mounted = true;
    const myUid = auth.currentUser.uid;
    const peerUid = selectedUser.uid;

    const loadConversation = async () => {
      try {
        const msgs = (await fetchConversation(peerUid)) as Message[];
        if (mounted) setMessages(msgs);
        await markConversationRead(peerUid);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'messages');
      }
    };
    void loadConversation();

    const socket = getSocket();
    const handleReceived = (raw: any) => {
      const normalized = normalizeDate(normalizeIdDocument(raw)) as Message;
      const inThisConversation =
        (normalized.senderId === myUid && normalized.recipientId === peerUid) ||
        (normalized.senderId === peerUid && normalized.recipientId === myUid);
      if (!inThisConversation) return;
      setMessages((prev) =>
        prev.some((m) => m.id === normalized.id) ? prev : [...prev, normalized],
      );
      if (normalized.senderId === peerUid) {
        void markConversationRead(peerUid);
      }
    };
    const handleTypingStart = (payload: { senderId: string }) => {
      if (payload.senderId !== peerUid) return;
      setPeerTyping(true);
      if (peerTypingTimerRef.current) window.clearTimeout(peerTypingTimerRef.current);
      peerTypingTimerRef.current = window.setTimeout(() => setPeerTyping(false), 5000);
    };
    const handleTypingStop = (payload: { senderId: string }) => {
      if (payload.senderId !== peerUid) return;
      if (peerTypingTimerRef.current) window.clearTimeout(peerTypingTimerRef.current);
      setPeerTyping(false);
    };
    const handleReconnect = () => void loadConversation();

    socket?.on('dm.received', handleReceived);
    socket?.on('typing.start', handleTypingStart);
    socket?.on('typing.stop', handleTypingStop);
    socket?.io.on('reconnect', handleReconnect);

    return () => {
      mounted = false;
      socket?.off('dm.received', handleReceived);
      socket?.off('typing.start', handleTypingStart);
      socket?.off('typing.stop', handleTypingStop);
      socket?.io.off('reconnect', handleReconnect);
      if (peerTypingTimerRef.current) {
        window.clearTimeout(peerTypingTimerRef.current);
        peerTypingTimerRef.current = null;
      }
      setPeerTyping(false);
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || !selectedUser) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    emitSocketEvent('typing.stop', { recipientId: selectedUser.uid });
    try {
      emitSocketEvent('dm.send', { recipientId: selectedUser.uid, content: text });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages');
      setNewMessage(text);
    } finally {
      window.setTimeout(() => setSending(false), 200);
    }
  };

  const handleNewMessageChange = (value: string) => {
    setNewMessage(value);
    if (!selectedUser) return;
    if (value.length === 0) {
      if (typingStopTimerRef.current) {
        window.clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
      emitSocketEvent('typing.stop', { recipientId: selectedUser.uid });
      return;
    }
    emitSocketEvent('typing.start', { recipientId: selectedUser.uid });
    if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = window.setTimeout(() => {
      emitSocketEvent('typing.stop', { recipientId: selectedUser.uid });
      typingStopTimerRef.current = null;
    }, 2500);
  };

  const handleClearConversation = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Clear all messages with ${selectedUser.displayName}?`)) return;
    try {
      await clearConversation(selectedUser.uid);
      setMessages([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'messages/clear');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessageById(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'messages/' + messageId);
    }
  };

  if (loading) {
    return <PageLoader variant="messages" />;
  }

  return (
    <div className="grid min-h-[280px] grid-cols-1 gap-3 sm:gap-4 md:grid-cols-[minmax(0,280px)_1fr] h-[calc(100dvh-14rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] md:h-[calc(100dvh-10rem)]">
      <div className={`surface-card flex flex-col overflow-hidden ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="border-b border-black/10 p-3 sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input type="search" placeholder="Search people…" className="input-field py-2.5 pl-10 pr-3 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <motion.button
              key={u.uid}
              type="button"
              onClick={() => setSelectedUser(u)}
              className={`flex w-full items-center gap-3 border-b border-black/5 p-3 text-left transition-colors sm:p-4 ${
                selectedUser?.uid === u.uid ? 'bg-primary/20' : 'hover:bg-primary/10'
              }`}
              whileTap={{ scale: 0.995 }}
            >
              <Avatar
                name={u.displayName}
                src={u.photoURL}
                className="h-10 w-10 shrink-0 rounded-full border border-black/12 object-cover"
                initialsClassName="flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-xs font-bold text-primary"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{u.displayName}</p>
                <p className="truncate text-xs text-muted">{u.college || 'Developer'}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className={`surface-card flex flex-col overflow-hidden ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 border-b border-black/10 p-3 sm:p-4">
              <motion.button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl p-2 text-muted hover:bg-primary/15 md:hidden"
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <Avatar
                name={selectedUser.displayName}
                src={selectedUser.photoURL}
                className="h-10 w-10 shrink-0 rounded-full border border-black/12 object-cover"
                initialsClassName="flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-xs font-bold text-primary"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold sm:text-base">{selectedUser.displayName}</h3>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Live · Active now
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => void handleClearConversation()}
                className="rounded-xl p-2 text-muted hover:bg-black/5 hover:text-black"
                whileTap={{ scale: 0.95 }}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:space-y-4 sm:p-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const mine = msg.senderId === auth.currentUser?.uid;
                    return (
                      <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:max-w-[75%] sm:px-4 sm:py-3 ${
                            mine
                              ? 'rounded-br-md bg-black text-white shadow-md'
                              : 'rounded-bl-md border border-black/12 bg-white text-black'
                          }`}
                        >
                          {mine && (
                            <div className="mb-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => void handleDeleteMessage(msg.id)}
                                className="rounded-md p-1 text-white/65 hover:bg-white/15 hover:text-white"
                                title="Delete message"
                                aria-label="Delete message"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                          <p className="text-sm font-normal leading-relaxed sm:text-[0.95rem]">{msg.content}</p>
                          <p
                            className={`mt-1 text-[10px] opacity-70 ${mine ? 'text-right' : 'text-left'}`}
                          >
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt as unknown as string)) + ' ago' : 'Just now'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <AnimatePresence>
                  {sending && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex justify-end"
                    >
                      <div className="flex items-center gap-2 rounded-2xl rounded-br-md border border-black/15 bg-primary/20 px-4 py-2.5 text-black">
                        <TypingIndicator />
                        <span className="text-xs font-medium">Sending…</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {peerTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-black/12 bg-white px-4 py-2.5 text-black">
                        <TypingIndicator />
                        <span className="text-xs font-medium text-muted">
                          {selectedUser.displayName} is typing…
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {newMessage.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-black/10 px-4 py-2"
                >
                  <p className="flex items-center gap-2 text-xs text-black">
                    <TypingIndicator />
                    <span className="text-muted">You’re typing…</span>
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-black/10 p-3 sm:gap-3 sm:p-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleNewMessageChange(e.target.value)}
                  placeholder="Message…"
                  className="input-field min-w-0 flex-1 py-2.5 text-sm sm:text-base"
                />
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-cta flex shrink-0 items-center justify-center px-4 py-2.5 sm:px-5"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Send size={18} strokeWidth={2} />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center sm:p-14">
            <MessageSquare size={56} className="mb-4 text-black/15" strokeWidth={1.25} />
            <p className="heading text-base text-muted sm:text-lg">Select a conversation</p>
            <p className="mt-2 max-w-xs text-sm font-normal text-muted">Direct messages sync in real time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
