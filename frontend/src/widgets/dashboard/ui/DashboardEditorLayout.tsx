import { useState } from 'react';
import { CourseSection } from '../../../features/section-navigation/ui/SectionMenu';
import { QuickAccessWidgetCard } from '../../../entities/quick-access/ui/QuickAccessWidgetCard';
import { DashboardBlockCard } from '../../../entities/panel/ui/DashboardBlockCard';
import { useDashboardEditorStore } from '../../../shared/model/useDashboardEditorStore';

const ICON_BUTTON =
  'h-[34px] w-[34px] rounded-[10px] border border-[rgba(209,221,235,0.95)] bg-white/96 text-[#2f3b46] shadow-card-raised dark:text-[#dbe8f2] dark:shadow-none';

const ICON_BUTTON_ACTIVE =
  'bg-gradient-to-r from-[#9be8f7] to-[#bceeff] text-[#1e4b57]';

const SLOT_COL_SPAN: Record<'small' | 'medium' | 'large', string> = {
  small: 'col-span-4 max-xl:col-span-3 max-sm:col-span-full',
  medium: 'col-span-6 max-xl:col-span-3 max-sm:col-span-full',
  large: 'col-span-full',
};

const SLOT_EDITABLE =
  'cursor-grab relative rounded-[28px] border border-dashed border-[rgba(137,213,228,0.6)] bg-[linear-gradient(0deg,rgba(155,232,247,0.08),rgba(155,232,247,0.08)),rgba(255,255,255,0.22)] p-2.5 active:cursor-grabbing dark:border-[rgba(72,146,168,0.55)] dark:bg-[linear-gradient(0deg,rgba(43,94,111,0.15),rgba(43,94,111,0.15)),rgba(16,24,31,0.3)]';

const SLOT_TARGET =
  'border-[rgba(82,196,220,0.95)] bg-[linear-gradient(0deg,rgba(155,232,247,0.18),rgba(155,232,247,0.18)),rgba(255,255,255,0.32)] shadow-[0_0_0_2px_rgba(82,196,220,0.16)] dark:border-[rgba(88,174,199,0.9)] dark:bg-[linear-gradient(0deg,rgba(43,94,111,0.22),rgba(43,94,111,0.22)),rgba(16,24,31,0.42)]';

export function DashboardEditorLayout() {
  const quickItems = useDashboardEditorStore((state) => state.quickItems);
  const panels = useDashboardEditorStore((state) => state.panels);
  const isEditMode = useDashboardEditorStore((state) => state.isEditMode);
  const toggleEditMode = useDashboardEditorStore(
    (state) => state.toggleEditMode,
  );
  const openBlockDrawer = useDashboardEditorStore(
    (state) => state.openBlockDrawer,
  );
  const openWidgetDrawer = useDashboardEditorStore(
    (state) => state.openWidgetDrawer,
  );
  const removePanel = useDashboardEditorStore((state) => state.removePanel);
  const cyclePanelSize = useDashboardEditorStore(
    (state) => state.cyclePanelSize,
  );
  const movePanel = useDashboardEditorStore((state) => state.movePanel);
  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  return (
    <main className="min-h-[calc(100vh-44px)]">
      <section
        className="flex w-full flex-col gap-[34px] pt-3"
        aria-label="Главная страница"
      >
        <header className="flex items-center justify-between gap-5 pr-1.5 max-lg:pr-0">
          <div>
            <h1 className="m-0 text-[30px] font-semibold dark:text-[#eef5fb]">
              Главная страница
            </h1>
            <p className="text-text-muted m-0 mt-1.5 text-[13px]">
              Обзор обучения, задач и активности студента
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {isEditMode ? (
              <button
                type="button"
                className={ICON_BUTTON}
                aria-label="Добавить блок"
                onClick={openBlockDrawer}
              >
                +
              </button>
            ) : null}
            <button
              type="button"
              className={`${ICON_BUTTON} ${isEditMode ? ICON_BUTTON_ACTIVE : ''}`}
              aria-label="Редактировать макет"
              onClick={toggleEditMode}
            >
              ✎
            </button>
          </div>
        </header>

        <section
          className="grid grid-cols-3 gap-[26px] max-xl:grid-cols-1"
          aria-label="Быстрый доступ"
        >
          {quickItems.map((card) => (
            <QuickAccessWidgetCard
              key={card.id}
              item={card}
              isEditMode={isEditMode}
              onEditWidget={() => openWidgetDrawer(card.id)}
            />
          ))}
        </section>

        <section
          className="grid grid-cols-12 items-stretch gap-7 max-xl:grid-cols-6"
          aria-label="Контент"
        >
          {panels.map((panel) => {
            const size = panel.size ?? 'medium';
            const classes = [
              'h-full min-w-0',
              SLOT_COL_SPAN[size],
              isEditMode ? SLOT_EDITABLE : '',
              dropTargetId === panel.id ? SLOT_TARGET : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={panel.id}
                className={classes}
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
                {isEditMode ? (
                  <span className="absolute -top-2.5 left-4 rounded-full border border-[rgba(155,232,247,0.55)] bg-[#f3fbff] px-2.5 py-0.5 text-[11px] text-[#4f7482] opacity-[0.92] dark:border-[rgba(72,146,168,0.45)] dark:bg-[#14202a] dark:text-[#9bc4d0]">
                    Перетащи блок в нужную ячейку
                  </span>
                ) : null}
                <DashboardBlockCard
                  panel={panel}
                  isEditMode={isEditMode}
                  onRemove={() => removePanel(panel.id)}
                  onResize={() => cyclePanelSize(panel.id)}
                />
              </div>
            );
          })}
        </section>

        <CourseSection />
      </section>
    </main>
  );
}
