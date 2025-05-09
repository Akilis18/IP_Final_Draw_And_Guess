"use client"
import { Button } from "@/components/ui/button"
import { Eraser, PaintBucket, Trash } from "lucide-react"
import React from "react"
import { headerLayout as HeaderLayout } from "@/app/layout"
import { backgroundLayout as BackgroundLayout } from "@/app/layout"
import { footerLayout as FooterLayout } from "@/app/layout"
import blackUserMemberGuestIcon from "@/../public/black-user-member-guest-icon-701751695037011q8iwf4mjbn.png"
import { RotateCcw, Circle, Square, Triangle, Star } from "lucide-react"

export function playerPlate(playerName: string, playerScore: number) {
  return (
    <div className={`playerPlate ${playerName} w-full h-16 bg-white dark:bg-black/30 rounded-xl flex mt-2 items-center justify-between p-4 border-1 border-1`}>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full">
          <img src={blackUserMemberGuestIcon.src} alt={`${playerName}`} className="w-full h-full rounded-full" />
        </div>
        <span className="text-md font-200">{playerName}</span>
      </div>
      <span className="text-lg font-200 text-zinc-400">{playerScore}</span>
    </div>
  )
}

export default function RoomPage() {
  // Generate random bubble styles
  const [brushWeight, setBrushWeight] = React.useState(10)

  const weightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    setBrushWeight(value)
    console.log("Brush weight changed to:", brushWeight)

  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Dynamic Background */}
        <BackgroundLayout />

        <HeaderLayout />

        {/* Main content */}
        <main className="main-content container z-10 flex flex-1 flex-col md:flex-row items-center justify-center ml-auto mr-auto gap-4">
            {/* divide into three parts: players, drawing area and chat */}
            <div className="flex flex-col items-center space-y-2 w-full md:w-1/4">
                <div className="player-list h-192 w-full overflow-y-auto bg-white dark:bg-black/30 p-4 rounded-xl">
                <h2 className="text-lg font-300 align-center text-zinc-600">Players</h2>
                <div className="flex flex-col items-center">
                    {playerPlate("Player 1", 10)}
                    {playerPlate("Player 2", 20)}
                    {playerPlate("Player 3", 30)}
                    {playerPlate("Player 4", 40)}
                    {playerPlate("Player 5", 50)}
                </div>
                <div className="findingPlayer flex flex-col items-center mt-2">
                    <span className="text-lg font-200">Searching for players...</span>
                </div>
                </div>
            </div>
            <div className="flex flex-col items-center space-y-2 w-full md:w-2/4">
                <div className="drawing-area h-192 w-full bg-white/50 dark:bg-black/30 p-4 rounded-xl">
                {/* Drawing area content */}
                    <div className="canva w-full h-[70%] bg-[#ffffff] border-1 rounded-sm border-zinc-200"></div>
                    <div className="toolbox w-full h-[30%] p-2 flex flex-col mt-2">
                        <div className="tools w-full h-[50%] flex gap-3">
                            <div className="currentColor w-[100px] h-full bg-blue-500 border-7 border-white rounded-md"></div>
                            <div className="brush-width w-[50%] bg-white flex items-center p-4">
                                <label htmlFor="brushWeight" className="mr-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    Brush Weight:
                                </label>
                                <input
                                    id="brushWeight"
                                    type="range"
                                    min="1"
                                    max="50"
                                    defaultValue="10"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    value={brushWeight}
                                    onChange={(e) => weightChange(e)} // Replace with your logic
                                />
                                <label htmlFor="tooltip" className="brushtooltip ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    {brushWeight}px
                                </label>
                            </div>
                            <div className="other-tools h-full grid grid-cols-4 gap-3">
                                {/* Top Row */}
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <Eraser className="w-6 h-6 text-black" />
                                </div>
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <PaintBucket className="w-6 h-6 text-black" />
                                </div>
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <RotateCcw className="w-6 h-6 text-black" />
                                </div>
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <Trash className="w-6 h-6 text-black" />
                                </div>

                                {/* Bottom Row */}
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <Circle className="w-6 h-6 text-black" />
                                </div>
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <Square className="w-6 h-6 text-black" />
                                </div>
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <Triangle className="w-6 h-6 text-black" />
                                </div>
                                <div className="tool w-[50px] h-[50px] bg-white rounded-md border-1 border-zinc-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-100">
                                    <Star className="w-6 h-6 text-black" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center space-y-2 w-full md:w-1/4">
                <div className="chat-area h-192 w-full overflow-y-auto bg-white dark:bg-black/30 p-4 rounded-xl">
                {/* Chat area content */}
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