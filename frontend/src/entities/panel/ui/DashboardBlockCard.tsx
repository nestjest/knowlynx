import type { DashboardEditorPanel } from '../model/dashboardEditorData';

type DashboardBlockCardProps = {
  panel: DashboardEditorPanel;
  isEditMode?: boolean;
  onRemove?: () => void;
  onResize?: () => void;
};

const CARD_BASE =
  'flex h-full flex-col rounded-[22px] border border-[rgba(219,229,238,0.95)] bg-(--panel-bg) p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] max-sm:rounded-[18px] dark:border-[rgba(41,57,70,0.95)] dark:bg-[rgba(18,26,34,0.92)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';

const CARD_MIN_HEIGHT: Record<'small' | 'medium' | 'large', string> = {
  small: 'min-h-[160px]',
  medium: 'min-h-[230px]',
  large: 'min-h-[260px]',
};

const CARD_SOFT =
  'bg-gradient-to-b from-white/84 to-[rgba(246,250,255,0.92)] dark:from-[rgba(18,26,34,0.92)] dark:to-[rgba(18,26,34,0.92)]';

const NOTE_BOX =
  'rounded-2xl border border-[rgba(219,229,238,0.9)] bg-white/70 p-3.5 dark:border-[rgba(42,60,74,0.9)] dark:bg-[rgba(23,34,44,0.92)]';

const NOTE_P =
  'm-0 text-[13px] leading-[1.45] text-[#637180] dark:text-[#9eb1c2]';

const TAG =
  'mb-2 inline-flex rounded-full bg-[rgba(155,232,247,0.22)] px-2 py-1 text-[11px] font-semibold text-[#2b6a78] dark:bg-[rgba(57,148,173,0.24)] dark:text-[#97e5f5]';

const HEADING_STRONG =
  'mb-1.5 block text-lg text-[#24303a] dark:text-[#eef5fb]';

const METRIC_LABEL = 'text-xs text-[#748291] dark:text-[#9eb1c2]';

const METRIC_ARTICLE =
  'rounded-2xl border border-[rgba(219,229,238,0.9)] bg-white/74 p-3.5 dark:border-[rgba(42,60,74,0.9)] dark:bg-[rgba(23,34,44,0.92)]';

const METRIC_STRONG = 'mb-1 block text-2xl text-[#24303a] dark:text-[#eef5fb]';

const CHIP =
  'rounded-full border border-[rgba(219,229,238,0.95)] bg-white/78 px-3 py-2.5 text-[13px] text-[#50606d] dark:border-[rgba(42,60,74,0.95)] dark:bg-[rgba(22,34,44,0.92)] dark:text-[#c7d6e3]';

export function DashboardBlockCard({
  panel,
  isEditMode = false,
  onRemove,
  onResize,
}: DashboardBlockCardProps) {
  return (
    <section
      className={`${CARD_BASE} ${CARD_MIN_HEIGHT[panel.size ?? 'small']} ${panel.accent === 'soft' ? CARD_SOFT : ''}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="mb-2 text-base font-semibold text-[#26313b] dark:text-[#eef5fb]">
            {panel.title}
          </h3>
        </div>
        {isEditMode ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="mb-5 h-8 w-8 flex-shrink-0 rounded-[10px] border border-[var(--control-border)] bg-[var(--control-bg)] px-2.5 text-xs font-bold tracking-[0.06em] text-[var(--control-text)] dark:border-[rgba(57,78,95,0.95)] dark:bg-[rgba(21,31,40,0.96)] dark:text-[#dbe8f2] dark:shadow-none"
              onClick={onResize}
              aria-label="Изменить размер блока"
            >
              {panel.size === 'small'
                ? 'S'
                : panel.size === 'medium'
                  ? 'M'
                  : 'L'}
            </button>
            <button
              type="button"
              className="mb-5 h-8 w-8 flex-shrink-0 rounded-[10px] border border-[var(--control-danger-border)] bg-[var(--control-danger-bg)] text-lg leading-none text-[var(--control-danger-text)]"
              onClick={onRemove}
              aria-label="Удалить блок"
            >
              ×
            </button>
          </div>
        ) : null}
      </header>

      {panel.type === 'notifications' && (
        <div className="flex flex-col gap-3">
          <article className={NOTE_BOX}>
            <span className={TAG}>Система</span>
            <p className={NOTE_P}>
              Открыт новый модуль по веб-разработке. Доступ к заданиям активен
              до 20 апреля.
            </p>
          </article>
          <article className={NOTE_BOX}>
            <span className={TAG}>Преподаватель</span>
            <p className={NOTE_P}>
              Марина Викторовна добавила комментарии к последней лабораторной
              работе.
            </p>
          </article>
          <article className={NOTE_BOX}>
            <span className={TAG}>Куратор</span>
            <p className={NOTE_P}>
              Напоминание: завтра в 10:00 вебинар по итоговому проекту и
              вопросам по курсам.
            </p>
          </article>
        </div>
      )}

      {panel.type === 'progress' && (
        <div className="flex flex-col gap-3.5">
          <div>
            <span className={TAG}>Сейчас в работе</span>
            <strong className={HEADING_STRONG}>Веб-разработка</strong>
            <p className={NOTE_P}>
              Следующий урок: WebSocket и real-time обновления интерфейса.
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#e7eef5] dark:bg-[#253441]">
            <div
              className="h-full rounded-[inherit] bg-gradient-to-r from-[#97e4f4] to-[#5dc7de]"
              style={{ width: '68%' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <span className={METRIC_LABEL}>Прогресс: 68%</span>
            <span className={METRIC_LABEL}>До завершения: 6 занятий</span>
          </div>
        </div>
      )}

      {panel.type === 'performance' && (
        <div className="grid grid-cols-2 gap-3">
          <article className={METRIC_ARTICLE}>
            <strong className={METRIC_STRONG}>4.7 / 5</strong>
            <span className={METRIC_LABEL}>Средний балл</span>
          </article>
          <article className={METRIC_ARTICLE}>
            <strong className={METRIC_STRONG}>92%</strong>
            <span className={METRIC_LABEL}>Выполнено заданий</span>
          </article>
          <article className={METRIC_ARTICLE}>
            <strong className={METRIC_STRONG}>6 место</strong>
            <span className={METRIC_LABEL}>В рейтинге группы</span>
          </article>
          <article className={METRIC_ARTICLE}>
            <strong className={METRIC_STRONG}>11</strong>
            <span className={METRIC_LABEL}>Курсов завершено</span>
          </article>
        </div>
      )}

      {panel.type === 'deadlines' && (
        <div className="flex flex-col gap-3">
          <article className={NOTE_BOX}>
            <strong className={HEADING_STRONG}>Лабораторная по SQL</strong>
            <span className={NOTE_P}>Сдать до 18 апреля, 23:59</span>
          </article>
          <article className={NOTE_BOX}>
            <strong className={HEADING_STRONG}>Тест по UX-исследованиям</strong>
            <span className={NOTE_P}>Сдать до 19 апреля, 18:00</span>
          </article>
          <article className={NOTE_BOX}>
            <strong className={HEADING_STRONG}>
              Черновик дипломного проекта
            </strong>
            <span className={NOTE_P}>Показать куратору 22 апреля</span>
          </article>
        </div>
      )}

      {panel.type === 'activity' && (
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <article className={METRIC_ARTICLE}>
            <strong className={METRIC_STRONG}>14 ч</strong>
            <span className={METRIC_LABEL}>Время обучения</span>
          </article>
          <article className={METRIC_ARTICLE}>
            <strong className={METRIC_STRONG}>9</strong>
            <span className={METRIC_LABEL}>Пройдено уроков</span>
          </article>
          <article className={METRIC_ARTICLE}>
            <strong className={METRIC_STRONG}>3</strong>
            <span className={METRIC_LABEL}>Онлайн-сессии</span>
          </article>
        </div>
      )}

      {panel.type === 'recommendations' && (
        <div className="flex flex-wrap gap-2.5">
          <span className={CHIP}>Финальный тренажер по JS</span>
          <span className={CHIP}>Повторение по БД</span>
          <span className={CHIP}>Воркшоп по soft skills</span>
        </div>
      )}

      {panel.type === 'webinars' && (
        <div className="flex flex-col gap-3">
          <article className={NOTE_BOX}>
            <strong className={HEADING_STRONG}>
              Live Q&amp;A по итоговому проекту
            </strong>
            <span className={NOTE_P}>
              Сегодня, 19:00. Подключение по ссылке из курса.
            </span>
          </article>
          <article className={NOTE_BOX}>
            <strong className={HEADING_STRONG}>Разбор типичных ошибок</strong>
            <span className={NOTE_P}>
              Пятница, 18:30. Сессия с преподавателем и разбором кейсов.
            </span>
          </article>
        </div>
      )}

      {panel.type === 'certificates' && (
        <div className="flex flex-wrap gap-2.5">
          <span className={CHIP}>Сертификат: SQL Basics</span>
          <span className={CHIP}>Достижение: 30 дней подряд</span>
          <span className={CHIP}>Бейдж: Лучший прогресс недели</span>
        </div>
      )}
    </section>
  );
}
