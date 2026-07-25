import { auth } from "@/auth"
import ProfileForm from "./ProfileForm"
import { Settings2 } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>No autorizado</div>;
  }

  return (
    <div style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Settings2 size={14} />
            Configuración
          </div>
          <h1 className="section-title" style={{ marginTop: "1rem" }}>Preferencias de cuenta</h1>
          <p className="section-copy">
            Actualiza tu perfil visible y revisa el estado de tu acceso.
          </p>
        </div>
      </div>

      <ProfileForm user={session.user} />
    </div>
  )
}
