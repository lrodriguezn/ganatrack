import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { AppProviders } from "@/shared/providers/app-providers";
import { ToastProvider } from "@/shared/components/feedback";
import { SerwistProvider } from "./serwist";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

const APP_NAME = "GanaTrack";
const APP_DEFAULT_TITLE = "GanaTrack";
const APP_DESCRIPTION = "Sistema de gestión ganadera";

export const metadata: Metadata = {
  title: {
    default: APP_DEFAULT_TITLE,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: `%s — ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: `%s — ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* FOUC prevention: apply dark mode class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('darkMode');
                  if (mode === 'true' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        {/* Skip to content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="
            sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
            z-[100] bg-brand-600 text-white px-4 py-2 rounded-md
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          "
        >
          Saltar al contenido principal
        </a>

        <SerwistProvider swUrl="/sw.js">
          <AppProviders>{children}</AppProviders>
        </SerwistProvider>

        <ToastProvider />
      </body>
    </html>
  );
}
