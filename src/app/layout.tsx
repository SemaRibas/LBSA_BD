import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ClientShell from "@/components/layout/ClientShell";

export const metadata: Metadata = {
  title: "LBSA - Laboratório de Sistemática Animal",
  description: "Sistema de gerenciamento do Laboratório de Sistemática Animal (LBSA) - Inventário de materiais e coleções sistemáticas",
  keywords: ["laboratorio", "sistematica animal", "inventario", "colecoes", "biologia"],
  icons: {
    icon: "/logo_black.png",
    shortcut: "/logo_black.png",
    apple: "/logo_black.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  document.documentElement.style.backgroundColor = 
                    document.documentElement.classList.contains('dark') ? '#0c0a09' : '#fafafa';
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <ClientShell>
              {children}
            </ClientShell>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
