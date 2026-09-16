import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { TitleBar } from "@/components/TitleBar";
import appCss from "../styles.css?url";
import { getLocale, LocaleProvider } from "@/lib/i18n";

const APP_NAME = "Abliterater";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Uncensored / Abliterated / domain-specific model workbench. Local, AWS, GCP, Azure. Research and education.",
      },
      { name: "theme-color", content: "#1C1D1F" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <LocaleProvider>
          <TitleBar />
          <PreviewHostBridge />
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </LocaleProvider>
        <Scripts />
      </body>
    </html>
  ),
});
