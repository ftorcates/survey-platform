import prisma from "@/lib/prisma"
import SurveyClient from "./SurveyClient"
import { notFound } from "next/navigation"

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const survey = await prisma.survey.findUnique({
    where: { id: resolvedParams.id },
    include: {
      options: {
        orderBy: { id: 'asc' }
      },
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: true
        }
      }
    }
  });

  if (!survey) return notFound();

  return (
    <div className="container page-shell" style={{ minHeight: '100vh', display: 'grid', alignItems: 'center' }}>
      <main className="survey-frame" style={{ position: 'relative' }}>
        <header style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "1rem", alignItems: "end", marginBottom: "1rem" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>Encuesta activa</div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95, fontWeight: 800, textTransform: "uppercase" }}>
              {survey.title}
            </h1>
            {survey.description ? (
              <p style={{ color: "var(--color-text-muted)", marginTop: "0.75rem", lineHeight: 1.65 }}>
                {survey.description}
              </p>
            ) : null}
          </div>
          <div className="card stat-card" style={{ minWidth: "130px" }}>
            <div className="stat-label">Preguntas</div>
            <div className="stat-value">{survey.questions.length}</div>
          </div>
        </header>
        <div style={{ width: '100%', position: 'relative' }}>
          <SurveyClient survey={survey} />
        </div>
      </main>
    </div>
  )
}
