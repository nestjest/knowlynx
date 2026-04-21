import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  Bold,
  Code2,
  Copy,
  CornerUpLeft,
  Edit3,
  Italic,
  List,
  MessageSquareReply,
  Pin,
  Search,
  SendHorizontal,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { DashboardEditorShell } from '../../../widgets/shell/ui/DashboardEditorShell';
import { threadMocks, threadMocksMap, type ThreadItem, type ThreadMessage } from '../model/threadMocks';

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

type MenuState = {
  messageId: string;
  top: number;
  left: number;
  placement: 'above' | 'below';
};

function ThreadAvatar({ label, name, className = '' }: { label: string; name: string; className?: string }) {
  return (
    <span className={`thread-avatar ${className}`.trim()} aria-label={name} title={name}>
      {label}
    </span>
  );
}

function ThreadStatusBadge({ status }: { status: ThreadItem['status'] }) {
  const labelMap: Record<ThreadItem['status'], string> = {
    active: 'Активный',
    draft: 'Черновик',
    archived: 'Архив'
  };

  return <span className={`threads-page__status threads-page__status--${status}`}>{labelMap[status]}</span>;
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
      return <blockquote key={key} dangerouslySetInnerHTML={{ __html: renderInlineMarkup(line.slice(2)) }} />;
    }

    if (line.startsWith('- ')) {
      return (
        <div key={key} className="thread-message__list-item">
          <span />
          <span dangerouslySetInnerHTML={{ __html: renderInlineMarkup(line.slice(2)) }} />
        </div>
      );
    }

    return <div key={key} dangerouslySetInnerHTML={{ __html: renderInlineMarkup(line) }} />;
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
  onReply
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
  const repliedMessage = message.replyToId ? findMessage(allMessages, message.replyToId) : null;

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

      <div className="thread-history__message-body">{renderFormattedText(message.text)}</div>

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ThreadItem['category']>('all');
  const [draftMessage, setDraftMessage] = useState('');
  const [composerMode, setComposerMode] = useState<ComposerMode>({ type: 'new' });
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<Record<string, UIThreadMessage[]>>(
    Object.fromEntries(
      threadMocks.map((thread) => [
        thread.id,
        thread.messages.map((message) => ({
          ...message,
          reactions: {}
        }))
      ])
    )
  );

  const categories = Array.from(new Set(threadMocks.map((thread) => thread.category)));
  const topCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    threadMocks.forEach((thread) => {
      categoryMap.set(thread.category, (categoryMap.get(thread.category) ?? 0) + 1);
    });

    return Array.from(categoryMap.entries()).sort((left, right) => right[1] - left[1])[0] ?? null;
  }, []);
  const latestThread = useMemo(
    () =>
      [...threadMocks].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt, 'ru'))[0] ?? null,
    []
  );
  const uniquePeopleCount = useMemo(
    () =>
      new Set(
        threadMocks.flatMap((thread) => [thread.creator.name, ...thread.participants])
      ).size,
    []
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredThreads = threadMocks.filter((thread) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      thread.title.toLowerCase().includes(normalizedQuery) ||
      thread.summary.toLowerCase().includes(normalizedQuery) ||
      thread.participants.some((participant) => participant.toLowerCase().includes(normalizedQuery)) ||
      thread.creator.name.toLowerCase().includes(normalizedQuery);
    const matchesCategory = selectedCategory === 'all' || thread.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const selectedThread = threadId ? threadMocksMap[threadId] : null;
  const selectedThreadMessages = selectedThread ? threadMessages[selectedThread.id] ?? [] : [];
  const pinnedMessage = useMemo(
    () => selectedThreadMessages.find((message) => message.isPinned) ?? null,
    [selectedThreadMessages]
  );
  const activeMenuMessage = menuState ? findMessage(selectedThreadMessages, menuState.messageId) : null;
  const composerTarget =
    composerMode.type === 'new' ? null : findMessage(selectedThreadMessages, composerMode.messageId);
  const remainingCharacters = THREAD_MESSAGE_LIMIT - draftMessage.length;

  useEffect(() => {
    if (!menuState) {
      return undefined;
    }

    function handleClickOutside(event: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
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
    setMenuState(null);
    setCopiedMessageId(null);
  }, [threadId]);

  if (threadId && !selectedThread) {
    return <Navigate to="/threads" replace />;
  }

  function updateThreadMessages(threadKey: string, updater: (messages: UIThreadMessage[]) => UIThreadMessage[]) {
    setThreadMessages((current) => ({
      ...current,
      [threadKey]: updater(current[threadKey] ?? [])
    }));
  }

  function openThread(id: string) {
    navigate(`/threads/${id}`);
  }

  function closeThread() {
    navigate('/threads');
    setDraftMessage('');
    setComposerMode({ type: 'new' });
    setMenuState(null);
  }

  function resetComposer() {
    setDraftMessage('');
    setComposerMode({ type: 'new' });
  }

  function applyFormatting(type: 'bold' | 'italic' | 'code' | 'quote' | 'list') {
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
        const lines = (selected || 'цитата').split('\n').map((line) => `> ${line}`);
        inserted = lines.join('\n');
        caretStart = start;
        caretEnd = start + inserted.length;
        break;
      }
      case 'list': {
        const lines = (selected || 'пункт списка').split('\n').map((line) => `- ${line}`);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
                timestamp: 'Сейчас'
              }
            : message
        )
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
      replyToId: composerMode.type === 'reply' ? composerMode.messageId : null
    };

    updateThreadMessages(selectedThread.id, (messages) => [...messages, nextMessage]);
    resetComposer();
  }

  function openMessageMenu(event: ReactMouseEvent<HTMLElement>, messageId: string) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = Math.min(248, window.innerWidth - 24);
    const viewportPadding = 12;
    const left = Math.min(
      Math.max(rect.right - menuWidth, viewportPadding),
      window.innerWidth - menuWidth - viewportPadding
    );
    const shouldPlaceAbove = rect.bottom + 220 > window.innerHeight && rect.top > 220;

    setMenuState({
      messageId,
      left,
      top: shouldPlaceAbove ? rect.top - 8 : rect.bottom + 8,
      placement: shouldPlaceAbove ? 'above' : 'below'
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
                [emoji]: (message.reactions?.[emoji] ?? 0) + 1
              }
            }
          : message
      )
    );
  }

  function togglePin(messageId: string) {
    if (!selectedThread) {
      return;
    }

    updateThreadMessages(selectedThread.id, (messages) =>
      messages.map((message) => ({
        ...message,
        isPinned: message.id === messageId ? !message.isPinned : false
      }))
    );
  }

  function removeMessage(messageId: string) {
    if (!selectedThread) {
      return;
    }

    updateThreadMessages(selectedThread.id, (messages) => messages.filter((message) => message.id !== messageId));

    if (composerMode.type !== 'new' && composerMode.messageId === messageId) {
      resetComposer();
    }
  }

  function startReply(message: UIThreadMessage) {
    setComposerMode({ type: 'reply', messageId: message.id });
    setDraftMessage('');
    textareaRef.current?.focus();
  }

  function startEdit(message: UIThreadMessage) {
    setComposerMode({ type: 'edit', messageId: message.id });
    setDraftMessage(message.text);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  return (
    <DashboardEditorShell>
      <div className="threads-page">
        <section className="threads-page__hero">
          <div className="threads-page__hero-copy">
            <div className="threads-page__eyebrow">
              <Sparkles size={14} />
              <span>Threads</span>
            </div>
            <h1 className="threads-page__title">Ваши треды по профилю и рабочим сценариям</h1>
            <p className="threads-page__subtitle">
              Пока это визуальная заглушка: здесь можно оценить список тредов, карточки и просмотр истории внутри выбранного диалога.
            </p>

            <div className="threads-page__hero-insights">
              <article className="threads-page__hero-insight">
                <span className="threads-page__hero-insight-label">Главный фокус</span>
                <strong>{topCategory?.[0] ?? 'Без категории'}</strong>
                <p>{topCategory ? `${topCategory[1]} треда в этой группе` : 'Категории появятся позже'}</p>
              </article>

              <article className="threads-page__hero-insight">
                <span className="threads-page__hero-insight-label">Последний апдейт</span>
                <strong>{latestThread?.title ?? 'Новый тред'}</strong>
                <p>{latestThread?.summary ?? 'Здесь будет краткое описание активности.'}</p>
              </article>
            </div>

            <div className="threads-page__hero-strip">
              <div className="threads-page__hero-avatars" aria-hidden="true">
                {threadMocks.slice(0, 3).map((thread) => (
                  <ThreadAvatar
                    key={thread.id}
                    label={thread.creator.avatar}
                    name={thread.creator.name}
                    className="threads-page__hero-avatar"
                  />
                ))}
              </div>

              <div className="threads-page__hero-strip-copy">
                <strong>{uniquePeopleCount} участников уже в моках</strong>
                <span>Быстрый обзор тредов, авторов и сценариев прямо из профиля.</span>
              </div>
            </div>
          </div>

          <div className="threads-page__hero-stats">
            <article className="threads-page__hero-stat">
              <span>Всего тредов</span>
              <strong>{threadMocks.length}</strong>
            </article>
            <article className="threads-page__hero-stat">
              <span>Активных сейчас</span>
              <strong>{threadMocks.filter((thread) => thread.status === 'active').length}</strong>
            </article>
            <article className="threads-page__hero-stat">
              <span>Новых сообщений</span>
              <strong>{threadMocks.reduce((count, thread) => count + thread.unreadCount, 0)}</strong>
            </article>
          </div>
        </section>

        <section className="threads-page__list-panel">
          <div className="threads-page__panel-head">
            <div>
              <p className="threads-page__panel-eyebrow">Список тредов</p>
              <h2>Созданные пользователем обсуждения</h2>
            </div>
            <span className="threads-page__panel-meta">Мок-данные</span>
          </div>

          <div className="threads-page__controls">
            <label className="threads-page__search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Поиск по названию, описанию или участникам"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="threads-page__filters" role="tablist" aria-label="Фильтрация тредов по категориям">
              <button
                type="button"
                className={`threads-page__filter ${selectedCategory === 'all' ? 'threads-page__filter--active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Все
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`threads-page__filter ${selectedCategory === category ? 'threads-page__filter--active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="threads-page__list threads-page__list--rows">
            {filteredThreads.length ? (
              filteredThreads.map((thread) => {
                const isActive = selectedThread?.id === thread.id;
                const threadPinnedMessage = (threadMessages[thread.id] ?? []).find((message) => message.isPinned);

                return (
                  <button
                    key={thread.id}
                    type="button"
                    className={`thread-card thread-card--row ${isActive ? 'thread-card--active' : ''}`}
                    onClick={() => openThread(thread.id)}
                  >
                    <div className="thread-card__accent" style={{ background: thread.accent }} />
                    <div className="thread-card__body">
                      <div className="thread-card__top">
                        <div className="thread-card__identity">
                          <ThreadAvatar label={thread.creator.avatar} name={thread.creator.name} />
                          <div className="thread-card__heading">
                            <h3>{thread.title}</h3>
                            <p>{thread.summary}</p>
                          </div>
                        </div>
                        <div className="thread-card__meta">
                          <ThreadStatusBadge status={thread.status} />
                          <span className="thread-card__updated">{thread.updatedAt}</span>
                        </div>
                      </div>

                      {threadPinnedMessage ? (
                        <div className="thread-card__pinned-preview">
                          <Pin size={14} />
                          <span>{threadPinnedMessage.text}</span>
                        </div>
                      ) : null}

                      <div className="thread-card__footer">
                        <div className="thread-card__footer-main">
                          <span className="thread-card__category">{thread.category}</span>
                          <span className="thread-card__participants">
                            {thread.creator.name} · {thread.participants.join(' · ')}
                          </span>
                        </div>
                        <div className="thread-card__side">
                          {thread.unreadCount ? <span className="thread-card__counter">{thread.unreadCount}</span> : null}
                          <ArrowUpRight size={16} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="threads-page__empty">
                <strong>Ничего не найдено</strong>
                <p>Попробуйте изменить поисковый запрос или выбрать другую категорию.</p>
              </div>
            )}
          </div>
        </section>

        {selectedThread ? (
          <>
            <button type="button" className="threads-modal__backdrop" aria-label="Закрыть тред" onClick={closeThread} />

            <section className="threads-modal">

              <div className="threads-modal__header">
                <div className="threads-modal__heading">
                  <div className="threads-modal__eyebrow">
                    <Sparkles size={14} />
                    <span>Thread Opened</span>
                  </div>
                  <h3>{selectedThread.title}</h3>
                  <p>{selectedThread.summary}</p>
                </div>

                <button type="button" className="threads-modal__close" aria-label="Закрыть" onClick={closeThread}>
                  <X size={18} />
                </button>
              </div>

              <div className="threads-modal__summary">
                <ThreadStatusBadge status={selectedThread.status} />
                <span className="thread-card__category">{selectedThread.category}</span>
                <span className="threads-modal__participants">
                  {selectedThread.creator.name} · {selectedThread.participants.join(' · ')}
                </span>
                <span className="thread-card__updated">{selectedThread.updatedAt}</span>
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

              <div className="threads-modal__history">
                {selectedThreadMessages.map((message) => (
                  <ThreadMessageBubble
                    key={message.id}
                    allMessages={selectedThreadMessages}
                    message={message}
                    onOpenMenu={openMessageMenu}
                  />
                ))}
              </div>

              {menuState && activeMenuMessage ? (
                createPortal(
                  <div ref={contextMenuRef}>
                    <ThreadMessageMenu
                      copiedMessageId={copiedMessageId}
                      message={activeMenuMessage}
                      placement={menuState.placement}
                      style={{ top: menuState.top, left: menuState.left, position: 'fixed' }}
                      onClose={() => setMenuState(null)}
                      onCopy={copyMessage}
                      onEdit={startEdit}
                      onPin={togglePin}
                      onReact={toggleReaction}
                      onRemove={removeMessage}
                      onReply={startReply}
                    />
                  </div>,
                  document.body
                )
              ) : null}

              {composerTarget ? (
                <div className="threads-modal__composer-mode">
                  <div>
                    <strong>{composerMode.type === 'edit' ? 'Редактирование сообщения' : 'Ответ на сообщение'}</strong>
                    <span>{composerTarget.text}</span>
                  </div>
                  <button type="button" onClick={resetComposer} aria-label="Отменить действие">
                    <X size={14} />
                  </button>
                </div>
              ) : null}

              <form className="threads-modal__composer" onSubmit={handleSubmit}>
                <div className="threads-modal__toolbar">
                  <button type="button" onClick={() => applyFormatting('bold')} aria-label="Жирный текст">
                    <Bold size={16} />
                  </button>
                  <button type="button" onClick={() => applyFormatting('italic')} aria-label="Курсив">
                    <Italic size={16} />
                  </button>
                  <button type="button" onClick={() => applyFormatting('code')} aria-label="Код">
                    <Code2 size={16} />
                  </button>
                  <button type="button" onClick={() => applyFormatting('quote')} aria-label="Цитата">
                    <CornerUpLeft size={16} />
                  </button>
                  <button type="button" onClick={() => applyFormatting('list')} aria-label="Список">
                    <List size={16} />
                  </button>
                </div>

                <div className="threads-modal__composer-field">
                  <textarea
                    ref={textareaRef}
                    maxLength={THREAD_MESSAGE_LIMIT}
                    placeholder="Напишите сообщение в тред..."
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                  />
                  <span className={`threads-modal__counter ${remainingCharacters <= 80 ? 'threads-modal__counter--limit' : ''}`}>
                    {draftMessage.length}/{THREAD_MESSAGE_LIMIT}
                  </span>
                </div>

                <button
                  type="submit"
                  className="threads-modal__send"
                  aria-label="Отправить сообщение"
                  disabled={!draftMessage.trim()}
                >
                  <SendHorizontal size={16} />
                  {composerMode.type === 'edit' ? 'Сохранить' : 'Отправить'}
                </button>
              </form>
            </section>
          </>
        ) : null}
      </div>
    </DashboardEditorShell>
  );
}
