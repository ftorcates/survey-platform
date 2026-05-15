import { signIn } from "@/auth"
import { LogIn } from "lucide-react"

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(79, 138, 139, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <LogIn size={32} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Bienvenido</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Inicia sesión para gestionar tus encuestas</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/admin" })
            }}
          >
            <button className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Continuar con Google
            </button>
          </form>

          <form
            action={async () => {
              "use server"
              await signIn("github", { redirectTo: "/admin" })
            }}
          >
            <button className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
              Continuar con GitHub
            </button>
          </form>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Al iniciar sesión, aceptas nuestros términos y condiciones.
        </p>
      </div>
    </div>
  )
}
