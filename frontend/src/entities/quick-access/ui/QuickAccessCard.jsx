export function QuickAccessCard({ item }) {
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
