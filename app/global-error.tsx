'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error.message}</p>
        <button
          onClick={reset}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', background: '#111827', color: '#fff', cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
