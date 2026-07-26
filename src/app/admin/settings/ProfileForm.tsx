/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { updateUserProfile } from "../actions"
import { Save, User, Mail, ShieldCheck } from "lucide-react"

type ProfileUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({ name });
      alert("Perfil actualizado correctamente");
    } catch {
      alert("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="var(--color-primary)" /> Información del Perfil
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: "wrap" }}>
            <img 
              src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`} 
              alt="Profile" 
              style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-strong)', boxShadow: "var(--shadow-md)" }}
            />
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.name}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{user.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Nombre Público</label>
            <input 
              className="input-base" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Email (No editable)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', fontSize: '0.875rem', border: "1px solid var(--color-border)" }}>
              <Mail size={16} /> {user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--color-primary)" /> Seguridad y Cuenta
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Tu cuenta está protegida mediante autenticación social. No es necesario gestionar contraseñas locales.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-accent-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Autenticación verificada vía Google/GitHub</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
          <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  )
}
