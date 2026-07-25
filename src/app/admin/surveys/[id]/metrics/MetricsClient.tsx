/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from 'recharts';
import { toPng, toJpeg } from 'html-to-image';

const COLORS = ['#4F8A8B', '#FBD46D', '#EF4444', '#10B981', '#8B5CF6', '#F97316'];

export default function MetricsClient({ survey }: { survey: any }) {
  const downloadImage = async (elementId: string, format: 'png' | 'jpeg', filename: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
      const filter = (node: HTMLElement) => {
        return !node.classList?.contains('hide-on-download');
      };
      const dataUrl = format === 'png' ? await toPng(el, { backgroundColor: '#ffffff', filter }) : await toJpeg(el, { backgroundColor: '#ffffff', quality: 0.95, filter });
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading image', err);
    }
  };
  // Process demographic data
  const totalResponses = survey.responses.length;
  
  if (totalResponses === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
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

  const exportToExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const { saveAs } = await import('file-saver');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Plataforma de Encuestas';

    survey.responses.forEach((response: any, idx: number) => {
      const sheetName = `R${idx + 1}`;
      const sheet = workbook.addWorksheet(sheetName);

      // Add Demographics
      sheet.addRow([`Respuesta #${idx + 1}`]);
      sheet.addRow([`Edad: ${response.ageGroup || 'N/A'}`, `Sexo: ${response.sex === 'M' ? 'Masculino' : response.sex === 'F' ? 'Femenino' : response.sex || 'N/A'}`]);
      sheet.addRow([]);

      // Make demographic text bold
      sheet.getCell('A1').font = { bold: true, size: 14 };
      sheet.getCell('A2').font = { bold: true };
      sheet.getCell('B2').font = { bold: true };

      if (survey.type === 'FIXED_SCALE' && survey.options) {
        // Matrix Header
        const headerRow = sheet.addRow(['Afirmación', ...survey.options.map((o: any) => o.text)]);
        
        // Style Header
        headerRow.font = { bold: true };
        headerRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (colNumber > 1) {
            cell.alignment = { horizontal: 'center' };
          }
        });

        // Set column widths
        sheet.getColumn(1).width = 60; // Afirmación column wide
        for (let i = 2; i <= survey.options.length + 1; i++) {
          sheet.getColumn(i).width = 25; // Options columns
        }

        // Add Questions
        survey.questions.forEach((q: any) => {
          const answer = q.answers.find((a: any) => a.responseId === response.id);
          const rowData = [q.text];
          survey.options.forEach((opt: any) => {
            rowData.push(answer?.optionId === opt.id ? 'X' : '');
          });
          const row = sheet.addRow(rowData);
          
          row.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            if (colNumber > 1) {
              cell.alignment = { horizontal: 'center' };
            }
          });
        });
      } else {
        // Normal list
        const headerRow = sheet.addRow(['Pregunta', 'Respuesta']);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        sheet.getColumn(1).width = 60;
        sheet.getColumn(2).width = 40;

        survey.questions.forEach((q: any) => {
          const answer = q.answers.find((a: any) => a.responseId === response.id);
          let answerText = 'Sin respuesta';
          
          if (answer) {
            if (q.type === 'TEXT') {
              answerText = answer.textValue || '';
            } else if (q.type === 'SINGLE_CHOICE') {
              const opt = q.options.find((o: any) => o.id === answer.optionId);
              answerText = opt ? opt.text : '';
            } else if (q.type === 'MULTIPLE_CHOICE') {
              const answers = q.answers.filter((a: any) => a.responseId === response.id);
              const opts = answers.map((a: any) => {
                const o = q.options.find((o: any) => o.id === a.optionId);
                return o ? o.text : '';
              });
              answerText = opts.join(', ');
            }
          }
          const row = sheet.addRow([q.text, answerText]);
          row.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Resultados_${survey.title.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Resumen */}
      <div className="stats-grid">
        <div className="card stat-card" style={{ textAlign: 'center' }}>
          <h3 className="stat-label">Total de respuestas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: "0.65rem" }}>{totalResponses}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={exportToExcel} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar Resultados a Excel
          </button>
        </div>
      </div>

      {/* Demographics */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1rem' }}>Datos Demográficos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div id="chart-edad" className="card" style={{ padding: '1.5rem', height: '350px', minWidth: 0, position: 'relative' }}>
          <div className="hide-on-download" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            <button onClick={() => downloadImage('chart-edad', 'png', 'distribucion_edad')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
            <button onClick={() => downloadImage('chart-edad', 'jpeg', 'distribucion_edad')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Distribución por Edad</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageChartData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="value" position="top" style={{ fill: 'var(--color-text-main)', fontSize: '12px', fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div id="chart-sexo" className="card" style={{ padding: '1.5rem', height: '350px', minWidth: 0, position: 'relative' }}>
          <div className="hide-on-download" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            <button onClick={() => downloadImage('chart-sexo', 'png', 'distribucion_sexo')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
            <button onClick={() => downloadImage('chart-sexo', 'jpeg', 'distribucion_sexo')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Distribución por Sexo</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sexChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} style={{ fontSize: '12px', fontWeight: 500 }}>
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

      {/* Global Fixed Scale Metrics */}
      {survey.type === 'FIXED_SCALE' && survey.options && (
        <>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '2rem' }}>Resumen General (Toda la Encuesta)</h2>
          <div id="chart-global" className="card" style={{ padding: '1.5rem', height: '400px', minWidth: 0, position: 'relative' }}>
            <div className="hide-on-download" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
              <button onClick={() => downloadImage('chart-global', 'png', 'resumen_general')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
              <button onClick={() => downloadImage('chart-global', 'jpeg', 'resumen_general')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Frecuencia de Opciones Globales</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  ...survey.options.map((opt: any) => ({
                    name: opt.text,
                    value: survey.questions.reduce((acc: number, q: any) => acc + q.answers.filter((a: any) => a.optionId === opt.id).length, 0)
                  })),
                  {
                    name: 'No Responde',
                    value: (totalResponses * survey.questions.length) - survey.questions.reduce((acc: number, q: any) => acc + q.answers.length, 0)
                  }
                ].filter(d => d.name !== 'No Responde' || d.value > 0)} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="value" fill="var(--color-cta)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" style={{ fill: 'var(--color-text-main)', fontSize: '12px', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Questions Breakdown */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '2rem' }}>Respuestas por Pregunta</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {survey.questions.map((q: any, i: number) => {
          
          if (q.type === 'TEXT') {
            const textAnswers = q.answers.filter((a:any) => a.textValue).map((a:any) => a.textValue);
            return (
              <div key={q.id} className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>{i + 1}. {q.text}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {textAnswers.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No hay respuestas.</p> : null}
                  {textAnswers.map((txt: string, idx: number) => (
                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '1rem', fontSize: '0.875rem', border: '1px solid var(--color-border)' }}>
                      &ldquo;{txt}&rdquo;
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          // Options logic
          const optionsList = survey.type === 'FIXED_SCALE' ? survey.options : q.options;
          const optionsData = optionsList.map((opt: any) => {
            const count = q.answers.filter((a: any) => a.optionId === opt.id).length;
            return { name: opt.text, value: count };
          });
          
          const missingCount = totalResponses - q.answers.length;
          if (missingCount > 0) {
            optionsData.push({ name: 'No Responde', value: missingCount });
          }

          return (
            <div key={q.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              {/* Bar Chart Panel */}
              <div id={`chart-q-bar-${q.id}`} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
                <div className="hide-on-download" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                  <button onClick={() => downloadImage(`chart-q-bar-${q.id}`, 'png', `pregunta_${i + 1}_cantidades`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
                  <button onClick={() => downloadImage(`chart-q-bar-${q.id}`, 'jpeg', `pregunta_${i + 1}_cantidades`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', paddingRight: '100px' }}>{i + 1}. {q.text} <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(Cantidades)</span></h3>
                <div style={{ height: '300px', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={optionsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                      <Bar dataKey="value" fill="#0F9D58" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" style={{ fill: 'var(--color-text-main)', fontSize: '12px', fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart Panel */}
              <div id={`chart-q-pie-${q.id}`} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
                <div className="hide-on-download" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                  <button onClick={() => downloadImage(`chart-q-pie-${q.id}`, 'png', `pregunta_${i + 1}_porcentajes`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
                  <button onClick={() => downloadImage(`chart-q-pie-${q.id}`, 'jpeg', `pregunta_${i + 1}_porcentajes`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', paddingRight: '100px' }}>{i + 1}. {q.text} <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(Porcentajes)</span></h3>
                <div style={{ height: '300px', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={optionsData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value" label={({ percent }: { percent?: number }) => (percent && percent > 0) ? `${(percent * 100).toFixed(0)}%` : ''} labelLine={false} style={{ fontSize: '12px', fontWeight: 500 }}>
                        {optionsData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: any, props: any) => [`${value} (${((props?.payload?.percent || 0) * 100).toFixed(1)}%)`, name]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
