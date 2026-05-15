import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import MetricsClient from "./MetricsClient"
import { auth } from "@/auth"

export default async function MetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const survey = await prisma.survey.findUnique({
    where: { id: resolvedParams.id },
    include: {
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

  if (!survey || survey.authorId !== session?.user?.id) return notFound();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Métricas: {survey.title}</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Análisis de respuestas y datos demográficos en tiempo real.</p>
      </div>

      <MetricsClient survey={survey} />
    </div>
  )
}
