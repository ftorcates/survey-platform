export interface QuestionStatistics {
  mean: number | null;
  median: number | null;
  mode: number[] | null;
  standardDeviation: number | null;
}

export interface QuestionAnalytics {
  questionId: string;
  totalResponses: number;
  frequencies: Record<string, number>;
  statistics: QuestionStatistics;
}

/**
 * Función pura que procesa un arreglo de valores numéricos para obtener métricas
 * de tendencia central (Media, Mediana, Moda) y dispersión (Desviación Estándar muestral s).
 * 
 * Optimizada en bucles de iteración sobre las respuestas para máximo rendimiento.
 */
export function calculateStatistics(values: number[]): QuestionStatistics {
  if (!values || values.length === 0) {
    return {
      mean: null,
      median: null,
      mode: null,
      standardDeviation: null,
    };
  }

  const N = values.length;
  let sum = 0;
  const freqMap: Record<number, number> = {};
  let maxFreq = 0;

  // Paso 1: Único bucle para calcular la suma total y la frecuencia de cada valor
  for (let i = 0; i < N; i++) {
    const val = values[i];
    sum += val;
    
    const currentFreq = (freqMap[val] || 0) + 1;
    freqMap[val] = currentFreq;
    if (currentFreq > maxFreq) {
      maxFreq = currentFreq;
    }
  }

  // Helper para redondear a 2 decimales evitando errores de precisión de punto flotante
  const round2 = (num: number): number => Math.round(num * 100) / 100;

  // 1. Media (Promedio)
  const rawMean = sum / N;
  const mean = round2(rawMean);

  // 2. Moda (Maneja casos bimodales / multimodales ordenados ascendentemente)
  const mode: number[] = [];
  for (const key in freqMap) {
    if (freqMap[key] === maxFreq) {
      mode.push(Number(key));
    }
  }
  mode.sort((a, b) => a - b);

  // 3. Mediana (Percentil 50 sobre los datos ordenados)
  const sorted = [...values].sort((a, b) => a - b);
  let median: number;
  if (N % 2 === 1) {
    median = sorted[Math.floor(N / 2)];
  } else {
    const mid = N / 2;
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  }
  median = round2(median);

  // 4. Desviación Estándar (s)
  // Si N <= 1 o si todos los elementos son idénticos, la desviación estándar es 0
  let standardDeviation: number = 0;
  if (N > 1) {
    let sumSqDiff = 0;
    for (let i = 0; i < N; i++) {
      const diff = values[i] - rawMean;
      sumSqDiff += diff * diff;
    }

    // Tolerancia ante imprecisión de coma flotante cuando todas las respuestas son iguales
    if (sumSqDiff > 1e-10) {
      // Fórmula de desviación estándar muestral (dividido entre N - 1)
      standardDeviation = round2(Math.sqrt(sumSqDiff / (N - 1)));
    } else {
      standardDeviation = 0;
    }
  }

  return {
    mean,
    median,
    mode,
    standardDeviation,
  };
}

/**
 * Genera el objeto completo de analíticas por pregunta incluyendo conteos (frequencies)
 * y métricas de estadística descriptiva.
 */
export function generateQuestionAnalytics(
  questionId: string,
  values: number[],
  possibleValues?: number[]
): QuestionAnalytics {
  const statistics = calculateStatistics(values);
  const frequencies: Record<string, number> = {};

  // Inicializa con ceros si se pasan las opciones posibles
  if (possibleValues && possibleValues.length > 0) {
    possibleValues.forEach((val) => {
      frequencies[String(val)] = 0;
    });
  }

  // Cuenta frecuencias del array real
  values.forEach((val) => {
    const key = String(val);
    frequencies[key] = (frequencies[key] || 0) + 1;
  });

  return {
    questionId,
    totalResponses: values.length,
    frequencies,
    statistics,
  };
}

export interface DistributionPattern {
  name: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
}

/**
 * Clasifica el patrón de distribución de respuestas para una pregunta (ej. Bimodal, Sesgo Positivo, etc.)
 * basándose en las frecuencias y métricas descriptivas.
 */
export function getDistributionPattern(
  values: number[],
  statistics: QuestionStatistics,
  numOptions: number = 5
): DistributionPattern {
  const N = values.length;
  if (N === 0 || statistics.mean === null) {
    return {
      name: "Sin Datos",
      badgeColor: "#6B7280",
      badgeBg: "rgba(107, 114, 128, 0.1)",
      description: "Aún no se registran suficientes respuestas para categorizar el patrón."
    };
  }

  const { mean, standardDeviation, mode } = statistics;
  const stdDev = standardDeviation ?? 0;

  let lowCount = 0;
  let midCount = 0;
  let highCount = 0;

  values.forEach((v) => {
    const norm = v / numOptions;
    if (norm <= 0.4) lowCount++;
    else if (norm >= 0.7) highCount++;
    else midCount++;
  });

  const lowPct = lowCount / N;
  const highPct = highCount / N;
  const midPct = midCount / N;

  const hasMultipleRemoteModes = mode && mode.length > 1 && (Math.max(...mode) - Math.min(...mode) >= 2);
  if ((lowPct >= 0.25 && highPct >= 0.25 && stdDev >= 1.1) || hasMultipleRemoteModes) {
    return {
      name: "Bimodal (Opiniones Divididas)",
      badgeColor: "#8B5CF6",
      badgeBg: "rgba(139, 92, 246, 0.12)",
      description: "Existe polarización: dos grupos significativos opinan en extremos opuestos de la escala."
    };
  }

  if (highPct >= 0.75 || (mean >= (numOptions * 0.85) && stdDev <= 0.85)) {
    return {
      name: "Sesgo Excesivo Positivo",
      badgeColor: "#10B981",
      badgeBg: "rgba(16, 185, 129, 0.12)",
      description: "Concentración masiva e inusualmente alta en las valoraciones superiores de la escala."
    };
  }

  if (highPct >= 0.45 || mean >= (numOptions * 0.65)) {
    return {
      name: "Normal (Sesgo Positivo)",
      badgeColor: "#059669",
      badgeBg: "rgba(5, 150, 105, 0.12)",
      description: "Tendencia favorable constante hacia las opciones superiores de la escala."
    };
  }

  if (lowPct >= 0.75 || (mean <= (numOptions * 0.35) && stdDev <= 0.85)) {
    return {
      name: "Sesgo Excesivo Negativo",
      badgeColor: "#EF4444",
      badgeBg: "rgba(239, 68, 68, 0.12)",
      description: "Rechazo o descontento generalizado concentrado en los niveles más bajos."
    };
  }

  if (lowPct >= 0.45 || mean <= (numOptions * 0.45)) {
    return {
      name: "Sesgo Negativo",
      badgeColor: "#F97316",
      badgeBg: "rgba(249, 115, 22, 0.12)",
      description: "Inclinación preponderante hacia opciones desfavorables o de desacuerdo."
    };
  }

  if (midPct >= 0.4) {
    return {
      name: "Neutral / Imparcial",
      badgeColor: "#F59E0B",
      badgeBg: "rgba(245, 158, 11, 0.12)",
      description: "Mayoría concentrada en la postura intermedia o imparcial de la encuesta."
    };
  }

  return {
    name: "Distribución Equilibrada",
    badgeColor: "#3B82F6",
    badgeBg: "rgba(59, 130, 246, 0.12)",
    description: "Respuestas distribuidas heterogéneamente en la escala sin un polo dominante."
  };
}
