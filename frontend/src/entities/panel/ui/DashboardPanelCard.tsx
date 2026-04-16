import {
  widgetPresets,
  type EditableDashboardPanel
} from '../model/dashboardPanelData';

type DashboardPanelCardProps = {
  panel: EditableDashboardPanel;
  isEditMode?: boolean;
  onEditWidget?: () => void;
};

export function DashboardPanelCard({
  panel,
  isEditMode = false,
  onEditWidget
}: DashboardPanelCardProps) {
  const widget = widgetPresets.find((item) => item.id === panel.widgetId);

  return (
    <section className={`content-panel ${panel.accent === 'soft' ? 'content-panel--soft' : ''}`}>
      <header className="content-panel__header">
        <div>
          <h3>{panel.title}</h3>
          {widget ? <p className="content-panel__widget-label">{widget.title}</p> : null}
        </div>
        {isEditMode ? (
          <button type="button" className="content-panel__edit-button" onClick={onEditWidget} aria-label="Редактировать виджет">
            ✎
          </button>
        ) : null}
      </header>

      {panel.type === 'notifications' && (
        <div className="content-panel__stack">
          <article className="content-panel__note">
            <span className="content-panel__tag">Система</span>
            <p>Открыт новый модуль по веб-разработке. Доступ к заданиям до 20 апреля.</p>
          </article>
          <article className="content-panel__note">
            <span className="content-panel__tag">Преподаватель</span>
            <p>Марина Викторовна добавила комментарии к последней лабораторной работе.</p>
          </article>
          <article className="content-panel__note">
            <span className="content-panel__tag">Куратор</span>
            <p>Напоминание: завтра в 10:00 вебинар по итоговому проекту и вопросам по курсам.</p>
          </article>
        </div>
      )}

      {panel.type === 'progress' && (
        <div className="content-panel__progress">
          <div>
            <span className="content-panel__eyebrow">Сейчас в работе</span>
            <strong>Веб-разработка</strong>
            <p>Следующий урок: WebSocket и real-time обновления интерфейса.</p>
          </div>
          <div className="content-panel__progress-bar">
            <div style={{ width: '68%' }} />
          </div>
          <div className="content-panel__metrics">
            <span>Прогресс: 68%</span>
            <span>До завершения: 6 занятий</span>
          </div>
        </div>
      )}

      {panel.type === 'performance' && (
        <div className="content-panel__stats-grid">
          <article>
            <strong>4.7 / 5</strong>
            <span>Средний балл</span>
          </article>
          <article>
            <strong>92%</strong>
            <span>Выполнено заданий</span>
          </article>
          <article>
            <strong>6 место</strong>
            <span>В рейтинге группы</span>
          </article>
          <article>
            <strong>11</strong>
            <span>Курсов завершено</span>
          </article>
        </div>
      )}

      {panel.type === 'deadlines' && (
        <div className="content-panel__stack">
          <article className="content-panel__deadline">
            <strong>Лабораторная по SQL</strong>
            <span>Сдать до 18 апреля, 23:59</span>
          </article>
          <article className="content-panel__deadline">
            <strong>Тест по UX-исследованиям</strong>
            <span>Сдать до 19 апреля, 18:00</span>
          </article>
          <article className="content-panel__deadline">
            <strong>Черновик дипломного проекта</strong>
            <span>Показать куратору 22 апреля</span>
          </article>
        </div>
      )}

      {panel.type === 'activity' && (
        <div className="content-panel__mini-metrics">
          <article>
            <strong>14 ч</strong>
            <span>Время обучения</span>
          </article>
          <article>
            <strong>9</strong>
            <span>Пройдено уроков</span>
          </article>
          <article>
            <strong>3</strong>
            <span>Онлайн-сессии</span>
          </article>
        </div>
      )}

      {panel.type === 'recommendations' && (
        <div className="content-panel__chips">
          <span>Финальный тренажёр по JS</span>
          <span>Повторение по БД</span>
          <span>Воркшоп по soft skills</span>
        </div>
      )}

      {panel.type === 'webinars' && (
        <div className="content-panel__stack">
          <article className="content-panel__deadline">
            <strong>Live Q&A по итоговому проекту</strong>
            <span>Сегодня, 19:00. Подключение по ссылке из курса.</span>
          </article>
          <article className="content-panel__deadline">
            <strong>Разбор типичных ошибок</strong>
            <span>Пятница, 18:30. Сессия с преподавателем и разбором кейсов.</span>
          </article>
        </div>
      )}

      {panel.type === 'certificates' && (
        <div className="content-panel__chips">
          <span>Сертификат: SQL Basics</span>
          <span>Достижение: 30 дней подряд</span>
          <span>Бейдж: Лучший прогресс недели</span>
        </div>
      )}
    </section>
  );
}
