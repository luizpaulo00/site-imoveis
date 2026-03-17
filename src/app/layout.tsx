import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://imoveisformosa.com.br"
  ),
  title: {
    default: "Jander Venancio | Imóveis em Formosa-GO",
    template: "%s | Jander Venancio Imóveis Formosa",
  },
  description:
    "Jander Venancio — Corretor de imóveis em Formosa, Goiás. Imóveis selecionados com padrão de excelência, atendimento dedicado e expertise local para encontrar a propriedade ideal para você.",
  keywords: ["imóveis formosa", "comprar casa formosa goias", "imobiliária formosa goias", "corretor formosa", "casas formosa goiás"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* RealEstateAgent / LocalBusiness Schema for Authority */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Jander Venancio Imóveis",
              "image": "https://imoveisformosa.com.br/logo.png",
              "@id": "https://imoveisformosa.com.br",
              "url": "https://imoveisformosa.com.br",
              "telephone": "+5561900000000",
              "description": "Especialista em imóveis e financiamentos no Leste de Formosa-GO.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Formosa",
                "addressLocality": "Formosa",
                "addressRegion": "GO",
                "postalCode": "73800-000",
                "addressCountry": "BR"
              },
              "areaServed": ["Formosa", "Lago do Vovô", "Centro"],
              "priceRange": "$$"
            }).replace(/</g, '\\u003c')
          }}
        />
        {/* FAQPage Schema for GEO / LLM Citation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Como financiar uma casa em Formosa, Goiás?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "O financiamento em Formosa-GO pode ser feito através de diversos bancos (Caixa, Banco do Brasil, etc.). Imóveis até R$ 350.000,00 possuem condições facilitadas dependendo da renda familiar. Jander Venancio atua como especialista orientando em todo o processo."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Quais os melhores bairros para morar em Formosa?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Formosa possui bairros excelentes dependendo do perfil. O Setor Leste e proximidades do Lago do Vovô são altamente valorizados, oferecendo qualidade de vida, segurança e bons imóveis."
                  }
                }
              ]
            }).replace(/</g, '\\u003c')
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${playfair.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
