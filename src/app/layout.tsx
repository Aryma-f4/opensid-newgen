import type { Metadata } from "next"
import "./globals.css"
import Provider from "@/lib/session"

export const metadata: Metadata = {
  title: "OpenSID",
  description: "Sistem Informasi Desa",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/bootstrap/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/assets/bootstrap/css/ionicons.min.css" />
        <link rel="stylesheet" href="/assets/css/AdminLTE.min.css" />
        <link rel="stylesheet" href="/assets/css/skins/_all-skins.min.css" />
        <link rel="stylesheet" href="/assets/css/admin-style.css" />
      </head>
      <body className="min-h-full bg-[#ecf0f5]">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
