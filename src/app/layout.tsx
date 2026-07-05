import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Loop — Feedback Intelligence for Design Teams",
  description: "Capture, translate, and track design feedback from Slack, Figma, and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased overflow-hidden`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('loop-theme');
                  if (savedTheme === 'jc-brand' || savedTheme === 'dark') {
                    document.documentElement.setAttribute('data-theme', savedTheme);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="h-full bg-sooty text-foreground overflow-hidden">
        <Sidebar />
        <main className="ml-0 lg:ml-[250px] h-screen overflow-hidden flex flex-col bg-sooty w-full lg:w-[calc(100%-250px)] transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
