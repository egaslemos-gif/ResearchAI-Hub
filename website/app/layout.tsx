import type { Metadata } from "next";
import "../styles/tokens.css";
import "./globals.css";
import { Shell } from "@/components/shell/Shell";
import { ui } from "@/lib/labels";
import { ResearchSessionProvider } from "@/components/workspace/ResearchSessionContext";

export const metadata: Metadata = {
  title: { default: ui.product.name, template: `%s · ${ui.product.name}` },
  description: ui.product.tagline,
};

// Define o tema antes da pintura para evitar flash (lê localStorage / preferência do SO).
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#faf9f7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f0e0d" media="(prefers-color-scheme: dark)" />
      </head>
      <body suppressHydrationWarning>
        <ResearchSessionProvider>
          <Shell>{children}</Shell>
        </ResearchSessionProvider>
      </body>
    </html>
  );
}
