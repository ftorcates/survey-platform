"use client"

import { useState, useEffect, useTransition } from "react"
import { Users, UserPlus, Trash2, X, Shield, Eye, Edit3, Check, AlertCircle, Loader2 } from "lucide-react"
import { getSurveyShares, shareSurvey, updateSurveyShareRole, removeSurveyShare } from "./actions"

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
  variant = "button"
}: { 
  surveyId: string
  surveyTitle?: string
  variant?: "button" | "menu-item" | "icon"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [shares, setShares] = useState<ShareUser[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<'READ' | 'EDIT'>('READ')
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadShares = async () => {
    try {
      setLoading(true)
      const data = await getSurveyShares(surveyId)
      setShares(data as ShareUser[])
    } catch (err: any) {
      console.error("Error al cargar colaboradores:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadShares()
      setFeedback(null)
      setEmail("")
    }
  }, [isOpen, surveyId])

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
        await loadShares()
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

      {isOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="modal-panel" style={{ width: '100%', maxWidth: '540px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
              style={{ position: 'absolute', top: '1rem', right: '1rem', padding: "0.35rem" }}
            >
              <X size={20} />
            </button>

            <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>
              <Shield size={14} />
              Permisos y Colaboración
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              Colaboradores de la Encuesta
            </h3>
            {surveyTitle && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                {surveyTitle}
              </p>
            )}

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
        </div>
      )}
    </>
  )
}
