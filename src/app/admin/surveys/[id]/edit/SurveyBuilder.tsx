"use client"

import { useState } from "react"
import { 
  addQuestion, 
  addOption, 
  updateBranching, 
  updateQuestionBranching,
  updateSurveyHeader,
  updateQuestion,
  deleteQuestion,
  deleteOption
} from "./actions"
import { Plus, GitBranch, Edit3, Trash2, Check, X, Save } from "lucide-react"

type SurveyData = any;

export default function SurveyBuilder({ survey }: { survey: SurveyData }) {
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>('SINGLE_CHOICE');
  
  // Header editing state
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editTitle, setEditTitle] = useState(survey.title);
  const [editDescription, setEditDescription] = useState(survey.description || "");

  // Question editing state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState("");
  const [editQType, setEditQType] = useState<'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>('TEXT');

  const handleUpdateHeader = async () => {
    await updateSurveyHeader(survey.id, { title: editTitle, description: editDescription });
    setIsEditingHeader(false);
  };

  const startEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setEditQText(q.text);
    setEditQType(q.type);
  };

  const handleUpdateQuestion = async (qId: string) => {
    await updateQuestion(qId, survey.id, { text: editQText, type: editQType });
    setEditingQuestionId(null);
  };

  const handleAddQuestion = async () => {
    if (!newQuestionText) return;
    await addQuestion(survey.id, { text: newQuestionText, type: newQuestionType });
    setNewQuestionText("");
  };

  const questions = survey.questions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Survey Header Edit */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', border: '1px solid var(--color-primary)' }}>
        {!isEditingHeader ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>{survey.title}</h1>
              <p style={{ color: 'var(--color-text-muted)' }}>{survey.description || "Sin descripción"}</p>
            </div>
            <button onClick={() => setIsEditingHeader(true)} className="btn-secondary" style={{ padding: '0.5rem' }}>
              <Edit3 size={18} /> Editar Info
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              className="input-base" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)} 
              placeholder="Título de la encuesta"
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            />
            <textarea 
              className="input-base" 
              value={editDescription} 
              onChange={e => setEditDescription(e.target.value)} 
              placeholder="Descripción (opcional)"
              style={{ minHeight: '80px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsEditingHeader(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleUpdateHeader} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q: any, index: number) => (
          <div key={q.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: editingQuestionId === q.id ? '4px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
            
            {editingQuestionId !== q.id ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{index + 1}. {q.text}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-md)', marginRight: '0.5rem' }}>
                      {q.type === 'SINGLE_CHOICE' ? 'Selección Única' : q.type === 'MULTIPLE_CHOICE' ? 'Selección Múltiple' : 'Texto Abierto'}
                    </span>
                    <button onClick={() => startEditQuestion(q)} className="btn-secondary" style={{ padding: '0.4rem' }} title="Editar Pregunta">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => deleteQuestion(q.id, survey.id)} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-error)' }} title="Eliminar Pregunta">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {q.type !== 'TEXT' && (
                  <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {q.options.map((opt: any) => (
                      <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: q.type === 'SINGLE_CHOICE' ? '50%' : '4px', border: '2px solid var(--color-primary)' }} />
                        <span style={{ flex: 1 }}>{opt.text}</span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <GitBranch size={16} color="var(--color-text-muted)" />
                          <select 
                            className="input-base" 
                            style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.875rem' }}
                            value={opt.nextQuestionId || ""}
                            onChange={(e) => updateBranching(opt.id, e.target.value || null, survey.id)}
                          >
                            <option value="">Siguiente en orden</option>
                            <option value="END" style={{ color: 'var(--color-error)' }}>Finalizar Encuesta</option>
                            {questions.filter((target: any) => target.order > q.order).map((target: any) => (
                              <option key={target.id} value={target.id}>Saltar a: {target.text.substring(0,20)}...</option>
                            ))}
                          </select>
                          <button onClick={() => deleteOption(opt.id, survey.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <form action={async (formData) => {
                      const text = formData.get("text") as string;
                      if(text) await addOption(q.id, survey.id, text);
                    }} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input name="text" className="input-base" placeholder="Nueva opción..." style={{ padding: '0.5rem' }} autoComplete="off" />
                      <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Agregar Opción</button>
                    </form>
                  </div>
                )}

                {q.type === 'TEXT' && (
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <GitBranch size={16} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '0.875rem' }}>Lógica de ramificación: </span>
                    <select 
                      className="input-base" 
                      style={{ padding: '0.5rem', width: 'auto' }}
                      value={q.nextQuestionId || ""}
                      onChange={(e) => updateQuestionBranching(q.id, e.target.value || null, survey.id)}
                    >
                      <option value="">Siguiente en orden</option>
                      <option value="END" style={{ color: 'var(--color-error)' }}>Finalizar Encuesta</option>
                      {questions.filter((target: any) => target.order > q.order).map((target: any) => (
                        <option key={target.id} value={target.id}>Saltar a: {target.text.substring(0,20)}...</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 600 }}>Editando Pregunta {index + 1}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingQuestionId(null)} className="btn-secondary" style={{ padding: '0.4rem' }}>
                      <X size={18} />
                    </button>
                    <button onClick={() => handleUpdateQuestion(q.id)} className="btn-primary" style={{ padding: '0.4rem' }}>
                      <Check size={18} />
                    </button>
                  </div>
                </div>
                <input 
                  className="input-base" 
                  value={editQText} 
                  onChange={e => setEditQText(e.target.value)}
                  placeholder="Texto de la pregunta"
                />
                <select 
                  className="input-base"
                  value={editQType}
                  onChange={e => setEditQType(e.target.value as any)}
                >
                  <option value="SINGLE_CHOICE">Selección Única</option>
                  <option value="MULTIPLE_CHOICE">Selección Múltiple</option>
                  <option value="TEXT">Respuesta de Texto Abierta</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  * Al cambiar el tipo de pregunta, las opciones y lógica de salto se mantendrán si son compatibles.
                </p>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Add Question Box */}
      <div className="glass-panel" style={{ padding: '2rem', border: '2px dashed var(--color-primary)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Agregar Nueva Pregunta</h3>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <input 
            className="input-base" 
            placeholder="Escribe la pregunta aquí..." 
            value={newQuestionText}
            onChange={e => setNewQuestionText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select 
              className="input-base" 
              style={{ flex: 1 }}
              value={newQuestionType}
              onChange={e => setNewQuestionType(e.target.value as any)}
            >
              <option value="SINGLE_CHOICE">Selección Única (Una sola respuesta)</option>
              <option value="MULTIPLE_CHOICE">Selección Múltiple (Varias respuestas)</option>
              <option value="TEXT">Respuesta de Texto Abierta</option>
            </select>
            <button className="btn-primary" onClick={handleAddQuestion}>
              <Plus size={18} /> Agregar Pregunta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
