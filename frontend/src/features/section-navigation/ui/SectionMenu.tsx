import { useMemo, useState } from 'react';
import {
  courses,
  type CourseCategory,
} from '../../../entities/course/model/courseData';

const INPUT_BASE =
  'w-full rounded-[14px] border border-border-strong bg-surface-raised px-3.5 py-3 text-text-primary dark:border-[rgba(57,78,95,0.9)] dark:bg-[rgba(18,28,36,0.95)] dark:text-[#e4eef6]';

const META_TEXT = 'text-xs text-text-muted';

export function CourseSection() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CourseCategory>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory =
        category === 'all' ? true : course.category === category;
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.teacher.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <section className="flex flex-col gap-[18px] pb-5" aria-label="Курсы">
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary m-0 text-[22px] font-semibold">
          Мои курсы
        </h2>
        <span className="rounded-full bg-white/78 px-2.5 py-1.5 text-xs text-[#6d7b88] dark:border dark:text-[#c7d6e3]">
          {filteredCourses.length}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-3 max-lg:grid-cols-1">
        <input
          className={INPUT_BASE}
          type="search"
          placeholder="Поиск курса или преподавателя"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className={INPUT_BASE}
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as CourseCategory)
          }
        >
          <option value="all">Все курсы</option>
          <option value="active">Активные</option>
          <option value="completed">Завершённые</option>
          <option value="upcoming">Скоро стартуют</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-lg:grid-cols-1">
        {filteredCourses.map((course) => (
          <article
            key={course.id}
            className="shadow-card rounded-[18px] border border-[rgba(219,229,238,0.95)] bg-white/84 p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="text-text-primary m-0 text-[15px] font-semibold">
                {course.title}
              </h3>
              <span className={META_TEXT}>{course.progress}%</span>
            </div>
            <p className={`mb-2.5 ${META_TEXT}`}>{course.teacher}</p>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-[#e7eef5] dark:bg-[#253441]">
              <div
                className="h-full rounded-[inherit] bg-gradient-to-r from-[#9be8f7] to-[#67cfe6]"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className={META_TEXT}>
              {course.lessonsLeft === 0
                ? 'Курс завершён'
                : `Осталось занятий: ${course.lessonsLeft}`}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
