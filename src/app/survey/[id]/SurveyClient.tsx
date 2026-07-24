"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { startSurveyResponse, saveAnswer } from "./actions"

export default function SurveyClient({ survey }: { survey: any }) {
  const [currentStep, setCurrentStep] = useState(-1); // -1: demographics, 0+: question index (or matrix), -2: finished
  const [responseId, setResponseId] = useState<string | null>(null);

  // Demographics state
  const [ageGroup, setAgeGroup] = useState("");
  const [sex, setSex] = useState("");
  
  // Current answer state (Dynamic flow)
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState<string[]>([]);
  
  // Matrix answer state (Fixed Scale flow)
  const [matrixAnswers, setMatrixAnswers] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async () => {
    setIsSubmitting(true);
    const rid = await startSurveyResponse(survey.id, { ageGroup, sex });
    setResponseId(rid);
    setIsSubmitting(false);
    
    if (survey.questions.length > 0) {
      setCurrentStep(0);
    } else {
      setCurrentStep(-2); // Finish if no questions
    }
  };

  const handleNextQuestion = async () => {
    if (!responseId) return;
    
    const currentQ = survey.questions[currentStep];
    let nextQId = currentQ.nextQuestionId;

    setIsSubmitting(true);

    if (currentQ.type === 'TEXT') {
      await saveAnswer(responseId, currentQ.id, textAnswer, undefined);
    } else if (currentQ.type === 'SINGLE_CHOICE') {
      await saveAnswer(responseId, currentQ.id, undefined, selectedOptionId || undefined);
      const selectedOpt = currentQ.options.find((o:any) => o.id === selectedOptionId);
      if (selectedOpt && selectedOpt.nextQuestionId) {
        nextQId = selectedOpt.nextQuestionId; // Branching logic overrides question sequence!
      }
    } else if (currentQ.type === 'MULTIPLE_CHOICE') {
      for (const optId of selectedMultipleOptions) {
        await saveAnswer(responseId, currentQ.id, undefined, optId);
      }
    }

    setIsSubmitting(false);

    // Reset answer state
    setTextAnswer("");
    setSelectedOptionId(null);
    setSelectedMultipleOptions([]);

    // Branching: Find the next question index if a specific nextQuestionId is set
    if (nextQId === 'END') {
      setCurrentStep(-2); // End immediately
      return;
    }

    if (nextQId) {
      const nextIndex = survey.questions.findIndex((q:any) => q.id === nextQId);
      if (nextIndex !== -1) {
        setCurrentStep(nextIndex);
        return;
      }
    }
    
    // Default flow: go to the next question in the array
    if (currentStep + 1 < survey.questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(-2); // End of survey
    }
  };

  const handleSubmitMatrix = async () => {
    if (!responseId) return;
    setIsSubmitting(true);
    for (const q of survey.questions) {
      if (matrixAnswers[q.id]) {
        await saveAnswer(responseId, q.id, undefined, matrixAnswers[q.id]);
      }
    }
    setIsSubmitting(false);
    setCurrentStep(-2); // End of survey
  };

  const toggleMultipleOption = (id: string) => {
    if (selectedMultipleOptions.includes(id)) {
      setSelectedMultipleOptions(selectedMultipleOptions.filter(x => x !== id));
    } else {
      setSelectedMultipleOptions([...selectedMultipleOptions, id]);
    }
  };

  if (currentStep === -2) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5 }} className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '4px solid var(--color-success)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'transparent', backgroundImage: 'linear-gradient(135deg, var(--color-success), var(--color-cta))', backgroundClip: 'text', WebkitBackgroundClip: 'text', marginBottom: '1.5rem' }}>
          ¡Misión Cumplida! 🚀
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>Tus respuestas han sido registradas exitosamente y de forma anónima. ¡Gracias por tu tiempo!</p>
      </motion.div>
    );
  }

  if (currentStep === -1) {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ display: 'inline-block', padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cta)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Fase de Preparación
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Conociéndote un poco</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Esta experiencia es 100% anónima. Tus datos nos ayudan a mejorar nuestras métricas.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>¿En qué rango de edad te encuentras?</label>
            <select className="input-base" style={{ padding: '1rem' }} value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
              <option value="">Selecciona una opción...</option>
              <option value="18-24">18 - 24 años</option>
              <option value="25-34">25 - 34 años</option>
              <option value="35-44">35 - 44 años</option>
              <option value="45-54">45 - 54 años</option>
              <option value="55+">55+ años</option>
              <option value="none">Prefiero no decirlo</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>¿Con qué género te identificas?</label>
            <select className="input-base" style={{ padding: '1rem' }} value={sex} onChange={e => setSex(e.target.value)}>
              <option value="">Selecciona una opción...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Other">Otro</option>
              <option value="none">Prefiero no decirlo</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }} onClick={handleStart} disabled={isSubmitting}>
          {isSubmitting ? 'Cargando...' : '¡Iniciar Experiencia!'}
        </button>
      </motion.div>
    );
  }

  // --- FIXED SCALE (MATRIX) FLOW ---
  if (survey.type === 'FIXED_SCALE' && currentStep === 0) {
    const isMatrixComplete = survey.questions.every((q: any) => matrixAnswers[q.id]);
    
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-cta)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Encuesta Completa
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--color-text-main)' }}>Por favor evalúa las siguientes afirmaciones</h2>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid var(--color-border)', width: '35%' }}>Afirmación</th>
                {survey.options.map((opt: any) => (
                  <th key={opt.id} style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem', width: `${65 / survey.options.length}%` }}>
                    {opt.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {survey.questions.map((q: any) => (
                <tr key={q.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: matrixAnswers[q.id] ? 'transparent' : 'rgba(239, 68, 68, 0.02)' }}>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.95rem' }}>{q.text}</td>
                  {survey.options.map((opt: any) => (
                    <td key={opt.id} style={{ padding: '1.5rem 0.5rem' }}>
                      <label style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', height: '100%', width: '100%' }}>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          border: `2px solid ${matrixAnswers[q.id] === opt.id ? 'var(--color-primary)' : 'var(--color-text-muted)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          backgroundColor: matrixAnswers[q.id] === opt.id ? 'rgba(124, 58, 237, 0.1)' : 'transparent'
                        }}>
                          {matrixAnswers[q.id] === opt.id && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />}
                        </div>
                        <input 
                          type="radio" 
                          name={`matrix-${q.id}`} 
                          checked={matrixAnswers[q.id] === opt.id}
                          onChange={() => setMatrixAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleSubmitMatrix}
          disabled={isSubmitting}
          style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', opacity: 1 }}
        >
          {isSubmitting ? 'Guardando...' : 'Finalizar Encuesta'}
        </button>
      </motion.div>
    );
  }

  // --- DYNAMIC FLOW ---
  const q = survey.questions[currentStep];
  const progress = ((currentStep) / survey.questions.length) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={q.id}
        initial={{ opacity: 0, x: 100, scale: 0.95 }} 
        animate={{ opacity: 1, x: 0, scale: 1 }} 
        exit={{ opacity: 0, x: -100, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass-panel" 
        style={{ padding: '0', overflow: 'hidden' }}
      >
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-hover)' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-cta))' }}
          />
        </div>

        <div style={{ padding: '3rem 2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-cta)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Pregunta {currentStep + 1} de {survey.questions.length}
            </span>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', marginBottom: '2.5rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--color-text-main)' }}>{q.text}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            {q.type === 'TEXT' && (
              <textarea 
                className="input-base" 
                rows={5} 
                style={{ fontSize: '1.125rem', resize: 'vertical' }}
                placeholder="Escribe tu respuesta aquí..."
                value={textAnswer}
                onChange={e => setTextAnswer(e.target.value)}
              />
            )}

            {q.type === 'SINGLE_CHOICE' && q.options.map((opt:any, idx: number) => (
              <label 
                key={opt.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1.25rem', 
                  backgroundColor: selectedOptionId === opt.id ? 'rgba(124, 58, 237, 0.08)' : 'var(--color-surface)', 
                  border: `2px solid ${selectedOptionId === opt.id ? 'var(--color-primary)' : 'transparent'}`, 
                  borderRadius: 'var(--radius-lg)', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedOptionId === opt.id ? '0 4px 12px rgba(124, 58, 237, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  border: `2px solid ${selectedOptionId === opt.id ? 'var(--color-primary)' : 'var(--color-text-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {selectedOptionId === opt.id && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />}
                </div>
                <input 
                  type="radio" 
                  name={`q-${q.id}`} 
                  checked={selectedOptionId === opt.id}
                  onChange={() => setSelectedOptionId(opt.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '1.125rem', fontWeight: selectedOptionId === opt.id ? 600 : 400 }}>{opt.text}</span>
              </label>
            ))}

            {q.type === 'MULTIPLE_CHOICE' && q.options.map((opt:any) => (
              <label 
                key={opt.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1.25rem', 
                  backgroundColor: selectedMultipleOptions.includes(opt.id) ? 'rgba(6, 182, 212, 0.08)' : 'var(--color-surface)', 
                  border: `2px solid ${selectedMultipleOptions.includes(opt.id) ? 'var(--color-cta)' : 'transparent'}`, 
                  borderRadius: 'var(--radius-lg)', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedMultipleOptions.includes(opt.id) ? '0 4px 12px rgba(6, 182, 212, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '6px', 
                  border: `2px solid ${selectedMultipleOptions.includes(opt.id) ? 'var(--color-cta)' : 'var(--color-text-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: selectedMultipleOptions.includes(opt.id) ? 'var(--color-cta)' : 'transparent'
                }}>
                  {selectedMultipleOptions.includes(opt.id) && (
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <input 
                  type="checkbox" 
                  checked={selectedMultipleOptions.includes(opt.id)}
                  onChange={() => toggleMultipleOption(opt.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '1.125rem', fontWeight: selectedMultipleOptions.includes(opt.id) ? 600 : 400 }}>{opt.text}</span>
              </label>
            ))}
          </div>

          <button 
            className="btn-primary" 
            onClick={handleNextQuestion}
            disabled={isSubmitting || (q.type === 'SINGLE_CHOICE' && !selectedOptionId) || (q.type === 'MULTIPLE_CHOICE' && selectedMultipleOptions.length === 0) || (q.type === 'TEXT' && !textAnswer.trim())}
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem' }}
          >
            {isSubmitting ? 'Guardando...' : 'Siguiente Misión'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
