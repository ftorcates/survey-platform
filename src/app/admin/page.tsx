import { getSurveys } from "./actions";
import Link from "next/link";
import { BarChart2, Edit3 } from "lucide-react";
import ShareModal from "./ShareModal";
import DeleteSurveyButton from "./DeleteSurveyButton";
import CreateSurveyModal from "./CreateSurveyModal";

export default async function AdminDashboard() {
  const surveys = await getSurveys();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'transparent', backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-cta))', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>Mis Encuestas</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gestiona tus encuestas y visualiza las métricas.</p>
        </div>
        
        <CreateSurveyModal />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {surveys.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No tienes encuestas creadas aún.</p>
            <CreateSurveyModal />
          </div>
        ) : (
          surveys.map(survey => (
            <div key={survey.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{survey.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                {survey.description || 'Sin descripción'}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Respuestas</span>
                  <span style={{ fontWeight: 600 }}>{survey._count.responses}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Preguntas</span>
                  <span style={{ fontWeight: 600 }}>{survey._count.questions}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <Link href={`/admin/surveys/${survey.id}/edit`} className="btn-secondary" style={{ flex: '1 1 30%', padding: '0.5rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'center' }}>
                  <Edit3 size={16} style={{ marginRight: '0.25rem' }} /> Editar
                </Link>
                <Link href={`/admin/surveys/${survey.id}/metrics`} className="btn-primary" style={{ flex: '1 1 30%', padding: '0.5rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'center' }}>
                  <BarChart2 size={16} style={{ marginRight: '0.25rem' }} /> Métricas
                </Link>
                <ShareModal surveyId={survey.id} />
                <DeleteSurveyButton surveyId={survey.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
