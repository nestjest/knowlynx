import { Button, Tooltip } from '@heroui/react';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Pencil, Plus } from 'lucide-react';
import { CourseSection } from '@/features/section-navigation/ui/SectionMenu';
import { QuickAccessWidgetCard } from '@/entities/quick-access/ui/QuickAccessWidgetCard';
import { useDashboardEditorStore } from '@/shared/model/useDashboardEditorStore';
import { SortablePanel } from './SortablePanel';

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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      movePanel(String(active.id), String(over.id));
    }
  };

  return (
    <main className="min-h-[calc(100vh-44px)]">
      <section
        className="flex w-full flex-col gap-[34px] pt-3"
        aria-label="Главная страница"
      >
        <header className="flex items-center justify-between gap-5 pr-1.5 max-lg:pr-0">
          <div>
            <h1 className="m-0 text-3xl font-semibold dark:text-[#eef5fb]">
              Главная страница
            </h1>
            <p className="text-text-muted m-0 mt-1.5 text-[13px]">
              Обзор обучения, задач и активности студента
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {isEditMode ? (
              <Button
                isIconOnly
                variant="ghost"
                aria-label="Добавить блок"
                onPress={openBlockDrawer}
              >
                <Plus size={18} />
              </Button>
            ) : null}
            <Tooltip delay={0}>
              <Button
                isIconOnly
                variant={isEditMode ? 'primary' : 'ghost'}
                aria-label="Редактировать макет"
                onPress={toggleEditMode}
              >
                <Pencil size={18} />
              </Button>
              <Tooltip.Content>
                <p>Редактировать макет</p>
              </Tooltip.Content>
            </Tooltip>
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={panels.map((panel) => panel.id)}
            strategy={rectSortingStrategy}
          >
            <section
              className="grid grid-cols-12 items-stretch gap-7 max-xl:grid-cols-6"
              aria-label="Контент"
            >
              {panels.map((panel) => (
                <SortablePanel
                  key={panel.id}
                  panel={panel}
                  isEditMode={isEditMode}
                  onRemove={() => removePanel(panel.id)}
                  onResize={() => cyclePanelSize(panel.id)}
                />
              ))}
            </section>
          </SortableContext>
        </DndContext>

        <CourseSection />
      </section>
    </main>
  );
}
