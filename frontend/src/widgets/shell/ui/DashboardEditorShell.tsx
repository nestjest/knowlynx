import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Settings, Sun, Moon, X } from 'lucide-react';
import logoUrl from '@/app/logo.svg';
import { dashboardEditorPanelTemplates } from '@/entities/panel/model/dashboardEditorData';
import { quickAccessWidgetPresets } from '@/entities/quick-access/model/quickAccessEditorData';
import { ThreadChatModal } from '@/entities/thread/ui/ThreadChatModal';
import { threadMocksMap } from '@/pages/threads/model/threadMocks';
import { useThreadWindowsStore } from '@/entities/thread/model/useThreadWindowsStore';
import { useDashboardEditorStore } from '@/shared/model/useDashboardEditorStore';
import { ActionBar } from '@/shared/ui/ActionBar';
import { DashboardDrawer } from './DashboardDrawer';

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

type Props = {
  children: ReactNode;
};

type SiteSearchSuggestion = {
  id: string;
  title: string;
  meta: string;
};

const siteSearchSuggestions: SiteSearchSuggestion[] = [
  {
    id: 'search-schedule',
    title: 'Расписание на неделю',
    meta: 'Раздел расписания',
  },
  {
    id: 'search-sql',
    title: 'Лабораторная по SQL',
    meta: 'Ближайшие дедлайны',
  },
  { id: 'search-web', title: 'Веб-разработка', meta: 'Текущий курс' },
  {
    id: 'search-messages',
    title: 'Сообщения преподавателей',
    meta: 'Коммуникации',
  },
  {
    id: 'search-library',
    title: 'Библиотека материалов',
    meta: 'Учебные ресурсы',
  },
  { id: 'search-faq', title: 'Часто задаваемые вопросы', meta: 'FAQ' },
];

const HEADER_LINK_ACTIVE_BG =
  'bg-gradient-to-r from-[rgba(155,232,247,0.26)] to-[rgba(188,238,255,0.32)] dark:from-[rgba(48,114,132,0.38)] dark:to-[rgba(63,140,162,0.34)]';

const HEADER_LINK_ACTIVE_BORDER =
  'dark:border-[rgba(88,174,199,0.4)] dark:text-[#eaf8fd]';

export function DashboardEditorShell(props: Props) {
  const { children } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useDashboardEditorStore((state) => state.theme);
  const drawerMode = useDashboardEditorStore((state) => state.drawerMode);
  const drawerSearch = useDashboardEditorStore((state) => state.drawerSearch);
  const savedPanels = useDashboardEditorStore((state) => state.panels);
  const draftPanels = useDashboardEditorStore((state) => state.draftPanels);
  const effectivePanels = draftPanels ?? savedPanels;
  const togglePanelVisibility = useDashboardEditorStore(
    (state) => state.togglePanelVisibility,
  );
  const editingQuickItemId = useDashboardEditorStore(
    (state) => state.editingQuickItemId,
  );
  const toggleTheme = useDashboardEditorStore((state) => state.toggleTheme);
  const closeDrawer = useDashboardEditorStore((state) => state.closeDrawer);
  const setDrawerSearch = useDashboardEditorStore(
    (state) => state.setDrawerSearch,
  );
  const addPanel = useDashboardEditorStore((state) => state.addPanel);
  const assignWidget = useDashboardEditorStore((state) => state.assignWidget);
  const activeThreadId = useThreadWindowsStore((state) => state.activeThreadId);
  const openThread = useThreadWindowsStore((state) => state.openThread);
  const minimizedThreads = useThreadWindowsStore(
    (state) => state.minimizedThreads,
  );
  const restoreThread = useThreadWindowsStore((state) => state.restoreThread);
  const removeMinimizedThread = useThreadWindowsStore(
    (state) => state.removeMinimizedThread,
  );
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
    <div
      className={`min-h-screen px-5 pt-[18px] pb-28 max-lg:px-3.5 max-lg:pt-3.5 max-lg:pb-[102px] ${theme === 'dark' ? 'layout--dark' : ''}`}
    >
      <header className="shadow-card relative z-20 mb-6 flex min-h-[78px] items-center justify-between gap-[18px] overflow-visible rounded-3xl border border-[rgba(209,221,235,0.82)] bg-white/82 p-[14px_18px] backdrop-blur-[18px] max-xl:flex-wrap max-lg:min-h-0 max-lg:p-3.5 max-sm:gap-1.5 dark:border-[rgba(57,78,95,0.82)] dark:bg-[rgba(15,21,28,0.82)]">
        <div className="flex shrink-0 items-center gap-3">
          <img
            src={logoUrl}
            alt="logo"
            className="shadow-card grid size-[60px] min-h-11 min-w-11 shrink-0 place-items-center rounded-[14px] bg-[#2d3137] text-lg font-extrabold text-white"
          />
          <span className="text-text-primary text-2xl font-bold tracking-[0.01em]">
            Knowlynx
          </span>
        </div>

        <nav className="flex shrink-0 items-center gap-2 overflow-visible [-webkit-overflow-scrolling:touch] max-xl:order-4 max-xl:w-full max-xl:flex-nowrap max-xl:overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {headerNavItems.map((item) => {
            const isActive = location.pathname === (item.path ?? `/${item.id}`);
            return (
              <button
                key={item.id}
                type="button"
                className={`smooth-interact h-[42px] rounded-[14px] border border-transparent bg-transparent px-4 whitespace-nowrap text-[#53606c] hover:${HEADER_LINK_ACTIVE_BG} dark:text-[#b6c6d4] ${isActive ? `${HEADER_LINK_ACTIVE_BG} ${HEADER_LINK_ACTIVE_BORDER}` : ''}`}
                onClick={() => (item.path ? navigate(item.path) : undefined)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="relative z-[42] max-w-[500px] min-w-[200px] flex-1 max-xl:order-3 max-xl:w-full max-xl:max-w-none max-xl:flex-[unset]">
          <input
            type="search"
            className="border-border-strong bg-surface-raised text-text-primary h-[42px] w-full rounded-[14px] border px-3.5 pr-11 placeholder:text-[#80909f] dark:bg-[rgba(18,28,36,0.96)] dark:text-[#e7f1f8] dark:placeholder:text-[#8fa4b5] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
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
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full"
              aria-label="Очистить поиск"
              onPressStart={() => {
                setSiteSearchQuery('');
                setIsSearchOpen(false);
              }}
            >
              <X size={14} />
            </Button>
          ) : null}

          {isSearchOpen && normalizedSiteSearch ? (
            <div className="shadow-card border-border-strong absolute top-[calc(100%+10px)] left-0 z-[60] w-full rounded-[18px] border bg-white/96 p-2.5 dark:bg-[rgba(14,22,29,0.98)]">
              {filteredSiteSuggestions.length ? (
                filteredSiteSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="hover:bg-accent-soft-bg-subtle flex w-full flex-col gap-0.5 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-[#31404d] dark:text-[#e7f1f8] dark:hover:bg-[rgba(48,114,132,0.22)]"
                    onMouseDown={() => {
                      setSiteSearchQuery(suggestion.title);
                      setIsSearchOpen(false);
                    }}
                  >
                    <strong className="text-sm font-semibold">
                      {suggestion.title}
                    </strong>
                    <span className="text-xs text-[#7e8d9a] dark:text-[#9eb1c2]">
                      {suggestion.meta}
                    </span>
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
          <Button
            isIconOnly
            variant="ghost"
            aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            onPress={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Button
            isIconOnly
            variant={
              location.pathname.startsWith('/settings') ? 'primary' : 'ghost'
            }
            aria-label="Настройки"
            onPress={() => navigate('/settings')}
          >
            <Settings size={20} />
          </Button>
        </div>
      </header>

      <div className="relative px-2">{children}</div>

      <DashboardDrawer
        drawerMode={drawerMode}
        drawerSearch={drawerSearch}
        blockOptions={blockOptions}
        widgetOptions={widgetOptions}
        panels={effectivePanels}
        editingQuickItemId={editingQuickItemId}
        onClose={closeDrawer}
        onSearchChange={setDrawerSearch}
        onAddPanel={addPanel}
        onTogglePanelVisibility={togglePanelVisibility}
        onAssignWidget={assignWidget}
      />

      <ThreadChatModal />

      {visibleMinimizedThreads.length ? (
        <div
          className="fixed bottom-4 left-4 z-[31] flex max-w-[min(420px,calc(100vw-32px))] items-center gap-3 overflow-x-auto p-1.5 px-1 [scrollbar-width:none] max-lg:left-3 max-lg:max-w-[calc(100vw-24px)] max-lg:gap-2.5 [&::-webkit-scrollbar]:hidden"
          aria-label="Свернутые треды"
        >
          {visibleMinimizedThreads.map((item) => {
            const thread = threadMocksMap[item.threadId];

            if (!thread) {
              return null;
            }

            return (
              <button
                key={item.threadId}
                type="button"
                className="group smooth-transform shadow-soft dark:from-surface relative inline-flex size-16 shrink-0 [animation:threads-dock-orb-enter_340ms_cubic-bezier(0.22,1,0.36,1)] cursor-pointer items-center justify-center rounded-full border border-[rgba(155,232,247,0.28)] bg-gradient-to-b from-[rgba(250,253,255,0.96)] to-[rgba(228,239,246,0.92)] p-0 backdrop-blur-[18px] hover:-translate-y-1 hover:scale-[1.03] focus-visible:-translate-y-1 focus-visible:scale-[1.03] max-lg:size-[58px] dark:border-[rgba(88,174,199,0.28)] dark:to-[rgba(24,34,44,0.94)]"
                aria-label={`Открыть тред ${thread.title}`}
                onClick={() => {
                  restoreThread(item.threadId);
                  openThread(item.threadId);
                }}
              >
                <span className="pointer-events-none absolute -inset-2 rounded-[inherit] bg-[radial-gradient(circle,rgba(124,223,245,0.22)_0%,rgba(124,223,245,0)_72%)] opacity-60" />
                <span className="gradient-accent shadow-soft dark:border-surface relative z-[1] inline-flex size-[52px] items-center justify-center rounded-[inherit] border-[3px] border-[rgba(244,249,252,0.96)] font-extrabold text-[#215260] max-lg:size-[46px]">
                  {thread.creator.avatar}
                </span>

                <span
                  className="shadow-soft absolute -top-1 -right-1 z-[2] inline-flex size-[22px] items-center justify-center rounded-full bg-[rgba(33,40,48,0.76)] text-[#f6fbff]"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeMinimizedThread(item.threadId);
                  }}
                >
                  <X size={12} />
                </span>

                <span className="hover-reveal bordered-soft shadow-elevated dark:from-surface absolute bottom-[82px] left-0 w-[min(300px,calc(100vw-32px))] rounded-[22px] bg-gradient-to-b from-[rgba(252,254,255,0.97)] to-[rgba(237,244,249,0.95)] p-3.5 px-4 text-left max-lg:bottom-[74px] max-lg:w-[min(260px,calc(100vw-24px))] dark:to-[rgba(22,31,40,0.96)]">
                  <span className="mb-1.5 flex items-start justify-between gap-2.5">
                    <strong className="text-text-primary text-sm leading-[1.35]">
                      {thread.title}
                    </strong>
                    <span className="meta-text leading-normal">
                      {item.previewTimestamp || thread.updatedAt}
                    </span>
                  </span>
                  <span className="meta-text line-clamp-3 overflow-hidden leading-normal">
                    {item.previewText || thread.summary}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <ActionBar />
    </div>
  );
}
