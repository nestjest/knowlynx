import {
  User,
  Bookmark,
  Bell,
  Lock,
  HardDrive,
  Palette,
  FlaskConical,
  ChevronRight
} from 'lucide-react';
import { useDashboardEditorStore } from '../../../shared/model/useDashboardEditorStore';
import { DashboardEditorShell } from '../../../widgets/shell/ui/DashboardEditorShell';

export function SettingsPage() {
  const theme = useDashboardEditorStore((state) => state.theme);
  const toggleTheme = useDashboardEditorStore((state) => state.toggleTheme);

  return (
    <DashboardEditorShell>
      <div className="settings">
        <div className="settings__profile">
          <div className="settings__avatar">
            <User size={28} />
          </div>
          <div className="settings__profile-info">
            <h2 className="settings__profile-name">Максим Каревский</h2>
            <p className="settings__profile-meta">@nestjest · Студент</p>
          </div>
          <button type="button" className="settings__profile-edit" aria-label="Редактировать профиль">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="settings__card">
          <button type="button" className="settings__row">
            <span className="settings__row-icon">
              <Bookmark size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">Избранное</span>
              <span className="settings__row-desc">Сохранённые материалы и курсы</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </button>
        </div>

        <div className="settings__card">
          <button type="button" className="settings__row">
            <span className="settings__row-icon">
              <Bell size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">Уведомления</span>
              <span className="settings__row-desc">Настройка push и email</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </button>
          <div className="settings__divider" />
          <button type="button" className="settings__row">
            <span className="settings__row-icon">
              <Lock size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">Приватность</span>
              <span className="settings__row-desc">Видимость профиля и данных</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </button>
          <div className="settings__divider" />
          <button type="button" className="settings__row">
            <span className="settings__row-icon">
              <HardDrive size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">Дата и Storage</span>
              <span className="settings__row-desc">Кэш, загрузки и хранилище</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </button>
        </div>

        <div className="settings__card">
          <div className="settings__row settings__row--toggle">
            <span className="settings__row-icon">
              <Palette size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">Тема</span>
              <span className="settings__row-desc">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
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
          <button type="button" className="settings__row">
            <span className="settings__row-icon settings__row-icon--accent">
              <FlaskConical size={18} />
            </span>
            <span className="settings__row-content">
              <span className="settings__row-label">
                LABS
                <span className="settings__badge">Beta</span>
              </span>
              <span className="settings__row-desc">Экспериментальные функции</span>
            </span>
            <ChevronRight size={16} className="settings__row-chevron" />
          </button>
        </div>
      </div>
    </DashboardEditorShell>
  );
}
