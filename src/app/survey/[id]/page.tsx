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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-panel" style={{ margin: '1rem', padding: '1rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'transparent', backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-cta))', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
          {survey.title}
        </h1>
      </header>
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '700px', position: 'relative' }}>
          <SurveyClient survey={survey} />
        </div>
      </main>
    </div>
  )
}
