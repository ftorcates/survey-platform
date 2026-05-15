"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4F8A8B', '#FBD46D', '#EF4444', '#10B981', '#8B5CF6', '#F97316'];

export default function MetricsClient({ survey }: { survey: any }) {
  // Process demographic data
  const totalResponses = survey.responses.length;
  
  if (totalResponses === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>Aún no hay respuestas para esta encuesta. Comparte el enlace para empezar a recolectar datos.</p>
      </div>
    )
  }

  // Age grouping
  const ageData = survey.responses.reduce((acc: any, response: any) => {
    const age = response.ageGroup || 'No especificado';
    acc[age] = (acc[age] || 0) + 1;
    return acc;
  }, {});
  const ageChartData = Object.keys(ageData).map(key => ({ name: key, value: ageData[key] }));

  // Sex grouping
  const sexData = survey.responses.reduce((acc: any, response: any) => {
    const sex = response.sex === 'M' ? 'Masculino' : response.sex === 'F' ? 'Femenino' : 'Otro/No esp.';
    acc[sex] = (acc[sex] || 0) + 1;
    return acc;
  }, {});
  const sexChartData = Object.keys(sexData).map(key => ({ name: key, value: sexData[key] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total de Respuestas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalResponses}</p>
        </div>
      </div>

      {/* Demographics */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1rem' }}>Datos Demográficos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Distribución por Edad</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Distribución por Sexo</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sexChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {sexChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Questions Breakdown */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '2rem' }}>Respuestas por Pregunta</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {survey.questions.map((q: any, i: number) => {
          
          if (q.type === 'TEXT') {
            const textAnswers = q.answers.filter((a:any) => a.textValue).map((a:any) => a.textValue);
            return (
              <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>{i + 1}. {q.text}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {textAnswers.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No hay respuestas.</p> : null}
                  {textAnswers.map((txt: string, idx: number) => (
                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                      "{txt}"
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          // Options logic
          const optionsData = q.options.map((opt: any) => {
            const count = q.answers.filter((a: any) => a.optionId === opt.id).length;
            return { name: opt.text, value: count };
          });

          return (
            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>{i + 1}. {q.text}</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={optionsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Bar dataKey="value" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
