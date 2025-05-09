import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button"
import { PencilLine, Users, ArrowRight } from "lucide-react"
import React from "react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gotoHomepage = () => {
    window.location.href = "/"
  }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

export function headerLayout(){
  const gotoHomepage = () => {
    window.location.href = "/"
  }

  return (
  <header className="container z-10 flex items-center justify-center py-6 ml-auto mr-auto hover:cursor-pointer">
          <div className="flex items-center gap-2" onClick={gotoHomepage}>
            <PencilLine className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">Draw & Guess</span>
          </div>
        </header>
  )
}

export function backgroundLayout() {
  const bubbles = React.useMemo(() => {
      return Array.from({ length: 20 }).map(() => ({
        width: `${Math.random() * 10 + 5}rem`,
        height: `${Math.random() * 10 + 5}rem`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.1,
        animation: `float ${Math.random() * 10 + 20}s linear infinite`,
        animationDelay: `${Math.random() * 20}s`,
      }))
    }, [])

  return (
    <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-100 dark:from-blue-950 dark:via-purple-950 dark:to-blue-950"></div>
            <div className="absolute inset-0 opacity-30">
              {bubbles.map((style, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-blue-400 dark:bg-blue-600"
                  style={style}
                />
              ))}
            </div>
          </div>
    
  )
}

export function footerLayout() {
  return (
    <footer className="container z-10 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400 ml-auto mr-auto">
        © 2025 Draw & Guess | Simple, fun drawing game
      </footer>
  )
}