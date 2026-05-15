import { auth } from "@/auth"
import ProfileForm from "./ProfileForm"

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>No autorizado</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Configuración</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          Gestiona tus datos personales y preferencias de la plataforma.
        </p>
      </div>

      <ProfileForm user={session.user} />
    </div>
  )
}
