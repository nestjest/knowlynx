import { useMemo, useState } from 'react';
import {
  courses,
  type CourseCategory,
} from '../../../entities/course/model/courseData';

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
    <section className="course-section" aria-label="Курсы">
      <div className="course-section__header">
        <h2 className="course-section__title">Мои курсы</h2>
        <span className="course-section__count">{filteredCourses.length}</span>
      </div>

      <div className="course-section__filters">
        <input
          className="course-section__input"
          type="search"
          placeholder="Поиск курса или преподавателя"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="course-section__select"
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

      <div className="course-section__list">
        {filteredCourses.map((course) => (
          <article key={course.id} className="course-section__card">
            <div className="course-section__card-top">
              <h3>{course.title}</h3>
              <span>{course.progress}%</span>
            </div>
            <p>{course.teacher}</p>
            <div className="course-section__progress">
              <div style={{ width: `${course.progress}%` }} />
            </div>
            <span className="course-section__meta">
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
