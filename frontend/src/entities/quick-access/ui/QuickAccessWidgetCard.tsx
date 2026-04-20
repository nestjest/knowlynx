import { WidgetIcon } from '../../../shared/ui/icons';
import {
  quickAccessWidgetPresets,
  type QuickAccessItem
} from '../model/quickAccessEditorData';

type QuickAccessWidgetCardProps = {
  item: QuickAccessItem;
  isEditMode?: boolean;
  onEditWidget?: () => void;
};

export function QuickAccessWidgetCard({
  item,
  isEditMode = false,
  onEditWidget
}: QuickAccessWidgetCardProps) {
  const widget = quickAccessWidgetPresets.find((entry) => entry.id === item.widgetId);

  if (!widget) {
    return null;
  }

  return (
    <article className="quick-card quick-card--minimal">
      <div className="quick-card__content">
        <span className="quick-card__eyebrow">Быстрый доступ</span>

        <div className="quick-card__text">
          <h3>{widget.title}</h3>
          <p>{widget.description}</p>
        </div>
      </div>

      <div className="quick-card__side">
        {isEditMode ? (
          <button type="button" className="quick-card__edit-button" onClick={onEditWidget} aria-label="Изменить виджет">
            ✎
          </button>
        ) : null}

        <div className="quick-card__visual quick-card__visual--minimal" aria-hidden="true">
          <div className="quick-card__visual-shape">
            <span />
          </div>
          <div className="quick-card__badge quick-card__badge--minimal">
            <WidgetIcon size={32} />
          </div>
        </div>
      </div>
    </article>
  );
}
