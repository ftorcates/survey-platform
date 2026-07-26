import prisma from "@/lib/prisma"
import SurveyBuilder from "./SurveyBuilder"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, PencilRuler } from "lucide-react"
import { auth } from "@/auth"

export default async function EditSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const survey = await prisma.survey.findUnique({
    where: { id: resolvedParams.id },
    include: {
      options: true,
      blocks: {
        orderBy: { order: 'asc' }
      },
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
    <div style={{ maxWidth: '1040px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 700 }}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <div className="eyebrow" style={{ marginBottom: 0 }}>
          <PencilRuler size={14} />
          Edición de encuesta
        </div>
      </div>

      <SurveyBuilder survey={survey} />
    </div>
  )
}
