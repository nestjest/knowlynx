import type { QuickAccessItem } from '../model/quickAccessData';

type QuickAccessCardProps = {
  item: QuickAccessItem;
};

export function QuickAccessCard({ item }: QuickAccessCardProps) {
  return (
    <article className="quick-card">
      <div className="quick-card__text">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      <div className="quick-card__badge" aria-hidden="true">
        ✦
      </div>
    </article>
  );
}
