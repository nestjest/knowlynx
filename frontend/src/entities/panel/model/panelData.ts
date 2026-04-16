export type PanelLayout = {
  id: string;
  accent: 'soft' | 'plain';
  title: string;
  type: 'notifications' | 'progress' | 'performance' | 'deadlines' | 'activity' | 'recommendations';
};

export const panels: PanelLayout[] = [
  { id: 'panel-a', accent: 'soft', title: 'Уведомления системы и преподавателей', type: 'notifications' },
  { id: 'panel-b', accent: 'plain', title: 'Текущий курс и прогресс', type: 'progress' },
  { id: 'panel-c', accent: 'plain', title: 'Успеваемость студента', type: 'performance' },
  { id: 'panel-d', accent: 'plain', title: 'Ближайшие дедлайны', type: 'deadlines' },
  { id: 'panel-e', accent: 'plain', title: 'Активность за неделю', type: 'activity' },
  { id: 'panel-f', accent: 'plain', title: 'Рекомендовано к изучению', type: 'recommendations' }
];
