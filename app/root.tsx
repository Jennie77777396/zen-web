import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, Settings } from "lucide-react";
import { SettingsDialog } from "./components/SettingsDialog";
import { getSettings, updateSettings } from "./lib/storage";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [settings, setSettings] = useState(getSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
  }, [settings.fontSize]);

  // Apply font family
  useEffect(() => {
    const fontMap: Record<string, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    };
    document.documentElement.style.setProperty('font-family', fontMap[settings.fontFamily] || fontMap.system);
  }, [settings.fontFamily]);

  const handleToggleDarkMode = () => {
    const updated = updateSettings({ darkMode: !settings.darkMode });
    setSettings(updated);
  };

  const handleFontSizeChange = (fontSize: number) => {
    const updated = updateSettings({ fontSize });
    setSettings(updated);
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    const updated = updateSettings({ fontFamily });
    setSettings(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Notion/Apple style */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-[15px] font-medium tracking-tight text-foreground/90">
              C.C.Wang - The Guru Drinks Burbon
            </h1>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleDarkMode}
                className="p-2 rounded-md hover:bg-foreground/[0.06] transition-all text-foreground/60 hover:text-foreground/80"
                aria-label="Toggle dark mode"
              >
                {settings.darkMode ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </button>
              
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-md hover:bg-foreground/[0.06] transition-all text-foreground/60 hover:text-foreground/80"
                aria-label="Settings"
              >
                <Settings className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={settings.fontSize}
        fontFamily={settings.fontFamily}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
      />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
