import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Example content below the hero */}
      <section style={{
        padding: '60px 20px',
        background: '#0a0a14',
        minHeight: '400px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#e0e4f0' }}>
            Content Below Hero
          </h2>
          <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '30px' }}>
            Your page content goes here.
          </p>
          <a
            href="/editor"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(126,232,250,0.15)',
              border: '1px solid #7ee8fa',
              borderRadius: '8px',
              color: '#7ee8fa',
              textDecoration: 'none',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          >
            Open Cloud Editor
          </a>
        </div>
      </section>
    </main>
  );
}
