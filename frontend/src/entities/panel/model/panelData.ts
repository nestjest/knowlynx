export type PanelLayout = {
  id: string;
  minHeight: string;
  className: string;
  accent: 'soft' | 'plain';
};

export const panels: PanelLayout[] = [
  { id: 'panel-a', minHeight: '230px', className: '', accent: 'soft' },
  { id: 'panel-b', minHeight: '230px', className: 'xl:col-span-2', accent: 'plain' },
  { id: 'panel-c', minHeight: '232px', className: '', accent: 'plain' },
  { id: 'panel-d', minHeight: '232px', className: '', accent: 'plain' },
  { id: 'panel-e', minHeight: '96px', className: '', accent: 'plain' },
  { id: 'panel-f', minHeight: '96px', className: '', accent: 'plain' }
];
