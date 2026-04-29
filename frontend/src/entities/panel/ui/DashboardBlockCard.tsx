import { Button } from '@heroui/react';
import { X } from 'lucide-react';
import type { DashboardEditorPanel } from '@/entities/panel/model/dashboardEditorData';

type Props = {
  panel: DashboardEditorPanel;
  isEditMode?: boolean;
  onRemove?: () => void;
  onResize?: () => void;
};

const CARD_BASE = 'card flex h-full flex-col max-sm:rounded-[18px]';

const CARD_MIN_HEIGHT: Record<'small' | 'medium' | 'large', string> = {
  small: 'min-h-[160px]',
  medium: 'min-h-[230px]',
  large: 'min-h-[260px]',
};

const CARD_SOFT =
  'bg-gradient-to-b from-white/84 to-[rgba(246,250,255,0.92)] dark:from-surface dark:to-surface';

const NOTE_P = 'm-0 text-[13px] leading-[1.45] text-text-secondary';

const HEADING_STRONG = 'mb-1.5 block text-lg text-text-primary';

const METRIC_STRONG = 'mb-1 block text-2xl text-text-primary';

export function DashboardBlockCard(props: Props) {
  const { panel, isEditMode = false, onRemove, onResize } = props;

  return (
    <section
      className={`${CARD_BASE} ${CARD_MIN_HEIGHT[panel.size ?? 'small']} ${panel.accent === 'soft' ? CARD_SOFT : ''}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-text-primary mb-2 text-base font-semibold">
            {panel.title}
          </h3>
        </div>
        {isEditMode ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="icon-button size-8 rounded-[10px] text-xs font-bold tracking-[0.06em]"
              onClick={onResize}
              aria-label="Изменить размер блока"
            >
              {panel.size === 'small'
                ? 'S'
                : panel.size === 'medium'
                  ? 'M'
                  : 'L'}
            </button>
            <Button
              isIconOnly
              variant="danger"
              aria-label="Удалить блок"
              onPress={onRemove}
            >
              <X size={16} />
            </Button>
          </div>
        ) : null}
      </header>

      {panel.type === 'notifications' && (
        <div className="flex flex-col gap-3">
          <article className="note-box">
            <span className="tag">Система</span>
            <p className={NOTE_P}>
              Открыт новый модуль по веб-разработке. Доступ к заданиям активен
              до 20 апреля.
            </p>
          </article>
          <article className="note-box">
            <span className="tag">Преподаватель</span>
            <p className={NOTE_P}>
              Марина Викторовна добавила комментарии к последней лабораторной
              работе.
            </p>
          </article>
          <article className="note-box">
            <span className="tag">Куратор</span>
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
            <span className="tag">Сейчас в работе</span>
            <strong className={HEADING_STRONG}>Веб-разработка</strong>
            <p className={NOTE_P}>
              Следующий урок: WebSocket и real-time обновления интерфейса.
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#e7eef5] dark:bg-[#253441]">
            <div
              className="from-accent-gradient-from to-accent h-full rounded-[inherit] bg-gradient-to-r"
              style={{ width: '68%' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <span className="meta-text">Прогресс: 68%</span>
            <span className="meta-text">До завершения: 6 занятий</span>
          </div>
        </div>
      )}

      {panel.type === 'performance' && (
        <div className="grid grid-cols-2 gap-3">
          <article className="metric-article">
            <strong className={METRIC_STRONG}>4.7 / 5</strong>
            <span className="meta-text">Средний балл</span>
          </article>
          <article className="metric-article">
            <strong className={METRIC_STRONG}>92%</strong>
            <span className="meta-text">Выполнено заданий</span>
          </article>
          <article className="metric-article">
            <strong className={METRIC_STRONG}>6 место</strong>
            <span className="meta-text">В рейтинге группы</span>
          </article>
          <article className="metric-article">
            <strong className={METRIC_STRONG}>11</strong>
            <span className="meta-text">Курсов завершено</span>
          </article>
        </div>
      )}

      {panel.type === 'deadlines' && (
        <div className="flex flex-col gap-3">
          <article className="note-box">
            <strong className={HEADING_STRONG}>Лабораторная по SQL</strong>
            <span className={NOTE_P}>Сдать до 18 апреля, 23:59</span>
          </article>
          <article className="note-box">
            <strong className={HEADING_STRONG}>Тест по UX-исследованиям</strong>
            <span className={NOTE_P}>Сдать до 19 апреля, 18:00</span>
          </article>
          <article className="note-box">
            <strong className={HEADING_STRONG}>
              Черновик дипломного проекта
            </strong>
            <span className={NOTE_P}>Показать куратору 22 апреля</span>
          </article>
        </div>
      )}

      {panel.type === 'activity' && (
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <article className="metric-article">
            <strong className={METRIC_STRONG}>14 ч</strong>
            <span className="meta-text">Время обучения</span>
          </article>
          <article className="metric-article">
            <strong className={METRIC_STRONG}>9</strong>
            <span className="meta-text">Пройдено уроков</span>
          </article>
          <article className="metric-article">
            <strong className={METRIC_STRONG}>3</strong>
            <span className="meta-text">Онлайн-сессии</span>
          </article>
        </div>
      )}

      {panel.type === 'recommendations' && (
        <div className="flex flex-wrap gap-2.5">
          <span className="chip">Финальный тренажер по JS</span>
          <span className="chip">Повторение по БД</span>
          <span className="chip">Воркшоп по soft skills</span>
        </div>
      )}

      {panel.type === 'webinars' && (
        <div className="flex flex-col gap-3">
          <article className="note-box">
            <strong className={HEADING_STRONG}>
              Live Q&amp;A по итоговому проекту
            </strong>
            <span className={NOTE_P}>
              Сегодня, 19:00. Подключение по ссылке из курса.
            </span>
          </article>
          <article className="note-box">
            <strong className={HEADING_STRONG}>Разбор типичных ошибок</strong>
            <span className={NOTE_P}>
              Пятница, 18:30. Сессия с преподавателем и разбором кейсов.
            </span>
          </article>
        </div>
      )}

      {panel.type === 'certificates' && (
        <div className="flex flex-wrap gap-2.5">
          <span className="chip">Сертификат: SQL Basics</span>
          <span className="chip">Достижение: 30 дней подряд</span>
          <span className="chip">Бейдж: Лучший прогресс недели</span>
        </div>
      )}
    </section>
  );
}
