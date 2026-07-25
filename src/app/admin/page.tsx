import { getSurveys } from "./actions";
import Link from "next/link";
import { BarChart2, Edit3, FileText, MessageSquare, PanelsTopLeft } from "lucide-react";
import ShareModal from "./ShareModal";
import DeleteSurveyButton from "./DeleteSurveyButton";
import CreateSurveyModal from "./CreateSurveyModal";

export default async function AdminDashboard() {
  const surveys = await getSurveys();
  const totalResponses = surveys.reduce((sum, survey) => sum + survey._count.responses, 0);
  const totalQuestions = surveys.reduce((sum, survey) => sum + survey._count.questions, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <PanelsTopLeft size={14} />
            Dashboard
          </div>
          <h1 className="section-title" style={{ marginTop: "1rem" }}>Tus encuestas</h1>
          <p className="section-copy">Gestiona creación, edición, publicación y lectura de métricas desde una sola vista.</p>
        </div>
        <CreateSurveyModal />
      </div>

      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat-card">
          <div className="stat-label">Encuestas creadas</div>
          <div className="stat-value">{surveys.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Respuestas totales</div>
          <div className="stat-value">{totalResponses}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Preguntas activas</div>
          <div className="stat-value">{totalQuestions}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {surveys.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center", gridColumn: "1 / -1" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "1.25rem", margin: "0 auto 1rem", background: "rgba(15, 118, 110, 0.08)", display: "grid", placeItems: "center" }}>
              <FileText size={24} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>Todavía no has creado encuestas</h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
              Empieza con una nueva encuesta y luego revísala desde este panel.
            </p>
            <CreateSurveyModal />
          </div>
        ) : (
          surveys.map(survey => (
            <article key={survey.id} className="card survey-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <span className="chip">
                    <MessageSquare size={14} />
                    Encuesta
                  </span>
                  <h3 style={{ fontSize: "1.3rem", margin: "0.85rem 0 0.45rem" }}>{survey.title}</h3>
                </div>
                <DeleteSurveyButton surveyId={survey.id} />
              </div>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.94rem', lineHeight: 1.7, flex: 1 }}>
                {survey.description || 'Sin descripción'}
              </p>
              
              <div className="stats-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div className="soft-card stat-card">
                  <span className="stat-label">Respuestas</span>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, marginTop: "0.45rem" }}>{survey._count.responses}</div>
                </div>
                <div className="soft-card stat-card">
                  <span className="stat-label">Preguntas</span>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, marginTop: "0.45rem" }}>{survey._count.questions}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.7rem" }}>
                <Link href={`/admin/surveys/${survey.id}/edit`} className="btn-secondary" style={{ width: "100%" }}>
                  <Edit3 size={16} style={{ marginRight: '0.25rem' }} /> Editar
                </Link>
                <Link href={`/admin/surveys/${survey.id}/metrics`} className="btn-primary" style={{ width: "100%" }}>
                  <BarChart2 size={16} style={{ marginRight: '0.25rem' }} /> Métricas
                </Link>
              </div>

              <div className="divider" />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>
                  Comparte esta encuesta para empezar a recolectar respuestas.
                </span>
                <div style={{ minWidth: "220px" }}>
                  <ShareModal surveyId={survey.id} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
