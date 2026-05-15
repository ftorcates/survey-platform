"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, ClipboardList } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 0' }}>
      <motion.div 
        className="glass-panel"
        style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
        >
          <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '1rem', borderRadius: '50%' }}>
            <ClipboardList size={40} />
          </div>
        </motion.div>

        <motion.h1 
          style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-main)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Descubre <span style={{ color: 'var(--color-primary)' }}>Insights</span> Profundos
        </motion.h1>

        <motion.p 
          style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Una plataforma diseñada para psicólogos y profesionales. Crea encuestas dinámicas, 
          recolecta datos precisos y analiza resultados con facilidad.
        </motion.p>

        <motion.div 
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button className="btn-primary" onClick={() => router.push('/admin')}>
            <Sparkles size={18} />
            Crear Encuesta
          </button>
          <button className="btn-secondary" onClick={() => router.push('/survey/demo')}>
            Ver Demo
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
