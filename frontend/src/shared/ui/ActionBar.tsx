import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import logoUrl from '@/app/logo.svg';
import { useActionBarStore } from '@/shared/model/useActionBarStore';

type NavItem = {
  id: string;
  label: string;
  path?: string;
};

const navItems: NavItem[] = [
  { id: 'best', label: 'Лучшие', path: '/' },
  { id: 'threads', label: 'Треды', path: '/threads' },
  { id: 'teachers', label: 'Преподаватели' },
  { id: 'analytics', label: 'Аналитика' },
];

const NAV_BUTTON =
  'smooth-interact hover:bg-accent-soft-bg flex h-[50px] w-[100px] items-center justify-center rounded-[15px] border border-white/12 bg-inherit px-4 py-6 text-[0.7rem] whitespace-nowrap text-white/88 hover:border-[rgba(155,232,247,0.36)] hover:text-white max-lg:w-auto max-lg:px-3 max-lg:text-[13px]';

const NAV_BUTTON_ACTIVE =
  'bg-accent-soft-bg border-[rgba(155,232,247,0.36)] text-white';

export function ActionBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useActionBarStore((state) => state.mode);
  const actions = useActionBarStore((state) => state.actions);

  return (
    <div className="fixed-centered bottom-4 z-30 flex items-center gap-2.5 rounded-[15px] border border-white/18 bg-black/66 p-2.5 shadow-[0_18px_38px_rgba(48,35,40,0.24),inset_0_1px_0_rgba(255,255,255,0.16)] max-lg:w-[min(100%,calc(100vw-32px))] max-lg:p-1.5 dark:border-[rgba(58,80,97,0.28)] dark:bg-[rgba(14,20,27,0.78)]">
      <div className="flex shrink-0 items-center gap-3 pr-1.5 max-sm:hidden">
        <img
          src={logoUrl}
          alt="logo"
          className="shadow-card grid size-[60px] min-h-11 min-w-11 shrink-0 place-items-center rounded-[14px] bg-[#2d3137] text-lg font-extrabold text-white"
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mode === 'navigation' ? (
          <motion.nav
            key="navigation"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mr-2.5 flex h-[60px] min-w-0 items-center gap-2 overflow-x-auto rounded-[15px] bg-[#414141] px-1.5 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const isActive =
                item.path &&
                (location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`));
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${NAV_BUTTON} ${isActive ? NAV_BUTTON_ACTIVE : ''}`}
                  onClick={() => (item.path ? navigate(item.path) : undefined)}
                >
                  {item.label}
                </button>
              );
            })}
          </motion.nav>
        ) : (
          <motion.div
            key="context"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mr-2.5 flex h-[60px] min-w-0 items-center gap-2 overflow-x-auto rounded-[15px] bg-[#414141] px-1.5 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          >
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant ?? 'ghost'}
                  isDisabled={action.isDisabled}
                  onPress={action.onPress}
                  className="h-[50px] gap-1.5 whitespace-nowrap text-[13px]"
                >
                  {Icon ? <Icon size={16} /> : null}
                  {action.label}
                </Button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="accent-cta h-[60px] justify-center px-4 whitespace-nowrap max-lg:px-3.5 max-lg:text-[13px] max-sm:hidden"
      >
        К работам
      </button>
    </div>
  );
}
