import { create } from 'zustand';

type SectionState = {
  sections: string[];
  activeSection: string;
  activeIndex: number;
  setActiveSection: (section: string, index: number) => void;
};

const defaultSections = ['Главная страница', 'Мои задания', 'Расписание', 'Сообщения', 'Библиотека', 'Поддержка'];

export const useSectionStore = create<SectionState>((set) => ({
  sections: defaultSections,
  activeSection: defaultSections[0],
  activeIndex: 0,
  setActiveSection: (section, index) =>
    set({
      activeSection: section,
      activeIndex: index
    })
}));
