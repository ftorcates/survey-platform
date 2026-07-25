"use client"

import { Download, Search } from "lucide-react"
import { useState } from "react"

type AudienceResponse = {
  id: string;
  createdAt: string | Date;
  ageGroup?: string | null;
  sex?: string | null;
  location?: string | null;
  survey: {
    title: string;
  };
};

export default function AudienceTable({ responses }: { responses: AudienceResponse[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResponses = responses.filter(r => 
    r.survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ageGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sex?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["ID", "Fecha", "Encuesta", "Rango Etario", "Sexo", "Ubicación"];
    const rows = filteredResponses.map(r => [
      r.id,
      new Date(r.createdAt).toLocaleDateString(),
      r.survey.title,
      r.ageGroup || "N/A",
      r.sex || "N/A",
      r.location || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audiencia_completa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por encuesta, edad o sexo..." 
            className="input-base"
            style={{ paddingLeft: '3rem', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      <div className="card table-shell">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Encuesta</th>
                <th>Rango etario</th>
                <th>Sexo</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.length > 0 ? (
                filteredResponses.map((response) => (
                  <tr key={response.id}>
                    <td style={{ fontSize: '0.92rem' }}>
                      {new Date(response.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                      {response.survey.title}
                    </td>
                    <td style={{ fontSize: '0.92rem' }}>
                      <span className="chip" style={{ color: "var(--color-primary)" }}>
                        {response.ageGroup || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.92rem' }}>
                      {response.sex || 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
                      {response.location || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No se encontraron registros de audiencia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
