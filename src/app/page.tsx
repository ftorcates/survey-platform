"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, ClipboardList, Gauge, RadioTower } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="container page-shell" style={{ minHeight: "100vh", display: "grid", alignItems: "center" }}>
      <motion.section
        className="command-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="command-copy">
          <div>
            <motion.div className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <RadioTower size={14} />
              Survey Platform
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Centro de mando para estudios vivos.
            </motion.h1>

            <motion.p
              className="hero-copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
            >
              Crea encuestas, compártelas y lee audiencias como un flujo activo de señales. La interfaz prioriza contraste, ritmo operativo y datos accionables.
            </motion.p>

            <motion.div
              style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginTop: "2rem" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56 }}
            >
              <button className="btn-primary" onClick={() => router.push("/auth/login")}>
                Iniciar sesión
                <ArrowRight size={17} />
              </button>
              <button className="btn-secondary" onClick={() => router.push("/survey/demo")}>
                Ver demo
              </button>
            </motion.div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
            <div>
              <div className="stat-label">Encuestas</div>
              <div className="stat-value">18</div>
            </div>
            <div>
              <div className="stat-label">Respuestas</div>
              <div className="stat-value">2.4k</div>
            </div>
            <div>
              <div className="stat-label">Pulso</div>
              <div className="stat-value">47%</div>
            </div>
          </div>
        </div>

        <motion.div
          className="signal-wall"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="signal-panel signal-panel-wide">
            <div className="scanline" />
            <span className="chip">
              <ClipboardList size={14} />
              Encuesta activa
            </span>
            <div className="pulse-bars" aria-hidden="true">
              {[52, 88, 41, 66, 93, 58, 79, 46, 90, 63, 74, 39, 82, 55, 69, 96].map((height, index) => (
                <span key={index} style={{ height: `${height}%`, ["--i" as string]: index }} />
              ))}
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 3.5rem)", lineHeight: 0.95, textTransform: "uppercase" }}>
                Respuestas entrando en tiempo real.
              </h2>
            </div>
          </div>

          <div className="signal-panel">
            <span className="chip">
              <BarChart3 size={14} />
              Audiencias
            </span>
            <div style={{ display: "grid", gap: "0.7rem", marginTop: "1.5rem" }}>
              {["18-24", "25-34", "35-44", "45+"].map((label, index) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                    <span>{label}</span>
                    <span>{[28, 41, 19, 12][index]}%</span>
                  </div>
                  <div className="progress-track">
                    <div style={{ width: `${[28, 41, 19, 12][index]}%`, height: "100%", background: index === 1 ? "var(--color-primary)" : "var(--color-cta)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="signal-panel">
            <span className="chip">
              <Gauge size={14} />
              Operación
            </span>
            <div style={{ marginTop: "2rem", display: "grid", gap: "0.9rem" }}>
              <div style={{ fontSize: "3.5rem", lineHeight: 0.85, fontWeight: 800, color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>06</div>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                Estudios preparados para edición, publicación y lectura de métricas.
              </p>
              <div className="divider" />
              <div style={{ color: "var(--color-secondary)", fontWeight: 800 }}>Modo análisis</div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
