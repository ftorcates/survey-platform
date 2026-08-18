import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChartColumn } from "lucide-react"
import MetricsClient from "./MetricsClient"
import { auth } from "@/auth"
import { getSurveyUserRole } from "@/lib/permissions"
import ShareCollaboratorsModal from "@/app/admin/ShareCollaboratorsModal"

export default async function MetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const role = await getSurveyUserRole(resolvedParams.id, session?.user?.id);
  if (!role) return notFound();

  const survey = await prisma.survey.findUnique({
    where: { id: resolvedParams.id },
    include: {
      blocks: {
        orderBy: { order: 'asc' }
      },
      options: {
        orderBy: { id: 'asc' }
      },
      responses: true,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: true,
          answers: true
        }
      }
    }
  });

  if (!survey) return notFound();

  const canShare = role === 'OWNER' || role === 'EDIT';

  return (
    <div style={{ maxWidth: '1480px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 700 }}>
            <ArrowLeft size={16} /> Volver al Dashboard
          </Link>
          <div className="eyebrow">
            <ChartColumn size={14} />
            Métricas
          </div>
          <h1 className="section-title" style={{ marginTop: "1rem" }}>{survey.title}</h1>
          <p className="section-copy">Análisis de respuestas, tendencias por pregunta y exportación de resultados.</p>
        </div>

        {canShare && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ShareCollaboratorsModal 
              surveyId={survey.id} 
              surveyTitle={survey.title} 
              defaultTab="public_metrics"
            />
          </div>
        )}
      </div>

      <MetricsClient survey={survey} />
    </div>
  )
}
