"use client"
import { Button } from "@/components/ui/button"
import { PencilLine, Users, ArrowRight } from "lucide-react"
import React from "react"
import { headerLayout as HeaderLayout } from "./layout"
import { backgroundLayout as BackgroundLayout } from "./layout"
import { footerLayout as FooterLayout } from "./layout"

export default function HomePage() {
  // Generate random bubble styles

  const findRoom = () => {
    window.location.href = "/room"
  }

  const lobbySearch = () => {
    window.location.href = "/lobby"
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Dynamic Background */}
      <BackgroundLayout />

      <HeaderLayout />

      <main className="main-content container z-10 flex flex-1 flex-col items-center justify-center px-4 text-center ml-auto mr-auto">
        <div className="max-w-3xl space-y-6 backdrop-blur-sm bg-white/30 dark:bg-black/30 p-8 rounded-xl">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Draw, Guess, <span className="text-blue-500">Have Fun!</span>
          </h1>

          <p className="mx-auto max-w-[600px] text-lg text-zinc-700 dark:text-zinc-300">
            Challenge your creativity in this simple drawing game. No accounts needed - just draw and guess!
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-lg hover:cursor-pointer" onClick={findRoom}>
              開始
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 text-lg hover:cursor-pointer" onClick={lobbySearch}>
              尋找大廳
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-8 sm:grid-cols-3">
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
                <PencilLine className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold">Draw</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Get a word and draw it within the time limit</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold">Guess</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Watch others draw and type your guesses</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
                <svg
                  className="h-6 w-6 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Play</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No login needed - just jump in and play</p>
            </div>
          </div>
        </div>
      </main>

      <FooterLayout />

      {/* Animation for floating bubbles */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
