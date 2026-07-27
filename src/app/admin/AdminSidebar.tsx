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
            <div className="brand-title">Mapa de flujos</div>
          </div>
        </div>
      <nav className="nav-list" aria-label="Navegación principal">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
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
          <button className="nav-link" aria-label="Cerrar sesión" title="Cerrar sesión" style={{ width: "100%", background: "none" }}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
