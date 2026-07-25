"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, ClipboardList, ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="container page-shell" style={{ minHeight: "100vh", display: "grid", alignItems: "center" }}>
      <motion.section
        className="glass-panel hero-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)", gap: "1.5rem", alignItems: "stretch" }}>
          <div>
            <motion.div
              className="eyebrow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <ShieldCheck size={14} />
              Investigación con mejor señal
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ maxWidth: "11ch", marginTop: "1.15rem" }}
            >
              Encuestas claras, datos confiables, decisiones mejor guiadas.
            </motion.h1>

            <motion.p
              className="hero-copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
            >
              Diseñada para equipos que necesitan levantar información con orden y presentar resultados con contexto. Crea estudios, comparte enlaces y analiza respuestas desde un dashboard limpio y profesional.
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

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{ display: "grid", gap: "1rem" }}
          >
            <div className="card" style={{ padding: "1.3rem", transform: "translateY(6px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span className="chip">
                  <ClipboardList size={14} />
                  Flujo activo
                </span>
                <span style={{ fontSize: "0.86rem", color: "var(--color-text-muted)", fontWeight: 700 }}>Dashboard</span>
              </div>
              <div className="stats-grid">
                <div className="soft-card stat-card">
                  <div className="stat-label">Encuestas</div>
                  <div className="stat-value">18</div>
                </div>
                <div className="soft-card stat-card">
                  <div className="stat-label">Respuestas</div>
                  <div className="stat-value">2.4k</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: "1.4rem" }}>
              <div style={{ display: "flex", gap: "0.9rem", alignItems: "center", marginBottom: "0.85rem" }}>
                <div className="brand-badge" style={{ width: "2.5rem", height: "2.5rem" }}>
                  <BarChart3 size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: 800 }}>Audiencias y métricas</p>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem" }}>
                    Resumen demográfico y análisis por encuesta.
                  </p>
                </div>
              </div>
              <div className="divider" style={{ margin: "1rem 0" }} />
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                El nuevo frontend prioriza lectura, foco y consistencia visual en todo el recorrido.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
