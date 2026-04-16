import type { ReactNode } from 'react';
import { useAppStore } from '../../../shared/model/useAppStore';

type NavItem = {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
};

const mainNavItems: NavItem[] = [
  { id: 'search', label: 'Поиск', icon: '⌕', active: true },
  { id: 'groups', label: 'Группы', icon: '◌' },
  { id: 'chats', label: 'Чаты', icon: '◔' },
  { id: 'schedule', label: 'Расписание', icon: '⌘' },
  { id: 'documents', label: 'Документы', icon: '◫' },
  { id: 'disk', label: 'Диск', icon: '⌂' },
  { id: 'faq', label: 'FAQ', icon: '?' }
];

const footerNavItems: NavItem[] = [
  { id: 'lab', label: 'Лаб', icon: '∿' },
  { id: 'profile', label: 'Профиль', icon: '⊙' },
  { id: 'settings', label: 'Настройки', icon: '⚙' }
];

type AppShellProps = {
  children: ReactNode;
};

const navButtonBase =
  'h-7 w-[46px] rounded-full border-0 bg-transparent text-[#56626d] transition duration-200 hover:bg-pill-blue hover:text-[#1e4b57]';

export function AppShell({ children }: AppShellProps) {
  const connectionStatus = useAppStore((state) => state.connectionStatus);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[72px_1fr]">
      <aside className="flex flex-row items-center justify-between gap-4 border-b border-[#d1ddeb]/65 bg-rail-surface px-[18px] py-[14px] backdrop-blur-[18px] lg:flex-col lg:justify-start lg:gap-[22px] lg:border-b-0 lg:border-r lg:px-3 lg:py-6">
        <div className="grid h-[34px] w-[34px] place-items-center rounded-xl bg-[#2d3137] text-sm font-bold text-white shadow-soft">
          K
        </div>

        <nav className="flex flex-row items-center gap-3 lg:mt-2 lg:flex-1 lg:flex-col">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              className={`${navButtonBase} ${item.active ? 'bg-pill-blue text-[#1e4b57]' : ''}`}
              type="button"
              aria-label={item.label}
            >
              <span>{item.icon}</span>
            </button>
          ))}
        </nav>

        <div className="flex flex-row items-center gap-3 lg:flex-col">
          {footerNavItems.map((item) => (
            <button key={item.id} className={navButtonBase} type="button" aria-label={item.label}>
              <span>{item.icon}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="relative p-[18px] lg:p-[22px_28px_22px_0]">
        <div className="absolute right-[18px] top-[18px] inline-flex items-center gap-2 rounded-full border border-[#dbe5ee]/75 bg-white/70 px-3 py-2 text-xs text-[#5d6b78] lg:right-7">
          <span
            className={`h-2 w-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-[#50c878]' : 'bg-[#ff7d7d]'
            }`}
          />
          <span>WS {connectionStatus}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
