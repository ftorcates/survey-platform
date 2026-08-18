import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChartColumn, Lock, ShieldCheck } from "lucide-react"
import MetricsClient from "@/app/admin/surveys/[id]/metrics/MetricsClient"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const survey = await prisma.survey.findUnique({
    where: { id: resolvedParams.id },
    select: { title: true, description: true, isMetricsPublic: true }
  });

  if (!survey || !survey.isMetricsPublic) {
    return {
      title: "Métricas - Plataforma de Encuestas",
      description: "Resultados y análisis de encuestas."
    };
  }

  return {
    title: `Métricas: ${survey.title} | Plataforma de Encuestas`,
    description: survey.description || `Visualiza los resultados en tiempo real de la encuesta ${survey.title}.`
  };
}

export default async function PublicMetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

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

  // Si las métricas públicas están desactivadas por el autor/editor
  if (!survey.isMetricsPublic) {
    return (
      <div className="container page-shell" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>
            Métricas no disponibles
          </h2>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            El creador de esta encuesta ha desactivado el acceso público a los resultados. Si eres el propietario o colaborador, inicia sesión para acceder al informe analítico.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/auth/login" className="btn-primary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
              Iniciar Sesión
            </Link>
            <Link href="/" className="btn-secondary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-shell" style={{ maxWidth: '1480px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div className="eyebrow" style={{ color: 'var(--color-primary)' }}>
            <ChartColumn size={15} />
            Informe Público de Métricas
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={14} />
            Solo Lectura
          </div>
        </div>

        <h1 className="section-title">{survey.title}</h1>
        <p className="section-copy" style={{ maxWidth: '800px' }}>
          {survey.description || "Análisis consolidado de respuestas y estadísticas de distribución en tiempo real."}
        </p>
      </header>

      <main>
        <MetricsClient survey={survey} isPublicView={true} />
      </main>
    </div>
  );
}
