export type QuickAccessItem = {
  id: string;
  title: string;
  description: string;
};

export const quickAccessItems: QuickAccessItem[] = [
  {
    id: 'qa-1',
    title: 'Расписание',
    description: 'Перейти к ближайшим занятиям, дедлайнам и синхронизации календаря.'
  },
  {
    id: 'qa-2',
    title: 'Домашние задания',
    description: 'Открыть активные задания и быстро перейти к последней отправке.'
  },
  {
    id: 'qa-3',
    title: 'Материалы курса',
    description: 'Собранные лекции, записи вебинаров и методические материалы по предметам.'
  }
];
