"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { startSurveyResponse, saveAnswer } from "./actions"

export default function SurveyClient({ survey }: { survey: any }) {
  const [currentStep, setCurrentStep] = useState(-1); // -1: demographics, 0+: question index, -2: finished
  const [responseId, setResponseId] = useState<string | null>(null);

  // Demographics state
  const [ageGroup, setAgeGroup] = useState("");
  const [sex, setSex] = useState("");
  
  // Current answer state
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState<string[]>([]);
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

  const toggleMultipleOption = (id: string) => {
    if (selectedMultipleOptions.includes(id)) {
      setSelectedMultipleOptions(selectedMultipleOptions.filter(x => x !== id));
    } else {
      setSelectedMultipleOptions([...selectedMultipleOptions, id]);
    }
  };

  if (currentStep === -2) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>¡Gracias por participar!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Tus respuestas han sido registradas exitosamente y de forma anónima.</p>
      </motion.div>
    );
  }

  if (currentStep === -1) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>Datos Demográficos</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Esta encuesta es 100% anónima. Por favor, completa estos datos básicos para ayudarnos con nuestras métricas.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rango de Edad</label>
            <select className="input-base" value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
              <option value="">Prefiero no decirlo</option>
              <option value="18-24">18 - 24 años</option>
              <option value="25-34">25 - 34 años</option>
              <option value="35-44">35 - 44 años</option>
              <option value="45-54">45 - 54 años</option>
              <option value="55+">55+ años</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Sexo</label>
            <select className="input-base" value={sex} onChange={e => setSex(e.target.value)}>
              <option value="">Prefiero no decirlo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Other">Otro</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={handleStart} disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando...' : 'Comenzar Encuesta'}
        </button>
      </motion.div>
    );
  }

  const q = survey.questions[currentStep];

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={q.id}
        initial={{ opacity: 0, x: 50 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="glass-panel" 
        style={{ padding: '2.5rem' }}
      >
        <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          Pregunta {currentStep + 1}
        </span>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600, lineHeight: 1.4 }}>{q.text}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {q.type === 'TEXT' && (
            <textarea 
              className="input-base" 
              rows={4} 
              placeholder="Escribe tu respuesta aquí..."
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
            />
          )}

          {q.type === 'SINGLE_CHOICE' && q.options.map((opt:any) => (
            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: selectedOptionId === opt.id ? 'rgba(79, 138, 139, 0.1)' : 'var(--color-surface)', border: `1px solid ${selectedOptionId === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
              <input 
                type="radio" 
                name={`q-${q.id}`} 
                checked={selectedOptionId === opt.id}
                onChange={() => setSelectedOptionId(opt.id)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '1.125rem' }}>{opt.text}</span>
            </label>
          ))}

          {q.type === 'MULTIPLE_CHOICE' && q.options.map((opt:any) => (
            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: selectedMultipleOptions.includes(opt.id) ? 'rgba(79, 138, 139, 0.1)' : 'var(--color-surface)', border: `1px solid ${selectedMultipleOptions.includes(opt.id) ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
              <input 
                type="checkbox" 
                checked={selectedMultipleOptions.includes(opt.id)}
                onChange={() => toggleMultipleOption(opt.id)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '1.125rem' }}>{opt.text}</span>
            </label>
          ))}
        </div>

        <button 
          className="btn-primary" 
          onClick={handleNextQuestion}
          disabled={isSubmitting || (q.type === 'SINGLE_CHOICE' && !selectedOptionId) || (q.type === 'MULTIPLE_CHOICE' && selectedMultipleOptions.length === 0) || (q.type === 'TEXT' && !textAnswer.trim())}
          style={{ width: '100%', padding: '1rem' }}
        >
          {isSubmitting ? 'Guardando...' : 'Siguiente'}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
