import { create } from 'zustand';
import {
  threadMocks,
  type ThreadMessage,
} from '../../../pages/threads/model/threadMocks';

export const THREAD_REACTION_EMOJIS = ['❤️', '🔥', '👏', '😂', '😮'] as const;

export type ThreadReaction = (typeof THREAD_REACTION_EMOJIS)[number];
export type ThreadReactionMap = Partial<Record<ThreadReaction, number>>;

export type UIThreadMessage = ThreadMessage & {
  reactions?: ThreadReactionMap;
  replyToId?: string | null;
  isPinned?: boolean;
  isEdited?: boolean;
};

export type MinimizedThreadItem = {
  threadId: string;
  previewText: string;
  previewTimestamp: string;
};

type ThreadWindowsState = {
  activeThreadId: string | null;
  minimizedThreads: MinimizedThreadItem[];
  threadMessages: Record<string, UIThreadMessage[]>;
  openThread: (threadId: string) => void;
  closeActiveThread: () => void;
  minimizeThread: (
    threadId: string,
    preview?: { text: string; timestamp: string },
  ) => void;
  restoreThread: (threadId: string) => void;
  removeMinimizedThread: (threadId: string) => void;
  setThreadMessages: (
    threadId: string,
    updater: (messages: UIThreadMessage[]) => UIThreadMessage[],
  ) => void;
};

function createInitialThreadMessages() {
  return Object.fromEntries(
    threadMocks.map((thread) => [
      thread.id,
      thread.messages.map((message) => ({
        ...message,
        reactions: {},
      })),
    ]),
  ) as Record<string, UIThreadMessage[]>;
}

export const useThreadWindowsStore = create<ThreadWindowsState>((set) => ({
  activeThreadId: null,
  minimizedThreads: [],
  threadMessages: createInitialThreadMessages(),
  openThread: (threadId) =>
    set((state) => ({
      activeThreadId: threadId,
      minimizedThreads: state.minimizedThreads.filter(
        (item) => item.threadId !== threadId,
      ),
    })),
  closeActiveThread: () => set({ activeThreadId: null }),
  minimizeThread: (threadId, preview) =>
    set((state) => {
      const fallbackMessages = state.threadMessages[threadId] ?? [];
      const fallbackPreview = fallbackMessages[fallbackMessages.length - 1];
      const nextItem: MinimizedThreadItem = {
        threadId,
        previewText: preview?.text ?? fallbackPreview?.text ?? '',
        previewTimestamp:
          preview?.timestamp ?? fallbackPreview?.timestamp ?? '',
      };

      return {
        activeThreadId:
          state.activeThreadId === threadId ? null : state.activeThreadId,
        minimizedThreads: [
          ...state.minimizedThreads.filter(
            (item) => item.threadId !== threadId,
          ),
          nextItem,
        ],
      };
    }),
  restoreThread: (threadId) =>
    set((state) => ({
      minimizedThreads: state.minimizedThreads.filter(
        (item) => item.threadId !== threadId,
      ),
    })),
  removeMinimizedThread: (threadId) =>
    set((state) => ({
      minimizedThreads: state.minimizedThreads.filter(
        (item) => item.threadId !== threadId,
      ),
    })),
  setThreadMessages: (threadId, updater) =>
    set((state) => ({
      threadMessages: {
        ...state.threadMessages,
        [threadId]: updater(state.threadMessages[threadId] ?? []),
      },
    })),
}));
