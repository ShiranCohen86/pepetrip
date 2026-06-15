export function Skeleton({ height = 16, width = '100%', radius, style }) {
  return (
    <div
      className="skeleton"
      style={{ height, width, ...(radius != null ? { borderRadius: radius } : {}), ...style }}
    />
  );
}
