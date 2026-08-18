import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./ThemeToggle";

export const metadata: Metadata = {
  title: "Plataforma de Encuestas",
  description: "Crea y responde encuestas dinámicas, modernas y atractivas.",
  other: {
    "color-scheme": "dark light",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (() => {
      try {
        const theme = localStorage.getItem("survey-platform-theme");
        if (theme === "light") {
          document.documentElement.dataset.theme = "light";
          document.documentElement.style.colorScheme = "light";
        } else {
          document.documentElement.dataset.theme = "dark";
          document.documentElement.style.colorScheme = "dark";
        }
      } catch {}
    })();
  `;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
