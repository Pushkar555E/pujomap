import type { Metadata, Viewport } from "next";
import { Fraunces, Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const bengali = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PujoMap: Kolkata Durga Puja map & route planner",
  description:
    "Every Bonedi Bari and pandal in Kolkata on one map. Filter by area, find great food nearby, and plan your pandal-hopping route.",
  openGraph: {
    type: "website",
    siteName: "PujoMap",
    title: "PujoMap: Kolkata Durga Puja map & route planner",
    description:
      "Every Bonedi Bari and pandal in Kolkata on one map. Filter by area, find great food nearby, and plan your pandal-hopping route.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0a14" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${fraunces.variable} ${bengali.variable} h-full`}
    >
      <body className="h-full overflow-hidden">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TVDCJQZP"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TVDCJQZP');`}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
