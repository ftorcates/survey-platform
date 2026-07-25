"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/audience", label: "Audiencias", icon: Users },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export default function AdminSidebar({
  signOutAction,
}: {
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="glass-panel admin-sidebar">
      <div className="brand-lockup">
        <div className="brand-badge">
          <ClipboardList size={20} />
        </div>
        <div>
          <div className="brand-kicker">Survey Platform</div>
          <div className="brand-title">Control Center</div>
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem", padding: "1rem", borderRadius: "1.2rem", background: "rgba(255,255,255,0.52)", border: "1px solid rgba(255,255,255,0.48)" }}>
        <p className="menu-section-title">Espacio de trabajo</p>
        <p style={{ color: "var(--color-text-main)", fontWeight: 700, marginBottom: "0.4rem" }}>
          Gestiona encuestas y resultados
        </p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>
          Un único lugar para publicar, compartir y revisar estudios.
        </p>
      </div>

      <nav className="nav-list" aria-label="Navegación principal">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="divider" style={{ marginBottom: "1rem" }} />
        <form action={signOutAction}>
          <button className="nav-link" style={{ width: "100%", background: "none" }}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
