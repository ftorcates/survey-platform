import { signIn } from "@/auth"
import { ArrowRight, KeyRound, RadioTower, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="hero-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "620px" }}>
          <div>
            <div className="eyebrow">
              <RadioTower size={14} />
              Acceso al centro
            </div>
            <h1 className="section-title" style={{ marginTop: "1.2rem" }}>
              Entra al panel de estudios.
            </h1>
            <p className="section-copy">
              El login conserva Google OAuth y te lleva directo al dashboard para crear encuestas, revisar audiencias y ajustar configuración.
            </p>
          </div>

          <div className="signal-panel" style={{ minHeight: "260px" }}>
            <div className="scanline" />
            <span className="chip">
              <ShieldCheck size={14} />
              Sesión protegida
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.55rem", alignItems: "end", height: "150px", marginTop: "1.4rem" }} aria-hidden="true">
              {[38, 74, 46, 92, 58, 81].map((height, index) => (
                <span key={index} style={{ height: `${height}%`, background: index === 3 ? "var(--color-primary)" : "rgba(101, 213, 255, 0.5)", display: "block" }} />
              ))}
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div className="brand-badge" style={{ marginBottom: "1rem" }}>
              <KeyRound size={22} />
            </div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.45rem", textTransform: "uppercase" }}>Iniciar sesión</h2>
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
