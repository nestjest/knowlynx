import { useSectionStore } from '../../../features/section-navigation/model/useSectionStore';
import { SectionMenu } from '../../../features/section-navigation/ui/SectionMenu';
import { quickAccessItems } from '../../../entities/quick-access/model/quickAccessData';
import { QuickAccessCard } from '../../../entities/quick-access/ui/QuickAccessCard';
import { panels } from '../../../entities/panel/model/panelData';
import { ContentPanel } from '../../../entities/panel/ui/ContentPanel';

export function DashboardLayout() {
  const activeSection = useSectionStore((state) => state.activeSection);

  return (
    <main className="grid min-h-[calc(100vh-44px)] grid-cols-1 gap-[26px] lg:grid-cols-[102px_minmax(0,1fr)]">
      <SectionMenu />

      <section className="flex flex-col gap-[34px] pt-0 lg:pt-3" aria-label="Главная страница">
        <header className="flex items-start justify-between gap-5 pr-0 pt-10 lg:pr-24 lg:pt-0">
          <div>
            <h1 className="m-0 text-lg font-semibold">Документы</h1>
            <p className="mt-1.5 text-[13px] text-[#80909f]">Текущий раздел: {activeSection}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="h-[34px] w-[34px] rounded-[10px] border-0 bg-white/70 text-[#42505d] shadow-[0_10px_25px_rgba(198,209,221,0.2)]"
              aria-label="Уведомления"
            >
              ⌁
            </button>
            <button
              type="button"
              className="h-[34px] w-[34px] rounded-[10px] border-0 bg-white/70 text-[#42505d] shadow-[0_10px_25px_rgba(198,209,221,0.2)]"
              aria-label="Редактировать"
            >
              ✎
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-[26px] xl:grid-cols-3" aria-label="Быстрый доступ">
          {quickAccessItems.map((card) => (
            <QuickAccessCard key={card.id} item={card} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-[38px] xl:grid-cols-[1.02fr_1.02fr_0.88fr]">
          {panels.map((panel) => (
            <ContentPanel key={panel.id} panel={panel} />
          ))}
        </section>
      </section>
    </main>
  );
}
