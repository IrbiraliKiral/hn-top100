import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "2025 Cricket Tournament",
    description: "Live cricket match dashboard and management system",
    keywords: ["cricket", "tournament", "live scores", "dashboard"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange={false}
                >
                    <div className="relative min-h-screen flex flex-col">
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
