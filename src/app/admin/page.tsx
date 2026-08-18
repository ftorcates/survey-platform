import { getSurveys } from "./actions";
import Link from "next/link";
import { BarChart2, Edit3, FileText, MessageSquare, PanelsTopLeft, Shield, Eye, Users } from "lucide-react";
import ShareModal from "./ShareModal";
import ShareCollaboratorsModal from "./ShareCollaboratorsModal";
import DeleteSurveyButton from "./DeleteSurveyButton";
import CreateSurveyModal from "./CreateSurveyModal";

export default async function AdminDashboard() {
  const surveys = await getSurveys();
  const totalResponses = surveys.reduce((sum: number, survey: any) => sum + (survey._count?.responses || 0), 0);
  const totalQuestions = surveys.reduce((sum: number, survey: any) => sum + (survey._count?.questions || 0), 0);
  const averageResponses = surveys.length > 0 ? Math.round(totalResponses / surveys.length) : 0;

  return (
    <div>
      <section className="dashboard-hero">
        <div className="card dashboard-hero-main">
          <div>
            <div className="eyebrow">
              <PanelsTopLeft size={14} />
              Dashboard
            </div>
            <h1 className="section-title">Mapa operativo de encuestas.</h1>
            <p className="section-copy">
              Cada encuesta se trata como una ruta: preguntas, respuestas, audiencia y acciones conectadas en un mismo recorrido.
            </p>
          </div>
          <div>
            <div className="route-strip" aria-hidden="true">
              <span />
              <i />
              <span />
              <i />
              <span />
            </div>
            <div className="route-actions">
              <CreateSurveyModal />
              <Link href="/admin/audience" className="btn-secondary">
                Ver audiencias
              </Link>
            </div>
          </div>
        </div>

        <aside className="card dashboard-hero-side" aria-label="Resumen del tablero">
          <div>
            <div className="stat-label">Rutas creadas</div>
            <div className="stat-value">{surveys.length}</div>
          </div>
          <div className="divider" />
          <div>
            <div className="stat-label">Respuestas totales</div>
            <div className="stat-value">{totalResponses}</div>
          </div>
          <div className="divider" />
          <div>
            <div className="stat-label">Promedio por ruta</div>
            <div className="stat-value">{averageResponses}</div>
          </div>
        </aside>
      </section>

      <div className="stats-grid" style={{ marginBottom: "1.2rem" }}>
        <div className="soft-card stat-card">
          <div className="stat-label">Preguntas activas</div>
          <div className="stat-value">{totalQuestions}</div>
        </div>
        <div className="soft-card stat-card">
          <div className="stat-label">Rutas publicables</div>
          <div className="stat-value">{surveys.length}</div>
        </div>
        <div className="soft-card stat-card">
          <div className="stat-label">Modo audiencia</div>
          <div className="stat-value">{totalResponses > 0 ? "On" : "Off"}</div>
        </div>
      </div>

      <section className="dashboard-grid" aria-label="Encuestas creadas">
        {surveys.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1", padding: "3rem", textAlign: "center" }}>
            <div className="brand-badge" style={{ margin: "0 auto 1rem" }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: "1.7rem", marginBottom: "0.6rem" }}>Todavía no hay rutas de encuesta</h3>
            <p style={{ color: "var(--color-text-muted)", margin: "0 auto 1.25rem", maxWidth: "48ch", lineHeight: 1.7 }}>
              Crea la primera encuesta para definir preguntas, bifurcaciones, escala y publicación.
            </p>
            <CreateSurveyModal />
          </div>
        ) : (
          surveys.map((survey: any) => {
            const isOwner = survey.userRole === 'OWNER';
            const canEdit = survey.userRole === 'OWNER' || survey.userRole === 'EDIT';

            return (
              <article key={survey.id} className="card survey-card">
                <div className="survey-card__route" aria-hidden="true">
                  <span />
                  <i />
                  <span />
                  <i />
                  <span />
                </div>

                <div className="survey-card__body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isOwner ? (
                      <span className="chip">
                        <MessageSquare size={14} />
                        Creada por mí
                      </span>
                    ) : survey.userRole === 'EDIT' ? (
                      <span className="chip" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                        <Shield size={14} />
                        Compartida (Edición)
                      </span>
                    ) : (
                      <span className="chip" style={{ background: 'rgba(107, 114, 128, 0.12)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                        <Eye size={14} />
                        Compartida (Solo lectura)
                      </span>
                    )}

                    {!isOwner && survey.author?.name && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        de {survey.author.name}
                      </span>
                    )}
                  </div>

                  <h3 className="survey-card__title">{survey.title}</h3>
                  <p className="survey-card__description">
                    {survey.description || "Sin descripción"}
                  </p>
                </div>

                <div className="metric-strip">
                  <div>
                    <span className="stat-label">Resp.</span>
                    <div className="stat-value" style={{ fontSize: "1.75rem" }}>{survey._count.responses}</div>
                  </div>
                  <div>
                    <span className="stat-label">Nodos</span>
                    <div className="stat-value" style={{ fontSize: "1.75rem", color: "var(--color-secondary)" }}>{survey._count.questions}</div>
                  </div>
                </div>

                <div className="survey-card__actions">
                  {canEdit && (
                    <Link href={`/admin/surveys/${survey.id}/edit`} className="btn-secondary">
                      <Edit3 size={16} /> Editar
                    </Link>
                  )}
                  <Link href={`/admin/surveys/${survey.id}/metrics`} className="btn-primary">
                    <BarChart2 size={16} /> Métricas
                  </Link>
                  <ShareModal surveyId={survey.id} />
                  {isOwner && (
                    <>
                      <ShareCollaboratorsModal surveyId={survey.id} surveyTitle={survey.title} />
                      <DeleteSurveyButton surveyId={survey.id} />
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
