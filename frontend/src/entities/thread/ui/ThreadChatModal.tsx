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
      className={`thread-avatar ${className}`.trim()}
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
    <span className={`threads-page__status threads-page__status--${status}`}>
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
        {THREAD_REACTION_EMOJIS.map((emoji) => (
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
                <strong>Вы действительно хотите удалить сообщение?</strong>
                <p>Выберите, как именно удалить сообщение в этом треде.</p>
              </div>

              <div className="threads-modal__inline-dialog-actions">
                <button
                  type="button"
                  onClick={() => removeMessage(deleteDialogMessageId, 'self')}
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
    </>
  );
}
