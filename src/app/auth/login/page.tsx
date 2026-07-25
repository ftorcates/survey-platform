import { signIn } from "@/auth"
import { ArrowRight, LogIn, ShieldCheck, Sparkles } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="glass-panel hero-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="eyebrow">
              <Sparkles size={14} />
              Acceso seguro
            </div>
            <h1 className="section-title" style={{ marginTop: "1.2rem", maxWidth: "12ch" }}>
              Administra estudios con una interfaz más sobria y precisa.
            </h1>
            <p className="section-copy">
              Mantén tu flujo actual de trabajo, desde el acceso con Google hasta la revisión de audiencias, métricas y configuración de cuenta.
            </p>
          </div>
          <div className="stats-grid">
            <div className="soft-card stat-card">
              <div className="stat-label">Acceso</div>
              <div style={{ fontWeight: 800, marginTop: "0.55rem" }}>Google OAuth</div>
            </div>
            <div className="soft-card stat-card">
              <div className="stat-label">Entorno</div>
              <div style={{ fontWeight: 800, marginTop: "0.55rem" }}>Dashboard privado</div>
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "1.1rem", background: "rgba(15, 118, 110, 0.1)", display: "grid", placeItems: "center", marginBottom: "1rem" }}>
              <LogIn size={28} color="var(--color-primary)" />
            </div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.45rem" }}>Iniciar sesión</h2>
            <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
              Entra con tu cuenta de Google para acceder a tus encuestas y resultados.
            </p>
          </div>

          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/admin" })
            }}
          >
            <button className="btn-primary" style={{ width: "100%" }}>
              Continuar con Google
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="divider" style={{ margin: "1.5rem 0" }} />

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", color: "var(--color-text-muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            <ShieldCheck size={18} style={{ marginTop: "0.1rem", flexShrink: 0 }} />
            El acceso conserva el flujo actual de autenticación y dirige al panel administrativo.
          </div>
        </section>
      </div>
    </div>
  )
}
