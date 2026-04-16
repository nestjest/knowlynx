import type { ReactNode } from 'react';

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

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
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

      <div className="layout__content">
        {children}
      </div>

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
          Открыть портал
        </button>
      </div>
    </div>
  );
}
