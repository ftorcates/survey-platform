import { getGlobalAudience } from "../actions"
import AudienceTable from "./AudienceTable"
import { BarChart3, ScanSearch, Users } from "lucide-react"

export default async function AudiencePage() {
  const responses = await getGlobalAudience();

  const totalParticipants = responses.length;
  const uniqueSurveys = new Set(responses.map(r => r.surveyId)).size;
  
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <ScanSearch size={14} />
            Audiencias
          </div>
          <h1 className="section-title" style={{ marginTop: "1rem" }}>Resumen de respuestas</h1>
          <p className="section-copy">
            Una vista agregada de participación por encuesta, demografía y fecha.
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: '0.85rem', backgroundColor: 'rgba(15, 118, 110, 0.08)', borderRadius: '1rem' }}>
            <Users color="var(--color-primary)" size={24} />
          </div>
          <div>
            <p className="stat-label">Participantes</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: "0.4rem" }}>{totalParticipants}</p>
          </div>
        </div>
        <div className="card stat-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: '0.85rem', backgroundColor: 'rgba(217, 119, 6, 0.12)', borderRadius: '1rem' }}>
            <BarChart3 color="var(--color-secondary)" size={24} />
          </div>
          <div>
            <p className="stat-label">Encuestas activas</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: "0.4rem" }}>{uniqueSurveys}</p>
          </div>
        </div>
      </div>

      <AudienceTable responses={responses} />
    </div>
  )
}
