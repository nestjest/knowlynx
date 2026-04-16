import type { ReactNode } from 'react';
import { dashboardPanelTemplates, widgetPresets } from '../../../entities/panel/model/dashboardPanelData';
import { useDashboardStore } from '../../../shared/model/useDashboardStore';

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
  { id: 'collections', label: 'Подборки' },
  { id: 'teachers', label: 'Преподаватели' },
  { id: 'market', label: 'Маркет' },
  { id: 'community', label: 'Сообщество' }
];

type EditableAppShellProps = {
  children: ReactNode;
};

export function EditableAppShell({ children }: EditableAppShellProps) {
  const drawerMode = useDashboardStore((state) => state.drawerMode);
  const drawerSearch = useDashboardStore((state) => state.drawerSearch);
  const isEditMode = useDashboardStore((state) => state.isEditMode);
  const editingPanelId = useDashboardStore((state) => state.editingPanelId);
  const closeDrawer = useDashboardStore((state) => state.closeDrawer);
  const setDrawerSearch = useDashboardStore((state) => state.setDrawerSearch);
  const addPanel = useDashboardStore((state) => state.addPanel);
  const assignWidget = useDashboardStore((state) => state.assignWidget);

  const blockOptions = dashboardPanelTemplates.filter((item) =>
    item.title.toLowerCase().includes(drawerSearch.toLowerCase())
  );

  const widgetOptions = widgetPresets.filter(
    (item) =>
      item.title.toLowerCase().includes(drawerSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(drawerSearch.toLowerCase())
  );

  return (
    <div className="layout">
      <header className="site-header">
        <div className="site-header__brand">
          <div className="brand-mark">K</div>
          <span className="site-header__brand-text">Knowlynx</span>
        </div>

        <nav className="site-header__nav">
          {headerNavItems.map((item) => (
            <button
              key={item.id}
              className={`site-header__link ${item.active ? 'site-header__link--active' : ''}`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="site-header__actions">
          <button type="button" className="site-header__ghost">
            Войти
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
                  ? 'Список доступных блоков для макета дашборда.'
                  : 'Список заглушек-виджетов для выбранного блока.'}
              </p>
            </div>
            <button type="button" className="dashboard-drawer__close" onClick={closeDrawer}>
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

          <div className="dashboard-drawer__list">
            {drawerMode === 'blocks'
              ? blockOptions.map((item) => (
                  <button
                    key={item.templateId}
                    type="button"
                    className="dashboard-drawer__item"
                    onClick={() => addPanel(item.templateId)}
                  >
                    <strong>{item.title}</strong>
                    <span>Добавить блок в макет</span>
                  </button>
                ))
              : widgetOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="dashboard-drawer__item"
                    onClick={() => {
                      if (editingPanelId) {
                        assignWidget(editingPanelId, item.id);
                      }
                    }}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </button>
                ))}
          </div>
        </div>
      ) : null}

      <div className="bottom-dock">
        <div className="bottom-dock__brand">
          <div className="brand-mark">K</div>
          <span className="bottom-dock__brand-text">Knowlynx</span>
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
