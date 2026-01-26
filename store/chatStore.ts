import { create } from 'zustand';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  status?: 'sending' | 'sent' | 'error';
};

type ChatState = {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;

  addMessage: (m: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  input: '',
  setInput: (v) => set({ input: v }),

  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  reset: () => set({ messages: [], input: '' }),
}));
