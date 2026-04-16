import type { QuickAccessItem } from '../model/quickAccessData';

type QuickAccessCardProps = {
  item: QuickAccessItem;
};

export function QuickAccessCard({ item }: QuickAccessCardProps) {
  return (
    <article className="flex min-h-[102px] justify-between gap-4 rounded-[24px] border border-[#dbe5ee]/85 bg-panel-surface px-[18px] py-5 shadow-soft">
      <div>
        <h3 className="mb-2 mt-0 text-base font-semibold">{item.title}</h3>
        <p className="m-0 max-w-[270px] text-xs leading-[1.35] text-[#8b98a4]">{item.description}</p>
      </div>

      <div
        className="grid h-[42px] w-[42px] flex-shrink-0 place-items-center rounded-2xl bg-badge-blue text-[#32404d]"
        aria-hidden="true"
      >
        ✦
      </div>
    </article>
  );
}
