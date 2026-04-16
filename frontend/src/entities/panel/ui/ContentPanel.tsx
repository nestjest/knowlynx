import type { CSSProperties } from 'react';
import type { PanelLayout } from '../model/panelData';

type ContentPanelProps = {
  panel: PanelLayout;
};

export function ContentPanel({ panel }: ContentPanelProps) {
  const style = {
    minHeight: panel.minHeight
  } satisfies CSSProperties;

  return (
    <section
      className={`${panel.className} rounded-[22px] border border-[#dbe5ee]/95 ${
        panel.accent === 'soft' ? 'bg-panel-soft' : 'bg-white/80'
      } shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]`}
      style={style}
    />
  );
}
