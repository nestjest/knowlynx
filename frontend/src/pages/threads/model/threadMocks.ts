export type ThreadMessageAuthor = 'user' | 'assistant' | 'system';

export type ThreadMessage = {
  id: string;
  author: ThreadMessageAuthor;
  text: string;
  timestamp: string;
};

export type ThreadItem = {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'archived';
  category: string;
  updatedAt: string;
  summary: string;
  unreadCount: number;
  accent: string;
  creator: {
    name: string;
    avatar: string;
  };
  participants: string[];
  messages: ThreadMessage[];
};

export const threadMocks: ThreadItem[] = [
  {
    id: 'frontend-onboarding',
    title: 'Онбординг по frontend-платформе',
    status: 'active',
    category: 'Учеба',
    updatedAt: 'Обновлено 12 минут назад',
    summary: 'Тред с вопросами по структуре проекта, FSD и подготовке первого учебного спринта.',
    unreadCount: 3,
    accent: 'linear-gradient(135deg, #9be8f7 0%, #5dc7de 100%)',
    creator: {
      name: 'Maksim Karevsky',
      avatar: 'MK'
    },
    participants: ['Максим', 'Ментор', 'AI-ассистент'],
    messages: [
      {
        id: 'msg-1',
        author: 'system',
        text: 'Тред создан для обсуждения стартового набора задач по frontend-направлению.',
        timestamp: '09:10'
      },
      {
        id: 'msg-2',
        author: 'user',
        text: 'Собрал базовую структуру слоев. Хочу понять, как аккуратно разложить widgets и pages.',
        timestamp: '09:14'
      },
      {
        id: 'msg-3',
        author: 'assistant',
        text: 'Начни с pages для маршрутов, widgets для крупных секций и shared для переиспользуемой UI-базы. Так будет проще масштабировать экран.',
        timestamp: '09:16'
      }
    ]
  },
  {
    id: 'profile-redesign',
    title: 'Редизайн страницы профиля',
    status: 'draft',
    category: 'Дизайн',
    updatedAt: 'Обновлено вчера',
    summary: 'Подбор нового визуального ритма, карточек активности и блока достижений пользователя.',
    unreadCount: 0,
    accent: 'linear-gradient(135deg, #ffd6a5 0%, #ffb86b 100%)',
    creator: {
      name: 'Anna Sokolova',
      avatar: 'AS'
    },
    participants: ['Максим', 'Дизайнер'],
    messages: [
      {
        id: 'msg-4',
        author: 'user',
        text: 'Хочу сделать профиль более живым: показать прогресс, последние действия и полезные быстрые ссылки.',
        timestamp: '18:25'
      },
      {
        id: 'msg-5',
        author: 'assistant',
        text: 'Хорошо работает композиция из hero-блока, панели метрик и списка последних событий с явными акцентами.',
        timestamp: '18:31'
      }
    ]
  },
  {
    id: 'backend-sync',
    title: 'Синхронизация frontend и backend API',
    status: 'active',
    category: 'Интеграция',
    updatedAt: 'Обновлено 2 часа назад',
    summary: 'Список ручек для профиля, истории действий и будущего подключения реальных тредов.',
    unreadCount: 1,
    accent: 'linear-gradient(135deg, #c8f7c5 0%, #7ed98a 100%)',
    creator: {
      name: 'Ivan Belyaev',
      avatar: 'IB'
    },
    participants: ['Максим', 'Backend', 'QA'],
    messages: [
      {
        id: 'msg-6',
        author: 'system',
        text: 'Тред закреплен в профиле как рабочий канал по API-согласованию.',
        timestamp: '11:02'
      },
      {
        id: 'msg-7',
        author: 'assistant',
        text: 'Для первого мокапа достаточно держать список тредов локально, а затем заменить источник на API без смены UI-композиции.',
        timestamp: '11:06'
      },
      {
        id: 'msg-8',
        author: 'user',
        text: 'Ок, пока делаем заглушки, но закладываем место под статус, участников и короткую историю.',
        timestamp: '11:09'
      }
    ]
  }
];

export const threadMocksMap = Object.fromEntries(threadMocks.map((thread) => [thread.id, thread])) as Record<
  string,
  ThreadItem
>;
