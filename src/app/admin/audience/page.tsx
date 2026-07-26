import { getGlobalAudience } from "../actions"
import AudienceTable from "./AudienceTable"
import { BarChart3, ScanSearch, Users } from "lucide-react"

export default async function AudiencePage() {
  const responses = await getGlobalAudience();

  const totalParticipants = responses.length;
  const uniqueSurveys = new Set(responses.map(r => r.surveyId)).size;
  
  return (
    <div>
      <section className="dashboard-hero">
        <div className="card dashboard-hero-main">
          <div className="eyebrow">
            <ScanSearch size={14} />
            Audiencias
          </div>
          <h1 className="section-title">Mapa agregado de respuestas.</h1>
          <p className="section-copy">
            Cruza participación, encuesta, demografía y fecha desde una vista más editorial y menos tabular como punto de entrada.
          </p>
        </div>

        <aside className="card dashboard-hero-side">
          <div>
            <p className="stat-label">Participantes</p>
            <p className="stat-value">{totalParticipants}</p>
          </div>
          <div className="divider" />
          <div>
            <p className="stat-label">Encuestas activas</p>
            <p className="stat-value">{uniqueSurveys}</p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", color: "var(--color-text-muted)" }}>
            <Users size={20} />
            <BarChart3 size={20} />
          </div>
        </aside>
      </section>

      <div className="stats-grid" style={{ marginBottom: "1.2rem" }}>
        <div className="soft-card stat-card">
          <p className="stat-label">Participantes</p>
          <p className="stat-value">{totalParticipants}</p>
        </div>
        <div className="soft-card stat-card">
          <div>
            <p className="stat-label">Encuestas activas</p>
            <p className="stat-value">{uniqueSurveys}</p>
          </div>
        </div>
      </div>

      <AudienceTable responses={responses} />
    </div>
  )
}
