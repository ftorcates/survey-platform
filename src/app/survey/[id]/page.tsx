import prisma from "@/lib/prisma"
import SurveyClient from "./SurveyClient"
import { notFound } from "next/navigation"

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const survey = await prisma.survey.findUnique({
    where: { id: resolvedParams.id },
    include: {
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>{survey.title}</h1>
      </header>
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
          <SurveyClient survey={survey} />
        </div>
      </main>
    </div>
  )
}
