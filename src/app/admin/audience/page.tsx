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
          <div>
            <div className="eyebrow">
              <ScanSearch size={14} />
              Audiencias
            </div>
            <h1 className="section-title">Segmentos sobre el mapa.</h1>
            <p className="section-copy">
              Revisa quién respondió, desde qué encuesta llegó cada registro y cómo se distribuyen los grupos dentro del sistema.
            </p>
          </div>
          <div className="route-strip" aria-hidden="true">
            <span />
            <i />
            <span />
            <i />
            <span />
          </div>
        </div>

        <aside className="card dashboard-hero-side">
          <div>
            <p className="stat-label">Participantes</p>
            <p className="stat-value">{totalParticipants}</p>
          </div>
          <div className="divider" />
          <div>
            <p className="stat-label">Encuestas con respuesta</p>
            <p className="stat-value">{uniqueSurveys}</p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", color: "var(--color-text-muted)" }}>
            <Users size={20} />
            <BarChart3 size={20} />
          </div>
        </aside>
      </section>

      <AudienceTable responses={responses} />
    </div>
  )
}
