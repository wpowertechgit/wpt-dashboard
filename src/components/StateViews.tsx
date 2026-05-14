export function LoadingRows({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map(i => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}>
              <div style={{ height: 14, background: 'var(--color-surface-3)', borderRadius: 4, width: j === 0 ? 80 : '70%', animation: 'pulse 1.4s ease-in-out infinite' }} />
            </td>
          ))}
        </tr>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#f87171' }}>
      ⛔ {message}
    </div>
  )
}

export function EmptyState({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={99} style={{ textAlign: 'center', padding: 32, color: 'var(--color-ink-tertiary)', fontSize: 13 }}>
        {label}
      </td>
    </tr>
  )
}
