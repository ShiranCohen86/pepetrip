const VARIANT_CLASS = {
  default: '',
  primary: 'btn--primary',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
};

export function Button({
  variant = 'default',
  size,
  block = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    VARIANT_CLASS[variant],
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
      {children}
    </button>
  );
}
