"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, ClipboardList, GalleryVerticalEnd, Sparkles } from "lucide-react";

const bars = [62, 34, 78, 49, 92, 56, 68, 41, 84, 53, 74, 38, 88, 59, 71, 46];

export default function Home() {
  const router = useRouter();

  return (
    <main className="container landing-shell">
      <motion.section
        className="editorial-hero"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="editorial-copy">
          <div>
            <motion.div className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <Sparkles size={14} />
              Survey atelier
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            >
              Encuestas con lectura visual de audiencia.
            </motion.h1>

            <motion.p
              className="hero-copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Una plataforma para diseñar estudios, publicarlos y leer patrones de respuesta sin que el producto se sienta como otro panel administrativo genérico.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
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

          <motion.div
            className="micro-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72 }}
          >
            <div className="micro-stat">
              <div className="stat-label">Encuestas</div>
              <div className="stat-value">18</div>
            </div>
            <div className="micro-stat">
              <div className="stat-label">Respuestas</div>
              <div className="stat-value">2.4k</div>
            </div>
            <div className="micro-stat">
              <div className="stat-label">Pulso</div>
              <div className="stat-value">47%</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="atelier-stage"
          initial={{ opacity: 0, x: 34 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28, duration: 0.72, ease: [0.32, 0.72, 0, 1] }}
        >
          <article className="atelier-card">
            <div className="atelier-rings" aria-hidden="true" />
            <div className="atelier-card-inner">
              <span className="chip">
                <ClipboardList size={14} />
                Estudio activo
              </span>
              <div className="pulse-bars" aria-hidden="true">
                {bars.map((height, index) => (
                  <span key={index} style={{ height: `${height}%`, ["--i" as string]: index }} />
                ))}
              </div>
              <h2 style={{ marginTop: "1.3rem", fontSize: "clamp(2rem, 4vw, 4.6rem)", lineHeight: 0.9 }}>
                Diseña el flujo antes de pedir respuestas.
              </h2>
            </div>
          </article>

          <article className="atelier-card">
            <div className="atelier-card-inner">
              <span className="chip">
                <BarChart3 size={14} />
                Audiencias
              </span>
              <div style={{ display: "grid", gap: "0.8rem", marginTop: "1.4rem" }}>
                {["18-24", "25-34", "35-44", "45+"].map((label, index) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "0.82rem", marginBottom: "0.45rem" }}>
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
          </article>

          <article className="atelier-card">
            <div className="atelier-card-inner">
              <span className="chip">
                <GalleryVerticalEnd size={14} />
                Flujo completo
              </span>
              <p style={{ marginTop: "1.2rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                Home, login con Google, dashboard, audiencias, configuración y encuesta pública conviven bajo una misma dirección visual.
              </p>
            </div>
          </article>
        </motion.div>
      </motion.section>
    </main>
  );
}
