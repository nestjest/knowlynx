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
  SendHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  THREAD_REACTION_EMOJIS,
  useThreadWindowsStore,
  type ThreadReaction,
  type ThreadReactionMap,
  type UIThreadMessage,
} from '../model/useThreadWindowsStore';
import {
  threadMocksMap,
  type ThreadItem,
  type ThreadMessage,
} from '../../../pages/threads/model/threadMocks';

const THREAD_MESSAGE_LIMIT = 900;
const THREAD_MINIMIZE_ANIMATION_MS = 320;

type ComposerMode =
  | { type: 'new' }
  | { type: 'reply'; messageId: string }
  | { type: 'edit'; messageId: string };

type MenuState = {
  messageId: string;
  top: number;
  left: number;
  placement: 'above' | 'below';
};

const THREAD_AVATAR_BASE =
  'inline-flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9be8f7] to-[#5dc7de] text-[13px] font-extrabold tracking-[0.04em] text-[#173844] shadow-[inset_0_1px_0_rgba(255,255,255,0.44)] dark:from-[#235165] dark:to-[#1d7f95] dark:text-[#eff9fc] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]';

const STATUS_STYLES: Record<ThreadItem['status'], string> = {
  active: 'bg-[rgba(126,217,138,0.18)] text-[#2f7a40]',
  draft: 'bg-[rgba(255,184,107,0.18)] text-[#996126]',
  archived: 'bg-[rgba(176,190,201,0.22)] text-[#586673]',
};

const TOOLBAR_BUTTON =
  'grid size-9 place-items-center rounded-[10px] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)] text-white transition-colors duration-150 hover:bg-[rgba(255,255,255,0.12)]';

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

function ThreadStatusBadge({ status }: { status: ThreadItem['status'] }) {
  const labelMap: Record<ThreadItem['status'], string> = {
    active: 'Активный',
    draft: 'Черновик',
    archived: 'Архив',
  };

  return (
    <span
      className={`inline-flex w-fit items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[status]}`}
    >
      {labelMap[status]}
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
  return text.split('\n').map((line, index) => {
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
        <div key={key} className="flex items-baseline gap-2">
          <span className="h-1 w-1 rounded-full bg-current" />
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

const MENU_BUTTON =
  'flex w-full items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-3 py-2 text-left text-sm text-[#24313b] transition-colors duration-150 hover:bg-[rgba(155,232,247,0.14)] dark:text-[#eef5fb] dark:hover:bg-[rgba(48,114,132,0.22)]';

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
  const placementClass =
    placement === 'above' ? '-translate-y-full' : 'translate-y-0';

  return (
    <div
      className={`fixed z-[80] flex w-[248px] flex-col gap-0.5 rounded-2xl border border-[rgba(209,221,235,0.92)] bg-white/96 p-2 shadow-[0_18px_36px_rgba(37,50,63,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-[18px] dark:bg-[rgba(15,23,30,0.96)] dark:shadow-[0_18px_36px_rgba(4,8,12,0.36)] ${placementClass}`}
      style={style}
      role="menu"
      aria-label="Действия с сообщением"
    >
      <div className="mb-1 flex items-center gap-1 border-b border-[rgba(219,229,238,0.6)] pb-1.5 dark:border-[rgba(42,60,74,0.6)]">
        {THREAD_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="grid size-8 place-items-center rounded-[10px] border-0 bg-transparent text-base transition-colors duration-150 hover:bg-[rgba(155,232,247,0.14)] dark:hover:bg-[rgba(48,114,132,0.22)]"
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
        className={MENU_BUTTON}
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
        className={MENU_BUTTON}
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
          className={MENU_BUTTON}
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
        className={MENU_BUTTON}
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
          className={`${MENU_BUTTON} text-[#c44151] hover:bg-[rgba(196,65,81,0.12)] dark:text-[#ff8590] dark:hover:bg-[rgba(196,65,81,0.18)]`}
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
        className="inline-flex max-w-full items-center gap-2.5 self-center p-0 text-center text-[13px] leading-[1.5] text-white/76"
        role="status"
        aria-label={authorLabel}
        onContextMenu={(event) => onOpenMenu(event, message.id)}
      >
        <span className="text-white/48 dark:text-white/84">{message.text}</span>
        <span className="text-xs text-white/48 dark:text-white/54">
          {message.timestamp}
        </span>
      </div>
    );
  }

  const isUser = message.author === 'user';
  const wrapperAlign = isUser ? 'self-end' : 'self-start';
  const bubbleStyles = isUser
    ? 'border-[rgba(158,224,239,0.78)] bg-[linear-gradient(135deg,rgba(227,246,250,0.82)_0%,rgba(183,232,242,0.78)_100%)] dark:border-[rgba(111,201,223,0.42)] dark:bg-[linear-gradient(135deg,rgba(54,97,118,0.96)_0%,rgba(39,122,143,0.88)_100%)]'
    : 'border-[rgba(231,238,244,0.95)] bg-white/96 dark:border-[rgba(84,101,116,0.95)] dark:bg-[rgba(241,245,249,0.96)]';

  return (
    <article
      className={`relative max-w-[88%] rounded-[20px] border p-4 px-[18px] shadow-[0_14px_28px_rgba(28,43,56,0.08)] ${wrapperAlign} ${bubbleStyles}`}
      onContextMenu={(event) => onOpenMenu(event, message.id)}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <ThreadAvatar
          label={getMessageAvatar(message.author)}
          name={authorLabel}
          className={
            isUser
              ? 'size-[34px] rounded-full bg-white/24 text-inherit'
              : 'size-[34px] rounded-full bg-gradient-to-br from-[#d8f7ff] to-[#b7effb] text-[#204956]'
          }
        />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <strong
            className={`text-[13px] ${isUser ? 'text-[#22303c] dark:text-[#f4fbff]' : 'text-[#22303c]'}`}
          >
            {authorLabel}
          </strong>
          <span
            className={`text-xs ${isUser ? 'text-[#6e7d8a] dark:text-white/78' : 'text-[#6e7d8a] dark:text-[#6c7a87]'}`}
          >
            {message.timestamp}
            {message.isEdited ? ' · изменено' : ''}
          </span>
        </div>
      </div>

      {repliedMessage ? (
        <div className="mb-2 flex items-start gap-2.5 rounded-2xl border border-[rgba(209,221,235,0.85)] bg-white/55 p-2.5 dark:border-[rgba(42,60,74,0.85)] dark:bg-[rgba(21,31,40,0.55)]">
          <strong className="text-xs text-[#3a4a58] dark:text-[#cdd8e2]">
            {getMessageAuthorLabel(repliedMessage.author)}
          </strong>
          <span className="truncate text-xs text-[#66757f] dark:text-[#9eb1c2]">
            {repliedMessage.text}
          </span>
        </div>
      ) : null}

      <div
        className={`flex flex-col gap-2 text-sm leading-[1.55] ${isUser ? 'text-[#415161] dark:text-[#f4fbff]' : 'text-[#415161] dark:text-[#24313b]'} [&_blockquote]:m-0 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[rgba(155,232,247,0.6)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded-md [&_code]:bg-[rgba(44,49,55,0.1)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em]`}
      >
        {renderFormattedText(message.text)}
      </div>

      {message.reactions && Object.keys(message.reactions).length ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {Object.entries(message.reactions).map(([emoji, count]) => (
            <span
              key={emoji}
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(219,229,238,0.8)] bg-white/72 px-2 py-0.5 text-xs text-[#3a4a58] dark:border-[rgba(42,60,74,0.85)] dark:bg-[rgba(21,31,40,0.72)] dark:text-[#cdd8e2]"
            >
              {emoji} {count}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ThreadChatModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const minimizeTimeoutRef = useRef<number | null>(null);
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
  const setThreadMessages = useThreadWindowsStore(
    (state) => state.setThreadMessages,
  );
  const closeActiveThread = useThreadWindowsStore(
    (state) => state.closeActiveThread,
  );
  const minimizeThread = useThreadWindowsStore((state) => state.minimizeThread);
  const selectedThread = activeThreadId ? threadMocksMap[activeThreadId] : null;
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
    setDraftMessage('');
    setComposerMode({ type: 'new' });
    setIsComposerCollapsed(false);
    setIsMinimizingThread(false);
  }, [activeThreadId]);

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
    const historyElement = historyRef.current;

    if (!historyElement || !selectedThread) {
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
  }, [selectedThread?.id, selectedThreadMessages.length]);

  useEffect(() => {
    if (!selectedThread || !historyRef.current) {
      return;
    }

    window.requestAnimationFrame(() => {
      historyRef.current?.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [selectedThread?.id, selectedThreadMessages.length]);

  if (!selectedThread) {
    return null;
  }

  function updateMessages(
    updater: (messages: UIThreadMessage[]) => UIThreadMessage[],
  ) {
    setThreadMessages(selectedThread.id, updater);
  }

  function clearMinimizeAnimation() {
    if (minimizeTimeoutRef.current) {
      window.clearTimeout(minimizeTimeoutRef.current);
      minimizeTimeoutRef.current = null;
    }
  }

  function closeThread() {
    clearMinimizeAnimation();
    closeActiveThread();
    if (location.pathname.startsWith('/threads/')) {
      navigate('/threads');
    }
  }

  function minimizeThreadWindow() {
    if (isMinimizingThread) {
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
      closeActiveThread();
      setIsMinimizingThread(false);
      minimizeTimeoutRef.current = null;
      if (location.pathname.startsWith('/threads/')) {
        navigate('/threads');
      }
    }, THREAD_MINIMIZE_ANIMATION_MS);
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
      case 'quote':
        inserted = (selected || 'цитата')
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n');
        caretEnd = start + inserted.length;
        break;
      case 'list':
        inserted = (selected || 'пункт списка')
          .split('\n')
          .map((line) => `- ${line}`)
          .join('\n');
        caretEnd = start + inserted.length;
        break;
    }

    const nextValue = `${draftMessage.slice(0, start)}${inserted}${draftMessage.slice(end)}`;
    setDraftMessage(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(caretStart, caretEnd);
    });
  }

  function submitCurrentDraft() {
    if (!draftMessage.trim()) {
      return;
    }

    if (composerMode.type === 'edit') {
      updateMessages((messages) =>
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

    updateMessages((messages) => [...messages, nextMessage]);
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
    updateMessages((messages) =>
      messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              reactions: {
                ...message.reactions,
                [emoji]: (message.reactions?.[emoji] ?? 0) + 1,
              } as ThreadReactionMap,
            }
          : message,
      ),
    );
  }

  function togglePin(messageId: string) {
    updateMessages((messages) =>
      messages.map((message) => ({
        ...message,
        isPinned: message.id === messageId ? !message.isPinned : false,
      })),
    );
  }

  function removeMessage(messageId: string, mode: 'self' | 'everyone') {
    updateMessages((messages) => {
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
    <>
      <button
        type="button"
        className="fixed inset-0 z-[27] border-0 bg-[linear-gradient(180deg,rgba(15,21,28,0.04)_0%,rgba(15,21,28,0.32)_100%)]"
        aria-label="Закрыть тред"
        onClick={closeThread}
      />

      <section
        className={`fixed bottom-[96px] left-1/2 z-[29] mb-2.5 flex max-h-[72vh] w-[min(960px,calc(100vw-64px))] -translate-x-1/2 [animation:drawer-slide-up_240ms_ease] flex-col gap-3.5 rounded-t-3xl rounded-b-[18px] border border-white/18 bg-[rgba(54,49,52,0.78)] p-5 shadow-[0_20px_42px_rgba(48,35,40,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[22px] max-lg:bottom-[84px] max-lg:h-[78vh] max-lg:max-h-[78vh] max-lg:w-[min(100%,calc(100vw-32px))] max-lg:rounded-[26px] max-lg:p-4 dark:border-[rgba(60,82,98,0.28)] dark:bg-[rgba(12,18,24,0.92)] ${isMinimizingThread ? 'pointer-events-none [animation:threads-modal-minimize-soft_320ms_ease_forwards] opacity-0' : ''}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[rgba(155,232,247,0.22)] px-2 py-1 text-[11px] font-bold tracking-[0.06em] text-[#b9eef8] uppercase">
              <Sparkles size={14} />
              <span>Thread Opened</span>
            </div>
            <h3 className="m-0 text-xl text-white">{selectedThread.title}</h3>
            <p className="m-0 text-[13px] text-white/72">
              {selectedThread.summary}
            </p>
          </div>

          <button
            type="button"
            className="size-[34px] flex-shrink-0 rounded-[10px] border border-white/18 bg-white/8 text-white transition-colors duration-150 hover:bg-white/16"
            aria-label="Закрыть"
            onClick={closeThread}
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          className="absolute top-[18px] right-[52px] size-[34px] rounded-[10px] border border-white/18 bg-white/8 text-white transition-colors duration-150 hover:bg-white/16 dark:border-[rgba(60,82,98,0.46)] dark:bg-[rgba(22,30,40,0.72)] dark:text-[#dbe8f2]"
          aria-label="Свернуть тред"
          onClick={minimizeThreadWindow}
        >
          <Minus size={18} />
        </button>

        <div className="flex flex-wrap items-center gap-2 text-xs text-white/78">
          <ThreadStatusBadge status={selectedThread.status} />
          <span className="inline-flex w-fit items-center justify-center rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-white/84">
            {selectedThread.category}
          </span>
          <span className="text-white/72">
            {selectedThread.creator.name} ·{' '}
            {selectedThread.participants.join(' · ')}
          </span>
          <span className="text-white/56">{selectedThread.updatedAt}</span>
        </div>

        {pinnedMessage ? (
          <div className="flex items-start gap-2.5 rounded-2xl border border-white/14 bg-white/6 p-2.5 px-3 text-white dark:border-[rgba(60,82,98,0.38)] dark:bg-[rgba(22,30,40,0.62)]">
            <Pin size={14} className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <strong className="block text-xs text-white/88">
                Закрепленное сообщение
              </strong>
              <span className="block truncate text-xs text-white/70">
                {pinnedMessage.text}
              </span>
            </div>
          </div>
        ) : null}

        <div
          ref={historyRef}
          className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto rounded-[18px] bg-[rgba(13,18,24,0.52)] p-4"
        >
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
            className="absolute inset-0 z-[50] flex items-center justify-center rounded-t-3xl rounded-b-[18px] bg-[rgba(12,18,24,0.72)] backdrop-blur-sm"
            role="presentation"
          >
            <div
              className="relative w-[min(420px,calc(100%-48px))] rounded-3xl border border-white/18 bg-[rgba(36,33,38,0.98)] p-5 shadow-[0_24px_48px_rgba(4,8,12,0.48)] dark:border-[rgba(60,82,98,0.6)] dark:bg-[rgba(14,20,28,0.98)]"
              role="dialog"
              aria-modal="true"
              aria-label="Подтверждение удаления сообщения"
            >
              <div className="mb-4 flex flex-col gap-1.5 pr-8">
                <strong className="text-base text-white">
                  Вы действительно хотите удалить сообщение?
                </strong>
                <p className="m-0 text-[13px] text-white/68">
                  Выберите, как именно удалить сообщение в этом треде.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-[10px] border border-white/18 bg-white/6 px-3.5 py-2.5 text-sm text-white transition-colors duration-150 hover:bg-white/12 dark:border-[rgba(60,82,98,0.5)] dark:bg-[rgba(22,30,40,0.82)] dark:text-[#dbe8f2]"
                  onClick={() => removeMessage(deleteDialogMessageId, 'self')}
                >
                  Удалить у себя
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[10px] border border-[rgba(196,65,81,0.5)] bg-[rgba(196,65,81,0.2)] px-3.5 py-2.5 text-sm text-[#ffc5cb] transition-colors duration-150 hover:bg-[rgba(196,65,81,0.32)] dark:border-[rgba(156,86,99,0.54)] dark:bg-[rgba(60,26,32,0.72)] dark:text-[#f0c2ca]"
                  onClick={() =>
                    removeMessage(deleteDialogMessageId, 'everyone')
                  }
                >
                  Удалить у всех
                </button>
              </div>

              <button
                type="button"
                className="absolute top-3 right-3 grid size-7 place-items-center rounded-full border-0 bg-white/8 text-white transition-colors duration-150 hover:bg-white/16 dark:bg-[rgba(22,30,40,0.62)]"
                aria-label="Закрыть подтверждение удаления"
                onClick={() => setDeleteDialogMessageId(null)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : null}

        {composerTarget ? (
          <div className="flex items-start gap-2.5 rounded-2xl border border-white/14 bg-white/6 p-2.5 px-3 text-white dark:border-[rgba(60,82,98,0.38)] dark:bg-[rgba(22,30,40,0.62)]">
            <div className="min-w-0 flex-1">
              <strong className="block text-xs text-white/88">
                {composerMode.type === 'edit'
                  ? 'Редактирование сообщения'
                  : 'Ответ на сообщение'}
              </strong>
              <span className="block truncate text-xs text-white/70">
                {composerTarget.text}
              </span>
            </div>
            <button
              type="button"
              className="grid size-6 flex-shrink-0 place-items-center rounded-full border-0 bg-white/10 text-white transition-colors duration-150 hover:bg-white/18"
              onClick={resetComposer}
              aria-label="Отменить действие"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

        <form
          className={`flex flex-col gap-2.5 rounded-[18px] border border-white/14 bg-white/6 p-3 dark:border-[rgba(60,82,98,0.38)] dark:bg-[rgba(22,30,40,0.62)] ${isComposerCollapsed ? '[&_textarea]:max-h-10 [&_textarea]:min-h-10' : ''}`}
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                className={TOOLBAR_BUTTON}
                onClick={() => applyFormatting('bold')}
                aria-label="Жирный текст"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                className={TOOLBAR_BUTTON}
                onClick={() => applyFormatting('italic')}
                aria-label="Курсив"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                className={TOOLBAR_BUTTON}
                onClick={() => applyFormatting('code')}
                aria-label="Код"
              >
                <Code2 size={16} />
              </button>
              <button
                type="button"
                className={TOOLBAR_BUTTON}
                onClick={() => applyFormatting('quote')}
                aria-label="Цитата"
              >
                <CornerUpLeft size={16} />
              </button>
              <button
                type="button"
                className={TOOLBAR_BUTTON}
                onClick={() => applyFormatting('list')}
                aria-label="Список"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={TOOLBAR_BUTTON}
                aria-label={
                  isComposerCollapsed
                    ? 'Развернуть поле сообщения'
                    : 'Свернуть поле сообщения'
                }
                onClick={() => setIsComposerCollapsed((current) => !current)}
              >
                {isComposerCollapsed ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 max-lg:grid-cols-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="min-h-[84px] w-full resize-y rounded-[14px] border border-white/14 bg-[rgba(13,18,24,0.56)] p-3.5 pb-7 text-sm text-white outline-none placeholder:text-white/42 focus:border-white/30 dark:border-[rgba(60,82,98,0.4)] dark:bg-[rgba(11,16,22,0.72)]"
                maxLength={THREAD_MESSAGE_LIMIT}
                placeholder="Напишите сообщение в тред..."
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />
              <span
                className={`absolute right-3 bottom-2 text-xs ${remainingCharacters <= 80 ? 'text-[#ffb0b0]' : 'text-white/48'}`}
              >
                {draftMessage.length}/{THREAD_MESSAGE_LIMIT}
              </span>
            </div>

            <div className="flex flex-col items-end justify-between gap-2.5">
              <button
                type="button"
                className={`grid size-9 place-items-center rounded-full border border-white/16 bg-white/8 text-white transition-[opacity,background] duration-150 hover:bg-white/16 ${shouldShowScrollControl ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-label={
                  isScrollControlPointingDown
                    ? 'Перейти вниз'
                    : 'Вернуться наверх'
                }
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
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[rgba(93,199,222,0.6)] bg-gradient-to-br from-[#9be8f7] to-[#5dc7de] px-4 text-sm font-bold text-[#275d69] transition-[background,box-shadow] duration-200 hover:shadow-[0_4px_16px_rgba(93,199,222,0.3)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[rgba(88,174,199,0.4)] dark:from-[#235165] dark:to-[#1d7f95] dark:text-[#e8f8fc]"
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
    </>
  );
}
