import { create } from 'zustand';

const defaultSections = ['Раздел 1', 'Раздел 1', 'Раздел 1', 'Раздел 1', 'Раздел 1', 'Раздел 1'];

export const useSectionStore = create((set) => ({
  sections: defaultSections,
  activeSection: defaultSections[0],
  activeIndex: 0,
  setActiveSection: (section, index) =>
    set({
      activeSection: section,
      activeIndex: index
    })
}));
