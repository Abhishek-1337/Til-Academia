import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import SessionProvider from "@/components/SessionProvider"
import AuthButton from "@/components/AuthButton"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Today I Learned",
  description: "Capture and format your daily learnings with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <SessionProvider>
          <header className="flex items-center justify-end gap-4 border-b border-gray-200 px-6 py-3 dark:border-gray-800">
            <AuthButton />
          </header>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
