/* eslint-disable @typescript-eslint/no-explicit-any */
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
  deleteOption,
  addBlock,
  updateBlock,
  deleteBlock,
  moveQuestionToBlock
} from "./actions"
import { Plus, GitBranch, Edit3, Trash2, Check, X, Save, List, Layers, FolderPlus } from "lucide-react"

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

  // Block management state
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockDesc, setNewBlockDesc] = useState("");

  // Block editing state
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editBlockTitle, setEditBlockTitle] = useState("");
  const [editBlockDesc, setEditBlockDesc] = useState("");

  // Per-block question text inputs
  const [blockQuestionTexts, setBlockQuestionTexts] = useState<Record<string, string>>({});

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

  const handleAddQuestion = async (blockId?: string) => {
    if (!newQuestionText) return;
    await addQuestion(survey.id, { text: newQuestionText, type: newQuestionType, blockId });
    setNewQuestionText("");
  };

  const handleAddQuestionToBlock = async (blockId: string) => {
    const text = blockQuestionTexts[blockId];
    if (!text) return;
    await addQuestion(survey.id, { text, type: 'SINGLE_CHOICE', blockId });
    setBlockQuestionTexts(prev => ({ ...prev, [blockId]: "" }));
  };

  const handleAddBlock = async () => {
    if (!newBlockTitle) return;
    await addBlock(survey.id, { title: newBlockTitle, description: newBlockDesc });
    setNewBlockTitle("");
    setNewBlockDesc("");
    setIsAddingBlock(false);
  };

  const startEditBlock = (block: any) => {
    setEditingBlockId(block.id);
    setEditBlockTitle(block.title);
    setEditBlockDesc(block.description || "");
  };

  const handleUpdateBlock = async (blockId: string) => {
    await updateBlock(blockId, survey.id, { title: editBlockTitle, description: editBlockDesc });
    setEditingBlockId(null);
  };

  const questions = survey.questions || [];
  const blocks = survey.blocks || [];
  const unassignedQuestions = questions.filter((q: any) => !q.blockId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Survey Header Edit */}
      <div className="card" style={{ padding: '2rem', marginBottom: '0.5rem', borderLeft: '4px solid var(--color-primary)' }}>
        {!isEditingHeader ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 550px', minWidth: 0 }}>
              {survey.type === 'FIXED_SCALE' && (
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span className="chip" style={{ color: 'var(--color-primary)', fontWeight: 600, border: '1px solid var(--color-accent-border)', background: 'var(--color-accent-soft)' }}>
                    <List size={15} /> Escala Fija
                  </span>
                </div>
              )}
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)', margin: '0 0 1rem 0', lineHeight: 1.25 }}>
                {survey.title}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '1.05rem', margin: 0 }}>
                {survey.description || "Sin descripción"}
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button onClick={() => setIsEditingHeader(true)} className="btn-secondary" style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Edit3 size={17} /> Editar Info
              </button>
            </div>
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

      {/* --- MODO LIKERT / FIXED_SCALE (CON SOPORTE PARA BLOQUES Y DIMENSIONES) --- */}
      {survey.type === 'FIXED_SCALE' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1rem 1.5rem', borderLeft: '4px solid var(--color-secondary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Opciones Globales de la Escala</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Todas las preguntas o ítems evaluados usarán esta matriz de valoración en la encuesta final:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {survey.options?.map((opt: any) => (
                <span key={opt.id} className="chip">
                  {opt.text}
                </span>
              ))}
            </div>
          </div>

          {/* Tarjeta de Crear Nuevo Bloque */}
          <div className="card" style={{ padding: '1.75rem 2rem', border: '1px solid var(--color-accent-border)', background: 'var(--color-accent-soft)' }}>
            {!isAddingBlock ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-text-main)', margin: 0 }}>
                    <Layers size={20} color="var(--color-primary)" /> Configurar Bloques o Dimensiones
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', margin: '0.4rem 0 0 0' }}>
                    Agrupa tus preguntas por bloques (ej. dimensiones de clima, liderazgo). Cada bloque se presentará en una página distinta durante el llenado, con botones de navegación (&quot;Siguiente&quot;). Las descripciones del bloque son secretas/internas para el administrador.
                  </p>
                </div>
                <button onClick={() => setIsAddingBlock(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem' }}>
                  <FolderPlus size={18} /> + Crear Nuevo Bloque
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text-main)', margin: 0 }}>Nuevo Bloque de Preguntas</h4>
                  <button onClick={() => setIsAddingBlock(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                <input 
                  className="input-base"
                  placeholder="Nombre del bloque (ej: Dimensión Liderazgo y Comunicación)"
                  value={newBlockTitle}
                  onChange={(e) => setNewBlockTitle(e.target.value)}
                />
                <div>
                  <textarea 
                    className="input-base"
                    rows={2}
                    placeholder="Descripción o notas del bloque (Opcional - Sólo visible en esta administración, oculta para respondentes)"
                    value={newBlockDesc}
                    onChange={(e) => setNewBlockDesc(e.target.value)}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    * Esta descripción no se mostrará durante el llenado anónimo para mantener la neutralidad del estudio.
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsAddingBlock(false)}>Cancelar</button>
                  <button type="button" className="btn-primary" onClick={handleAddBlock} disabled={!newBlockTitle.trim()}>Guardar Bloque</button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Bloques y sus preguntas */}
          {blocks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '0.5rem' }}>
              {blocks.map((block: any, blockIdx: number) => {
                const blockQuestions = questions.filter((q: any) => q.blockId === block.id);
                return (
                  <div key={block.id} className="card" style={{ padding: '2rem', border: '1px solid var(--color-border)', borderTop: '4px solid var(--color-primary)' }}>
                    {editingBlockId !== block.id ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="eyebrow" style={{ color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>
                              BLOQUE {blockIdx + 1}
                            </span>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                              {block.title}
                            </h3>
                          </div>
                          {block.description && (
                            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '0.5rem 0 0 0', background: 'var(--color-bg)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                              🔒 Nota interna: &quot;{block.description}&quot; <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Oculto al respondente)</span>
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => startEditBlock(block)} className="btn-secondary" style={{ padding: '0.45rem' }} title="Editar Nombre/Descripción del Bloque">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => deleteBlock(block.id, survey.id)} className="btn-secondary" style={{ padding: '0.45rem', color: 'var(--color-error)' }} title="Eliminar Bloque">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                        <h4 style={{ fontWeight: 600, margin: 0 }}>Editando Bloque {blockIdx + 1}</h4>
                        <input 
                          className="input-base"
                          value={editBlockTitle}
                          onChange={(e) => setEditBlockTitle(e.target.value)}
                          placeholder="Nombre del bloque"
                        />
                        <textarea 
                          className="input-base"
                          rows={2}
                          value={editBlockDesc}
                          onChange={(e) => setEditBlockDesc(e.target.value)}
                          placeholder="Descripción interna opcional"
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button type="button" className="btn-secondary" onClick={() => setEditingBlockId(null)}>Cancelar</button>
                          <button type="button" className="btn-primary" onClick={() => handleUpdateBlock(block.id)}>Guardar</button>
                        </div>
                      </div>
                    )}

                    {/* Preguntas dentro de este bloque */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                      {blockQuestions.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', margin: 0 }}>
                          No hay preguntas asignadas a este bloque aún. Agrega una nueva abajo.
                        </p>
                      ) : (
                        blockQuestions.map((q: any, qIdx: number) => (
                          <div key={q.id} style={{ padding: '1.1rem 1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: editingQuestionId === q.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {editingQuestionId !== q.id ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                  <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                                    {qIdx + 1}.
                                  </span>
                                  <span style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                                    {q.text}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {blocks.length > 1 && (
                                    <select
                                      className="input-base"
                                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto', borderRadius: '20px' }}
                                      value={q.blockId || ""}
                                      onChange={(e) => moveQuestionToBlock(q.id, e.target.value || null, survey.id)}
                                      title="Mover de bloque"
                                    >
                                      {blocks.map((b: any, i: number) => (
                                        <option key={b.id} value={b.id}>Bloque {i+1}: {b.title.substring(0,20)}...</option>
                                      ))}
                                      <option value="">Sin Bloque (General)</option>
                                    </select>
                                  )}
                                  <button onClick={() => startEditQuestion(q)} className="btn-secondary" style={{ padding: '0.4rem' }} title="Editar Pregunta">
                                    <Edit3 size={16} />
                                  </button>
                                  <button onClick={() => deleteQuestion(q.id, survey.id)} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-error)' }} title="Eliminar Pregunta">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <h5 style={{ margin: 0, fontWeight: 600 }}>Editando Pregunta</h5>
                                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button onClick={() => setEditingQuestionId(null)} className="btn-secondary" style={{ padding: '0.3rem' }}><X size={16} /></button>
                                    <button onClick={() => handleUpdateQuestion(q.id)} className="btn-primary" style={{ padding: '0.3rem' }}><Check size={16} /></button>
                                  </div>
                                </div>
                                <input
                                  className="input-base"
                                  value={editQText}
                                  onChange={e => setEditQText(e.target.value)}
                                  placeholder="Texto de la pregunta"
                                />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Agregar pregunta en este bloque específico */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)' }}>
                      <input
                        className="input-base"
                        style={{ flex: 1 }}
                        placeholder={`Escribe una nueva pregunta para "${block.title}"...`}
                        value={blockQuestionTexts[block.id] || ""}
                        onChange={(e) => setBlockQuestionTexts({ ...blockQuestionTexts, [block.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddQuestionToBlock(block.id);
                        }}
                      />
                      <button type="button" className="btn-primary" onClick={() => handleAddQuestionToBlock(block.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <Plus size={18} /> Agregar al Bloque {blockIdx + 1}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Preguntas no asignadas (Si no hay bloques, o si quedaron preguntas libres) */}
          {(blocks.length === 0 || unassignedQuestions.length > 0) && (
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '1.25rem' }}>
                {blocks.length > 0 ? "Preguntas Generales (Sin Bloque Asignado)" : "Listado de Preguntas (Bloque Único)"}
              </h3>
              {blocks.length > 0 && (
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Estas preguntas no están asociadas a ningún bloque y se mostrarán en la primera pantalla del estudio. Puedes moverlas a cualquiera de tus bloques creados arriba.
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {unassignedQuestions.map((q: any, index: number) => (
                  <div key={q.id} style={{ padding: '1.1rem 1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: editingQuestionId === q.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {editingQuestionId !== q.id ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                            {index + 1}.
                          </span>
                          <span style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                            {q.text}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {blocks.length > 0 && (
                            <select
                              className="input-base"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto', borderRadius: '20px', background: 'var(--color-surface)' }}
                              value={""}
                              onChange={(e) => moveQuestionToBlock(q.id, e.target.value || null, survey.id)}
                            >
                              <option value="" disabled>Mover al Bloque...</option>
                              {blocks.map((b: any, i: number) => (
                                <option key={b.id} value={b.id}>Bloque {i+1}: {b.title.substring(0,25)}...</option>
                              ))}
                            </select>
                          )}
                          <button onClick={() => startEditQuestion(q)} className="btn-secondary" style={{ padding: '0.4rem' }} title="Editar Pregunta">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => deleteQuestion(q.id, survey.id)} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-error)' }} title="Eliminar Pregunta">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h5 style={{ margin: 0, fontWeight: 600 }}>Editando Pregunta {index + 1}</h5>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => setEditingQuestionId(null)} className="btn-secondary" style={{ padding: '0.3rem' }}><X size={16} /></button>
                            <button onClick={() => handleUpdateQuestion(q.id)} className="btn-primary" style={{ padding: '0.3rem' }}><Check size={16} /></button>
                          </div>
                        </div>
                        <input
                          className="input-base"
                          value={editQText}
                          onChange={e => setEditQText(e.target.value)}
                          placeholder="Texto de la pregunta"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Agregar pregunta general / sin bloque */}
              {blocks.length === 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)' }}>
                  <input 
                    className="input-base" 
                    placeholder="Escribe el ítem de valoración o pregunta aquí..." 
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddQuestion(); }}
                    style={{ flex: 1 }}
                  />
                  <button className="btn-primary" onClick={() => handleAddQuestion()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                    <Plus size={18} /> Agregar Pregunta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* --- MODO CUSTOM (ENCUESTAS DINÁMICAS PREGUNTA A PREGUNTA CON LÓGICA DE SALTO) --- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((q: any, index: number) => (
              <div key={q.id} className="card" style={{ padding: '1.5rem', borderLeft: editingQuestionId === q.id ? '4px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
                {editingQuestionId !== q.id ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{index + 1}. {q.text}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="chip" style={{ marginRight: '0.5rem' }}>
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
                        {q.options?.map((opt: any) => (
                          <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
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
                      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
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
          <div className="card" style={{ padding: '2rem', border: '2px dashed var(--color-accent-border)', backgroundColor: 'rgba(255, 255, 255, 0.045)' }}>
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
                <button className="btn-primary" onClick={() => handleAddQuestion()}>
                  <Plus size={18} /> Agregar Pregunta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
