export type DashboardEditorPanelType =
  | 'notifications'
  | 'progress'
  | 'performance'
  | 'deadlines'
  | 'activity'
  | 'recommendations'
  | 'webinars'
  | 'certificates';

export type DashboardEditorPanelAccent = 'soft' | 'plain';
export type DashboardEditorPanelSize = 'small' | 'medium' | 'large';

export type DashboardEditorPanelTemplate = {
  templateId: string;
  accent: DashboardEditorPanelAccent;
  title: string;
  type: DashboardEditorPanelType;
};

export type DashboardWidgetPreset = {
  id: string;
  title: string;
  description: string;
};

export type DashboardEditorPanel = DashboardEditorPanelTemplate & {
  id: string;
  widgetId: DashboardWidgetPreset['id'];
  size: DashboardEditorPanelSize;
};

export const dashboardEditorPanelTemplates = [
  { templateId: 'notifications', accent: 'soft', title: 'Уведомления системы и преподавателей', type: 'notifications' },
  { templateId: 'progress', accent: 'plain', title: 'Текущий курс и прогресс', type: 'progress' },
  { templateId: 'performance', accent: 'plain', title: 'Успеваемость студента', type: 'performance' },
  { templateId: 'deadlines', accent: 'plain', title: 'Ближайшие дедлайны', type: 'deadlines' },
  { templateId: 'activity', accent: 'plain', title: 'Активность за неделю', type: 'activity' },
  { templateId: 'recommendations', accent: 'plain', title: 'Рекомендовано к изучению', type: 'recommendations' },
  { templateId: 'webinars', accent: 'plain', title: 'Ближайшие вебинары', type: 'webinars' },
  { templateId: 'certificates', accent: 'plain', title: 'Сертификаты и достижения', type: 'certificates' }
] satisfies DashboardEditorPanelTemplate[];

export const dashboardWidgetPresets = [
  { id: 'widget-overview', title: 'Обзор курса', description: 'Краткая сводка по содержимому блока и ключевым данным.' },
  { id: 'widget-tasks', title: 'Список задач', description: 'Связанные задания, чеклисты и ближайшие действия.' },
  { id: 'widget-progress', title: 'Индикатор прогресса', description: 'Визуализация прогресса, KPI и контрольных точек.' },
  { id: 'widget-team', title: 'Команда курса', description: 'Преподаватели, кураторы и контакты по курсу.' },
  { id: 'widget-media', title: 'Медиатека', description: 'Видео, файлы, вебинары и дополнительные материалы.' }
] satisfies DashboardWidgetPreset[];

export type DashboardEditorTemplateId = (typeof dashboardEditorPanelTemplates)[number]['templateId'];
export type DashboardWidgetPresetId = (typeof dashboardWidgetPresets)[number]['id'];

const defaultTemplateOrder: DashboardEditorTemplateId[] = [
  'notifications',
  'progress',
  'performance',
  'deadlines',
  'activity',
  'recommendations'
];

const defaultTemplateSizes: Record<DashboardEditorTemplateId, DashboardEditorPanelSize> = {
  notifications: 'medium',
  progress: 'large',
  performance: 'medium',
  deadlines: 'medium',
  activity: 'small',
  recommendations: 'small',
  webinars: 'medium',
  certificates: 'small'
};

export function getNextPanelSize(current: DashboardEditorPanelSize): DashboardEditorPanelSize {
  if (current === 'small') {
    return 'medium';
  }

  if (current === 'medium') {
    return 'large';
  }

  return 'small';
}

export function createEditorPanel(templateId: DashboardEditorTemplateId): DashboardEditorPanel {
  const template = dashboardEditorPanelTemplates.find((item) => item.templateId === templateId);

  if (!template) {
    throw new Error(`Unknown dashboard panel template: ${templateId}`);
  }

  return {
    ...template,
    id: `${templateId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    widgetId: 'widget-overview',
    size: defaultTemplateSizes[templateId]
  };
}

export const defaultEditorPanels = defaultTemplateOrder.map((templateId) => createEditorPanel(templateId));
