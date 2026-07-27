/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from 'recharts';
import { toPng, toJpeg } from 'html-to-image';
import { generateQuestionAnalytics } from '@/lib/statistics';

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

    // Añade pestaña de Estadísticas y Analíticas (Media, Mediana, Moda y Desviación Estándar)
    const statSheet = workbook.addWorksheet('Estadísticas y Analíticas', { views: [{ state: 'frozen', ySplit: 1 }] });
    const statHeader = statSheet.addRow(['Pregunta', 'Total Respuestas', 'Media (Promedio)', 'Mediana', 'Moda', 'Desv. Estándar (s)']);
    statHeader.font = { bold: true };
    statSheet.getColumn(1).width = 55;
    statSheet.getColumn(2).width = 18;
    statSheet.getColumn(3).width = 18;
    statSheet.getColumn(4).width = 16;
    statSheet.getColumn(5).width = 16;
    statSheet.getColumn(6).width = 22;

    survey.questions.forEach((q: any) => {
      if (q.type !== 'TEXT') {
        const optionsList = survey.type === 'FIXED_SCALE' ? survey.options : q.options;
        if (optionsList) {
          const numericValues: number[] = [];
          q.answers.forEach((a: any) => {
            if (a.optionId) {
              const optIndex = optionsList.findIndex((o: any) => o.id === a.optionId);
              if (optIndex !== -1) {
                const opt = optionsList[optIndex];
                const numericValue = (opt && opt.value !== null && opt.value !== undefined && opt.value !== 0) ? opt.value : (optIndex + 1);
                numericValues.push(numericValue);
              }
            }
          });
          const analytics = generateQuestionAnalytics(q.id, numericValues);
          if (analytics.statistics.mean !== null) {
            const row = statSheet.addRow([
              q.text,
              analytics.totalResponses,
              analytics.statistics.mean,
              analytics.statistics.median,
              analytics.statistics.mode?.join(', ') ?? 'N/A',
              analytics.statistics.standardDeviation
            ]);
            row.eachCell((cell) => {
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
          }
        }
      }
    });

    if (survey.type === 'FIXED_SCALE' && survey.options) {
      const globalSheet = workbook.addWorksheet('Frecuencia Absoluta Acumulada', { views: [{ state: 'frozen', ySplit: 1 }] });
      const globalHeader = globalSheet.addRow(['Opción de la Escala', 'Puntaje / Valor', 'Frecuencia Absoluta Acumulada', 'Porcentaje Global']);
      globalHeader.font = { bold: true };
      globalSheet.getColumn(1).width = 35;
      globalSheet.getColumn(2).width = 18;
      globalSheet.getColumn(3).width = 28;
      globalSheet.getColumn(4).width = 20;

      const totalGlobalAnswers = survey.questions.reduce((acc: number, q: any) => acc + q.answers.length, 0);
      survey.options.forEach((opt: any, idx: number) => {
        const count = survey.questions.reduce((acc: number, q: any) => acc + q.answers.filter((a: any) => a.optionId === opt.id).length, 0);
        const percent = totalGlobalAnswers > 0 ? ((count / totalGlobalAnswers) * 100).toFixed(1) + '%' : '0%';
        const row = globalSheet.addRow([opt.text, opt.value ?? (idx + 1), count, percent]);
        row.eachCell((cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
      });
      globalSheet.addRow([]);
      const totalRow = globalSheet.addRow(['Total de Respuestas Evaluadas:', '', totalGlobalAnswers, '100%']);
      totalRow.font = { bold: true };
    }

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem', alignItems: 'stretch' }}>
        <div id="chart-edad" className="card" style={{ padding: '1.75rem', height: '380px', minWidth: 0, position: 'relative' }}>
          <div className="hide-on-download" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            <button onClick={() => downloadImage('chart-edad', 'png', 'distribucion_edad')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
            <button onClick={() => downloadImage('chart-edad', 'jpeg', 'distribucion_edad')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>Distribución por Edad</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={ageChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
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
        
        <div id="chart-sexo" className="card" style={{ padding: '1.75rem', height: '380px', minWidth: 0, position: 'relative' }}>
          <div className="hide-on-download" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            <button onClick={() => downloadImage('chart-sexo', 'png', 'distribucion_sexo')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
            <button onClick={() => downloadImage('chart-sexo', 'jpeg', 'distribucion_sexo')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>Distribución por Sexo</h3>
          <ResponsiveContainer width="100%" height="85%">
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

      {/* Global Fixed Scale Metrics (Frecuencia Absoluta Acumulada) */}
      {survey.type === 'FIXED_SCALE' && survey.options && (() => {
        const totalGlobalAnswers = survey.questions.reduce((acc: number, q: any) => acc + q.answers.length, 0);
        const numOptions = survey.options.length;
        const globalCounts = survey.options.map((opt: any, idx: number) => {
          const count = survey.questions.reduce((acc: number, q: any) => acc + q.answers.filter((a: any) => a.optionId === opt.id).length, 0);
          const pct = totalGlobalAnswers > 0 ? (count / totalGlobalAnswers) * 100 : 0;
          return { id: opt.id, text: opt.text, value: opt.value ?? (idx + 1), count, pct, name: opt.text };
        });

        let highCount = 0;
        let midCount = 0;
        let lowCount = 0;
        const midIdx = Math.floor(numOptions / 2);
        const isEven = numOptions % 2 === 0;

        globalCounts.forEach((o: any, idx: number) => {
          if (isEven) {
            if (idx < numOptions / 2) lowCount += o.count;
            else highCount += o.count;
          } else {
            if (idx < midIdx) lowCount += o.count;
            else if (idx === midIdx) midCount += o.count;
            else highCount += o.count;
          }
        });

        const highPct = totalGlobalAnswers > 0 ? (highCount / totalGlobalAnswers) * 100 : 0;
        const midPct = totalGlobalAnswers > 0 ? (midCount / totalGlobalAnswers) * 100 : 0;
        const lowPct = totalGlobalAnswers > 0 ? (lowCount / totalGlobalAnswers) * 100 : 0;

        let insightTitle = "Evaluación Equilibrada / Dispersa";
        let insightColor = "var(--color-primary, #3b82f6)";
        let insightDesc = "Las respuestas se distribuyen de manera heterogénea en los diferentes niveles de la escala, sin inclinarse marcadamente hacia ningún extremo.";

        if (highPct >= 50) {
          insightTitle = "Alta Tendencia a la Benevolencia / Acuerdo";
          insightColor = "#10B981";
          insightDesc = `El ${highPct.toFixed(1)}% del total general de selecciones se concentra en las opciones de mayor valoración (4 y 5), revelando una marcada inclinación positiva o benevolente en los participantes.`;
        } else if (lowPct >= 40) {
          insightTitle = "Tendencia al Descontento / Criticidad";
          insightColor = "#EF4444";
          insightDesc = `El ${lowPct.toFixed(1)}% de las respuestas acumuladas recae en las opciones más bajas de la escala, evidenciando una postura eminentemente crítica o de desacuerdo generalizado.`;
        } else if (midPct >= 35) {
          insightTitle = "Alta Neutralidad / Imparcialidad";
          insightColor = "#F59E0B";
          insightDesc = `Un notable ${midPct.toFixed(1)}% de las selecciones totales apunta al punto neutral de la escala, lo cual puede indicar cautela, indecisión o moderación entre los encuestados.`;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Frecuencia Absoluta Acumulada</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                Suma consolidada de todas las respuestas emitidas en todas las preguntas del estudio para medir el comportamiento general frente a la escala.
              </p>
            </div>

            {/* Tarjeta de Insight de Comportamiento */}
            <div className="card" style={{ padding: '1.5rem', borderLeft: `5px solid ${insightColor}`, background: 'var(--color-bg-secondary, rgba(255, 255, 255, 0.04))', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>💡</span>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Insight de Comportamiento Global
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
                  {insightTitle}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', margin: 0, lineHeight: 1.5 }}>
                  {insightDesc} (De un total de <strong>{totalGlobalAnswers}</strong> evaluaciones acumuladas en toda la encuesta).
                </p>
              </div>
            </div>

            {/* Cajas de KPI para cada opción */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {globalCounts.map((opt: any) => (
                <div key={opt.id} className="card" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {opt.text}
                  </span>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', margin: '0.5rem 0 0.25rem' }}>
                    {opt.count} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>veces</span>
                  </p>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-cta, #10B981)' }}>
                    {opt.pct.toFixed(1)}% del total
                  </span>
                </div>
              ))}
            </div>

            {/* Gráfico de Barras Consolidado */}
            <div id="chart-global" className="card" style={{ padding: '1.75rem', height: '420px', minWidth: 0, position: 'relative' }}>
              <div className="hide-on-download" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                <button onClick={() => downloadImage('chart-global', 'png', 'frecuencia_absoluta_acumulada')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
                <button onClick={() => downloadImage('chart-global', 'jpeg', 'frecuencia_absoluta_acumulada')} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Distribución de Frecuencia Absoluta Acumulada</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={globalCounts} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => [`${val ?? 0} veces`, 'Frecuencia']} cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" formatter={(val: any) => `${val ?? ''}`} style={{ fill: 'var(--color-text-main)', fontSize: '13px', fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

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

          // Cálculo de Tendencia Central y Dispersión
          const numericValues: number[] = [];
          q.answers.forEach((a: any) => {
            if (a.optionId) {
              const optIndex = optionsList.findIndex((o: any) => o.id === a.optionId);
              if (optIndex !== -1) {
                const opt = optionsList[optIndex];
                const numericValue = (opt && opt.value !== null && opt.value !== undefined && opt.value !== 0) ? opt.value : (optIndex + 1);
                numericValues.push(numericValue);
              }
            }
          });
          const possibleValues = optionsList.map((opt: any, idx: number) => 
            (opt.value !== null && opt.value !== undefined && opt.value !== 0) ? opt.value : (idx + 1)
          );
          const analytics = generateQuestionAnalytics(q.id, numericValues, possibleValues);

          return (
            <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Panel de Estadísticas: Media, Mediana, Moda y Desviación Estándar */}
              <div className="card" style={{ padding: '1.25rem 1.75rem', borderLeft: '4px solid var(--color-cta, #10b981)', background: 'var(--color-bg-secondary, rgba(255, 255, 255, 0.03))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                      {i + 1}. {q.text}
                    </h3>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.35rem' }}>
                      Respuestas analizadas: <strong>{analytics.totalResponses}</strong> {missingCount > 0 ? `(${missingCount} sin responder)` : ''}
                    </span>
                  </div>

                  {analytics.statistics.mean !== null ? (
                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                      <div style={{ background: 'var(--color-bg, rgba(255, 255, 255, 0.05))', padding: '0.65rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', minWidth: '95px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Media</span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-main)' }}>{analytics.statistics.mean.toFixed(2)}</strong>
                      </div>
                      <div style={{ background: 'var(--color-bg, rgba(255, 255, 255, 0.05))', padding: '0.65rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', minWidth: '95px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Mediana</span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-main)' }}>{analytics.statistics.median}</strong>
                      </div>
                      <div style={{ background: 'var(--color-bg, rgba(255, 255, 255, 0.05))', padding: '0.65rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', minWidth: '95px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Moda</span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-main)' }}>{analytics.statistics.mode?.join(', ') ?? 'N/A'}</strong>
                      </div>
                      <div style={{ background: 'var(--color-bg, rgba(255, 255, 255, 0.05))', padding: '0.65rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', minWidth: '125px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Desv. Estándar (s)</span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--color-cta, #10b981)' }}>{analytics.statistics.standardDeviation}</strong>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Sin datos suficientes para cálculo estadístico</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.75rem' }}>
              {/* Bar Chart Panel */}
              <div id={`chart-q-bar-${q.id}`} className="card" style={{ padding: '1.75rem', position: 'relative', minWidth: 0 }}>
                <div className="hide-on-download" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                  <button onClick={() => downloadImage(`chart-q-bar-${q.id}`, 'png', `pregunta_${i + 1}_cantidades`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
                  <button onClick={() => downloadImage(`chart-q-bar-${q.id}`, 'jpeg', `pregunta_${i + 1}_cantidades`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem', paddingRight: '110px' }}>{i + 1}. {q.text} <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(Cantidades)</span></h3>
                <div style={{ height: '320px', width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={optionsData} layout="vertical" margin={{ top: 10, right: 45, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={170} tick={{ fontSize: 13, fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                      <Bar dataKey="value" fill="#0F9D58" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" style={{ fill: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart Panel */}
              <div id={`chart-q-pie-${q.id}`} className="card" style={{ padding: '1.75rem', position: 'relative', minWidth: 0 }}>
                <div className="hide-on-download" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                  <button onClick={() => downloadImage(`chart-q-pie-${q.id}`, 'png', `pregunta_${i + 1}_porcentajes`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>PNG</button>
                  <button onClick={() => downloadImage(`chart-q-pie-${q.id}`, 'jpeg', `pregunta_${i + 1}_porcentajes`)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>JPG</button>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem', paddingRight: '110px' }}>{i + 1}. {q.text} <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(Porcentajes)</span></h3>
                <div style={{ height: '320px', width: '100%', minWidth: 0 }}>
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
            </div>
          )
        })}
      </div>

    </div>
  )
}
