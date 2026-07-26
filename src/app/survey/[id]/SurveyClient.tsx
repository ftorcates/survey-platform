/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { submitCompletedSurvey } from "./actions"

type StepState = 'PRESENTATION' | 'INSTRUCTIONS' | 'DEMOGRAPHICS' | 'QUESTIONS' | 'FINISHED';
type DynamicAnswer = { questionId: string; textValue?: string; optionId?: string };

export default function SurveyClient({ survey }: { survey: any }) {
  const [step, setStep] = useState<StepState>('PRESENTATION');
  const [currentStep, setCurrentStep] = useState(0); // Question index in dynamic flow

  // Demographics state
  const [ageGroup, setAgeGroup] = useState("");
  const [sex, setSex] = useState("");

  // Current & accumulated answer state (Dynamic flow)
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState<string[]>([]);
  const [dynamicAnswers, setDynamicAnswers] = useState<DynamicAnswer[]>([]);

  // Matrix answer state (Fixed Scale flow)
  const [matrixAnswers, setMatrixAnswers] = useState<Record<string, string>>({});
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  // Build blocks sequence for FIXED_SCALE surveys
  const rawBlocks = survey.blocks || [];
  const allQuestions = survey.questions || [];
  const unassignedQuestions = allQuestions.filter((q: any) => !q.blockId);
  let activeBlocks: { id: string; title: string; questions: any[] }[] = [];
  if (rawBlocks.length > 0) {
    if (unassignedQuestions.length > 0) {
      activeBlocks.push({ id: 'unassigned', title: 'Preguntas Generales', questions: unassignedQuestions });
    }
    for (const b of rawBlocks) {
      const bQs = allQuestions.filter((q: any) => q.blockId === b.id);
      if (bQs.length > 0) {
        activeBlocks.push({ id: b.id, title: b.title, questions: bQs });
      }
    }
  } else {
    activeBlocks = [{ id: 'default', title: 'Evaluación de Afirmaciones', questions: allQuestions }];
  }
  if (activeBlocks.length === 0) {
    activeBlocks = [{ id: 'empty', title: 'Evaluación', questions: [] }];
  }
  const currentBlockQuestions = activeBlocks[currentBlockIndex]?.questions || [];
  const isCurrentBlockComplete = currentBlockQuestions.every((q: any) => Boolean(matrixAnswers[q.id]));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async () => {
    if (survey.questions && survey.questions.length > 0) {
      setStep('QUESTIONS');
      setCurrentStep(0);
    } else {
      setIsSubmitting(true);
      await submitCompletedSurvey(survey.id, { ageGroup, sex }, []);
      setIsSubmitting(false);
      setStep('FINISHED');
    }
  };

  const handleNextQuestion = async () => {
    const currentQ = survey.questions[currentStep];
    let nextQId = currentQ.nextQuestionId;

    const currentNewAnswers: DynamicAnswer[] = [];
    if (currentQ.type === 'TEXT') {
      currentNewAnswers.push({ questionId: currentQ.id, textValue: textAnswer });
    } else if (currentQ.type === 'SINGLE_CHOICE') {
      currentNewAnswers.push({ questionId: currentQ.id, optionId: selectedOptionId || undefined });
      const selectedOpt = currentQ.options?.find((o: any) => o.id === selectedOptionId);
      if (selectedOpt && selectedOpt.nextQuestionId) {
        nextQId = selectedOpt.nextQuestionId; // Branching logic overrides question sequence!
      }
    } else if (currentQ.type === 'MULTIPLE_CHOICE') {
      for (const optId of selectedMultipleOptions) {
        currentNewAnswers.push({ questionId: currentQ.id, optionId: optId });
      }
    }

    const allAccumulated = [...dynamicAnswers, ...currentNewAnswers];
    setDynamicAnswers(allAccumulated);

    // Reset answer state
    setTextAnswer("");
    setSelectedOptionId(null);
    setSelectedMultipleOptions([]);

    // Branching & Completion check
    const isEndReached = nextQId === 'END' || (!nextQId && currentStep + 1 >= survey.questions.length);
    if (isEndReached) {
      setIsSubmitting(true);
      await submitCompletedSurvey(survey.id, { ageGroup, sex }, allAccumulated);
      setIsSubmitting(false);
      setStep('FINISHED');
      return;
    }

    if (nextQId) {
      const nextIndex = survey.questions.findIndex((q: any) => q.id === nextQId);
      if (nextIndex !== -1) {
        setCurrentStep(nextIndex);
        return;
      }
    }

    // Default flow: go to the next question in the array
    if (currentStep + 1 < survey.questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      await submitCompletedSurvey(survey.id, { ageGroup, sex }, allAccumulated);
      setIsSubmitting(false);
      setStep('FINISHED');
    }
  };

  const handleSubmitMatrix = async () => {
    setIsSubmitting(true);
    const formattedAnswers = Object.entries(matrixAnswers).map(([questionId, optionId]) => ({
      questionId,
      optionId
    }));
    await submitCompletedSurvey(survey.id, { ageGroup, sex }, formattedAnswers);
    setIsSubmitting(false);
    setStep('FINISHED');
  };

  const toggleMultipleOption = (id: string) => {
    if (selectedMultipleOptions.includes(id)) {
      setSelectedMultipleOptions(selectedMultipleOptions.filter(x => x !== id));
    } else {
      setSelectedMultipleOptions([...selectedMultipleOptions, id]);
    }
  };

  // --- 1. PRESENTATION SCREEN (PORTADA DE TRABAJO) ---
  if (step === 'PRESENTATION') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card"
        style={{
          padding: '5rem 3rem',
          textAlign: 'center',
          minHeight: '620px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(145deg, var(--color-surface), var(--color-surface-solid))',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '850px',
          margin: '0 auto'
        }}
      >
        {/* Subtle radial light highlight in background */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--color-accent-soft) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Top Section: Logo and Hierarchy (Centrados) */}
        <div style={{ width: '100%', maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
          {survey.image && (
            <div style={{ marginBottom: '0.5rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={survey.image}
                alt="Logo de la Empresa"
                style={{ maxHeight: '140px', maxWidth: '300px', objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', width: '100%' }}>
            {survey.organization && (
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {survey.organization}
              </div>
            )}
            {survey.department && (
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                {survey.department}
              </div>
            )}
            {survey.subdepartment && (
              <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                {survey.subdepartment}
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Título de la encuesta (Centrado) */}
        <div style={{ margin: '3.5rem 0', width: '100%' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.15, color: 'var(--color-text-main)', letterSpacing: '-0.02em', maxWidth: '750px', margin: '0 auto' }}>
            {survey.title}
          </h1>
        </div>

        {/* Bottom Section: Botón Ver Instrucciones */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', width: '100%' }}>
          <button
            type="button"
            onClick={() => setStep('INSTRUCTIONS')}
            className="btn-primary"
            style={{
              padding: '1.25rem 3.2rem',
              fontSize: '1.15rem',
              fontWeight: 700,
              borderRadius: '50px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 10px 35px var(--color-accent-focus)',
              cursor: 'pointer'
            }}
          >
            <span>Ver Instrucciones</span>
            <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>→</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // --- 2. INSTRUCTIONS SCREEN ---
  if (step === 'INSTRUCTIONS') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="card"
        style={{ padding: '4rem 3.5rem', minHeight: '520px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto', width: '100%' }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="eyebrow">Instrucciones generales</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
            Antes de comenzar
          </h2>
          {survey.description ? (
            <div style={{ fontSize: '1.15rem', lineHeight: 1.75, color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap', background: 'var(--color-bg)', padding: '2.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              {survey.description}
            </div>
          ) : (
            <div style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', lineHeight: 1.75, background: 'var(--color-bg)', padding: '2.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              Por favor responde a todas las preguntas con atención y sinceridad. Tu opinión es el pilar para nuestras mejoras continuas y toda la información suministrada se procesa de forma completamente confidencial.
            </div>
          )}

          {survey.type === 'FIXED_SCALE' && survey.includeLikertTable && survey.options && survey.options.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '1.25rem' }}>
                Tabla de opciones de respuesta:
              </h3>
              <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.95rem' }}>Opciones disponibles en la escala</th>
                    </tr>
                  </thead>
                  <tbody>
                    {survey.options.map((opt: any, index: number) => (
                      <tr key={opt.id} style={{ borderBottom: index < survey.options.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <td style={{ padding: '1.1rem 1.5rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', flexShrink: 0 }} />
                          <span>{opt.text}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensaje final de agradecimiento previo */}
          <div style={{
            marginTop: '2.5rem',
            padding: '1.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(90deg, var(--color-accent-soft), rgba(255, 255, 255, 0.02))',
            borderLeft: '4px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderRight: '1px solid var(--color-border)',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 24px var(--color-accent-focus)', flexShrink: 0 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-main)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
              &quot;Agradecemos y apreciamos mucho su participación {survey.isMandatory ? 'obligatoria' : 'voluntaria'} en el proceso.&quot;
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4rem', paddingTop: '1.75rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setStep('PRESENTATION')}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={() => {
              if (survey.requireDemographics) {
                setStep('DEMOGRAPHICS');
              } else {
                handleStart();
              }
            }}
            disabled={isSubmitting}
            className="btn-primary"
            style={{ padding: '1.2rem 3.5rem', fontSize: '1.15rem', fontWeight: 700, borderRadius: '50px', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}
          >
            {isSubmitting ? 'Iniciando...' : 'Comenzar'}
          </button>
        </div>
      </motion.div>
    );
  }

  // --- 3. DEMOGRAPHICS SCREEN (ONLY IF REQUIRED) ---
  if (step === 'DEMOGRAPHICS') {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '3.5rem 3rem', maxWidth: '650px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="eyebrow">Datos Demográficos</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--color-text-main)' }}>
            Conociéndote un poco
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Esta experiencia es 100% anónima. Tus datos nos ayudan a segmentar y mejorar las métricas analíticas.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '3rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--color-text-main)' }}>¿En qué rango de edad te encuentras?</label>
            <select className="input-base" style={{ padding: '1rem', fontSize: '1.05rem' }} value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
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
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--color-text-main)' }}>¿Con qué género te identificas?</label>
            <select className="input-base" style={{ padding: '1rem', fontSize: '1.05rem' }} value={sex} onChange={e => setSex(e.target.value)}>
              <option value="">Selecciona una opción...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Other">Otro</option>
              <option value="none">Prefiero no decirlo</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setStep('INSTRUCTIONS')}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
          >
            ← Instrucciones
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '1.1rem 2.8rem', fontSize: '1.15rem', fontWeight: 700, borderRadius: '40px' }}
            onClick={handleStart}
            disabled={isSubmitting || !ageGroup || !sex}
          >
            {isSubmitting ? 'Iniciando...' : 'Ir a las Preguntas →'}
          </button>
        </div>
      </motion.div>
    );
  }

  // --- 5. FINISHED SCREEN (AGRADECIMIENTO) ---
  if (step === 'FINISHED') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="card" style={{ padding: '5rem 2.5rem', textAlign: 'center', borderTop: '5px solid var(--color-success)', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', border: '2px solid var(--color-success)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
          ¡Muchas Gracias!
        </h2>
        <p style={{ color: 'var(--color-text-main)', fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>
          Tus respuestas han sido registradas exitosamente.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.08rem', lineHeight: 1.65, maxWidth: '520px', margin: '0 auto' }}>
          Agradecemos sinceramente el tiempo dedicado en completar este estudio. Toda la información ha sido almacenada de forma segura y confidencial. Ya puedes cerrar esta ventana.
        </p>
      </motion.div>
    );
  }

  // --- 4. QUESTIONS SCREEN (FIXED SCALE OR DYNAMIC FLOW) ---
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <header style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "1.5rem", alignItems: "end", marginBottom: "2rem" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>Encuesta en progreso</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.05, fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.01em' }}>
            {survey.title}
          </h1>
        </div>
        <div className="card stat-card" style={{ minWidth: "120px", padding: '0.75rem 1.25rem', textAlign: 'center', background: 'var(--color-surface)' }}>
          <div className="stat-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Preguntas</div>
          <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{survey.questions ? survey.questions.length : 0}</div>
        </div>
      </header>

      {/* FIXED SCALE (MATRIX) FLOW */}
      {survey.type === 'FIXED_SCALE' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlockIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="card"
            style={{ padding: '2.5rem', width: '100%' }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <span className="eyebrow">
                {activeBlocks.length > 1 ? `Bloque ${currentBlockIndex + 1} de ${activeBlocks.length}` : "Escala completa"}
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--color-text-main)' }}>
                Por favor evalúa las siguientes afirmaciones
              </h2>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
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
                  {currentBlockQuestions.map((q: any) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: matrixAnswers[q.id] ? 'transparent' : 'rgba(239, 68, 68, 0.02)' }}>
                      <td style={{ padding: '1.5rem 1rem', textAlign: 'left', fontWeight: 500, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>{q.text}</td>
                      {survey.options.map((opt: any) => (
                        <td key={opt.id} style={{ padding: '1.5rem 0.5rem' }}>
                          <label style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', height: '100%', width: '100%' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              border: `2px solid ${matrixAnswers[q.id] === opt.id ? 'var(--color-primary)' : 'var(--color-text-muted)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              backgroundColor: matrixAnswers[q.id] === opt.id ? 'var(--color-accent-soft)' : 'transparent'
                            }}>
                              {matrixAnswers[q.id] === opt.id && <div style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {currentBlockIndex > 0 ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setCurrentBlockIndex(prev => prev - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, borderRadius: '40px' }}
                >
                  ← Volver al bloque anterior
                </button>
              ) : (
                <div />
              )}

              {currentBlockIndex < activeBlocks.length - 1 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setCurrentBlockIndex(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={!isCurrentBlockComplete}
                  style={{ padding: '1.25rem 3.5rem', fontSize: '1.15rem', fontWeight: 700, borderRadius: '40px', marginLeft: 'auto' }}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmitMatrix}
                  disabled={isSubmitting || !isCurrentBlockComplete}
                  style={{ padding: '1.25rem 3.5rem', fontSize: '1.15rem', fontWeight: 700, borderRadius: '40px', marginLeft: 'auto' }}
                >
                  {isSubmitting ? 'Guardando...' : 'Finalizar encuesta'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        /* DYNAMIC FLOW */
        (() => {
          const q = survey.questions[currentStep];
          if (!q) return null;
          const progress = ((currentStep) / survey.questions.length) * 100;

          return (
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 80, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -80, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="card"
                style={{ padding: '0', overflow: 'hidden' }}
              >
                {/* Progress Bar */}
                <div className="progress-track" style={{ borderRadius: 0, height: '6px', background: 'var(--color-bg-hover)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-cta))' }}
                  />
                </div>

                <div style={{ padding: '3.5rem 3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span className="eyebrow" style={{ color: 'var(--color-text-muted)' }}>
                      Pregunta {currentStep + 1} de {survey.questions.length}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.85rem', marginBottom: '2.5rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--color-text-main)' }}>{q.text}</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3.5rem' }}>
                    {q.type === 'TEXT' && (
                      <textarea
                        className="input-base"
                        rows={6}
                        style={{ fontSize: '1.125rem', resize: 'vertical', padding: '1.25rem' }}
                        placeholder="Escribe tu respuesta con el mayor detalle posible..."
                        value={textAnswer}
                        onChange={e => setTextAnswer(e.target.value)}
                      />
                    )}

                    {q.type === 'SINGLE_CHOICE' && q.options && q.options.map((opt: any) => (
                      <label
                        key={opt.id}
                        className={`question-option ${selectedOptionId === opt.id ? "question-option-active" : ""}`}
                        style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: selectedOptionId === opt.id ? 'var(--color-accent-soft)' : 'var(--color-bg)', border: `1px solid ${selectedOptionId === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}` }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `2px solid ${selectedOptionId === opt.id ? 'var(--color-primary)' : 'var(--color-text-muted)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          flexShrink: 0
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
                        <span style={{ fontSize: '1.15rem', fontWeight: selectedOptionId === opt.id ? 600 : 400, color: 'var(--color-text-main)' }}>{opt.text}</span>
                      </label>
                    ))}

                    {q.type === 'MULTIPLE_CHOICE' && q.options && q.options.map((opt: any) => (
                      <label
                        key={opt.id}
                        className={`question-option ${selectedMultipleOptions.includes(opt.id) ? "question-option-active" : ""}`}
                        style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: selectedMultipleOptions.includes(opt.id) ? 'var(--color-accent-soft)' : 'var(--color-bg)', border: `1px solid ${selectedMultipleOptions.includes(opt.id) ? 'var(--color-cta)' : 'var(--color-border)'}` }}
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
                          backgroundColor: selectedMultipleOptions.includes(opt.id) ? 'var(--color-cta)' : 'transparent',
                          flexShrink: 0
                        }}>
                          {selectedMultipleOptions.includes(opt.id) && (
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedMultipleOptions.includes(opt.id)}
                          onChange={() => toggleMultipleOption(opt.id)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '1.15rem', fontWeight: selectedMultipleOptions.includes(opt.id) ? 600 : 400, color: 'var(--color-text-main)' }}>{opt.text}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    className="btn-primary"
                    onClick={handleNextQuestion}
                    disabled={isSubmitting || (q.type === 'SINGLE_CHOICE' && !selectedOptionId) || (q.type === 'MULTIPLE_CHOICE' && selectedMultipleOptions.length === 0) || (q.type === 'TEXT' && !textAnswer.trim())}
                    style={{ width: '100%', padding: '1.25rem', fontSize: '1.15rem', fontWeight: 700, borderRadius: '40px' }}
                  >
                    {isSubmitting ? 'Guardando...' : (currentStep + 1 === survey.questions.length && !q.nextQuestionId) ? 'Finalizar' : 'Siguiente →'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          );
        })()
      )}
    </div>
  );
}
