"use client";

import { useState } from "react";
import { Plus, X, Type, List, Image as ImageIcon, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";
import { createSurvey } from "./actions";

export default function CreateSurveyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"CUSTOM" | "FIXED_SCALE">("CUSTOM");
  const [options, setOptions] = useState<{ text: string; value: number }[]>([
    { text: "Nunca", value: 1 },
    { text: "A veces", value: 2 },
    { text: "Siempre", value: 3 }
  ]);
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const handleAddOption = () => setOptions([...options, { text: "", value: options.length + 1 }]);
  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
  };
  const handleOptionValueChange = (index: number, value: number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], value };
    setOptions(newOptions);
  };
  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        <Plus size={18} /> Nueva Encuesta
      </button>

      {isOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: "760px", maxHeight: "90vh", overflowY: "auto" }}>
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
                  placeholder="Ej: Encuesta de Clima Laboral 2026"
                  className="input-base"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Imagen principal o banner (opcional)</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  Añade una imagen que sirva de encabezado al iniciar el estudio.
                </p>
                <input type="hidden" name="image" value={imageDataUrl || ""} />
                
                {imageDataUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', maxWidth: '100%', maxHeight: '220px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageDataUrl} alt="Preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
                    <button 
                      type="button" 
                      onClick={() => setImageDataUrl(null)} 
                      className="btn-danger"
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', borderRadius: 'var(--radius-md)' }}
                    >
                      <Trash2 size={14} /> Quitar imagen
                    </button>
                  </div>
                ) : (
                  <label 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '2rem 1.5rem', 
                      border: '2px dashed var(--color-border)', 
                      borderRadius: 'var(--radius-lg)', 
                      cursor: 'pointer',
                      backgroundColor: 'var(--color-bg)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                  >
                    <ImageIcon size={28} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Haz clic aquí para seleccionar una imagen</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>PNG, JPG o WEBP</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Organización (opcional)</label>
                  <input 
                    type="text" 
                    name="organization" 
                    placeholder="Ej: Empresa S.A."
                    className="input-base"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Departamento (opcional)</label>
                  <input 
                    type="text" 
                    name="department" 
                    placeholder="Ej: Recursos Humanos"
                    className="input-base"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Sub-departamento (opcional)</label>
                  <input 
                    type="text" 
                    name="subdepartment" 
                    placeholder="Ej: Formación y Desarrollo"
                    className="input-base"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Instrucciones y descripción general</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  Proporciónale a los encuestados el contexto, objetivo o pasos a seguir para responder la encuesta.
                </p>
                <textarea 
                  name="description" 
                  rows={4}
                  placeholder="Escribe aquí las instrucciones completas que leerá el participante antes de responder..."
                  className="input-base"
                  style={{ minHeight: '100px' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Carácter de la participación</label>
                <input type="hidden" name="isMandatory" value={isMandatory ? "true" : "false"} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div 
                    onClick={() => setIsMandatory(true)}
                    style={{ 
                      padding: '0.85rem 1rem', 
                      borderRadius: 'var(--radius-lg)', 
                      border: `2px solid ${isMandatory ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: isMandatory ? 'var(--color-accent-soft)' : 'var(--color-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem'
                    }}
                  >
                    <ShieldAlert size={20} style={{ color: isMandatory ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                    <div>
                      <strong style={{ display: 'block', color: isMandatory ? 'var(--color-primary)' : 'inherit', fontSize: '0.95rem' }}>Obligatorio</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Requiere cumplimiento obligatorio</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setIsMandatory(false)}
                    style={{ 
                      padding: '0.85rem 1rem', 
                      borderRadius: 'var(--radius-lg)', 
                      border: `2px solid ${!isMandatory ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: !isMandatory ? 'var(--color-accent-soft)' : 'var(--color-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem'
                    }}
                  >
                    <ShieldCheck size={20} style={{ color: !isMandatory ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                    <div>
                      <strong style={{ display: 'block', color: !isMandatory ? 'var(--color-primary)' : 'inherit', fontSize: '0.95rem' }}>Voluntario</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>La participación es opcional</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <input 
                  type="checkbox" 
                  name="requireDemographics" 
                  id="requireDemographics" 
                  defaultChecked
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <label htmlFor="requireDemographics" style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
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
                      borderRadius: 'var(--radius-lg)', 
                      border: `2px solid ${type === "CUSTOM" ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: type === "CUSTOM" ? 'var(--color-accent-soft)' : 'var(--color-bg)'
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
                      borderRadius: 'var(--radius-lg)', 
                      border: `2px solid ${type === "FIXED_SCALE" ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      backgroundColor: type === "FIXED_SCALE" ? 'var(--color-accent-soft)' : 'var(--color-bg)'
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
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: "1px solid var(--color-border)" }}>
                  <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input 
                      type="checkbox" 
                      name="includeLikertTable" 
                      id="includeLikertTable" 
                      defaultChecked={false}
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <label htmlFor="includeLikertTable" style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                      Incluir una tabla inicial de referencia con las opciones de respuesta
                    </label>
                  </div>

                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Opciones y Puntajes de la Escala</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Define las opciones de respuesta y su valor numérico asignado (estos puntajes son para cálculos estadísticos y nunca se mostrarán a los encuestados).
                  </p>
                  
                  {options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(i, e.target.value)}
                        placeholder={`Opción ${i + 1}`}
                        required
                        className="input-base"
                        style={{ flex: 1, padding: '0.6rem 0.75rem' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Puntaje:</span>
                        <input 
                          type="number" 
                          value={opt.value}
                          onChange={(e) => handleOptionValueChange(i, parseInt(e.target.value) || 0)}
                          required
                          className="input-base"
                          style={{ width: '60px', padding: '0.35rem', textAlign: 'center', fontWeight: 700, borderRadius: '4px' }}
                        />
                      </div>
                      {options.length > 2 && (
                        <button type="button" onClick={() => handleRemoveOption(i)} className="btn-danger" style={{ padding: '0.5rem 0.7rem', borderRadius: "0.8rem" }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button type="button" onClick={handleAddOption} style={{ marginTop: '0.5rem', background: 'none', border: '1px dashed var(--color-border)', color: 'var(--color-text-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', width: '100%', fontWeight: 700 }}>
                    + Añadir Opción
                  </button>

                  <input type="hidden" name="globalOptions" value={JSON.stringify(options.filter(o => o.text.trim() !== ''))} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingBottom: '0.5rem' }}>
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
