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
    <article className="flex min-h-[146px] justify-between gap-4 overflow-hidden rounded-3xl border border-[rgba(219,229,238,0.85)] bg-gradient-to-b from-white/85 to-[rgba(245,248,252,0.92)] px-[18px] py-5 shadow-(--shadow-soft) max-sm:min-h-[132px] max-sm:flex-col max-sm:items-stretch max-sm:rounded-[18px] dark:border-[rgba(41,57,70,0.95)] dark:from-[rgba(18,26,34,0.92)] dark:to-[rgba(18,26,34,0.92)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="text-[11px] leading-none font-bold tracking-[0.04em] text-[#62a8b9] uppercase dark:text-[#8adcee]">
          Быстрый доступ
        </span>

        <div>
          <h3 className="mb-1.5 text-lg font-semibold dark:text-[#eef5fb]">
            {widget.title}
          </h3>
          <p className="max-w-[320px] text-xs leading-[1.45] text-[#8b98a4] dark:text-[#9eb1c2]">
            {widget.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between gap-3 max-sm:flex-row max-sm:items-center">
        {isEditMode ? (
          <button
            type="button"
            className="h-8 w-8 rounded-[10px] border border-[var(--control-border)] bg-[var(--control-bg)] text-[var(--control-text)] dark:border-[rgba(57,78,95,0.95)] dark:bg-[rgba(21,31,40,0.96)] dark:text-[#dbe8f2] dark:shadow-none"
            onClick={onEditWidget}
            aria-label="Изменить виджет"
          >
            ✎
          </button>
        ) : null}

        <div
          aria-hidden="true"
          className="relative flex h-[92px] w-[92px] min-w-[92px] items-center justify-center rounded-3xl border border-[rgba(155,232,247,0.22)] bg-gradient-to-b from-[rgba(155,232,247,0.14)] to-white/40 p-3 max-sm:h-[88px] max-sm:w-[88px] max-sm:min-w-[88px] dark:border-[rgba(57,148,173,0.2)] dark:from-[rgba(30,56,70,0.72)] dark:to-[rgba(20,32,42,0.82)]"
        >
          <div className="absolute inset-0 grid place-items-center">
            <span className="block h-[54px] w-[54px] rounded-[18px] bg-[rgba(155,232,247,0.18)] dark:bg-[rgba(57,148,173,0.2)]" />
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(233,250,254,0.95)] text-[#32404d] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:bg-[rgba(16,27,36,0.98)] dark:text-[#dceaf4]">
            <WidgetIcon size={32} />
          </div>
        </div>
      </div>
    </article>
  );
}
