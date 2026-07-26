import { signIn } from "@/auth"
import { ArrowRight, KeyRound, RadioTower, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="card dashboard-hero-main" style={{ minHeight: "620px" }}>
          <div>
            <div className="eyebrow">
              <RadioTower size={14} />
              Acceso
            </div>
            <h1 className="section-title">Vuelve a tu mesa de estudios.</h1>
            <p className="section-copy">
              El flujo de autenticación se mantiene igual: Google OAuth abre tu dashboard con encuestas, audiencias y configuración.
            </p>
          </div>

          <div className="atelier-card-inner" style={{ minHeight: "240px" }}>
            <span className="chip">
              <ShieldCheck size={14} />
              Sesión protegida
            </span>
            <div className="pulse-bars" style={{ height: "150px", marginTop: "1.4rem" }} aria-hidden="true">
              {[38, 74, 46, 92, 58, 81, 44, 69].map((height, index) => (
                <span key={index} style={{ height: `${height}%`, ["--i" as string]: index }} />
              ))}
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: "1.25rem", display: "grid", alignContent: "center" }}>
          <div className="atelier-card-inner" style={{ padding: "1.4rem" }}>
            <div style={{ marginBottom: "2rem" }}>
              <div className="brand-badge" style={{ marginBottom: "1rem" }}>
                <KeyRound size={22} />
              </div>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "0.55rem" }}>Iniciar sesión</h2>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                Entra con tu cuenta de Google para administrar estudios y resultados.
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
              El acceso conserva el comportamiento actual y dirige al panel administrativo.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
