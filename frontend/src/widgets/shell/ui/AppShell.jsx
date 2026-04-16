import { useAppStore } from '../../../shared/model/useAppStore';

const mainNavItems = [
  { id: 'search', label: 'Поиск', icon: '⌕', active: true },
  { id: 'groups', label: 'Группы', icon: '◌' },
  { id: 'chats', label: 'Чаты', icon: '◔' },
  { id: 'schedule', label: 'Расписание', icon: '⌘' },
  { id: 'documents', label: 'Документы', icon: '◫' },
  { id: 'disk', label: 'Диск', icon: '⌂' },
  { id: 'faq', label: 'FAQ', icon: '?' }
];

const footerNavItems = [
  { id: 'lab', label: 'Лаб', icon: '∿' },
  { id: 'profile', label: 'Профиль', icon: '⊙' },
  { id: 'settings', label: 'Настройки', icon: '⚙' }
];

export function AppShell({ children }) {
  const connectionStatus = useAppStore((state) => state.connectionStatus);

  return (
    <div className="layout">
      <aside className="layout__rail">
        <div className="brand-mark">K</div>

        <nav className="layout__nav">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              className={`layout__nav-button ${item.active ? 'layout__nav-button--active' : ''}`}
              type="button"
              aria-label={item.label}
            >
              <span>{item.icon}</span>
            </button>
          ))}
        </nav>

        <div className="layout__footer-nav">
          {footerNavItems.map((item) => (
            <button key={item.id} className="layout__nav-button" type="button" aria-label={item.label}>
              <span>{item.icon}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="layout__content">
        <div className="layout__status">
          <span className={`layout__status-dot layout__status-dot--${connectionStatus}`} />
          <span>WS {connectionStatus}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
