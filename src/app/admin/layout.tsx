import Link from 'next/link';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { signOut } from "@/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: '250px', borderRight: '1px solid var(--color-border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', margin: '1rem', height: 'calc(100vh - 2rem)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'transparent', backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-cta))', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
            SurveyAdmin
          </h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-main)', textDecoration: 'none', backgroundColor: 'var(--color-surface-hover)', fontWeight: 600 }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/audience" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <Users size={20} /> Audiencia
          </Link>
          <Link href="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <Settings size={20} /> Configuración
          </Link>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
