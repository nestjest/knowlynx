import { CourseSection } from '../../../features/section-navigation/ui/SectionMenu';
import { quickAccessItems } from '../../../entities/quick-access/model/quickAccessData';
import { QuickAccessCard } from '../../../entities/quick-access/ui/QuickAccessCard';
import { panels } from '../../../entities/panel/model/panelData';
import { ContentPanel } from '../../../entities/panel/ui/ContentPanel';

export function DashboardLayout() {
  return (
    <main className="dashboard">
      <section className="dashboard__workspace dashboard__workspace--full" aria-label="Главная страница">
        <header className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Главная страница</h1>
            <p className="dashboard__subtitle">Обзор обучения, задач и активности студента</p>
          </div>

          <div className="dashboard__actions">
            <button type="button" className="dashboard__icon-button" aria-label="Уведомления">
              ⌁
            </button>
            <button type="button" className="dashboard__icon-button" aria-label="Редактировать">
              ✎
            </button>
          </div>
        </header>

        <section className="dashboard__quick-grid" aria-label="Быстрый доступ">
          {quickAccessItems.map((card) => (
            <QuickAccessCard key={card.id} item={card} />
          ))}
        </section>

        <section className="dashboard__panels" aria-label="Контент">
          {panels.map((panel) => (
            <ContentPanel key={panel.id} panel={panel} />
          ))}
        </section>

        <CourseSection />
      </section>
    </main>
  );
}
