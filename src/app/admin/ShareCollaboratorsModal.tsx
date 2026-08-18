"use client"

import { useState, useEffect, useTransition } from "react"
import { createPortal } from "react-dom"
import { Users, UserPlus, Trash2, X, Shield, Check, AlertCircle, Loader2, Link2, Copy, ExternalLink, Globe, Lock } from "lucide-react"
import { getSurveyShares, shareSurvey, updateSurveyShareRole, removeSurveyShare, getSurveyPublicMetricsStatus, togglePublicMetrics } from "./actions"

interface ShareUser {
  id: string
  role: 'READ' | 'EDIT'
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

export default function ShareCollaboratorsModal({ 
  surveyId, 
  surveyTitle,
  variant = "button",
  defaultTab = "collaborators"
}: { 
  surveyId: string
  surveyTitle?: string
  variant?: "button" | "menu-item" | "icon"
  defaultTab?: "collaborators" | "public_metrics"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"collaborators" | "public_metrics">(defaultTab)
  const [shares, setShares] = useState<ShareUser[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<'READ' | 'EDIT'>('READ')
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null)
  
  // Public metrics state
  const [isMetricsPublic, setIsMetricsPublic] = useState(false)
  const [publicStatusLoading, setPublicStatusLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMounted(true)
  }, [])

  const publicMetricsUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/metrics/${surveyId}` 
    : `/metrics/${surveyId}`

  const loadData = async () => {
    try {
      setLoading(true)
      const [sharesData, publicData] = await Promise.all([
        getSurveyShares(surveyId),
        getSurveyPublicMetricsStatus(surveyId)
      ])
      setShares(sharesData as ShareUser[])
      setIsMetricsPublic(publicData.isMetricsPublic)
    } catch (err: any) {
      console.error("Error al cargar datos de compartición:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
      setFeedback(null)
      setEmail("")
      setCopied(false)
      setActiveTab(defaultTab)
    }
  }, [isOpen, surveyId, defaultTab])

  const handleAddShare = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setFeedback(null)
    startTransition(async () => {
      const res = await shareSurvey(surveyId, email, role)
      if (res.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setFeedback({ type: 'success', message: `Permisos otorgados correctamente a ${email}.` })
        setEmail("")
        try {
          const updated = await getSurveyShares(surveyId)
          setShares(updated as ShareUser[])
        } catch {}
      }
    })
  }

  const handleUpdateRole = async (shareId: string, newRole: 'READ' | 'EDIT') => {
    startTransition(async () => {
      const res = await updateSurveyShareRole(shareId, newRole)
      if (res.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setShares(prev => prev.map(s => s.id === shareId ? { ...s, role: newRole } : s))
      }
    })
  }

  const handleRemove = async (shareId: string, userName: string | null) => {
    if (!confirm(`¿Estás seguro de revocar el acceso a ${userName || 'este usuario'}?`)) return

    startTransition(async () => {
      const res = await removeSurveyShare(shareId)
      if (res.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setShares(prev => prev.filter(s => s.id !== shareId))
        setFeedback({ type: 'success', message: 'Acceso revocado exitosamente.' })
      }
    })
  }

  const handleTogglePublicMetrics = async () => {
    setPublicStatusLoading(true)
    startTransition(async () => {
      const nextState = !isMetricsPublic
      const res = await togglePublicMetrics(surveyId, nextState)
      if (res.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setIsMetricsPublic(nextState)
        setFeedback({ 
          type: 'success', 
          message: nextState 
            ? 'Enlace público activado. Cualquier persona con el enlace puede ver los resultados.' 
            : 'Enlace público desactivado. Solo los colaboradores autorizados tienen acceso.' 
        })
      }
      setPublicStatusLoading(false)
    })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicMetricsUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      {variant === "button" && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-secondary"
          style={{
            flex: '1 1 100%',
            padding: '0.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'var(--color-text-main)'
          }}
          title="Gestionar colaboradores y permisos"
        >
          <Users size={16} style={{ color: 'var(--color-primary)' }} />
          Colaboradores
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="modal-panel" style={{ width: '100%', maxWidth: '560px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75)' }}>
            <button 
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
              style={{ position: 'absolute', top: '1rem', right: '1rem', padding: "0.35rem" }}
            >
              <X size={20} />
            </button>

            <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>
              <Shield size={14} />
              Compartir y Permisos
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              {surveyTitle || "Gestión de Acceso a la Encuesta"}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Controla quién puede colaborar en la encuesta o comparte un enlace público para visualizar las métricas.
            </p>

            {/* Tabs Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem', paddingBottom: '0.25rem' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('collaborators'); setFeedback(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'collaborators' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === 'collaborators' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: activeTab === 'collaborators' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Users size={16} />
                Colaboradores Registrados ({shares.length})
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('public_metrics'); setFeedback(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'public_metrics' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === 'public_metrics' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: activeTab === 'public_metrics' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Globe size={16} />
                Enlace Público de Métricas
                {isMetricsPublic && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                )}
              </button>
            </div>

            {/* TAB 1: Colaboradores Registrados */}
            {activeTab === 'collaborators' && (
              <>
                {/* Formulario para invitar colaborador */}
                <form onSubmit={handleAddShare} style={{ background: 'var(--color-surface-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <UserPlus size={16} /> Invitar nuevo colaborador
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                        Correo electrónico del usuario
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input-base"
                        style={{ width: '100%', fontSize: '0.875rem', padding: '0.65rem 0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                          Nivel de Permiso
                        </label>
                        <select
                          value={role}
                          onChange={e => setRole(e.target.value as 'READ' | 'EDIT')}
                          className="input-base"
                          style={{ width: '100%', fontSize: '0.875rem', padding: '0.65rem 0.85rem', cursor: 'pointer' }}
                        >
                          <option value="READ">Solo lectura (Ver resultados y métricas)</option>
                          <option value="EDIT">Edición (Modificar preguntas y ver resultados)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isPending || !email.trim()}
                        className="btn-primary"
                        style={{ height: '42px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                      >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Feedback messages */}
                  {feedback && (
                    <div style={{
                      marginTop: '0.85rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: feedback.type === 'error' ? '#ef4444' : '#10b981',
                      border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
                    }}>
                      {feedback.type === 'error' ? <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                      <span>{feedback.message}</span>
                    </div>
                  )}
                </form>

                {/* Listado de colaboradores actuales */}
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Usuarios con acceso</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      {shares.length} {shares.length === 1 ? 'colaborador' : 'colaboradores'}
                    </span>
                  </div>

                  {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ fontSize: '0.875rem' }}>Cargando permisos...</p>
                    </div>
                  ) : shares.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      Esta encuesta aún no ha sido compartida con otros usuarios.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {shares.map(s => (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            background: 'var(--color-surface-subtle)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            gap: '0.75rem'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.user.name || "Usuario"}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.user.email}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            <select
                              value={s.role}
                              disabled={isPending}
                              onChange={e => handleUpdateRole(s.id, e.target.value as 'READ' | 'EDIT')}
                              className="input-base"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.55rem',
                                fontWeight: 600,
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="READ">Solo lectura</option>
                              <option value="EDIT">Edición</option>
                            </select>

                            <button
                              onClick={() => handleRemove(s.id, s.user.name || s.user.email)}
                              disabled={isPending}
                              className="btn-ghost"
                              title="Revocar acceso"
                              style={{
                                padding: '0.4rem',
                                color: '#ef4444',
                                borderRadius: 'var(--radius-sm)'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: Enlace Público de Métricas (Sin Login) */}
            {activeTab === 'public_metrics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: isMetricsPublic ? 'rgba(16, 185, 129, 0.06)' : 'var(--color-surface-subtle)',
                  border: `1px solid ${isMetricsPublic ? 'rgba(16, 185, 129, 0.25)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isMetricsPublic ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: isMetricsPublic ? '#10b981' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isMetricsPublic ? <Globe size={22} /> : <Lock size={22} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                        {isMetricsPublic ? 'Acceso Público Activado' : 'Acceso Público Desactivado'}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
                        {isMetricsPublic 
                          ? 'Cualquier persona con el enlace puede ver los gráficos e informes sin iniciar sesión.'
                          : 'Solo tú y los colaboradores autorizados pueden ver los resultados de esta encuesta.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={publicStatusLoading || isPending}
                    onClick={handleTogglePublicMetrics}
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: isMetricsPublic ? '#ef4444' : '#10b981',
                      color: '#ffffff',
                      boxShadow: isMetricsPublic ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {publicStatusLoading && <Loader2 size={14} className="animate-spin" />}
                    {isMetricsPublic ? 'Desactivar' : 'Activar Enlace'}
                  </button>
                </div>

                {isMetricsPublic ? (
                  <div style={{ background: 'var(--color-surface-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                      Enlace para compartir resultados (Solo lectura)
                    </label>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        readOnly
                        value={publicMetricsUrl}
                        className="input-base"
                        style={{
                          flex: 1,
                          fontSize: '0.875rem',
                          padding: '0.65rem 0.85rem',
                          background: 'var(--color-bg)',
                          cursor: 'default',
                          color: 'var(--color-text-main)',
                          fontFamily: 'var(--font-mono, monospace)'
                        }}
                      />

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="btn-primary"
                        style={{
                          padding: '0.65rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          backgroundColor: copied ? '#10b981' : undefined
                        }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? '¡Copiado!' : 'Copiar'}
                      </button>

                      <a
                        href={publicMetricsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none'
                        }}
                        title="Abrir enlace en pestaña nueva"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    <div style={{ marginTop: '0.85rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      🛡️ <strong>Privacidad protegida:</strong> La exportación completa a Excel está deshabilitada en el enlace público para salvaguardar la base de datos de respuestas individuales.
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <p style={{ margin: 0 }}>
                      Haz clic en <strong>&ldquo;Activar Enlace&rdquo;</strong> para generar la URL pública de métricas de esta encuesta.
                    </p>
                  </div>
                )}

                {/* Feedback messages */}
                {feedback && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: feedback.type === 'error' ? '#ef4444' : '#10b981',
                    border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
                  }}>
                    {feedback.type === 'error' ? <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                    <span>{feedback.message}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
