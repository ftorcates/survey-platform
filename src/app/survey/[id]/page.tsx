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
        <header className="glass-panel hero-panel" style={{ marginBottom: "1rem", textAlign: 'center', padding: "1.5rem" }}>
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: "0.8rem" }}>Encuesta activa</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {survey.title}
          </h1>
          {survey.description ? (
            <p style={{ color: "var(--color-text-muted)", marginTop: "0.75rem", lineHeight: 1.7 }}>
              {survey.description}
            </p>
          ) : null}
        </header>
        <div style={{ width: '100%', position: 'relative' }}>
          <SurveyClient survey={survey} />
        </div>
      </main>
    </div>
  )
}
