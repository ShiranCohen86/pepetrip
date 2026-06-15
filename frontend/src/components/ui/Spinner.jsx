export function Spinner({ size, className = '' }) {
  return (
    <span
      className={`spinner${size === 'lg' ? ' spinner--lg' : ''} ${className}`.trim()}
      role="status"
      aria-label="Loading"
    />
  );
}
