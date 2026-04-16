import { useSectionStore } from '../model/useSectionStore';

export function SectionMenu() {
  const sections = useSectionStore((state) => state.sections);
  const activeIndex = useSectionStore((state) => state.activeIndex);
  const setActiveSection = useSectionStore((state) => state.setActiveSection);

  return (
    <aside className="section-menu">
      <h2 className="section-menu__title">Документы</h2>

      <div className="section-menu__search">
        <span className="section-menu__search-icon">⌕</span>
      </div>

      <nav className="section-menu__list">
        {sections.map((section, index) => (
          <button
            key={`${section}-${index}`}
            type="button"
            className={`section-menu__item ${activeIndex === index ? 'section-menu__item--active' : ''}`}
            onClick={() => setActiveSection(section, index)}
          >
            {section}
          </button>
        ))}
      </nav>
    </aside>
  );
}
