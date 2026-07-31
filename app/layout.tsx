import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

/* Source requested Poppins 200;300;400;500 from the Google CDN. 200 is never used in the
   markup, so it is dropped; the rest are self-hosted by next/font, removing the
   fonts.googleapis.com round trip and the preconnect entirely. */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "X–2QO — Embodied intelligence research platform",
  description:
    "X–2QO is a research platform for embodied intelligence — an investigation into how perception, balance and reasoning collapse into one continuous loop, running entirely on the body.",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* woff2 only — every browser that supports woff2 takes this file, and the .otf in
            the @font-face src exists purely as a fallback that will realistically never load.
            Preloading both would download the 236 KB OTF for nothing. */}
        <link
          rel="preload"
          href="/fonts/Kiloy.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Givonic-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Without JS the loader would sit over the page forever and the custom cursor
            would never appear, leaving no cursor at all. Both are neutralised here. */}
        <noscript>
          <style>{[
            // Loader and custom cursor are JS-driven; without JS the loader would cover
            // the page forever and there would be no cursor at all.
            `#loader{display:none!important}`,
            `body,body a,body button{cursor:auto!important}`,
            `#cursorRing,#cursorDot,#cursorLabel{display:none!important}`,
            // Same fallback as html[data-flow-vectors] in globals.css — an attribute
            // selector cannot reach here, so the declarations are repeated.
            `#s-research{height:auto!important;overflow:visible!important;padding:24vh 0 12vh!important}`,
            `#s-research [data-vec-grid]{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;margin:0 6vw!important}`,
            `#s-research [data-vec-stack]{height:auto!important}`,
            `#s-research [data-vec]{position:relative!important;inset:auto!important;padding:6vh 0!important}`,
          ].join("")}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
