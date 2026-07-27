import { signIn } from "@/auth"
import { ArrowRight, KeyRound, Route, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="card dashboard-hero-main" style={{ minHeight: "620px" }}>
          <div>
            <div className="eyebrow">
              <Route size={14} />
              Acceso al mapa
            </div>
            <h1 className="section-title">Entra a tu mapa de encuestas.</h1>
            <p className="section-copy">
              El flujo mantiene Google OAuth intacto y abre el tablero donde creas rutas, compartes enlaces y revisas audiencias.
            </p>
          </div>

          <div className="flow-map__canvas" style={{ minHeight: "230px" }} aria-hidden="true">
            <span className="route-line route-line-main" />
            <span className="route-node route-node-start">G</span>
            <span className="route-node route-node-mid">S</span>
            <span className="route-node route-node-end">D</span>
            <div className="route-label route-label-a">
              <strong>Google OAuth</strong>
              Autenticación existente preservada.
            </div>
            <div className="route-label route-label-c">
              <strong>Dashboard</strong>
              Encuestas, audiencias y configuración.
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: "1.25rem", display: "grid", alignContent: "center" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div className="brand-badge" style={{ marginBottom: "1rem" }}>
              <KeyRound size={22} />
            </div>
            <h2 style={{ fontSize: "1.9rem", marginBottom: "0.45rem" }}>Iniciar sesión</h2>
            <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
              Usa tu cuenta de Google para acceder a tus encuestas y resultados.
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
            La autenticación conserva el comportamiento actual y dirige al panel administrativo.
          </div>
        </section>
      </div>
    </div>
  )
}
