export function ContentPanel({ panel }) {
  return <section className={`content-panel content-panel--${panel.size} content-panel--${panel.accent}`} />;
}
