import { useEffect, useState, type ReactNode } from 'react';
import {
  dashboardEditorPanelTemplates
} from '../../../entities/panel/model/dashboardEditorData';
import { quickAccessWidgetPresets } from '../../../entities/quick-access/model/quickAccessEditorData';
import { useDashboardEditorStore } from '../../../shared/model/useDashboardEditorStore';

type NavItem = {
  id: string;
  label: string;
  active?: boolean;
};

const headerNavItems: NavItem[] = [
  { id: 'home', label: 'Главная', active: true },
  { id: 'assignments', label: 'Задания' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'messages', label: 'Сообщения' },
  { id: 'library', label: 'Библиотека' },
  { id: 'support', label: 'Поддержка' }
];

const bottomNavItems: NavItem[] = [
  { id: 'courses', label: 'Курсы', active: true },
  { id: 'collections', label: 'Треды' },
  { id: 'teachers', label: 'Преподаватели' },
  { id: 'market', label: 'Маркет' },
  { id: 'community', label: 'Сообщество' }
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
  { id: 'search-support', title: 'Поддержка платформы', meta: 'Сервисный раздел' }
];

function renderDrawerPreview(preview: DrawerPreview) {
  if (preview.mode === 'widgets') {
    return (
      <div className="dashboard-drawer__preview-body">
        <span className="dashboard-drawer__preview-chip" />
        <span className="dashboard-drawer__preview-line dashboard-drawer__preview-line--long" />
        <span className="dashboard-drawer__preview-line" />
      </div>
    );
  }

  switch (preview.id) {
    case 'notifications':
      return (
        <div className="dashboard-drawer__preview-body">
          <span className="dashboard-drawer__preview-chip" />
          <span className="dashboard-drawer__preview-line dashboard-drawer__preview-line--long" />
          <span className="dashboard-drawer__preview-box" />
          <span className="dashboard-drawer__preview-box" />
        </div>
      );
    case 'progress':
      return (
        <div className="dashboard-drawer__preview-body">
          <span className="dashboard-drawer__preview-chip" />
          <span className="dashboard-drawer__preview-line dashboard-drawer__preview-line--long" />
          <span className="dashboard-drawer__preview-progress" />
          <div className="dashboard-drawer__preview-metrics">
            <span className="dashboard-drawer__preview-line dashboard-drawer__preview-line--metric" />
            <span className="dashboard-drawer__preview-line dashboard-drawer__preview-line--metric" />
          </div>
        </div>
      );
    case 'performance':
      return (
        <div className="dashboard-drawer__preview-grid">
          <span className="dashboard-drawer__preview-stat" />
          <span className="dashboard-drawer__preview-stat" />
          <span className="dashboard-drawer__preview-stat" />
          <span className="dashboard-drawer__preview-stat" />
        </div>
      );
    case 'deadlines':
      return (
        <div className="dashboard-drawer__preview-body">
          <span className="dashboard-drawer__preview-box dashboard-drawer__preview-box--tall" />
          <span className="dashboard-drawer__preview-box dashboard-drawer__preview-box--tall" />
          <span className="dashboard-drawer__preview-box dashboard-drawer__preview-box--tall" />
        </div>
      );
    case 'activity':
      return (
        <div className="dashboard-drawer__preview-grid">
          <span className="dashboard-drawer__preview-stat" />
          <span className="dashboard-drawer__preview-stat" />
          <span className="dashboard-drawer__preview-stat" />
        </div>
      );
    case 'recommendations':
      return (
        <div className="dashboard-drawer__preview-tags">
          <span className="dashboard-drawer__preview-tag" />
          <span className="dashboard-drawer__preview-tag" />
          <span className="dashboard-drawer__preview-tag dashboard-drawer__preview-tag--short" />
        </div>
      );
    default:
      return (
        <div className="dashboard-drawer__preview-body">
          <span className="dashboard-drawer__preview-line dashboard-drawer__preview-line--long" />
          <span className="dashboard-drawer__preview-box" />
          <span className="dashboard-drawer__preview-box" />
        </div>
      );
  }
}

export function DashboardEditorShell({ children }: DashboardEditorShellProps) {
  const theme = useDashboardEditorStore((state) => state.theme);
  const drawerMode = useDashboardEditorStore((state) => state.drawerMode);
  const drawerSearch = useDashboardEditorStore((state) => state.drawerSearch);
  const isEditMode = useDashboardEditorStore((state) => state.isEditMode);
  const editingQuickItemId = useDashboardEditorStore((state) => state.editingQuickItemId);
  const toggleTheme = useDashboardEditorStore((state) => state.toggleTheme);
  const closeDrawer = useDashboardEditorStore((state) => state.closeDrawer);
  const setDrawerSearch = useDashboardEditorStore((state) => state.setDrawerSearch);
  const addPanel = useDashboardEditorStore((state) => state.addPanel);
  const assignWidget = useDashboardEditorStore((state) => state.assignWidget);
  const [hoveredPreview, setHoveredPreview] = useState<DrawerPreview | null>(null);
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const normalizedSearch = drawerSearch.toLowerCase();

  const blockOptions = dashboardEditorPanelTemplates.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.templateId.toLowerCase().includes(normalizedSearch)
  );

  const widgetOptions = quickAccessWidgetPresets.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch)
  );
  const normalizedSiteSearch = siteSearchQuery.trim().toLowerCase();
  const filteredSiteSuggestions = normalizedSiteSearch
    ? siteSearchSuggestions.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedSiteSearch) ||
          item.meta.toLowerCase().includes(normalizedSiteSearch)
      )
    : [];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className={`layout ${theme === 'dark' ? 'layout--dark' : ''}`}>
      <header className="site-header">
        <div className="site-header__brand">
          <img src="../../../src/app/logo.svg" alt="logo" className="brand-mark" />
          <span className="site-header__brand-text">Knowlynx</span>
        </div>

        <nav className="site-header__nav">
          {headerNavItems.map((item) => (
            <div key={item.id} className="site-header__nav-item">
              {item.id === 'messages' ? (
                <div className="site-header__search">
                  <input
                    type="search"
                    className="site-header__search-input"
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
                      className="site-header__search-clear"
                      aria-label="Очистить поиск"
                      onMouseDown={() => {
                        setSiteSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                    >
                      <span />
                      <span />
                    </button>
                  ) : null}

                  {isSearchOpen && normalizedSiteSearch ? (
                    <div className="site-header__search-dropdown">
                      {filteredSiteSuggestions.length ? (
                        filteredSiteSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            className="site-header__search-suggestion"
                            onMouseDown={() => {
                              setSiteSearchQuery(suggestion.title);
                              setIsSearchOpen(false);
                            }}
                          >
                            <strong>{suggestion.title}</strong>
                            <span>{suggestion.meta}</span>
                          </button>
                        ))
                      ) : (
                        <div className="site-header__search-empty">Ничего не найдено</div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <button
                className={`site-header__link ${item.active ? 'site-header__link--active' : ''}`}
                type="button"
              >
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        <div className="site-header__actions">
          <button type="button" className="site-header__ghost site-header__theme" onClick={toggleTheme}>
            {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          </button>
          <button type="button" className="site-header__primary">
            Личный кабинет
          </button>
        </div>
      </header>

      <div className="layout__content">{children}</div>

      {drawerMode ? (
        <div className="dashboard-drawer">
          <div className="dashboard-drawer__header">
            <div>
              <h3>{drawerMode === 'blocks' ? 'Добавить новый блок' : 'Выбрать виджет'}</h3>
              <p>
                {drawerMode === 'blocks'
                  ? 'Список доступных блоков для текущего макета дашборда.'
                  : 'Список заглушек-виджетов для выбранного блока.'}
              </p>
            </div>
            <button type="button" className="dashboard-drawer__close" onClick={closeDrawer} aria-label="Закрыть drawer">
              ×
            </button>
          </div>

          <input
            className="dashboard-drawer__search"
            type="search"
            placeholder={drawerMode === 'blocks' ? 'Поиск блока' : 'Поиск виджета'}
            value={drawerSearch}
            onChange={(event) => setDrawerSearch(event.target.value)}
          />

          <div className="dashboard-drawer__body">
            <div className="dashboard-drawer__list">
            {drawerMode === 'blocks'
              ? blockOptions.map((item) => (
                  <button
                    key={item.templateId}
                    type="button"
                    className="dashboard-drawer__item"
                    onMouseEnter={() =>
                      setHoveredPreview({
                        id: item.templateId,
                        title: item.title,
                        description: 'Блок можно добавить в макет, затем менять размер и положение.',
                        mode: 'blocks'
                      })
                    }
                    onMouseLeave={() => setHoveredPreview(null)}
                    onClick={() => addPanel(item.templateId)}
                  >
                    <strong>{item.title}</strong>
                    <span>Добавить блок в текущий макет</span>
                  </button>
                ))
              : widgetOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="dashboard-drawer__item"
                    onMouseEnter={() =>
                      setHoveredPreview({
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        mode: 'widgets'
                      })
                    }
                    onMouseLeave={() => setHoveredPreview(null)}
                    onClick={() => {
                      if (editingQuickItemId) {
                        assignWidget(editingQuickItemId, item.id);
                      }
                    }}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </button>
                ))}
            </div>

            <aside className={`dashboard-drawer__preview ${hoveredPreview ? 'dashboard-drawer__preview--visible' : ''}`}>
              {hoveredPreview ? (
                <>
                  <div className={`dashboard-drawer__preview-card dashboard-drawer__preview-card--${hoveredPreview.mode}`}>
                    <div className="dashboard-drawer__preview-header" />
                    {renderDrawerPreview(hoveredPreview)}
                  </div>
                  <strong className="dashboard-drawer__preview-title">{hoveredPreview.title}</strong>
                  <p className="dashboard-drawer__preview-text">{hoveredPreview.description}</p>
                </>
              ) : (
                <>
                  <strong className="dashboard-drawer__preview-title">Предпросмотр</strong>
                  <p className="dashboard-drawer__preview-text">Наведи на элемент в списке, чтобы увидеть его внешний вид и краткое описание.</p>
                </>
              )}
            </aside>
          </div>
        </div>
      ) : null}

      <div className="bottom-dock">
        <div className="bottom-dock__brand">
          <img src="../../../src/app/logo.svg" alt="logo" className="brand-mark" />
        </div>

        <nav className="bottom-dock__nav">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              className={`bottom-dock__link ${item.active ? 'bottom-dock__link--active' : ''}`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="bottom-dock__cta">
          {isEditMode ? 'Режим редактирования' : 'Открыть портал'}
        </button>
      </div>
    </div>
  );
}
