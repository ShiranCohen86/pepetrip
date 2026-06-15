export function EmptyState({ emoji = '🗺️', title, children, action }) {
  return (
    <div className="empty">
      <div className="empty__emoji">{emoji}</div>
      {title && <h2>{title}</h2>}
      {children && <p>{children}</p>}
      {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
    </div>
  );
}
