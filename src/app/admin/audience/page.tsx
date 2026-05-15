import { getGlobalAudience } from "../actions"
import AudienceTable from "./AudienceTable"
import { Users, UserCheck, BarChart } from "lucide-react"

export default async function AudiencePage() {
  const responses = await getGlobalAudience();

  const totalParticipants = responses.length;
  const uniqueSurveys = new Set(responses.map(r => r.surveyId)).size;
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Audiencia Global</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          Gestiona y analiza a todos los participantes de tus estudios en un solo lugar.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(79, 138, 139, 0.1)', borderRadius: 'var(--radius-md)' }}>
            <Users color="var(--color-primary)" size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Total Participantes</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalParticipants}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(79, 138, 139, 0.1)', borderRadius: 'var(--radius-md)' }}>
            <BarChart color="var(--color-primary)" size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Encuestas Activas</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{uniqueSurveys}</p>
          </div>
        </div>
      </div>

      <AudienceTable responses={responses} />
    </div>
  )
}
