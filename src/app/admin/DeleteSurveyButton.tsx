"use client"

import { Trash2 } from "lucide-react"
import { deleteSurvey } from "./actions"
import { useState } from "react"

export default function DeleteSurveyButton({ surveyId }: { surveyId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer y borrará todas las respuestas asociadas.")) {
      setIsDeleting(true);
      try {
        await deleteSurvey(surveyId);
      } catch (error) {
        alert("Hubo un error al eliminar la encuesta.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="btn-secondary" 
      style={{ 
        flex: '0 0 auto', 
        padding: '0.5rem', 
        color: 'var(--color-error)',
        borderColor: 'rgba(239, 68, 68, 0.2)'
      }}
      title="Eliminar Encuesta"
    >
      <Trash2 size={16} opacity={isDeleting ? 0.5 : 1} />
    </button>
  )
}
