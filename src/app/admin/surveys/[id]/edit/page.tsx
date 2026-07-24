import prisma from "@/lib/prisma"
import SurveyBuilder from "./SurveyBuilder"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"

export default async function EditSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const survey = await prisma.survey.findUnique({
    where: { id: resolvedParams.id },
    include: {
      options: true,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: true
        }
      }
    }
  });

  if (!survey || survey.authorId !== session?.user?.id) return notFound();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{survey.title}</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Construye el flujo de tu encuesta y define la lógica de ramificación (Branching).</p>
      </div>

      <SurveyBuilder survey={survey} />
    </div>
  )
}
