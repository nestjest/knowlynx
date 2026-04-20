import type { SettingsSectionId } from './settingsSections';

export type SettingsControl =
  | {
      type: 'toggle';
      id: string;
      label: string;
      description: string;
      value: boolean;
    }
  | {
      type: 'select';
      id: string;
      label: string;
      description: string;
      value: string;
      options: string[];
    }
  | {
      type: 'segmented';
      id: string;
      label: string;
      description: string;
      value: string;
      options: string[];
    }
  | {
      type: 'input';
      id: string;
      label: string;
      description: string;
      value: string;
      placeholder?: string;
    }
  | {
      type: 'action';
      id: string;
      label: string;
      description: string;
      actionLabel: string;
      tone?: 'default' | 'danger';
    };

export type SettingsGroup = {
  id: string;
  title: string;
  description?: string;
  controls: SettingsControl[];
};

export const settingsFormSections: Record<SettingsSectionId, SettingsGroup[]> = {
  profile: [
    {
      id: 'profile-identity',
      title: 'Личные данные',
      controls: [
        {
          type: 'input',
          id: 'display-name',
          label: 'Отображаемое имя',
          description: 'Показывается в курсах, комментариях и командных проектах.',
          value: 'Максим Каревский'
        },
        {
          type: 'input',
          id: 'public-handle',
          label: 'Публичный логин',
          description: 'Используется в карточке профиля и в каталоге группы.',
          value: '@nestjest'
        },
        {
          type: 'input',
          id: 'bio',
          label: 'О себе',
          description: 'Короткое описание для преподавателей и участников команды.',
          value: 'Frontend student, интересуюсь UI, архитектурой и продуктовым дизайном.'
        }
      ]
    },
    {
      id: 'profile-public',
      title: 'Публичный профиль',
      controls: [
        {
          type: 'toggle',
          id: 'show-profile',
          label: 'Показывать профиль в каталоге группы',
          description: 'Позволяет другим студентам находить тебя для совместной работы.',
          value: true
        },
        {
          type: 'toggle',
          id: 'show-portfolio',
          label: 'Показывать портфолио участникам курса',
          description: 'Открывает ссылки на GitHub и внешние проекты внутри курса.',
          value: true
        },
        {
          type: 'select',
          id: 'profile-language',
          label: 'Язык профиля',
          description: 'Влияет на шаблонные подписи и системные блоки карточки.',
          value: 'Русский',
          options: ['Русский', 'English']
        }
      ]
    }
  ],
  favorites: [
    {
      id: 'favorites-view',
      title: 'Отображение избранного',
      controls: [
        {
          type: 'select',
          id: 'favorites-default',
          label: 'Раздел по умолчанию',
          description: 'Что открывать первым в избранном.',
          value: 'Курсы',
          options: ['Курсы', 'Материалы', 'Подборки']
        },
        {
          type: 'segmented',
          id: 'favorites-sort',
          label: 'Сортировка',
          description: 'Порядок элементов в списке сохранённого контента.',
          value: 'Недавние',
          options: ['Недавние', 'По алфавиту', 'Ручная']
        },
        {
          type: 'toggle',
          id: 'favorites-pin',
          label: 'Показывать закреплённые подборки сверху',
          description: 'Закреплённые учебные наборы всегда будут над общим списком.',
          value: true
        }
      ]
    },
    {
      id: 'favorites-automation',
      title: 'Автосохранение',
      controls: [
        {
          type: 'toggle',
          id: 'save-materials',
          label: 'Автоматически сохранять открытые материалы',
          description: 'Добавляет в избранное лекции и статьи, к которым ты часто возвращаешься.',
          value: false
        },
        {
          type: 'toggle',
          id: 'save-recordings',
          label: 'Сохранять записи вебинаров после просмотра',
          description: 'Удобно для повторения и подготовки к дедлайнам.',
          value: true
        }
      ]
    }
  ],
  notifications: [
    {
      id: 'notifications-channels',
      title: 'Каналы уведомлений',
      controls: [
        {
          type: 'toggle',
          id: 'push-enabled',
          label: 'Push-уведомления',
          description: 'События по заданиям, оценкам и расписанию на устройстве.',
          value: true
        },
        {
          type: 'select',
          id: 'email-level',
          label: 'Email-уведомления',
          description: 'Какие письма получать от платформы.',
          value: 'Только важные',
          options: ['Отключены', 'Только важные', 'Все учебные']
        },
        {
          type: 'toggle',
          id: 'inapp-enabled',
          label: 'Уведомления внутри платформы',
          description: 'Показывать события в центре уведомлений интерфейса.',
          value: true
        }
      ]
    },
    {
      id: 'notifications-events',
      title: 'Учебные события',
      controls: [
        {
          type: 'toggle',
          id: 'deadline-reminders',
          label: 'Напоминания о дедлайнах',
          description: 'Уведомления перед сдачей задания и при переносе срока.',
          value: true
        },
        {
          type: 'toggle',
          id: 'grade-updates',
          label: 'Новые оценки и комментарии проверки',
          description: 'Сообщения после проверки домашней работы или теста.',
          value: true
        },
        {
          type: 'select',
          id: 'digest-frequency',
          label: 'Частота дайджеста',
          description: 'Сводка по новым материалам и комментариям.',
          value: 'Раз в день',
          options: ['Не отправлять', 'Раз в день', 'Раз в неделю']
        }
      ]
    }
  ],
  privacy: [
    {
      id: 'privacy-visibility',
      title: 'Видимость профиля',
      controls: [
        {
          type: 'select',
          id: 'profile-visibility',
          label: 'Кто видит профиль',
          description: 'Ограничивает видимость карточки за пределами учебной группы.',
          value: 'Только группа',
          options: ['Все в организации', 'Только группа', 'Только преподаватели']
        },
        {
          type: 'toggle',
          id: 'show-achievements',
          label: 'Показывать достижения одногруппникам',
          description: 'Отображать сертификаты и бейджи в профиле.',
          value: false
        },
        {
          type: 'toggle',
          id: 'online-status',
          label: 'Показывать статус “в сети”',
          description: 'Виден в сообщениях и списках участников курса.',
          value: false
        }
      ]
    },
    {
      id: 'privacy-external',
      title: 'Внешние данные',
      controls: [
        {
          type: 'toggle',
          id: 'portfolio-links',
          label: 'Показывать внешние ссылки',
          description: 'GitHub, сайт и портфолио в публичной карточке.',
          value: true
        },
        {
          type: 'action',
          id: 'session-history',
          label: 'История входов',
          description: 'Проверить последние входы и завершить подозрительные сессии.',
          actionLabel: 'Открыть журнал'
        }
      ]
    }
  ],
  storage: [
    {
      id: 'storage-offline',
      title: 'Офлайн и кэш',
      controls: [
        {
          type: 'toggle',
          id: 'offline-materials',
          label: 'Сохранять материалы для офлайн-доступа',
          description: 'Кэшировать открытые лекции и документы на устройстве.',
          value: true
        },
        {
          type: 'select',
          id: 'cache-limit',
          label: 'Лимит локального хранилища',
          description: 'Максимальный объём под временные файлы и офлайн-материалы.',
          value: '2 ГБ',
          options: ['1 ГБ', '2 ГБ', '5 ГБ', 'Без лимита']
        },
        {
          type: 'toggle',
          id: 'draft-autosave',
          label: 'Автосохранение черновиков',
          description: 'Сохранять промежуточные версии ответов и заданий локально.',
          value: true
        }
      ]
    },
    {
      id: 'storage-actions',
      title: 'Очистка данных',
      controls: [
        {
          type: 'action',
          id: 'clear-cache',
          label: 'Очистить кэш',
          description: 'Удаляет временные файлы, превью и локальные миниатюры.',
          actionLabel: 'Очистить'
        },
        {
          type: 'action',
          id: 'remove-downloads',
          label: 'Удалить офлайн-загрузки',
          description: 'Освобождает место, не затрагивая сданные работы и прогресс.',
          actionLabel: 'Удалить загрузки',
          tone: 'danger'
        }
      ]
    }
  ],
  appearance: [
    {
      id: 'appearance-theme',
      title: 'Внешний вид',
      controls: [
        {
          type: 'select',
          id: 'theme-mode',
          label: 'Тема интерфейса',
          description: 'Основной режим отображения платформы.',
          value: 'Системная',
          options: ['Светлая', 'Тёмная', 'Системная']
        },
        {
          type: 'segmented',
          id: 'density',
          label: 'Плотность интерфейса',
          description: 'Количество визуального воздуха в карточках и списках.',
          value: 'Средняя',
          options: ['Компактная', 'Средняя', 'Свободная']
        },
        {
          type: 'segmented',
          id: 'font-size',
          label: 'Размер текста',
          description: 'Удобство чтения длинных лекций и статей.',
          value: 'Стандартный',
          options: ['Малый', 'Стандартный', 'Крупный']
        }
      ]
    },
    {
      id: 'appearance-accessibility',
      title: 'Доступность',
      controls: [
        {
          type: 'toggle',
          id: 'high-contrast',
          label: 'Повышенная контрастность',
          description: 'Усиливает визуальные контрасты для ключевых элементов интерфейса.',
          value: false
        },
        {
          type: 'toggle',
          id: 'deadline-focus',
          label: 'Акцентировать дедлайны',
          description: 'Сильнее подсвечивать близкие сроки сдачи и важные статусы.',
          value: true
        }
      ]
    }
  ],
  labs: [
    {
      id: 'labs-features',
      title: 'Бета-функции',
      controls: [
        {
          type: 'toggle',
          id: 'ai-summary',
          label: 'AI-конспекты лекций',
          description: 'Краткие выжимки и структурированные заметки по материалам курса.',
          value: true
        },
        {
          type: 'toggle',
          id: 'smart-planner',
          label: 'Умный планировщик подготовки',
          description: 'Автоматически раскладывает задачи перед дедлайнами.',
          value: false
        },
        {
          type: 'toggle',
          id: 'topic-recommendations',
          label: 'Рекомендации для повторения тем',
          description: 'Подбирает материалы на основе активности и результатов.',
          value: true
        }
      ]
    },
    {
      id: 'labs-feedback',
      title: 'Участие в тестировании',
      controls: [
        {
          type: 'toggle',
          id: 'labs-feedback',
          label: 'Отправлять расширенную обратную связь',
          description: 'Делиться оценкой новых функций и качеством экспериментов.',
          value: true
        },
        {
          type: 'select',
          id: 'labs-stability',
          label: 'Режим экспериментов',
          description: 'Сколько нестабильных функций показывать в интерфейсе.',
          value: 'Только проверенные',
          options: ['Только проверенные', 'Все доступные beta']
        }
      ]
    }
  ]
};

export const settingsReadonlyNotes: Record<SettingsSectionId, string[]> = {
  profile: [
    'Роль, учебная группа и организация синхронизируются автоматически.',
    'Официальный email и история завершённых курсов редактируются вне этого экрана.'
  ],
  favorites: [
    'Архивные или скрытые преподавателем материалы могут остаться недоступными даже в избранном.',
    'Избранное не расширяет академические права доступа.'
  ],
  notifications: [
    'Критические изменения дедлайнов и доступов платформа отправляет независимо от части настроек.',
    'Служебные уведомления безопасности отключить нельзя.'
  ],
  privacy: [
    'Преподаватели и кураторы всё равно видят прогресс и сдачи в рамках курса.',
    'Аудит действий и история входов сохраняются системно.'
  ],
  storage: [
    'Очистка локальных данных не удаляет оценки, сдачи и подтверждённые отправки.',
    'Экспорт и удаление персональных данных выполняются отдельным процессом.'
  ],
  appearance: [
    'Логика курсов, проверки работ и обязательные экраны не зависят от темы и плотности.',
    'Критические предупреждения всегда должны оставаться заметными.'
  ],
  labs: [
    'Эксперименты могут меняться или отключаться по роли и политике организации.',
    'Labs не подменяет обязательные академические процессы.'
  ]
};
