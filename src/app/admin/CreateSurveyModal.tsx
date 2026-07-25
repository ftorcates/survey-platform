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
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: "680px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div className="eyebrow">Nueva encuesta</div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: "0.9rem" }}>Configura la base del estudio</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="btn-ghost" style={{ padding: "0.35rem" }}>
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
                  className="input-base"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descripción (opcional)</label>
                <textarea 
                  name="description" 
                  rows={3}
                  placeholder="Instrucciones breves para quien responde..."
                  className="input-base"
                />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input 
                  type="checkbox" 
                  name="requireDemographics" 
                  id="requireDemographics" 
                  defaultChecked
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <label htmlFor="requireDemographics" style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--color-text-main)' }}>
                  Solicitar información demográfica de los participantes (edad y género)
                </label>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tipo de Encuesta</label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div 
                    onClick={() => setType("CUSTOM")}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '1rem', 
                      border: `2px solid ${type === "CUSTOM" ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: type === "CUSTOM" ? 'rgba(15, 118, 110, 0.08)' : 'rgba(255,255,255,0.4)'
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
                      borderRadius: '1rem', 
                      border: `2px solid ${type === "FIXED_SCALE" ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: type === "FIXED_SCALE" ? 'rgba(15, 118, 110, 0.08)' : 'rgba(255,255,255,0.4)'
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
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.58)', borderRadius: '1rem', border: "1px solid var(--color-border)" }}>
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
                        className="input-base"
                        style={{ flex: 1, padding: '0.6rem 0.75rem' }}
                      />
                      {options.length > 2 && (
                        <button type="button" onClick={() => handleRemoveOption(i)} className="btn-danger" style={{ padding: '0.5rem 0.7rem', borderRadius: "0.8rem" }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button type="button" onClick={handleAddOption} style={{ marginTop: '0.5rem', background: 'none', border: '1px dashed var(--color-border)', color: 'var(--color-text-main)', padding: '0.75rem 1rem', borderRadius: '1rem', cursor: 'pointer', width: '100%', fontWeight: 700 }}>
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
