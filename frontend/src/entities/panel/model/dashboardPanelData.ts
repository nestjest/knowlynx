export type DashboardPanelType =
  | 'notifications'
  | 'progress'
  | 'performance'
  | 'deadlines'
  | 'activity'
  | 'recommendations'
  | 'webinars'
  | 'certificates';

export type DashboardPanelAccent = 'soft' | 'plain';

export type DashboardPanelTemplate = {
  templateId: string;
  accent: DashboardPanelAccent;
  title: string;
  type: DashboardPanelType;
};

export type WidgetPreset = {
  id: string;
  title: string;
  description: string;
};

export type EditableDashboardPanel = DashboardPanelTemplate & {
  id: string;
  widgetId: WidgetPreset['id'];
};

export const dashboardPanelTemplates = [
  { templateId: 'notifications', accent: 'soft', title: 'Уведомления системы и преподавателей', type: 'notifications' },
  { templateId: 'progress', accent: 'plain', title: 'Текущий курс и прогресс', type: 'progress' },
  { templateId: 'performance', accent: 'plain', title: 'Успеваемость студента', type: 'performance' },
  { templateId: 'deadlines', accent: 'plain', title: 'Ближайшие дедлайны', type: 'deadlines' },
  { templateId: 'activity', accent: 'plain', title: 'Активность за неделю', type: 'activity' },
  { templateId: 'recommendations', accent: 'plain', title: 'Рекомендовано к изучению', type: 'recommendations' },
  { templateId: 'webinars', accent: 'plain', title: 'Ближайшие вебинары', type: 'webinars' },
  { templateId: 'certificates', accent: 'plain', title: 'Сертификаты и достижения', type: 'certificates' }
] satisfies DashboardPanelTemplate[];

export const widgetPresets = [
  { id: 'widget-overview', title: 'Обзор курса', description: 'Заглушка виджета с краткой сводкой по блоку.' },
  { id: 'widget-tasks', title: 'Список задач', description: 'Заглушка для отображения связанных задач и чеклистов.' },
  { id: 'widget-progress', title: 'Индикатор прогресса', description: 'Заглушка визуализации прогресса и KPI.' },
  { id: 'widget-team', title: 'Команда курса', description: 'Заглушка с преподавателями, менторами и кураторами.' },
  { id: 'widget-media', title: 'Медиатека', description: 'Заглушка для видео, вебинаров и файлов по курсу.' }
] satisfies WidgetPreset[];

export type DashboardTemplateId = (typeof dashboardPanelTemplates)[number]['templateId'];
export type WidgetPresetId = (typeof widgetPresets)[number]['id'];

const defaultTemplateOrder: DashboardTemplateId[] = [
  'notifications',
  'progress',
  'performance',
  'deadlines',
  'activity',
  'recommendations'
];

export function createDashboardPanel(templateId: DashboardTemplateId): EditableDashboardPanel {
  const template = dashboardPanelTemplates.find((item) => item.templateId === templateId);

  if (!template) {
    throw new Error(`Unknown dashboard panel template: ${templateId}`);
  }

  return {
    ...template,
    id: `${templateId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    widgetId: 'widget-overview'
  };
}

export const defaultEditablePanels = defaultTemplateOrder.map((templateId) => createDashboardPanel(templateId));
