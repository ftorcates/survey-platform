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
      <main className="survey-frame" style={{ position: 'relative', width: '100%' }}>
        <SurveyClient survey={survey} />
      </main>
    </div>
  )
}
