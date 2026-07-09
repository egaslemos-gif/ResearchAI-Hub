import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell/Shell";
import { ui } from "@/lib/labels";

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
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
