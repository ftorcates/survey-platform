"use client";

import { useState } from "react";
import { Plus, X, Type, List } from "lucide-react";
import { createSurvey } from "./actions";

export default function CreateSurveyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"CUSTOM" | "FIXED_SCALE">("CUSTOM");
  const [options, setOptions] = useState<string[]>(["Nunca", "A veces", "Siempre"]);

  const handleAddOption = () => setOptions([...options, ""]);
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        <Plus size={18} /> Nueva Encuesta
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-xl)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Crear Encuesta</h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
                <X size={24} />
              </button>
            </div>

            <form action={createSurvey}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Título de la Encuesta</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="Ej: Encuesta de Clima Laboral"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descripción (opcional)</label>
                <textarea 
                  name="description" 
                  rows={3}
                  placeholder="Instrucciones breves para quien responde..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tipo de Encuesta</label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div 
                    onClick={() => setType("CUSTOM")}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      border: `2px solid ${type === "CUSTOM" ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: type === "CUSTOM" ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: type === "CUSTOM" ? 'var(--color-primary)' : 'inherit' }}>
                      <Type size={20} style={{ marginRight: '0.5rem' }} />
                      <strong>Dinámica (Personalizada)</strong>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Cada pregunta tiene sus propias opciones y puedes configurar saltos lógicos.</p>
                  </div>

                  <div 
                    onClick={() => setType("FIXED_SCALE")}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      border: `2px solid ${type === "FIXED_SCALE" ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: type === "FIXED_SCALE" ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: type === "FIXED_SCALE" ? 'var(--color-primary)' : 'inherit' }}>
                      <List size={20} style={{ marginRight: '0.5rem' }} />
                      <strong>Escala Fija (Matriz)</strong>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Todas las preguntas comparten las mismas opciones. Ideal para Escalas de Likert.</p>
                  </div>
                </div>
                
                <input type="hidden" name="type" value={type} />
              </div>

              {type === "FIXED_SCALE" && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Opciones Globales Compartidas</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Estas opciones se mostrarán para todas las preguntas de la encuesta.</p>
                  
                  {options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Opción ${i + 1}`}
                        required
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                      />
                      {options.length > 2 && (
                        <button type="button" onClick={() => handleRemoveOption(i)} style={{ padding: '0.5rem', background: 'var(--color-error)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button type="button" onClick={handleAddOption} style={{ marginTop: '0.5rem', background: 'none', border: '1px dashed var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                    + Añadir Opción
                  </button>

                  <input type="hidden" name="globalOptions" value={JSON.stringify(options.filter(o => o.trim() !== ''))} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Crear Encuesta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
