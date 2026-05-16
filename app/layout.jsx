import './globals.css';
import AppShell from '@/components/AppShell';

const SITE_URL = 'https://www.getlivingresult.in';

export const metadata = {
  title: 'Living Result | #WEARETHELIVINGRESULT',
  description:
    "Living Result — Premium fitness supplements. We don't just sell supplements, we LIVE the results. Shop Whey Protein, Mass Gainer, Creatine and more.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/images/favicon.ico', type: 'image/x-icon' },
      { url: '/images/favicon.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/images/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PRELOAD CRITICAL ASSETS */}
        <link rel="preload" href="/images/logo.png" as="image" />
        <link rel="preload" href="/images/hero-athlete.png" as="image" />

        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body>
        {/*
          AppShell is the client-side wrapper that provides:
          - Navbar with live cart count (Zustand)
          - NoticeStrip (from settings API)
          - Maintenance Mode overlay
          - Search & Cart sidebar stubs (full build Phase 3)
          - Floating Cart Button
        */}
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
