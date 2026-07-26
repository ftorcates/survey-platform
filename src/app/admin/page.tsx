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
  const responseRate = surveys.length > 0 ? Math.round(totalResponses / surveys.length) : 0;

  return (
    <div>
      <section className="dashboard-hero">
        <div className="card dashboard-hero-main">
          <div>
            <div className="eyebrow">
              <PanelsTopLeft size={14} />
              Dashboard
            </div>
            <h1 className="section-title">Mesa de trabajo para tus estudios.</h1>
            <p className="section-copy">
              Crea, edita, publica y lee resultados desde un tablero más visual, pensado para comparar encuestas en vez de recorrer una lista plana.
            </p>
          </div>
          <div className="hero-actions">
            <CreateSurveyModal />
            <Link href="/admin/audience" className="btn-secondary">
              Ver audiencias
            </Link>
          </div>
        </div>

        <aside className="card dashboard-hero-side" aria-label="Resumen del tablero">
          <div>
            <div className="stat-label">Encuestas creadas</div>
            <div className="stat-value">{surveys.length}</div>
          </div>
          <div className="divider" />
          <div>
            <div className="stat-label">Respuestas totales</div>
            <div className="stat-value">{totalResponses}</div>
          </div>
          <div className="divider" />
          <div>
            <div className="stat-label">Promedio por encuesta</div>
            <div className="stat-value">{responseRate}</div>
          </div>
        </aside>
      </section>

      <div className="stats-grid" style={{ marginBottom: "1.2rem" }}>
        <div className="soft-card stat-card">
          <div className="stat-label">Preguntas activas</div>
          <div className="stat-value">{totalQuestions}</div>
        </div>
        <div className="soft-card stat-card">
          <div className="stat-label">Publicaciones listas</div>
          <div className="stat-value">{surveys.length}</div>
        </div>
        <div className="soft-card stat-card">
          <div className="stat-label">Lectura agregada</div>
          <div className="stat-value">{totalResponses > 0 ? "On" : "Off"}</div>
        </div>
      </div>

      <section className="dashboard-grid" aria-label="Encuestas creadas">
        {surveys.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1", padding: "3rem", textAlign: "center" }}>
            <div className="brand-badge" style={{ margin: "0 auto 1rem" }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>Todavía no has creado encuestas</h3>
            <p style={{ color: "var(--color-text-muted)", margin: "0 auto 1.25rem", maxWidth: "48ch", lineHeight: 1.7 }}>
              Empieza con una nueva encuesta y luego vuelve a este tablero para editarla, compartirla o revisar métricas.
            </p>
            <CreateSurveyModal />
          </div>
        ) : (
          surveys.map(survey => (
            <article key={survey.id} className="card survey-card">
              <div className="survey-card__body">
                <span className="chip">
                  <MessageSquare size={14} />
                  Encuesta
                </span>
                <h3 className="survey-card__title">
                  {survey.title}
                </h3>
                <p className="survey-card__description">
                  {survey.description || "Sin descripción"}
                </p>
              </div>

              <div className="metric-strip">
                <div>
                  <span className="stat-label">Resp.</span>
                  <div className="stat-value" style={{ fontSize: "2rem" }}>{survey._count.responses}</div>
                </div>
                <div>
                  <span className="stat-label">Preg.</span>
                  <div className="stat-value" style={{ fontSize: "2rem", color: "var(--color-cta)" }}>{survey._count.questions}</div>
                </div>
              </div>

              <div className="survey-card__actions">
                <Link href={`/admin/surveys/${survey.id}/edit`} className="btn-secondary">
                  <Edit3 size={16} /> Editar
                </Link>
                <Link href={`/admin/surveys/${survey.id}/metrics`} className="btn-primary">
                  <BarChart2 size={16} /> Métricas
                </Link>
                <ShareModal surveyId={survey.id} />
                <DeleteSurveyButton surveyId={survey.id} />
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
