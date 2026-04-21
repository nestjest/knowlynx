import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Sun, Moon, X } from 'lucide-react';
import logoUrl from '../../../app/logo.svg';
import { dashboardEditorPanelTemplates } from '../../../entities/panel/model/dashboardEditorData';
import { quickAccessWidgetPresets } from '../../../entities/quick-access/model/quickAccessEditorData';
import { ThreadChatModal } from '../../../entities/thread/ui/ThreadChatModal';
import { threadMocksMap } from '../../../pages/threads/model/threadMocks';
import { useThreadWindowsStore } from '../../../entities/thread/model/useThreadWindowsStore';
import { useDashboardEditorStore } from '../../../shared/model/useDashboardEditorStore';

type NavItem = {
  id: string;
  label: string;
  path?: string;
};

const headerNavItems: NavItem[] = [
  { id: 'home', label: 'Главная', path: '/' },
  { id: 'courses', label: 'Курсы' },
  { id: 'assignments', label: 'Задания' },
  { id: 'practice', label: 'Практика' },
  { id: 'library', label: 'Библиотека' },
  { id: 'faq', label: 'FAQ' },
];

const bottomNavItems: NavItem[] = [
  { id: 'best', label: 'Лучшие', path: '/' },
  { id: 'threads', label: 'Треды', path: '/threads' },
  { id: 'teachers', label: 'Преподаватели' },
  { id: 'analytics', label: 'Аналитика' },
];

type DashboardEditorShellProps = {
  children: ReactNode;
};

type DrawerPreview = {
  id: string;
  title: string;
  description: string;
  mode: 'blocks' | 'widgets';
};

type SiteSearchSuggestion = {
  id: string;
  title: string;
  meta: string;
};

const siteSearchSuggestions: SiteSearchSuggestion[] = [
  { id: 'search-schedule', title: 'Расписание на неделю', meta: 'Раздел расписания' },
  { id: 'search-sql', title: 'Лабораторная по SQL', meta: 'Ближайшие дедлайны' },
  { id: 'search-web', title: 'Веб-разработка', meta: 'Текущий курс' },
  { id: 'search-messages', title: 'Сообщения преподавателей', meta: 'Коммуникации' },
  { id: 'search-library', title: 'Библиотека материалов', meta: 'Учебные ресурсы' },
  { id: 'search-faq', title: 'Часто задаваемые вопросы', meta: 'FAQ' },
];

const HEADER_LINK_ACTIVE_BG =
  'bg-gradient-to-r from-[rgba(155,232,247,0.26)] to-[rgba(188,238,255,0.32)] dark:from-[rgba(48,114,132,0.38)] dark:to-[rgba(63,140,162,0.34)]';

const HEADER_LINK_ACTIVE_BORDER =
  'dark:border-[rgba(88,174,199,0.4)] dark:text-[#eaf8fd]';

const ICON_BUTTON_BASE =
  'grid size-[42px] place-items-center rounded-xl border border-[var(--control-border)] bg-[var(--control-bg)] text-[var(--control-text)] transition-[background,color,border-color] duration-200 hover:bg-gradient-to-r hover:from-[rgba(155,232,247,0.26)] hover:to-[rgba(188,238,255,0.32)] hover:border-[var(--accent-soft-border)] hover:text-[var(--accent-soft-text)] dark:border-[rgba(57,78,95,0.95)] dark:bg-[rgba(21,31,40,0.96)] dark:text-[#dbe8f2] dark:shadow-none dark:hover:from-[rgba(48,114,132,0.38)] dark:hover:to-[rgba(63,140,162,0.34)] dark:hover:border-[rgba(88,174,199,0.4)] dark:hover:text-[#eaf8fd]';

const PREVIEW_BOX =
  'h-[34px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92';

const PREVIEW_LINE = 'h-2.5 rounded-full bg-[rgba(75,98,116,0.18)]';

function renderDrawerPreview(preview: DrawerPreview) {
  if (preview.mode === 'widgets') {
    return (
      <div className="flex flex-col gap-2">
        <span className="h-5 w-[72px] rounded-full bg-[rgba(155,232,247,0.38)]" />
        <span className={`${PREVIEW_LINE} w-[88%]`} />
        <span className={`${PREVIEW_LINE} w-[72%]`} />
      </div>
    );
  }

  switch (preview.id) {
    case 'notifications':
      return (
        <div className="flex flex-col gap-2">
          <span className="h-5 w-[72px] rounded-full bg-[rgba(155,232,247,0.38)]" />
          <span className={`${PREVIEW_LINE} w-[88%]`} />
          <span className={PREVIEW_BOX} />
          <span className={PREVIEW_BOX} />
        </div>
      );
    case 'progress':
      return (
        <div className="flex flex-col gap-2">
          <span className="h-5 w-[72px] rounded-full bg-[rgba(155,232,247,0.38)]" />
          <span className={`${PREVIEW_LINE} w-[88%]`} />
          <span className="h-3 rounded-full bg-[linear-gradient(90deg,#9be8f7_0%,#67cfe6_66%,rgba(218,229,239,0.8)_66%,rgba(218,229,239,0.8)_100%)]" />
          <div className="flex justify-between gap-2.5">
            <span className={`${PREVIEW_LINE} w-[42%]`} />
            <span className={`${PREVIEW_LINE} w-[42%]`} />
          </div>
        </div>
      );
    case 'performance':
      return (
        <div className="grid grid-cols-2 gap-2">
          <span className="h-[54px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[54px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[54px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[54px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
        </div>
      );
    case 'deadlines':
      return (
        <div className="flex flex-col gap-2">
          <span className="h-[42px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[42px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[42px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
        </div>
      );
    case 'activity':
      return (
        <div className="grid grid-cols-2 gap-2">
          <span className="h-[54px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[54px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[54px] rounded-xl border border-[rgba(214,225,235,0.9)] bg-white/92" />
        </div>
      );
    case 'recommendations':
      return (
        <div className="flex flex-wrap gap-2">
          <span className="h-[30px] w-[120px] rounded-full border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[30px] w-[120px] rounded-full border border-[rgba(214,225,235,0.9)] bg-white/92" />
          <span className="h-[30px] w-[92px] rounded-full border border-[rgba(214,225,235,0.9)] bg-white/92" />
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-2">
          <span className={`${PREVIEW_LINE} w-[88%]`} />
          <span className={PREVIEW_BOX} />
          <span className={PREVIEW_BOX} />
        </div>
      );
  }
}

export function DashboardEditorShell({ children }: DashboardEditorShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useDashboardEditorStore((state) => state.theme);
  const drawerMode = useDashboardEditorStore((state) => state.drawerMode);
  const drawerSearch = useDashboardEditorStore((state) => state.drawerSearch);
  const editingQuickItemId = useDashboardEditorStore((state) => state.editingQuickItemId);
  const toggleTheme = useDashboardEditorStore((state) => state.toggleTheme);
  const closeDrawer = useDashboardEditorStore((state) => state.closeDrawer);
  const setDrawerSearch = useDashboardEditorStore((state) => state.setDrawerSearch);
  const addPanel = useDashboardEditorStore((state) => state.addPanel);
  const assignWidget = useDashboardEditorStore((state) => state.assignWidget);
  const activeThreadId = useThreadWindowsStore((state) => state.activeThreadId);
  const openThread = useThreadWindowsStore((state) => state.openThread);
  const minimizedThreads = useThreadWindowsStore((state) => state.minimizedThreads);
  const restoreThread = useThreadWindowsStore((state) => state.restoreThread);
  const removeMinimizedThread = useThreadWindowsStore(
    (state) => state.removeMinimizedThread,
  );
  const [hoveredPreview, setHoveredPreview] = useState<DrawerPreview | null>(null);
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const visibleMinimizedThreads = minimizedThreads.filter(
    (item) =>
      item.threadId !== activeThreadId &&
      !location.pathname.startsWith(`/threads/${item.threadId}`),
  );

  const normalizedSearch = drawerSearch.toLowerCase();

  const blockOptions = dashboardEditorPanelTemplates.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.templateId.toLowerCase().includes(normalizedSearch),
  );

  const widgetOptions = quickAccessWidgetPresets.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch),
  );
  const normalizedSiteSearch = siteSearchQuery.trim().toLowerCase();
  const filteredSiteSuggestions = normalizedSiteSearch
    ? siteSearchSuggestions.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedSiteSearch) ||
          item.meta.toLowerCase().includes(normalizedSiteSearch),
      )
    : [];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className={`min-h-screen px-5 pt-[18px] pb-28 max-lg:px-3.5 max-lg:pt-3.5 max-lg:pb-[102px] ${theme === 'dark' ? 'layout--dark' : ''}`}>
      <header className="relative z-20 mb-6 flex min-h-[78px] items-center justify-between gap-[18px] overflow-visible rounded-3xl border border-[rgba(209,221,235,0.82)] bg-white/82 p-[14px_18px] shadow-(--shadow-soft) backdrop-blur-[18px] max-xl:flex-wrap max-lg:min-h-0 max-lg:p-3.5 max-sm:gap-1.5 dark:border-[rgba(57,78,95,0.82)] dark:bg-[rgba(15,21,28,0.82)]">
        <div className="flex shrink-0 items-center gap-3">
          <img src={logoUrl} alt="logo" className="size-[60px] min-h-11 min-w-11 shrink-0 grid place-items-center rounded-[14px] bg-[#2d3137] text-lg font-extrabold text-white shadow-(--shadow-soft)" />
          <span className="text-2xl font-bold tracking-[0.01em] text-[#25323d] dark:text-[#eef5fb]">Knowlynx</span>
        </div>

        <nav className="flex shrink-0 items-center gap-2 overflow-visible max-xl:order-4 max-xl:w-full max-xl:flex-nowrap max-xl:overflow-x-auto [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          {headerNavItems.map((item) => {
            const isActive = location.pathname === (item.path ?? `/${item.id}`);
            return (
              <button
                key={item.id}
                type="button"
                className={`h-[42px] whitespace-nowrap rounded-[14px] border border-transparent bg-transparent px-4 text-[#53606c] transition-[background,color,border-color] duration-200 hover:${HEADER_LINK_ACTIVE_BG} dark:text-[#b6c6d4] ${isActive ? `${HEADER_LINK_ACTIVE_BG} ${HEADER_LINK_ACTIVE_BORDER}` : ''}`}
                onClick={() => (item.path ? navigate(item.path) : undefined)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="relative z-[42] min-w-[200px] max-w-[500px] flex-1 max-xl:order-3 max-xl:w-full max-xl:max-w-none max-xl:flex-[unset]">
          <input
            type="search"
            className="h-[42px] w-full rounded-[14px] border border-[var(--control-border)] bg-[var(--control-bg)] px-3.5 pr-11 text-[var(--control-text)] placeholder:text-[#80909f] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none dark:border-[rgba(57,78,95,0.92)] dark:bg-[rgba(18,28,36,0.96)] dark:text-[#e7f1f8] dark:placeholder:text-[#8fa4b5]"
            placeholder="Поиск по сайту"
            value={siteSearchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsSearchOpen(false), 120);
            }}
            onChange={(event) => {
              setSiteSearchQuery(event.target.value);
              setIsSearchOpen(true);
            }}
          />
          {siteSearchQuery ? (
            <button
              type="button"
              className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-[rgba(155,232,247,0.12)] p-0 text-[#4b6fa1] transition-colors duration-200 hover:bg-[rgba(155,232,247,0.22)] hover:text-[#274f84] dark:bg-[rgba(64,129,151,0.2)] dark:text-[#8fc4d3] dark:hover:bg-[rgba(64,129,151,0.32)] dark:hover:text-[#d6f4fb]"
              aria-label="Очистить поиск"
              onMouseDown={() => {
                setSiteSearchQuery('');
                setIsSearchOpen(false);
              }}
            >
              <span className="absolute h-0.5 w-2.5 rotate-45 rounded-full bg-current" />
              <span className="absolute h-0.5 w-2.5 -rotate-45 rounded-full bg-current" />
            </button>
          ) : null}

          {isSearchOpen && normalizedSiteSearch ? (
            <div className="absolute top-[calc(100%+10px)] left-0 z-[60] w-full rounded-[18px] border border-[rgba(209,221,235,0.92)] bg-white/96 p-2.5 shadow-(--shadow-soft) dark:border-[rgba(57,78,95,0.92)] dark:bg-[rgba(14,22,29,0.98)]">
              {filteredSiteSuggestions.length ? (
                filteredSiteSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="flex w-full flex-col gap-0.5 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-[#31404d] hover:bg-[rgba(155,232,247,0.14)] dark:text-[#e7f1f8] dark:hover:bg-[rgba(48,114,132,0.22)]"
                    onMouseDown={() => {
                      setSiteSearchQuery(suggestion.title);
                      setIsSearchOpen(false);
                    }}
                  >
                    <strong className="text-sm font-semibold">{suggestion.title}</strong>
                    <span className="text-xs text-[#7e8d9a] dark:text-[#9eb1c2]">{suggestion.meta}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2.5 text-xs text-[#7e8d9a] dark:text-[#9eb1c2]">
                  Ничего не найдено
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            className={ICON_BUTTON_BASE}
            aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            className={`${ICON_BUTTON_BASE} ${location.pathname.startsWith('/settings') ? `${HEADER_LINK_ACTIVE_BG} border-[var(--accent-soft-border)] text-[var(--accent-soft-text)] ${HEADER_LINK_ACTIVE_BORDER}` : ''}`}
            aria-label="Настройки"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="relative px-2">{children}</div>

      {drawerMode ? (
        <div className="fixed left-1/2 bottom-24 z-[29] mb-2.5 flex max-h-[72vh] w-[min(960px,calc(100vw-64px))] -translate-x-1/2 flex-col gap-3.5 rounded-t-3xl rounded-b-[18px] border border-white/18 bg-[rgba(54,49,52,0.78)] p-[18px] shadow-[0_20px_42px_rgba(48,35,40,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[22px] [backdrop-filter:blur(22px)_saturate(135%)] [animation:drawer-slide-up_240ms_ease] max-lg:w-[min(100%,calc(100vw-32px))] max-lg:bottom-[88px] max-lg:max-h-[74vh] dark:border-[rgba(60,82,98,0.28)] dark:bg-[rgba(12,18,24,0.92)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="m-0 mb-1 text-xl text-white">
                {drawerMode === 'blocks' ? 'Добавить новый блок' : 'Выбрать виджет'}
              </h3>
              <p className="m-0 text-[13px] text-white/72">
                {drawerMode === 'blocks'
                  ? 'Список доступных блоков для текущего макета дашборда.'
                  : 'Список заглушек-виджетов для выбранного блока.'}
              </p>
            </div>
            <button
              type="button"
              className="size-[34px] rounded-[10px] border border-white/18 bg-white/8 text-white"
              onClick={closeDrawer}
              aria-label="Закрыть drawer"
            >
              ×
            </button>
          </div>

          <input
            className="h-11 w-full rounded-[14px] border border-white/14 bg-white/8 px-3.5 text-white placeholder:text-white/50 dark:border-white/10 dark:bg-white/6"
            type="search"
            placeholder={drawerMode === 'blocks' ? 'Поиск блока' : 'Поиск виджета'}
            value={drawerSearch}
            onChange={(event) => setDrawerSearch(event.target.value)}
          />

          <div className="grid min-h-0 grid-cols-[minmax(0,1.4fr)_260px] items-start gap-4 max-lg:grid-cols-1">
            <div className="grid min-h-0 grid-cols-2 gap-3">
              {drawerMode === 'blocks'
                ? blockOptions.map((item) => (
                    <button
                      key={item.templateId}
                      type="button"
                      className="rounded-2xl border border-white/12 bg-white/6 p-3.5 text-left text-white dark:border-white/8 dark:bg-white/4"
                      onMouseEnter={() =>
                        setHoveredPreview({
                          id: item.templateId,
                          title: item.title,
                          description:
                            'Блок можно добавить в макет, затем менять размер и положение.',
                          mode: 'blocks',
                        })
                      }
                      onMouseLeave={() => setHoveredPreview(null)}
                      onClick={() => addPanel(item.templateId)}
                    >
                      <strong className="mb-1.5 block text-[15px]">{item.title}</strong>
                      <span className="text-xs text-white/68">Добавить блок в текущий макет</span>
                    </button>
                  ))
                : widgetOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="rounded-2xl border border-white/12 bg-white/6 p-3.5 text-left text-white dark:border-white/8 dark:bg-white/4"
                      onMouseEnter={() =>
                        setHoveredPreview({
                          id: item.id,
                          title: item.title,
                          description: item.description,
                          mode: 'widgets',
                        })
                      }
                      onMouseLeave={() => setHoveredPreview(null)}
                      onClick={() => {
                        if (editingQuickItemId) {
                          assignWidget(editingQuickItemId, item.id);
                        }
                      }}
                    >
                      <strong className="mb-1.5 block text-[15px]">{item.title}</strong>
                      <span className="text-xs text-white/68">{item.description}</span>
                    </button>
                  ))}
            </div>

            <aside
              className={`self-start rounded-[18px] border border-white/10 bg-white/5 p-4 transition-[opacity,transform] duration-[180ms] max-lg:hidden dark:border-white/8 dark:bg-white/4 ${hoveredPreview ? 'opacity-100 -translate-y-0.5' : 'opacity-[0.88]'}`}
            >
              {hoveredPreview ? (
                <>
                  <div
                    className={`mb-3 flex flex-col gap-2.5 rounded-[18px] bg-[rgba(244,249,253,0.98)] p-3 ${hoveredPreview.mode === 'blocks' ? 'min-h-[210px]' : 'min-h-[120px]'}`}
                  >
                    <div className="h-4 w-3/5 rounded-full bg-[rgba(31,79,90,0.14)]" />
                    {renderDrawerPreview(hoveredPreview)}
                  </div>
                  <strong className="mb-1.5 block text-[15px] text-white">{hoveredPreview.title}</strong>
                  <p className="m-0 text-xs leading-[1.45] text-white/74">{hoveredPreview.description}</p>
                </>
              ) : (
                <>
                  <strong className="mb-1.5 block text-[15px] text-white">Предпросмотр</strong>
                  <p className="m-0 text-xs leading-[1.45] text-white/74">
                    Наведи на элемент в списке, чтобы увидеть его внешний вид и краткое описание.
                  </p>
                </>
              )}
            </aside>
          </div>
        </div>
      ) : null}

      <ThreadChatModal />

      {visibleMinimizedThreads.length ? (
        <div className="threads-dock-orbs" aria-label="Свернутые треды">
          {visibleMinimizedThreads.map((item) => {
            const thread = threadMocksMap[item.threadId];

            if (!thread) {
              return null;
            }

            return (
              <button
                key={item.threadId}
                type="button"
                className="threads-dock-orb"
                aria-label={`Открыть тред ${thread.title}`}
                onClick={() => {
                  restoreThread(item.threadId);
                  openThread(item.threadId);
                }}
              >
                <span className="threads-dock-orb__halo" />
                <span className="threads-dock-orb__avatar">{thread.creator.avatar}</span>

                <span
                  className="threads-dock-orb__dismiss"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeMinimizedThread(item.threadId);
                  }}
                >
                  <X size={12} />
                </span>

                <span className="threads-dock-orb__preview">
                  <span className="threads-dock-orb__preview-head">
                    <strong>{thread.title}</strong>
                    <span>{item.previewTimestamp || thread.updatedAt}</span>
                  </span>
                  <span className="threads-dock-orb__preview-text">
                    {item.previewText || thread.summary}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 rounded-[15px] border border-white/18 bg-black/66 p-2.5 shadow-[0_18px_38px_rgba(48,35,40,0.24),inset_0_1px_0_rgba(255,255,255,0.16)] max-lg:w-[min(100%,calc(100vw-32px))] max-lg:p-1.5 dark:border-[rgba(58,80,97,0.28)] dark:bg-[rgba(14,20,27,0.78)]">
        <div className="flex shrink-0 items-center gap-3 pr-1.5">
          <img src={logoUrl} alt="logo" className="size-[60px] min-h-11 min-w-11 shrink-0 grid place-items-center rounded-[14px] bg-[#2d3137] text-lg font-extrabold text-white shadow-(--shadow-soft)" />
        </div>

        <nav className="mr-2.5 flex h-[60px] min-w-0 items-center gap-2 rounded-[15px] bg-[#414141] px-1.5">
          {bottomNavItems.map((item) => {
            const isActive =
              item.path &&
              (location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`));
            return (
              <button
                key={item.id}
                type="button"
                className={`flex h-[50px] w-[100px] items-center justify-center whitespace-nowrap rounded-[15px] border border-white/12 bg-inherit px-4 py-6 text-[0.7rem] text-white/88 transition-[background,color,border-color] duration-200 hover:border-[rgba(155,232,247,0.36)] hover:bg-[rgba(155,232,247,0.18)] hover:text-white max-lg:w-auto max-lg:px-3 max-lg:text-[13px] dark:border-white/8 dark:bg-white/3 dark:text-[rgba(228,238,246,0.88)] ${isActive ? 'border-[rgba(155,232,247,0.36)] bg-[rgba(155,232,247,0.18)] text-white' : ''}`}
                onClick={() => (item.path ? navigate(item.path) : undefined)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex h-[60px] shrink-0 items-center justify-center gap-[7px] whitespace-nowrap rounded-[14px] border border-[rgba(93,199,222,0.6)] bg-gradient-to-br from-[#9be8f7] to-[#5dc7de] px-4 font-bold text-[#275d69] transition-[background,box-shadow] duration-200 hover:bg-gradient-to-br hover:from-[#b7effb] hover:to-[#7dd8ea] hover:shadow-[0_4px_16px_rgba(93,199,222,0.3)] max-lg:px-3.5 max-lg:text-[13px] dark:border-[rgba(88,174,199,0.4)] dark:bg-gradient-to-br dark:from-[#235165] dark:to-[#1d7f95] dark:text-[#e8f8fc] dark:hover:from-[#2b6a78] dark:hover:to-[#25919e] dark:hover:shadow-[0_4px_16px_rgba(29,127,149,0.3)]"
        >
          К работам
        </button>
      </div>
    </div>
  );
}
