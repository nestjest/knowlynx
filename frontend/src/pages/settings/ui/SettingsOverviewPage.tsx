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
      <div className="settings">
        <div className="settings__profile">
          <div className="settings__avatar">
            <User size={28} />
          </div>
          <div className="settings__profile-info">
            <h2 className="settings__profile-name">Максим Каревский</h2>
            <p className="settings__profile-meta">
              @nestjest · Студент · Web Engineering
            </p>
          </div>
          <Link
            to="/settings/profile"
            className="settings__profile-edit"
            aria-label="Открыть настройки профиля"
          >
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="settings__card">
          <Link to="/settings/profile" className="settings__row">
            <span className="settings__row-icon">
              <User size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">{profile.title}</span>
              <span className="settings__row-desc">{profile.summary}</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </Link>
        </div>

        <div className="settings__card">
          <Link to="/settings/favorites" className="settings__row">
            <span className="settings__row-icon">
              <Bookmark size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">{favorites.title}</span>
              <span className="settings__row-desc">{favorites.summary}</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </Link>
        </div>

        <div className="settings__card">
          <Link to="/settings/notifications" className="settings__row">
            <span className="settings__row-icon">
              <Bell size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">{notifications.title}</span>
              <span className="settings__row-desc">
                {notifications.summary}
              </span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </Link>
          <div className="settings__divider" />
          <Link to="/settings/privacy" className="settings__row">
            <span className="settings__row-icon">
              <Lock size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">{privacy.title}</span>
              <span className="settings__row-desc">{privacy.summary}</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </Link>
          <div className="settings__divider" />
          <Link to="/settings/storage" className="settings__row">
            <span className="settings__row-icon">
              <HardDrive size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">{storage.title}</span>
              <span className="settings__row-desc">{storage.summary}</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </Link>
        </div>

        <div className="settings__card">
          <Link to="/settings/appearance" className="settings__row">
            <span className="settings__row-icon">
              <Palette size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">{appearance.title}</span>
              <span className="settings__row-desc">{appearance.summary}</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </Link>
          <div className="settings__divider" />
          <div className="settings__row settings__row--toggle">
            <span className="settings__row-icon">
              <Palette size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">
                Быстрое переключение темы
              </span>
              <span className="settings__row-desc">
                {theme === 'dark' ? 'Тёмная' : 'Светлая'}
              </span>
            </span>
            <button
              type="button"
              className={`settings__toggle ${theme === 'dark' ? 'settings__toggle--active' : ''}`}
              onClick={toggleTheme}
              aria-label="Переключить тему"
            >
              <span className="settings__toggle-thumb" />
            </button>
          </div>
        </div>

        <div className="settings__card settings__card--labs">
          <Link to="/settings/labs" className="settings__row">
            <span className="settings__row-icon settings__row-icon--accent">
              <FlaskConical size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">
                {labs.title}
                <span className="settings__badge">Beta</span>
              </span>
              <span className="settings__row-desc">{labs.summary}</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </Link>
        </div>
      </div>
    </DashboardEditorShell>
  );
}
