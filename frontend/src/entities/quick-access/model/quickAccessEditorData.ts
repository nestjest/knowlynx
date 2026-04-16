export type QuickAccessWidgetPreset = {
  id: string;
  title: string;
  description: string;
};

export type QuickAccessItem = {
  id: string;
  widgetId: QuickAccessWidgetPreset['id'];
};

export const quickAccessWidgetPresets: QuickAccessWidgetPreset[] = [
  {
    id: 'schedule',
    title: 'Расписание',
    description: 'Перейти к ближайшим занятиям, дедлайнам и синхронизации календаря.'
  },
  {
    id: 'assignments',
    title: 'Домашние задания',
    description: 'Открыть активные задания и быстро перейти к последней отправке.'
  },
  {
    id: 'materials',
    title: 'Материалы курса',
    description: 'Собранные лекции, записи вебинаров и методические материалы по предметам.'
  },
  {
    id: 'attendance',
    title: 'Посещаемость',
    description: 'Проверить пропуски, подтвержденные занятия и текущую посещаемость.'
  },
  {
    id: 'messages',
    title: 'Сообщения',
    description: 'Открыть диалоги с преподавателями, кураторами и группой.'
  },
  {
    id: 'grades',
    title: 'Оценки',
    description: 'Сводка по последним проверкам, баллам и обновлениям журнала.'
  }
];

export const quickAccessItems: QuickAccessItem[] = [
  { id: 'qa-1', widgetId: 'schedule' },
  { id: 'qa-2', widgetId: 'assignments' },
  { id: 'qa-3', widgetId: 'materials' }
];
