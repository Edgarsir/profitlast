import { create } from 'zustand';
import { ChatMessage, ChatSession } from '../types/chat';

interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  createSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSession: null,
  sessions: [],
  isLoading: false,
  addMessage: (message) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    set(() => ({
      currentSession: {
        ...currentSession,
        messages: [...currentSession.messages, newMessage],
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  createSession: () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      currentSession: newSession,
      sessions: [newSession, ...state.sessions],
    }));
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));