import { signOut } from "@/auth";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminSidebar
        signOutAction={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      />
      <main className="admin-main">
        <div className="container page-shell">
          {children}
        </div>
      </main>
    </div>
  );
}
