import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { DashboardBlockCard } from '@/entities/panel/ui/DashboardBlockCard';
import type { DashboardEditorPanel } from '@/entities/panel/model/dashboardEditorData';

const SLOT_COL_SPAN: Record<'small' | 'medium' | 'large', string> = {
  small: 'col-span-4 max-xl:col-span-3 max-sm:col-span-full',
  medium: 'col-span-6 max-xl:col-span-3 max-sm:col-span-full',
  large: 'col-span-full',
};

const SLOT_EDITABLE =
  'cursor-grab relative rounded-[28px] border border-dashed border-[rgba(137,213,228,0.6)] bg-[linear-gradient(0deg,rgba(155,232,247,0.08),rgba(155,232,247,0.08)),rgba(255,255,255,0.22)] p-2.5 active:cursor-grabbing dark:border-[rgba(72,146,168,0.55)] dark:bg-[linear-gradient(0deg,rgba(43,94,111,0.15),rgba(43,94,111,0.15)),rgba(16,24,31,0.3)]';

const SLOT_OVER =
  'border-[rgba(82,196,220,0.95)] bg-[linear-gradient(0deg,rgba(155,232,247,0.18),rgba(155,232,247,0.18)),rgba(255,255,255,0.32)] shadow-[0_0_0_2px_rgba(82,196,220,0.16)] dark:border-[rgba(88,174,199,0.9)]';

type Props = {
  panel: DashboardEditorPanel;
  isEditMode: boolean;
  onRemove: () => void;
  onResize: () => void;
};

export function SortablePanel(props: Props) {
  const { panel, isEditMode, onRemove, onResize } = props;
  const { attributes, listeners, setNodeRef, isDragging, isOver } = useSortable({
    id: panel.id,
    disabled: !isEditMode,
  });
  const size = panel.size ?? 'medium';
  const className = [
    'h-full min-w-0',
    SLOT_COL_SPAN[size],
    isEditMode ? SLOT_EDITABLE : '',
    isOver && !isDragging ? SLOT_OVER : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      ref={setNodeRef}
      layout
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className={className}
      style={{ visibility: isDragging ? 'hidden' : undefined }}
      {...attributes}
      {...listeners}
    >
      {isEditMode ? (
        <span className="absolute -top-2.5 left-4 rounded-full border border-[rgba(155,232,247,0.55)] bg-[#f3fbff] px-2.5 py-0.5 text-[11px] text-[#4f7482] opacity-[0.92] dark:border-[rgba(72,146,168,0.45)] dark:bg-[#14202a] dark:text-[#9bc4d0]">
          Перетащи блок в нужную ячейку
        </span>
      ) : null}
      <DashboardBlockCard
        panel={panel}
        isEditMode={isEditMode}
        onRemove={onRemove}
        onResize={onResize}
      />
    </motion.div>
  );
}
