import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Bold,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  CornerUpLeft,
  Edit3,
  Italic,
  List,
  MessageSquareReply,
  Minus,
  Pin,
  Search,
  SendHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useThreadWindowsStore } from '../../../entities/thread/model/useThreadWindowsStore';
import { DashboardEditorShell } from '../../../widgets/shell/ui/DashboardEditorShell';
import {
  threadMocks,
  threadMocksMap,
  type ThreadItem,
  type ThreadMessage,
} from '../model/threadMocks';

const THREAD_MESSAGE_LIMIT = 900;
const REACTION_EMOJIS = ['❤️', '🔥', '👏', '😂', '😮'] as const;

type ThreadReaction = (typeof REACTION_EMOJIS)[number];
type ThreadReactionMap = Partial<Record<ThreadReaction, number>>;

type UIThreadMessage = ThreadMessage & {
  reactions?: ThreadReactionMap;
  replyToId?: string | null;
  isPinned?: boolean;
  isEdited?: boolean;
};

type ComposerMode =
  | { type: 'new' }
  | { type: 'reply'; messageId: string }
  | { type: 'edit'; messageId: string };

const THREAD_MINIMIZE_ANIMATION_MS = 320;

type MenuState = {
  messageId: string;
  top: number;
  left: number;
  placement: 'above' | 'below';
};

const THREAD_AVATAR_BASE =
  'inline-flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9be8f7] to-[#5dc7de] text-[13px] font-extrabold tracking-[0.04em] text-[#173844] shadow-[inset_0_1px_0_rgba(255,255,255,0.44)]';

function ThreadAvatar({
  label,
  name,
  className = '',
}: {
  label: string;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`${THREAD_AVATAR_BASE} ${className}`.trim()}
      aria-label={name}
      title={name}
    >
      {label}
    </span>
  );
}

const STATUS_LABEL: Record<ThreadItem['status'], string> = {
  active: 'Активный',
  draft: 'Черновик',
  archived: 'Архив',
};

const HERO_INSIGHT_CARD =
  "bordered-soft relative overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(243,248,252,0.92)_100%)] p-[18px_20px] after:pointer-events-none after:absolute after:-right-[30px] after:-bottom-[30px] after:size-[110px] after:rounded-full after:bg-[radial-gradient(circle,rgba(124,223,245,0.22)_0%,rgba(124,223,245,0)_72%)] after:content-[''] dark:bg-surface-muted";

const HERO_STAT =
  'bordered-soft rounded-[22px] bg-white/72 p-[18px_20px] dark:bg-surface-muted';

function ThreadStatusBadge({ status }: { status: ThreadItem['status'] }) {
  return (
    <span className={`status-pill status-pill-${status}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInlineMarkup(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderFormattedText(text: string) {
  const lines = text.split('\n');

  return lines.map((line, index) => {
    const key = `${index}-${line}`;

    if (!line.trim()) {
      return <br key={key} />;
    }

    if (line.startsWith('> ')) {
      return (
        <blockquote
          key={key}
          dangerouslySetInnerHTML={{
            __html: renderInlineMarkup(line.slice(2)),
          }}
        />
      );
    }

    if (line.startsWith('- ')) {
      return (
        <div key={key} className="thread-message__list-item">
          <span />
          <span
            dangerouslySetInnerHTML={{
              __html: renderInlineMarkup(line.slice(2)),
            }}
          />
        </div>
      );
    }

    return (
      <div
        key={key}
        dangerouslySetInnerHTML={{ __html: renderInlineMarkup(line) }}
      />
    );
  });
}

function findMessage(messages: UIThreadMessage[], id: string) {
  return messages.find((message) => message.id === id) ?? null;
}

function getMessageAuthorLabel(author: ThreadMessage['author']) {
  if (author === 'user') {
    return 'Вы';
  }

  if (author === 'assistant') {
    return 'Ассистент';
  }

  return 'Система';
}

function getMessageAvatar(author: ThreadMessage['author']) {
  if (author === 'user') {
    return 'ВЫ';
  }

  if (author === 'assistant') {
    return 'AI';
  }

  return 'SY';
}

type ThreadMessageMenuProps = {
  copiedMessageId: string | null;
  message: UIThreadMessage;
  placement?: 'above' | 'below';
  style?: CSSProperties;
  onClose: () => void;
  onCopy: (message: UIThreadMessage) => Promise<void>;
  onEdit: (message: UIThreadMessage) => void;
  onPin: (messageId: string) => void;
  onReact: (messageId: string, emoji: ThreadReaction) => void;
  onRemove: (messageId: string) => void;
  onReply: (message: UIThreadMessage) => void;
};

function ThreadMessageMenu({
  copiedMessageId,
  message,
  placement = 'below',
  style,
  onClose,
  onCopy,
  onEdit,
  onPin,
  onReact,
  onRemove,
  onReply,
}: ThreadMessageMenuProps) {
  return (
    <div
      className={`thread-message-menu thread-message-menu--${placement}`}
      style={style}
      role="menu"
      aria-label="Действия с сообщением"
    >
      <div className="thread-message-menu__reactions">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onReact(message.id, emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          onReply(message);
          onClose();
        }}
      >
        <MessageSquareReply size={16} />
        Ответить
      </button>

      <button
        type="button"
        onClick={async () => {
          await onCopy(message);
          onClose();
        }}
      >
        <Copy size={16} />
        {copiedMessageId === message.id ? 'Скопировано' : 'Скопировать'}
      </button>

      {message.author !== 'system' ? (
        <button
          type="button"
          onClick={() => {
            onEdit(message);
            onClose();
          }}
        >
          <Edit3 size={16} />
          Редактировать
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => {
          onPin(message.id);
          onClose();
        }}
      >
        <Pin size={16} />
        {message.isPinned ? 'Открепить' : 'Закрепить'}
      </button>

      {message.author !== 'system' ? (
        <button
          type="button"
          className="thread-message-menu__danger"
          onClick={() => {
            onRemove(message.id);
            onClose();
          }}
        >
          <Trash2 size={16} />
          Удалить
        </button>
      ) : null}
    </div>
  );
}

type ThreadMessageBubbleProps = {
  allMessages: UIThreadMessage[];
  message: UIThreadMessage;
  onOpenMenu: (event: ReactMouseEvent<HTMLElement>, messageId: string) => void;
};

function ThreadMessageBubble({
  allMessages,
  message,
  onOpenMenu,
}: ThreadMessageBubbleProps) {
  const authorLabel = getMessageAuthorLabel(message.author);
  const repliedMessage = message.replyToId
    ? findMessage(allMessages, message.replyToId)
    : null;

  if (message.author === 'system') {
    return (
      <div
        className="thread-history__system-note"
        role="status"
        aria-label={authorLabel}
        onContextMenu={(event) => onOpenMenu(event, message.id)}
      >
        <span className="thread-history__system-text">{message.text}</span>
        <span className="thread-history__system-time">{message.timestamp}</span>
      </div>
    );
  }

  return (
    <article
      className={`thread-history__message thread-history__message--${message.author}`}
      onContextMenu={(event) => onOpenMenu(event, message.id)}
    >
      <div className="thread-history__message-head">
        <ThreadAvatar
          label={getMessageAvatar(message.author)}
          name={authorLabel}
          className={`thread-avatar--${message.author}`}
        />
        <div className="thread-history__message-meta">
          <strong>{authorLabel}</strong>
          <span>
            {message.timestamp}
            {message.isEdited ? ' · изменено' : ''}
          </span>
        </div>
      </div>

      {repliedMessage ? (
        <div className="thread-history__reply-preview">
          <strong>{getMessageAuthorLabel(repliedMessage.author)}</strong>
          <span>{repliedMessage.text}</span>
        </div>
      ) : null}

      <div className="thread-history__message-body">
        {renderFormattedText(message.text)}
      </div>

      {message.reactions && Object.keys(message.reactions).length ? (
        <div className="thread-history__reactions">
          {Object.entries(message.reactions).map(([emoji, count]) => (
            <span key={emoji} className="thread-history__reaction-chip">
              {emoji} {count}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ThreadsPage() {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId?: string }>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const minimizeTimeoutRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | ThreadItem['category']
  >('all');
  const [draftMessage, setDraftMessage] = useState('');
  const [composerMode, setComposerMode] = useState<ComposerMode>({
    type: 'new',
  });
  const [isComposerCollapsed, setIsComposerCollapsed] = useState(false);
  const [isMinimizingThread, setIsMinimizingThread] = useState(false);
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isHistoryScrollable, setIsHistoryScrollable] = useState(false);
  const [isHistoryAtTop, setIsHistoryAtTop] = useState(false);
  const [deleteDialogMessageId, setDeleteDialogMessageId] = useState<
    string | null
  >(null);
  const activeThreadId = useThreadWindowsStore((state) => state.activeThreadId);
  const threadMessages = useThreadWindowsStore((state) => state.threadMessages);
  const openThreadWindow = useThreadWindowsStore((state) => state.openThread);
  const setThreadMessages = useThreadWindowsStore(
    (state) => state.setThreadMessages,
  );
  const minimizeThread = useThreadWindowsStore((state) => state.minimizeThread);
  const restoreThread = useThreadWindowsStore((state) => state.restoreThread);

  const categories = Array.from(
    new Set(threadMocks.map((thread) => thread.category)),
  );
  const topCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    threadMocks.forEach((thread) => {
      categoryMap.set(
        thread.category,
        (categoryMap.get(thread.category) ?? 0) + 1,
      );
    });

    return (
      Array.from(categoryMap.entries()).sort(
        (left, right) => right[1] - left[1],
      )[0] ?? null
    );
  }, []);
  const latestThread = useMemo(
    () =>
      [...threadMocks].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt, 'ru'),
      )[0] ?? null,
    [],
  );
  const uniquePeopleCount = useMemo(
    () =>
      new Set(
        threadMocks.flatMap((thread) => [
          thread.creator.name,
          ...thread.participants,
        ]),
      ).size,
    [],
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredThreads = threadMocks.filter((thread) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      thread.title.toLowerCase().includes(normalizedQuery) ||
      thread.summary.toLowerCase().includes(normalizedQuery) ||
      thread.participants.some((participant) =>
        participant.toLowerCase().includes(normalizedQuery),
      ) ||
      thread.creator.name.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      selectedCategory === 'all' || thread.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const selectedThread = threadId
    ? threadMocksMap[threadId]
    : activeThreadId
      ? threadMocksMap[activeThreadId]
      : null;
  const selectedThreadMessages = selectedThread
    ? (threadMessages[selectedThread.id] ?? [])
    : [];
  const latestThreadMessage =
    selectedThreadMessages[selectedThreadMessages.length - 1] ?? null;
  const pinnedMessage = useMemo(
    () => selectedThreadMessages.find((message) => message.isPinned) ?? null,
    [selectedThreadMessages],
  );
  const activeMenuMessage = menuState
    ? findMessage(selectedThreadMessages, menuState.messageId)
    : null;
  const composerTarget =
    composerMode.type === 'new'
      ? null
      : findMessage(selectedThreadMessages, composerMode.messageId);
  const remainingCharacters = THREAD_MESSAGE_LIMIT - draftMessage.length;
  const isScrollControlPointingDown = isHistoryScrollable && isHistoryAtTop;
  const shouldShowScrollControl = isHistoryScrollable;

  useEffect(() => {
    if (!menuState) {
      return undefined;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setMenuState(null);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [menuState]);

  useEffect(() => {
    if (!menuState) {
      return undefined;
    }

    function handleViewportChange() {
      setMenuState(null);
    }

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [menuState]);

  useEffect(() => {
    return () => {
      if (minimizeTimeoutRef.current) {
        window.clearTimeout(minimizeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMenuState(null);
    setCopiedMessageId(null);
    setDeleteDialogMessageId(null);
    setIsComposerCollapsed(false);
    setIsMinimizingThread(false);
    if (threadId) {
      openThreadWindow(threadId);
      restoreThread(threadId);
    }
  }, [threadId, openThreadWindow, restoreThread]);

  useEffect(() => {
    const historyElement = historyRef.current;

    if (!historyElement) {
      return undefined;
    }

    function updateScrollState() {
      const maxScrollTop =
        historyElement.scrollHeight - historyElement.clientHeight;
      setIsHistoryScrollable(maxScrollTop > 24);
      setIsHistoryAtTop(historyElement.scrollTop <= 24);
    }

    updateScrollState();
    historyElement.addEventListener('scroll', updateScrollState);
    return () =>
      historyElement.removeEventListener('scroll', updateScrollState);
  }, [threadId, selectedThreadMessages.length]);

  useEffect(() => {
    if (!selectedThread) {
      return;
    }

    const historyElement = historyRef.current;

    if (!historyElement) {
      return;
    }

    window.requestAnimationFrame(() => {
      historyElement.scrollTo({
        top: historyElement.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [selectedThread?.id, selectedThreadMessages.length]);

  if (threadId && !selectedThread) {
    return <Navigate to="/threads" replace />;
  }

  function updateThreadMessages(
    threadKey: string,
    updater: (messages: UIThreadMessage[]) => UIThreadMessage[],
  ) {
    setThreadMessages(threadKey, updater);
  }

  function openThread(id: string) {
    restoreThread(id);
    openThreadWindow(id);
  }

  function clearMinimizeAnimation() {
    if (minimizeTimeoutRef.current) {
      window.clearTimeout(minimizeTimeoutRef.current);
      minimizeTimeoutRef.current = null;
    }
  }

  function minimizeThreadWindow() {
    if (!selectedThread || isMinimizingThread) {
      return;
    }

    clearMinimizeAnimation();
    setMenuState(null);
    setIsMinimizingThread(true);
    minimizeTimeoutRef.current = window.setTimeout(() => {
      minimizeThread(selectedThread.id, {
        text: latestThreadMessage?.text ?? selectedThread.summary,
        timestamp: latestThreadMessage?.timestamp ?? selectedThread.updatedAt,
      });
      setIsMinimizingThread(false);
      minimizeTimeoutRef.current = null;
      navigate('/threads');
    }, THREAD_MINIMIZE_ANIMATION_MS);
  }

  function closeThread() {
    clearMinimizeAnimation();
    navigate('/threads');
    setDraftMessage('');
    setComposerMode({ type: 'new' });
    setMenuState(null);
    setDeleteDialogMessageId(null);
    setIsComposerCollapsed(false);
    setIsMinimizingThread(false);
  }

  function resetComposer() {
    setDraftMessage('');
    setComposerMode({ type: 'new' });
  }

  function applyFormatting(
    type: 'bold' | 'italic' | 'code' | 'quote' | 'list',
  ) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = draftMessage.slice(start, end);
    let inserted = '';
    let caretStart = start;
    let caretEnd = end;

    switch (type) {
      case 'bold':
        inserted = `**${selected || 'текст'}**`;
        caretStart = start + 2;
        caretEnd = caretStart + (selected || 'текст').length;
        break;
      case 'italic':
        inserted = `*${selected || 'текст'}*`;
        caretStart = start + 1;
        caretEnd = caretStart + (selected || 'текст').length;
        break;
      case 'code':
        inserted = `\`${selected || 'code'}\``;
        caretStart = start + 1;
        caretEnd = caretStart + (selected || 'code').length;
        break;
      case 'quote': {
        const lines = (selected || 'цитата')
          .split('\n')
          .map((line) => `> ${line}`);
        inserted = lines.join('\n');
        caretStart = start;
        caretEnd = start + inserted.length;
        break;
      }
      case 'list': {
        const lines = (selected || 'пункт списка')
          .split('\n')
          .map((line) => `- ${line}`);
        inserted = lines.join('\n');
        caretStart = start;
        caretEnd = start + inserted.length;
        break;
      }
    }

    const nextValue = `${draftMessage.slice(0, start)}${inserted}${draftMessage.slice(end)}`;
    setDraftMessage(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(caretStart, caretEnd);
    });
  }

  function submitCurrentDraft() {
    if (!selectedThread || !draftMessage.trim()) {
      return;
    }

    if (composerMode.type === 'edit') {
      updateThreadMessages(selectedThread.id, (messages) =>
        messages.map((message) =>
          message.id === composerMode.messageId
            ? {
                ...message,
                text: draftMessage.trim(),
                isEdited: true,
                timestamp: 'Сейчас',
              }
            : message,
        ),
      );
      resetComposer();
      return;
    }

    const nextMessage: UIThreadMessage = {
      id: `draft-${Date.now()}`,
      author: 'user',
      text: draftMessage.trim(),
      timestamp: 'Сейчас',
      reactions: {},
      replyToId: composerMode.type === 'reply' ? composerMode.messageId : null,
    };

    updateThreadMessages(selectedThread.id, (messages) => [
      ...messages,
      nextMessage,
    ]);
    resetComposer();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCurrentDraft();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.key !== 'Enter') {
      return;
    }

    if (event.ctrlKey) {
      return;
    }

    event.preventDefault();
    submitCurrentDraft();
  }

  function openMessageMenu(
    event: ReactMouseEvent<HTMLElement>,
    messageId: string,
  ) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = Math.min(248, window.innerWidth - 24);
    const viewportPadding = 12;
    const left = Math.min(
      Math.max(rect.right - menuWidth, viewportPadding),
      window.innerWidth - menuWidth - viewportPadding,
    );
    const shouldPlaceAbove =
      rect.bottom + 220 > window.innerHeight && rect.top > 220;

    setMenuState({
      messageId,
      left,
      top: shouldPlaceAbove ? rect.top - 8 : rect.bottom + 8,
      placement: shouldPlaceAbove ? 'above' : 'below',
    });
  }

  function toggleHistoryScrollDirection() {
    const historyElement = historyRef.current;

    if (!historyElement) {
      return;
    }

    historyElement.scrollTo({
      top: isScrollControlPointingDown ? historyElement.scrollHeight : 0,
      behavior: 'smooth',
    });
  }

  async function copyMessage(message: UIThreadMessage) {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1400);
    } catch {
      setCopiedMessageId(null);
    }
  }

  function toggleReaction(messageId: string, emoji: ThreadReaction) {
    if (!selectedThread) {
      return;
    }

    updateThreadMessages(selectedThread.id, (messages) =>
      messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              reactions: {
                ...message.reactions,
                [emoji]: (message.reactions?.[emoji] ?? 0) + 1,
              },
            }
          : message,
      ),
    );
  }

  function togglePin(messageId: string) {
    if (!selectedThread) {
      return;
    }

    updateThreadMessages(selectedThread.id, (messages) =>
      messages.map((message) => ({
        ...message,
        isPinned: message.id === messageId ? !message.isPinned : false,
      })),
    );
  }

  function removeMessage(messageId: string, mode: 'self' | 'everyone') {
    if (!selectedThread) {
      return;
    }

    updateThreadMessages(selectedThread.id, (messages) => {
      const filteredMessages = messages.filter(
        (message) => message.id !== messageId,
      );

      if (mode === 'everyone') {
        return [
          ...filteredMessages,
          {
            id: `system-delete-${Date.now()}`,
            author: 'system',
            text: 'Сообщение удалено для всех участников треда.',
            timestamp: 'Сейчас',
            reactions: {},
          },
        ];
      }

      return filteredMessages;
    });

    if (composerMode.type !== 'new' && composerMode.messageId === messageId) {
      resetComposer();
    }

    setDeleteDialogMessageId(null);
  }

  function requestMessageRemoval(messageId: string) {
    setMenuState(null);
    setDeleteDialogMessageId(messageId);
  }

  function startReply(message: UIThreadMessage) {
    setComposerMode({ type: 'reply', messageId: message.id });
    setDraftMessage('');
    setIsComposerCollapsed(false);
    textareaRef.current?.focus();
  }

  function startEdit(message: UIThreadMessage) {
    setComposerMode({ type: 'edit', messageId: message.id });
    setDraftMessage(message.text);
    setIsComposerCollapsed(false);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  return (
    <DashboardEditorShell>
      <div className="flex flex-col gap-6 px-0 py-2 pb-4">
        <section className="bordered gradient-card shadow-card grid grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)] gap-5 rounded-[28px] p-7 max-xl:grid-cols-1 max-sm:p-5">
          <div className="flex flex-col gap-3.5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[rgba(155,232,247,0.22)] px-3 py-2 text-xs font-bold tracking-[0.06em] text-[#215c69] uppercase dark:text-[#97e5f5]">
              <Sparkles size={14} />
              <span>Threads</span>
            </div>
            <h1 className="text-text-primary m-0 max-w-[700px] text-[clamp(28px,4vw,40px)] leading-[1.05]">
              Ваши треды по профилю и рабочим сценариям
            </h1>
            <p className="text-text-secondary m-0 max-w-[620px] text-sm leading-[1.6]">
              Пока это визуальная заглушка: здесь можно оценить список тредов,
              карточки и просмотр истории внутри выбранного диалога.
            </p>

            <div className="mt-1.5 grid max-w-[720px] grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <article className={HERO_INSIGHT_CARD}>
                <span className="eyebrow mb-2.5 inline-block tracking-[0.12em]">
                  Главный фокус
                </span>
                <strong className="text-text-primary mb-2 block text-lg leading-[1.25]">
                  {topCategory?.[0] ?? 'Без категории'}
                </strong>
                <p className="meta-text m-0 leading-[1.55]">
                  {topCategory
                    ? `${topCategory[1]} треда в этой группе`
                    : 'Категории появятся позже'}
                </p>
              </article>

              <article className={HERO_INSIGHT_CARD}>
                <span className="eyebrow mb-2.5 inline-block tracking-[0.12em]">
                  Последний апдейт
                </span>
                <strong className="text-text-primary mb-2 block text-lg leading-[1.25]">
                  {latestThread?.title ?? 'Новый тред'}
                </strong>
                <p className="meta-text m-0 leading-[1.55]">
                  {latestThread?.summary ??
                    'Здесь будет краткое описание активности.'}
                </p>
              </article>
            </div>

            <div className="flex w-fit max-w-full items-center gap-4 rounded-full border border-[rgba(207,220,231,0.88)] bg-white/72 px-4 py-3 dark:bg-[rgba(21,31,40,0.82)]">
              <div className="flex items-center" aria-hidden="true">
                {threadMocks.slice(0, 3).map((thread, idx) => (
                  <ThreadAvatar
                    key={thread.id}
                    label={thread.creator.avatar}
                    name={thread.creator.name}
                    className={`size-10 border-[3px] border-[rgba(244,249,252,0.95)] shadow-[0_8px_18px_rgba(112,130,145,0.14)] dark:border-[rgba(18,26,34,0.92)] ${idx === 0 ? '' : '-ml-2.5'}`}
                  />
                ))}
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                <strong className="text-text-primary text-sm leading-[1.3]">
                  {uniquePeopleCount} участников уже в моках
                </strong>
                <span className="text-text-muted text-xs leading-[1.45]">
                  Быстрый обзор тредов, авторов и сценариев прямо из профиля.
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3.5">
            <article className="rounded-[22px] border border-[rgba(219,229,238,0.9)] bg-white/72 p-[18px_20px] dark:bg-[rgba(21,31,40,0.82)]">
              <span className="text-text-muted text-xs">Всего тредов</span>
              <strong className="text-text-primary mt-2 block text-[28px] leading-none">
                {threadMocks.length}
              </strong>
            </article>
            <article className="rounded-[22px] border border-[rgba(219,229,238,0.9)] bg-white/72 p-[18px_20px] dark:bg-[rgba(21,31,40,0.82)]">
              <span className="text-text-muted text-xs">Активных сейчас</span>
              <strong className="text-text-primary mt-2 block text-[28px] leading-none">
                {
                  threadMocks.filter((thread) => thread.status === 'active')
                    .length
                }
              </strong>
            </article>
            <article className="rounded-[22px] border border-[rgba(219,229,238,0.9)] bg-white/72 p-[18px_20px] dark:bg-[rgba(21,31,40,0.82)]">
              <span className="text-text-muted text-xs">Новых сообщений</span>
              <strong className="text-text-primary mt-2 block text-[28px] leading-none">
                {threadMocks.reduce(
                  (count, thread) => count + thread.unreadCount,
                  0,
                )}
              </strong>
            </article>
          </div>
        </section>

        <section className="shadow-card min-w-0 rounded-[26px] border border-[rgba(219,229,238,0.95)] bg-(--panel-bg) p-[22px] dark:bg-[radial-gradient(circle_at_top_right,rgba(29,127,149,0.14),transparent_32%),rgba(18,26,34,0.92)]">
          <div className="mb-[18px] flex items-start justify-between gap-4">
            <div>
              <p className="text-text-muted text-xs">Список тредов</p>
              <h2 className="text-text-primary m-0 mt-1 text-[21px]">
                Созданные пользователем обсуждения
              </h2>
            </div>
            <span className="text-text-muted rounded-full bg-[rgba(155,232,247,0.14)] px-2.5 py-[7px] text-xs whitespace-nowrap">
              Мок-данные
            </span>
          </div>

          <div className="mb-[18px] flex flex-col gap-4">
            <label className="flex h-12 items-center gap-2.5 rounded-2xl border border-[rgba(209,221,235,0.92)] bg-white/86 px-4 text-[#61707d] dark:bg-[rgba(21,31,40,0.82)] dark:text-[#9eb1c2]">
              <Search size={16} />
              <input
                type="search"
                placeholder="Поиск по названию, описанию или участникам"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full border-0 bg-transparent text-[#24313b] outline-0 placeholder:text-[#8493a0] dark:text-[#eef5fb] dark:placeholder:text-[#9eb1c2]"
              />
            </label>

            <div
              className="flex flex-wrap gap-2.5"
              role="tablist"
              aria-label="Фильтрация тредов по категориям"
            >
              {[
                { value: 'all' as const, label: 'Все' },
                ...categories.map((category) => ({
                  value: category,
                  label: category,
                })),
              ].map(({ value, label }) => {
                const active = selectedCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`h-10 rounded-full border px-3.5 transition-[0.18s_ease] hover:border-[rgba(93,199,222,0.48)] hover:bg-[rgba(155,232,247,0.2)] hover:text-[#1f4f5a] dark:hover:bg-[rgba(48,114,132,0.22)] ${active ? 'border-[rgba(93,199,222,0.48)] bg-[rgba(155,232,247,0.2)] text-[#1f4f5a]' : 'border-[rgba(209,221,235,0.92)] bg-white/76 text-[#53606c] dark:bg-[rgba(21,31,40,0.82)] dark:text-[#9eb1c2]'}`}
                    onClick={() => setSelectedCategory(value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3">
            {filteredThreads.length ? (
              filteredThreads.map((thread) => {
                const isActive = selectedThread?.id === thread.id;
                const threadPinnedMessage = (
                  threadMessages[thread.id] ?? []
                ).find((message) => message.isPinned);

                return (
                  <button
                    key={thread.id}
                    type="button"
                    className={`relative grid w-full grid-cols-[6px_minmax(0,1fr)] items-stretch gap-3.5 rounded-[20px] border p-4 text-left transition-[transform,border-color,box-shadow] duration-[0.18s] hover:-translate-y-0.5 hover:border-[rgba(93,199,222,0.55)] hover:shadow-[0_16px_30px_rgba(164,182,204,0.16)] dark:bg-[rgba(21,31,40,0.82)] ${isActive ? '-translate-y-0.5 border-[rgba(93,199,222,0.55)] shadow-[0_16px_30px_rgba(164,182,204,0.16)]' : 'border-[rgba(219,229,238,0.9)] bg-white/74'}`}
                    onClick={() => openThread(thread.id)}
                  >
                    <div
                      className="rounded-full"
                      style={{ background: thread.accent }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex min-w-0 items-start gap-3.5">
                          <ThreadAvatar
                            label={thread.creator.avatar}
                            name={thread.creator.name}
                          />
                          <div className="min-w-0">
                            <h3 className="text-text-primary m-0 mt-2.5 mb-2 text-[17px]">
                              {thread.title}
                            </h3>
                            <p className="text-text-secondary m-0 text-[13px] leading-[1.55]">
                              {thread.summary}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 flex-col items-end gap-2">
                          <ThreadStatusBadge status={thread.status} />
                          <span className="text-text-muted text-xs">
                            {thread.updatedAt}
                          </span>
                        </div>
                      </div>

                      {threadPinnedMessage ? (
                        <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl border border-[rgba(209,221,235,0.85)] bg-[rgba(155,232,247,0.12)] p-2.5 px-3 text-xs text-[#46606e] dark:bg-[rgba(21,31,40,0.82)] dark:text-[#9eb1c2]">
                          <Pin size={14} />
                          <span>{threadPinnedMessage.text}</span>
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex w-fit items-center justify-center rounded-full bg-[rgba(44,49,55,0.08)] px-2.5 py-1 text-[11px] font-bold text-[#42515d] dark:bg-white/6 dark:text-[#c6d7e4]">
                            {thread.category}
                          </span>
                          <span className="text-text-muted text-xs">
                            {thread.creator.name} ·{' '}
                            {thread.participants.join(' · ')}
                          </span>
                        </div>
                        <div className="text-text-muted flex flex-row items-center gap-2.5">
                          {thread.unreadCount ? (
                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#2d3137] px-2 text-xs font-bold text-white">
                              {thread.unreadCount}
                            </span>
                          ) : null}
                          <ArrowUpRight size={16} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[20px] border border-dashed border-[rgba(155,232,247,0.6)] bg-white/66 p-[22px] dark:bg-[rgba(21,31,40,0.82)]">
                <strong className="text-text-primary mb-1.5 block">
                  Ничего не найдено
                </strong>
                <p className="m-0 text-[13px] text-[#738290] dark:text-[#9eb1c2]">
                  Попробуйте изменить поисковый запрос или выбрать другую
                  категорию.
                </p>
              </div>
            )}
          </div>
        </section>

        {false ? (
          <>
            <button
              type="button"
              className="threads-modal__backdrop"
              aria-label="Закрыть тред"
              onClick={closeThread}
            />

            <section
              className={`threads-modal ${isMinimizingThread ? 'threads-modal--minimizing' : ''}`.trim()}
            >
              <div className="threads-modal__header">
                <div className="threads-modal__heading">
                  <div className="threads-modal__eyebrow">
                    <Sparkles size={14} />
                    <span>Thread Opened</span>
                  </div>
                  <h3>{selectedThread.title}</h3>
                  <p>{selectedThread.summary}</p>
                </div>

                <button
                  type="button"
                  className="threads-modal__close"
                  aria-label="Закрыть"
                  onClick={closeThread}
                >
                  <X size={18} />
                </button>
              </div>

              <button
                type="button"
                className="threads-modal__minimize"
                aria-label="Свернуть тред"
                onClick={minimizeThreadWindow}
              >
                <Minus size={18} />
              </button>

              <div className="threads-modal__summary">
                <ThreadStatusBadge status={selectedThread.status} />
                <span className="thread-card__category">
                  {selectedThread.category}
                </span>
                <span className="threads-modal__participants">
                  {selectedThread.creator.name} ·{' '}
                  {selectedThread.participants.join(' · ')}
                </span>
                <span className="thread-card__updated">
                  {selectedThread.updatedAt}
                </span>
              </div>

              {pinnedMessage ? (
                <div className="threads-modal__pinned">
                  <Pin size={14} />
                  <div>
                    <strong>Закрепленное сообщение</strong>
                    <span>{pinnedMessage.text}</span>
                  </div>
                </div>
              ) : null}

              <div ref={historyRef} className="threads-modal__history">
                {selectedThreadMessages.map((message) => (
                  <ThreadMessageBubble
                    key={message.id}
                    allMessages={selectedThreadMessages}
                    message={message}
                    onOpenMenu={openMessageMenu}
                  />
                ))}
              </div>

              {menuState && activeMenuMessage
                ? createPortal(
                    <div ref={contextMenuRef}>
                      <ThreadMessageMenu
                        key={`${menuState.messageId}-${menuState.placement}`}
                        copiedMessageId={copiedMessageId}
                        message={activeMenuMessage}
                        placement={menuState.placement}
                        style={{
                          top: menuState.top,
                          left: menuState.left,
                          position: 'fixed',
                        }}
                        onClose={() => setMenuState(null)}
                        onCopy={copyMessage}
                        onEdit={startEdit}
                        onPin={togglePin}
                        onReact={toggleReaction}
                        onRemove={requestMessageRemoval}
                        onReply={startReply}
                      />
                    </div>,
                    document.body,
                  )
                : null}

              {deleteDialogMessageId ? (
                <div
                  className="threads-modal__inline-dialog-backdrop"
                  role="presentation"
                >
                  <div
                    className="threads-modal__inline-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Подтверждение удаления сообщения"
                  >
                    <div className="threads-modal__inline-dialog-copy">
                      <strong>
                        Вы действительно хотите удалить сообщение?
                      </strong>
                      <p>
                        Выберите, как именно удалить сообщение в этом треде.
                      </p>
                    </div>

                    <div className="threads-modal__inline-dialog-actions">
                      <button
                        type="button"
                        onClick={() =>
                          removeMessage(deleteDialogMessageId, 'self')
                        }
                      >
                        Удалить у себя
                      </button>
                      <button
                        type="button"
                        className="threads-modal__inline-dialog-danger"
                        onClick={() =>
                          removeMessage(deleteDialogMessageId, 'everyone')
                        }
                      >
                        Удалить у всех
                      </button>
                    </div>

                    <button
                      type="button"
                      className="threads-modal__inline-dialog-close"
                      aria-label="Закрыть подтверждение удаления"
                      onClick={() => setDeleteDialogMessageId(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : null}

              {composerTarget ? (
                <div className="threads-modal__composer-mode">
                  <div>
                    <strong>
                      {composerMode.type === 'edit'
                        ? 'Редактирование сообщения'
                        : 'Ответ на сообщение'}
                    </strong>
                    <span>{composerTarget.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={resetComposer}
                    aria-label="Отменить действие"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}

              <form
                className={`threads-modal__composer ${isComposerCollapsed ? 'threads-modal__composer--collapsed' : ''}`}
                onSubmit={handleSubmit}
              >
                <div className="threads-modal__composer-top">
                  <div className="threads-modal__toolbar">
                    <button
                      type="button"
                      onClick={() => applyFormatting('bold')}
                      aria-label="Жирный текст"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('italic')}
                      aria-label="Курсив"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('code')}
                      aria-label="Код"
                    >
                      <Code2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('quote')}
                      aria-label="Цитата"
                    >
                      <CornerUpLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting('list')}
                      aria-label="Список"
                    >
                      <List size={16} />
                    </button>
                    <button
                      type="button"
                      className="threads-modal__composer-toggle"
                      aria-label={
                        isComposerCollapsed
                          ? 'Развернуть поле сообщения'
                          : 'Свернуть поле сообщения'
                      }
                      onClick={() =>
                        setIsComposerCollapsed((current) => !current)
                      }
                    >
                      {isComposerCollapsed ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="threads-modal__composer-body">
                  <div className="threads-modal__composer-field">
                    <textarea
                      ref={textareaRef}
                      maxLength={THREAD_MESSAGE_LIMIT}
                      placeholder="Напишите сообщение в тред..."
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                    />
                    <span
                      className={`threads-modal__counter ${remainingCharacters <= 80 ? 'threads-modal__counter--limit' : ''}`}
                    >
                      {draftMessage.length}/{THREAD_MESSAGE_LIMIT}
                    </span>
                  </div>

                  <div className="threads-modal__actions">
                    <button
                      type="button"
                      className={`threads-modal__jump ${shouldShowScrollControl ? 'threads-modal__jump--visible' : ''}`}
                      aria-label="Вернуться наверх"
                      onClick={toggleHistoryScrollDirection}
                    >
                      {isScrollControlPointingDown ? (
                        <ArrowDown size={16} />
                      ) : (
                        <ArrowUp size={16} />
                      )}
                    </button>

                    <button
                      type="submit"
                      className="threads-modal__send"
                      aria-label="Отправить сообщение"
                      disabled={!draftMessage.trim()}
                    >
                      <SendHorizontal size={16} />
                      {composerMode.type === 'edit' ? 'Сохранить' : 'Отправить'}
                    </button>
                  </div>
                </div>
              </form>
            </section>
            {/*

                aria-label="Развернуть тред"
                <ThreadAvatar
                  label={selectedThread.creator.avatar}
                  name={selectedThread.creator.name}
                  className="threads-float-orb__avatar"
                />
                <div className="threads-float-orb__preview">
                  <div className="threads-float-orb__preview-head">
                    <strong>{selectedThread.title}</strong>
                    <span>{latestThreadMessage?.timestamp ?? selectedThread.updatedAt}</span>
                  </div>
                  <p>{latestThreadMessage?.text ?? selectedThread.summary}</p>
                </div>
              </button>
            ) : null}
            */}
          </>
        ) : null}
      </div>
    </DashboardEditorShell>
  );
}
