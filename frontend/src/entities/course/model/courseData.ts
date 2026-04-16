export type CourseCategory = 'all' | 'active' | 'completed' | 'upcoming';

export type Course = {
  id: string;
  title: string;
  teacher: string;
  progress: number;
  category: Exclude<CourseCategory, 'all'>;
  lessonsLeft: number;
};

export const courses: Course[] = [
  {
    id: 'course-1',
    title: 'Веб-разработка',
    teacher: 'Алина Сергеевна',
    progress: 68,
    category: 'active',
    lessonsLeft: 6
  },
  {
    id: 'course-2',
    title: 'Базы данных',
    teacher: 'Игорь Михайлович',
    progress: 42,
    category: 'active',
    lessonsLeft: 11
  },
  {
    id: 'course-3',
    title: 'Алгоритмы и структуры данных',
    teacher: 'Марина Викторовна',
    progress: 100,
    category: 'completed',
    lessonsLeft: 0
  },
  {
    id: 'course-4',
    title: 'Академическое письмо',
    teacher: 'Елена Павловна',
    progress: 12,
    category: 'upcoming',
    lessonsLeft: 18
  },
  {
    id: 'course-5',
    title: 'UI/UX для образовательных продуктов',
    teacher: 'Дмитрий Андреевич',
    progress: 55,
    category: 'active',
    lessonsLeft: 8
  }
];
