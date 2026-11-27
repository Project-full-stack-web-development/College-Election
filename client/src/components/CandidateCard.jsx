export default function CandidateCard({
  name,
  subtitle = '',
  selected = false,
  isNota = false,
  onSelect,
}) {
  const initials = isNota
    ? 'Ø'
    : (name || 'C')
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        padding: 14,
        borderRadius: 14,
        border: selected
          ? '2px solid var(--primary)'
          : isNota
          ? '1px dashed var(--border)'
          : '1px solid var(--border)',
        background: selected
          ? 'var(--primary-soft)'
          : isNota
          ? 'var(--bg-page)'
          : 'var(--bg-surface)',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: isNota
            ? 'var(--bg-subtle)'
            : selected
            ? 'var(--primary)'
            : 'var(--bg-subtle)',
          color: isNota
            ? 'var(--text-primary)'
            : selected
            ? '#ffffff'
            : 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: isNota ? '0.85rem' : '0.95rem',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '0.98rem',
            color: 'var(--text-primary)',
          }}
        >
          {name}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
      </div>

      {selected && (
        <span
          className="badge"
          style={{
            background: 'var(--primary)',
            color: '#ffffff',
          }}
        >
          Selected
        </span>
      )}
    </button>
  );
}
