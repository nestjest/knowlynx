import { WidgetIcon } from '../../../shared/ui/icons';
import {
  quickAccessWidgetPresets,
  type QuickAccessItem,
} from '../model/quickAccessEditorData';

type QuickAccessWidgetCardProps = {
  item: QuickAccessItem;
  isEditMode?: boolean;
  onEditWidget?: () => void;
};

export function QuickAccessWidgetCard({
  item,
  isEditMode = false,
  onEditWidget,
}: QuickAccessWidgetCardProps) {
  const widget = quickAccessWidgetPresets.find(
    (entry) => entry.id === item.widgetId,
  );

  if (!widget) {
    return null;
  }

  return (
    <article className="rounded-card-lg border-border shadow-card dark:from-surface dark:to-surface flex min-h-[146px] justify-between gap-4 overflow-hidden border bg-gradient-to-b from-white/85 to-[rgba(245,248,252,0.92)] px-[18px] py-5 max-sm:min-h-[132px] max-sm:flex-col max-sm:items-stretch max-sm:rounded-[18px]">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="eyebrow text-accent-eyebrow tracking-[0.04em]">
          Быстрый доступ
        </span>

        <div>
          <h3 className="text-text-primary mb-1.5 text-lg font-semibold">
            {widget.title}
          </h3>
          <p className="text-text-secondary max-w-[320px] text-xs leading-[1.45]">
            {widget.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between gap-3 max-sm:flex-row max-sm:items-center">
        {isEditMode ? (
          <button
            type="button"
            className="icon-button size-8 rounded-[10px]"
            onClick={onEditWidget}
            aria-label="Изменить виджет"
          >
            ✎
          </button>
        ) : null}

        <div
          aria-hidden="true"
          className="border-accent-soft-border from-accent-soft-bg-subtle dark:border-accent-soft-border relative flex size-[92px] min-w-[92px] items-center justify-center rounded-3xl border bg-gradient-to-b to-white/40 p-3 max-sm:size-[88px] max-sm:min-w-[88px] dark:from-[rgba(30,56,70,0.72)] dark:to-[rgba(20,32,42,0.82)]"
        >
          <div className="absolute inset-0 grid place-items-center">
            <span className="bg-accent-soft-bg-subtle dark:bg-accent-soft-bg-subtle block size-[54px] rounded-[18px]" />
          </div>
          <div className="dark:bg-surface dark:text-text-primary grid size-12 place-items-center rounded-2xl bg-[rgba(233,250,254,0.95)] text-[#32404d] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            <WidgetIcon size={32} />
          </div>
        </div>
      </div>
    </article>
  );
}
