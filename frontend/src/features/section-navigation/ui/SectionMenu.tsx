import { useSectionStore } from '../model/useSectionStore';

export function SectionMenu() {
  const sections = useSectionStore((state) => state.sections);
  const activeIndex = useSectionStore((state) => state.activeIndex);
  const setActiveSection = useSectionStore((state) => state.setActiveSection);

  return (
    <aside className="flex flex-col pt-0 lg:pt-[26px]">
      <h2 className="mb-[14px] text-xl font-semibold text-[#2f3842]">Документы</h2>

      <div className="mb-[18px] flex h-[38px] w-full items-center rounded-full bg-search-blue px-[14px] text-[#43606b]">
        <span>⌕</span>
      </div>

      <nav className="flex flex-col gap-2">
        {sections.map((section, index) => (
          <button
            key={`${section}-${index}`}
            type="button"
            className={`rounded-full border-0 px-[10px] py-[7px] text-left text-[#5d6b78] transition ${
              activeIndex === index ? 'bg-section-active text-[#31525d]' : 'bg-transparent hover:bg-white/70'
            }`}
            onClick={() => setActiveSection(section, index)}
          >
            {section}
          </button>
        ))}
      </nav>
    </aside>
  );
}
