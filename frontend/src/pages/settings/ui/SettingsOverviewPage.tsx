import {
  Bell,
  Bookmark,
  ChevronRight,
  FlaskConical,
  HardDrive,
  Lock,
  Palette,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardEditorStore } from '../../../shared/model/useDashboardEditorStore';
import { DashboardEditorShell } from '../../../widgets/shell/ui/DashboardEditorShell';
import { settingsSectionsMap } from '../model/settingsSections';

const CARD_BASE =
  'overflow-hidden rounded-[22px] border border-border bg-(--panel-bg) shadow-card';

const CARD_LABS =
  'border-dashed border-[rgba(93,199,222,0.4)] dark:border-[rgba(93,199,222,0.25)]';

const ROW_BASE =
  'flex w-full cursor-pointer items-center gap-3.5 border-none bg-transparent px-4 py-3.5 text-left text-inherit transition-[background] duration-150 hover:bg-accent-soft-bg-subtle dark:hover:bg-[rgba(155,232,247,0.04)]';

const ROW_ICON =
  'grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft-bg-subtle text-[#5dc7de]';

const ROW_LABEL =
  'flex items-center gap-2 text-[15px] font-medium text-[#31404d] dark:text-[#e8f0f7]';

const ROW_DESC = 'mt-0.5 text-xs text-text-muted';

const ROW_CHEVRON = 'shrink-0 text-text-muted opacity-60';

const DIVIDER =
  'mx-4 ml-16 h-px bg-[rgba(219,229,238,0.6)] dark:bg-[rgba(42,60,74,0.6)]';

type SettingsRowProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
};

function SettingsRow({ to, icon, label, desc }: SettingsRowProps) {
  return (
    <Link to={to} className={ROW_BASE}>
      <span className={ROW_ICON}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className={ROW_LABEL}>{label}</span>
        <span className={`block ${ROW_DESC}`}>{desc}</span>
      </span>
      <ChevronRight size={16} className={ROW_CHEVRON} />
    </Link>
  );
}

export function SettingsOverviewPage() {
  const theme = useDashboardEditorStore((state) => state.theme);
  const toggleTheme = useDashboardEditorStore((state) => state.toggleTheme);

  const profile = settingsSectionsMap.profile;
  const favorites = settingsSectionsMap.favorites;
  const notifications = settingsSectionsMap.notifications;
  const privacy = settingsSectionsMap.privacy;
  const storage = settingsSectionsMap.storage;
  const appearance = settingsSectionsMap.appearance;
  const labs = settingsSectionsMap.labs;

  return (
    <DashboardEditorShell>
      <div className="mx-auto flex max-w-[600px] flex-col gap-4 px-0 py-2 max-lg:max-w-none max-lg:px-0">
        <div className="shadow-card border-border flex items-center gap-[18px] rounded-3xl border bg-[linear-gradient(180deg,rgba(155,232,247,0.08)_0%,transparent_60%),var(--panel-bg)] p-6 px-6 max-sm:rounded-[18px] max-sm:p-5 max-sm:px-4 dark:bg-[linear-gradient(180deg,rgba(54,104,122,0.12)_0%,transparent_60%),rgba(18,26,34,0.92)]">
          <div className="grid size-[72px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#9be8f7] to-[#5dc7de] text-white max-lg:size-[60px] dark:from-[#235165] dark:to-[#1d7f95]">
            <User size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-text-primary m-0 mb-1 text-xl font-semibold">
              Максим Каревский
            </h2>
            <p className="text-text-muted m-0 text-[13px]">
              @nestjest · Студент · Web Engineering
            </p>
          </div>
          <Link
            to="/settings/profile"
            className="border-border-muted hover:bg-accent-soft-bg-subtle grid size-9 shrink-0 place-items-center rounded-[10px] border bg-white/78 text-[#80909f] transition-[background,color] duration-150 hover:text-[#3d4b58] dark:text-[#9eb1c2] dark:hover:bg-[rgba(48,114,132,0.22)] dark:hover:text-[#dbe8f2]"
            aria-label="Открыть настройки профиля"
          >
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className={CARD_BASE}>
          <SettingsRow
            to="/settings/profile"
            icon={<User size={18} />}
            label={profile.title}
            desc={profile.summary}
          />
        </div>

        <div className={CARD_BASE}>
          <SettingsRow
            to="/settings/favorites"
            icon={<Bookmark size={18} />}
            label={favorites.title}
            desc={favorites.summary}
          />
        </div>

        <div className={CARD_BASE}>
          <SettingsRow
            to="/settings/notifications"
            icon={<Bell size={18} />}
            label={notifications.title}
            desc={notifications.summary}
          />
          <div className={DIVIDER} />
          <SettingsRow
            to="/settings/privacy"
            icon={<Lock size={18} />}
            label={privacy.title}
            desc={privacy.summary}
          />
          <div className={DIVIDER} />
          <SettingsRow
            to="/settings/storage"
            icon={<HardDrive size={18} />}
            label={storage.title}
            desc={storage.summary}
          />
        </div>

        <div className={CARD_BASE}>
          <SettingsRow
            to="/settings/appearance"
            icon={<Palette size={18} />}
            label={appearance.title}
            desc={appearance.summary}
          />
          <div className={DIVIDER} />
          <div
            className={`${ROW_BASE} cursor-default hover:bg-transparent dark:hover:bg-transparent`}
          >
            <span className={ROW_ICON}>
              <Palette size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={ROW_LABEL}>Быстрое переключение темы</span>
              <span className={`block ${ROW_DESC}`}>
                {theme === 'dark' ? 'Тёмная' : 'Светлая'}
              </span>
            </span>
            <button
              type="button"
              className={`relative h-[26px] w-11 shrink-0 cursor-pointer rounded-[13px] border-none p-0 transition-colors duration-200 ${theme === 'dark' ? 'bg-[#5dc7de] dark:bg-[#1d7f95]' : 'bg-[rgba(180,195,210,0.4)] dark:bg-[rgba(60,80,95,0.5)]'}`}
              onClick={toggleTheme}
              aria-label="Переключить тему"
            >
              <span
                className={`absolute top-0.5 left-0.5 size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform duration-200 ${theme === 'dark' ? 'translate-x-[18px]' : ''}`}
              />
            </button>
          </div>
        </div>

        <div className={`${CARD_BASE} ${CARD_LABS}`}>
          <Link to="/settings/labs" className={ROW_BASE}>
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[rgba(93,199,222,0.18)] text-[#3ba8c0]">
              <FlaskConical size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={ROW_LABEL}>
                {labs.title}
                <span className="inline-flex rounded-md bg-[rgba(155,232,247,0.25)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-[#1e4b57] uppercase dark:text-[#97e5f5]">
                  Beta
                </span>
              </span>
              <span className={`block ${ROW_DESC}`}>{labs.summary}</span>
            </span>
            <ChevronRight size={16} className={ROW_CHEVRON} />
          </Link>
        </div>
      </div>
    </DashboardEditorShell>
  );
}
