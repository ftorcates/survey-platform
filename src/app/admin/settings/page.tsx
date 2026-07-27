import { auth } from "@/auth"
import ProfileForm from "./ProfileForm"
import { Settings2 } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>No autorizado</div>;
  }

  return (
    <div>
      <section className="dashboard-hero">
        <div className="card dashboard-hero-main">
          <div>
            <div className="eyebrow">
              <Settings2 size={14} />
              Configuración
            </div>
            <h1 className="section-title">Estación de cuenta.</h1>
            <p className="section-copy">
              Ajusta la identidad visible y verifica que el acceso conserve su ruta segura.
            </p>
          </div>
          <div className="route-strip" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
        </div>
        <aside className="card dashboard-hero-side">
          <div>
            <p className="stat-label">Sesión</p>
            <p className="stat-value" style={{ fontSize: "2rem" }}>Activa</p>
          </div>
          <div className="divider" />
          <div>
            <p className="stat-label">Acceso</p>
            <p className="stat-value" style={{ fontSize: "2rem" }}>OAuth</p>
          </div>
        </aside>
      </section>

      <ProfileForm user={session.user} />
    </div>
  )
}
