import {
  quickAccessWidgetPresets,
  type QuickAccessItem
} from '../model/quickAccessEditorData';

type QuickAccessEditorCardProps = {
  item: QuickAccessItem;
  isEditMode?: boolean;
  onEditWidget?: () => void;
};

export function QuickAccessEditorCard({
  item,
  isEditMode = false,
  onEditWidget
}: QuickAccessEditorCardProps) {
  const widget = quickAccessWidgetPresets.find((entry) => entry.id === item.widgetId);

  if (!widget) {
    return null;
  }

  return (
    <article className="quick-card">
      <div className="quick-card__text">
        <h3>{widget.title}</h3>
        <p>{widget.description}</p>
      </div>

      <div className="quick-card__side">
        {isEditMode ? (
          <button type="button" className="quick-card__edit-button" onClick={onEditWidget} aria-label="Изменить виджет">
            ✎
          </button>
        ) : null}

        <div className="quick-card__badge" aria-hidden="true">
          ✦
        </div>
      </div>
    </article>
  );
}
