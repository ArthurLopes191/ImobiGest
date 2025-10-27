import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";


export const metadata: Metadata = {
  title: "ImobiGest",
  description: "Gestão de comissões",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
