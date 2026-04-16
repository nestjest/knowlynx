import { useState } from 'react';
import { CourseSection } from '../../../features/section-navigation/ui/SectionMenu';
import { quickAccessItems } from '../../../entities/quick-access/model/quickAccessData';
import { QuickAccessCard } from '../../../entities/quick-access/ui/QuickAccessCard';
import { DashboardPanelCard } from '../../../entities/panel/ui/DashboardPanelCard';
import { useDashboardStore } from '../../../shared/model/useDashboardStore';

export function EditableDashboardLayout() {
  const panels = useDashboardStore((state) => state.panels);
  const isEditMode = useDashboardStore((state) => state.isEditMode);
  const toggleEditMode = useDashboardStore((state) => state.toggleEditMode);
  const openBlockDrawer = useDashboardStore((state) => state.openBlockDrawer);
  const openWidgetDrawer = useDashboardStore((state) => state.openWidgetDrawer);
  const movePanel = useDashboardStore((state) => state.movePanel);
  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null);

  return (
    <main className="dashboard">
      <section className="dashboard__workspace dashboard__workspace--full" aria-label="Главная страница">
        <header className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Главная страница</h1>
            <p className="dashboard__subtitle">Обзор обучения, задач и активности студента</p>
          </div>

          <div className="dashboard__actions">
            {isEditMode ? (
              <button type="button" className="dashboard__icon-button" aria-label="Добавить блок" onClick={openBlockDrawer}>
                +
              </button>
            ) : null}
            <button
              type="button"
              className={`dashboard__icon-button ${isEditMode ? 'dashboard__icon-button--active' : ''}`}
              aria-label="Редактировать макет"
              onClick={toggleEditMode}
            >
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
            <div
              key={panel.id}
              className={`dashboard__panel-slot ${isEditMode ? 'dashboard__panel-slot--editable' : ''}`}
              draggable={isEditMode}
              onDragStart={() => setDraggedPanelId(panel.id)}
              onDragOver={(event) => {
                if (isEditMode) {
                  event.preventDefault();
                }
              }}
              onDrop={() => {
                if (isEditMode && draggedPanelId) {
                  movePanel(draggedPanelId, panel.id);
                  setDraggedPanelId(null);
                }
              }}
              onDragEnd={() => setDraggedPanelId(null)}
            >
              <DashboardPanelCard
                panel={panel}
                isEditMode={isEditMode}
                onEditWidget={() => openWidgetDrawer(panel.id)}
              />
            </div>
          ))}
        </section>

        <CourseSection />
      </section>
    </main>
  );
}
