"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Map, Route } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="container route-home">
      <motion.section
        className="route-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="route-copy">
          <motion.div className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Route size={14} />
            Survey Platform
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            Encuestas que se comportan como rutas vivas.
          </motion.h1>

          <motion.p
            className="hero-copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
          >
            Diseña flujos dinámicos, publica enlaces y lee audiencias desde un mapa operativo donde cada pregunta, bloque y respuesta ocupa su lugar.
          </motion.p>

          <motion.div
            className="route-actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
          >
            <button className="btn-primary" onClick={() => router.push("/auth/login")}>
              Iniciar sesión
              <ArrowRight size={17} />
            </button>
            <button className="btn-secondary" onClick={() => router.push("/survey/demo")}>
              Ver demo
            </button>
          </motion.div>

          <motion.div className="route-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.68 }}>
            <div>
              <div className="stat-label">Rutas</div>
              <div className="stat-value">18</div>
            </div>
            <div>
              <div className="stat-label">Respuestas</div>
              <div className="stat-value">2.4k</div>
            </div>
            <div>
              <div className="stat-label">Nodos activos</div>
              <div className="stat-value">47</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="card flow-map"
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28, duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
        >
          <div>
            <span className="chip">
              <Map size={14} />
              Mapa de encuesta
            </span>
          </div>

          <div className="flow-map__canvas" aria-label="Diagrama de flujo de encuesta">
            <span className="route-line route-line-main" />
            <span className="route-line route-line-branch-a" />
            <span className="route-line route-line-branch-b" />
            <span className="route-node route-node-start">01</span>
            <span className="route-node route-node-mid">02</span>
            <span className="route-node route-node-end">05</span>
            <span className="route-node route-node-branch-a">03</span>
            <span className="route-node route-node-branch-b">04</span>
            <div className="route-label route-label-a">
              <strong>Presentación</strong>
              Contexto, organización, instrucciones y datos demográficos cuando aplican.
            </div>
            <div className="route-label route-label-b">
              <strong>Bifurcación</strong>
              Una respuesta puede abrir una ruta distinta sin romper el flujo.
            </div>
            <div className="route-label route-label-c">
              <strong>Lectura</strong>
              Las respuestas llegan al dashboard y alimentan audiencias agregadas.
            </div>
          </div>

          <div className="route-strip" aria-hidden="true">
            <span />
            <i />
            <span />
            <i />
            <span />
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
