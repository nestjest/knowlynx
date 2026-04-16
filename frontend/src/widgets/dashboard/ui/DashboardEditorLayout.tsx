import { useState } from 'react';
import { CourseSection } from '../../../features/section-navigation/ui/SectionMenu';
import { QuickAccessEditorCard } from '../../../entities/quick-access/ui/QuickAccessEditorCard';
import { DashboardBlockCard } from '../../../entities/panel/ui/DashboardBlockCard';
import { useDashboardEditorStore } from '../../../shared/model/useDashboardEditorStore';

export function DashboardEditorLayout() {
  const quickItems = useDashboardEditorStore((state) => state.quickItems);
  const panels = useDashboardEditorStore((state) => state.panels);
  const isEditMode = useDashboardEditorStore((state) => state.isEditMode);
  const toggleEditMode = useDashboardEditorStore((state) => state.toggleEditMode);
  const openBlockDrawer = useDashboardEditorStore((state) => state.openBlockDrawer);
  const openWidgetDrawer = useDashboardEditorStore((state) => state.openWidgetDrawer);
  const removePanel = useDashboardEditorStore((state) => state.removePanel);
  const cyclePanelSize = useDashboardEditorStore((state) => state.cyclePanelSize);
  const movePanel = useDashboardEditorStore((state) => state.movePanel);
  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

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
          {quickItems.map((card) => (
            <QuickAccessEditorCard
              key={card.id}
              item={card}
              isEditMode={isEditMode}
              onEditWidget={() => openWidgetDrawer(card.id)}
            />
          ))}
        </section>

        <section className="dashboard__panels" aria-label="Контент">
          {panels.map((panel) => (
            <div
              key={panel.id}
              className={`dashboard__panel-slot dashboard__panel-slot--${panel.size ?? 'medium'} ${isEditMode ? 'dashboard__panel-slot--editable' : ''} ${
                dropTargetId === panel.id ? 'dashboard__panel-slot--target' : ''
              }`}
              draggable={isEditMode}
              onDragStart={() => {
                setDraggedPanelId(panel.id);
                setDropTargetId(panel.id);
              }}
              onDragOver={(event) => {
                if (isEditMode) {
                  event.preventDefault();
                  if (dropTargetId !== panel.id) {
                    setDropTargetId(panel.id);
                  }
                }
              }}
              onDrop={() => {
                if (isEditMode && draggedPanelId) {
                  movePanel(draggedPanelId, panel.id);
                  setDraggedPanelId(null);
                  setDropTargetId(null);
                }
              }}
              onDragEnd={() => {
                setDraggedPanelId(null);
                setDropTargetId(null);
              }}
            >
              <DashboardBlockCard
                panel={panel}
                isEditMode={isEditMode}
                onRemove={() => removePanel(panel.id)}
                onResize={() => cyclePanelSize(panel.id)}
              />
            </div>
          ))}
        </section>

        <CourseSection />
      </section>
    </main>
  );
}
