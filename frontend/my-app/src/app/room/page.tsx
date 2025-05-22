"use client"
import { Button } from "@/components/ui/button"
import {
  Eraser,
  PaintBucket,
  Trash,
  RotateCcw,
  Circle,
  Square,
  Triangle,
  Star,
  ArrowRight,
  Send,
  Clock,
  HelpCircle,
  SkipForward,
} from "lucide-react"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { headerLayout as HeaderLayout } from "@/app/layout"
import { backgroundLayout as BackgroundLayout } from "@/app/layout"
import { footerLayout as FooterLayout } from "@/app/layout"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Fascinate } from "next/font/google"

function PopUpSetName({
  name,
  setName,
  onSubmit,
  nameError,
}: {
  name: string
  setName: (name: string) => void
  onSubmit: () => void
  nameError?: string
}) {
  return (
    <div className="fixed z-50 top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Set Your Name</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="nameInput"
          placeholder="Enter your name"
          className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg"
        />
        {nameError && (
          <label className="nameInputWarning text-sm text-red-700 dark:text-red-400 mb-4">
            {nameError}
          </label>
        )}
        <Button onClick={onSubmit} className="w-full hover:scale-105 transition-transform duration-200 hover:cursor-pointer mt-4">
          Submit
        </Button>
      </div>
    </div>
  )
}

function BottomNotificationComp(
  { bottomNotificationMessage }: { bottomNotificationMessage?: string }
){
  return (
    <div className="fixed bottom-0 z-14 w-3/4 left-60 right-50 p-4 bg-white dark:bg-zinc-900 rounded-t-lg shadow-lg border-t-2 border-indigo-500">
      <div className="flex items-center justify-between">
        {
          bottomNotificationMessage && (
            <div className="text-md text-zinc-700 dark:text-zinc-300">
              {bottomNotificationMessage}
            </div>
          )
        }
      </div>
    </div>
  )
}

function QuestionSelection (
  { question1,
    question2,
    selectQuestion
  }: {
    question1: string
    question2: string
    selectQuestion: (question: string) => void
  }
){
  return (
    <div className="fixed z-50 top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Select a Word</h2>
        <div className="flex flex-col space-y-4">
          <Button onClick={() => selectQuestion(question1)}>{question1}</Button>
          <Button onClick={() => selectQuestion(question2)}>{question2}</Button>
        </div>
      </div>
    </div>
  )
}




export default function RoomPage() {
  // State management
  const clientId = useRef(crypto.randomUUID())
  const [brushWeight, setBrushWeight] = useState(4)
  const [brushColor, setBrushColor] = useState("#4F46E5")
  const [chatMessages, setChatMessages] = useState<{ playerName: string; message: string; isCurrentUser: boolean }[]>([
    /*{ playerName: "System", message: "Welcome to Draw & Guess! The game will start soon.", isCurrentUser: false },
    { playerName: "Player 2", message: "Hello everyone!", isCurrentUser: false },
    { playerName: "Player 3", message: "I'm ready to play!", isCurrentUser: false },*/
  ])
  const [currentWord, setCurrentWord] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentDrawer, setCurrentDrawer] = useState("")
  const [myname, setmyname] = useState("")
  const [showNamePopup, setShowNamePopup] = useState(true)
  const [bottomNotification, setBottomNotification] = useState(false)
  const [showQuestionSelection, setShowQuestionSelection] = useState(false)

  const [question1, setQuestion1] = useState("")
  const [question2, setQuestion2] = useState("")
  const [bottomNotificationMessage, setBottomNotificationMessage] = useState("")
  const [players, setPlayers] = useState<{name: string, score: number, isDrawing: boolean}[]>([ 
    // { name: myname, score: 120, isDrawing: false }
  ])
  const [isDrawing, setDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null)
  const [lastDrawPos, setLastDrawPos] = useState<{x: number, y: number} | null>(null)
  const [eraserActive, setEraserActive] = useState(false)
  const [fillActive, setFillActive] = useState(false)
  const [drawCircle, setDrawCircle] = useState(false)
  const [drawSquare, setDrawSquare] = useState(false)
  const [drawTriangle, setDrawTriangle] = useState(false)
  const [drawStar, setDrawStar] = useState(false)
  const [nameError, setNameError] = useState("");
  const [round, setRound] = useState(1)

  const [showHint, setShowHint] = useState(0)
  const [guessShowWord, setGuessShowWord] = useState("")
  
  const previousCanvasRef = useRef<HTMLCanvasElement | null>(null) //for redo
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const buttonEraser = useRef<HTMLButtonElement | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  const [guessed, setGuessed] = useState(false)

  // Colors palette
  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#4F46E5",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#6B7280",
  ]
  // websocket connection

  useEffect(() => {
  const socket = new WebSocket("ws://localhost:5000");
  socketRef.current = socket;
  

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "playerList") {
      setPlayers(data.players);

    }
    if (data.type === "chat") {
      setChatMessages((prev) => [
        ...prev,
        {
          playerName: data.senderId === clientId.current ? "You" : data.name,
          isCurrentUser: data.senderId === clientId.current,
          message: data.message,
        },
      ]);
    }
    if(data.type === "systemMessage") {
      if(data.senderId === clientId.current && !guessed){
        setGuessed(true)
      }
      setChatMessages((prev) => [
        ...prev,
        {
          playerName: "System",
          message: data.message,
          isCurrentUser: false,
        },
      ]);
    }
    // 未來可擴充處理：畫圖、換人、倒數等
    if (data.type === "canvasUpdate") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = data.image;
    }
    //系統訊息
    if (data.type === "bottomNotices") {
      setBottomNotification(true)
      setBottomNotificationMessage(data.message)
      setTimeout(() => {
        setBottomNotification(false)
      }, 3000)
    }
    if (data.type === "artist") {
      setGuessed(false);
      setCurrentDrawer(data.artist);
      setBottomNotification(true)
      setBottomNotificationMessage(`${data.artist} is drawing now!`)
      setTimeout(() => {
        setBottomNotification(false)
      }, 3000)
    }
    if (data.type === "question") {
      setQuestion1(data.question1);
      setQuestion2(data.question2);
      setShowQuestionSelection(true)
    }
    if (data.type === "clearCanvas") {
      artistDisconnectClearCanvas()
    }
    if (data.type === "showHint") {
      console.log(data.word)
      setShowHint(data.hintLevel);
      questionShowHint(data.hintLevel, data.word)
    }
    if (data.type === "selectWord") {
      setCurrentWord(data.word);
      setShowHint(0);
    }
    if (data.error === "Name already exists") {
      //socket connect
      setShowNamePopup(true)
      setShowNamePopup(true);
      setNameError("This name is taken, try another one.");
      return;
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    alert("Connection lost. Please refresh the page.");
    window.location.reload();
  };

  return () => {
    socket.close();
  };
  }, []);
  
  // send canvas data only if I am the current drawer, and在0.1秒內沒有畫圖才上傳canvas
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    // 追蹤是否正在畫圖
    if (!players.find((player) => player.name === myname)?.isDrawing) return;

    // 監聽 isDrawing 狀態
    if (!isDrawing) {
      // 停止畫圖後，延遲0.1秒再上傳
      timeout = setTimeout(() => {
        const canvas = canvasRef.current;
        if (
          canvas &&
          socketRef.current?.readyState === WebSocket.OPEN
        ) {
          // Check if canvas is not blank
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const pixelBuffer = new Uint32Array(
            ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
          );
          const isBlank = !pixelBuffer.some((color) => color !== 0);
          if (isBlank) return;

          const base64Image = canvas.toDataURL("image/png");
          socketRef.current.send(
            JSON.stringify({
              type: "canvasUpdate",
              image: base64Image,
            })
          );
        }
      }, 100);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isDrawing, players, myname]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)

    //set up your name
  }, [])

  // Event handlers
  const handleBrushWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    setBrushWeight(value)
  }

  const handleColorChange = (color: string) => {
    setBrushColor(color)
  }

  const handleSendChat = () => {
  const chatInput = document.getElementById("chatInput") as HTMLInputElement
  const message = chatInput.value.trim()
  if (message && socketRef.current?.readyState === WebSocket.OPEN) {
    const payload = {
      type: "chat",
      name: myname,
      message: message,
      senderId: clientId.current,
    }
    socketRef.current.send(JSON.stringify(payload))
    chatInput.value = ""
  }
}

  /*
  const handleSendChat = () => {
    const chatInput = document.getElementById("chatInput") as HTMLInputElement
    const message = chatInput.value.trim()
    if (message) {
      setChatMessages([...chatMessages, { playerName: "You", message, isCurrentUser: true }])
      chatInput.value = ""

      // Simulate response for demo purposes
      if (message.toLowerCase().includes(currentWord.toLowerCase())) {
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              playerName: "System",
              message: "You guessed correctly! The word was '" + currentWord + "'",
              isCurrentUser: false,
            },
          ])
        }, 500)
      } else {
        setTimeout(() => {
          const responses = [
            { playerName: "Player 2", message: "Good guess, but not quite!", isCurrentUser: false },
            { playerName: "Player 3", message: "I think it's something else...", isCurrentUser: false },
            { playerName: "Player 5", message: "Hmm, let me think...", isCurrentUser: false },
          ]
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]
          setChatMessages((prev) => [...prev, randomResponse])
        }, 1500)
      }
    }
  }
  */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendChat()
    }
  }

  const messageScrollRef = (node: HTMLDivElement | null) => {
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
  
    const targetColor = getPixelColor(data, x, y, canvas.width);
    const fillRgba = hexToRgba(fillColor);
  
    if (colorsMatch(targetColor, fillRgba)) return; // If the target color is the same as the fill color, do nothing
  
    const stack = [[x, y]];
  
    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop()!;
      const currentColor = getPixelColor(data, currentX, currentY, canvas.width);
  
      if (!colorsMatch(currentColor, targetColor)) continue;
  
      setPixelColor(data, currentX, currentY, canvas.width, fillRgba);
  
      stack.push([currentX + 1, currentY]);
      stack.push([currentX - 1, currentY]);
      stack.push([currentX, currentY + 1]);
      stack.push([currentX, currentY - 1]);
    }
  
    ctx.putImageData(imageData, 0, 0);
  };
  
  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
  };
  
  const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number, color: number[]) => {
    const index = (y * width + x) * 4;
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = color[3];
  };
  
  const colorsMatch = (color1: number[], color2: number[]) => {
    return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3];
  };
  
  const hexToRgba = (hex: string): number[] => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b, 255];
  };

// 修改你的事件處理函數
  const OtherEvents = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const amIDrawing = players.find((player) => player.name === myname)?.isDrawing
    if (!amIDrawing) return // If not the current player

    const canvas = canvasRef.current;
    if (!canvas) return; // If canvas is not ready

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // If context is not ready

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (fillActive) {
      console.log("Fill active");
      floodFill(ctx, x, y, brushColor);
      setLastDrawPos(null); // Reset last position
      setFillActive(false); // Disable fill after use
    }

    // ctx.strokeStyle = brushColor
    // ctx.lineWidth = brushWeight
    // ctx.lineCap = "round"
    // ctx.lineJoin = "round"
    // ctx.beginPath()
    // ctx.lineTo(x, y)
    // ctx.stroke()

    setLastDrawPos(null) // Save the last position
  };

  
  const Draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const amIDrawing = players.find((player) => player.name === myname)?.isDrawing
    if (!isDrawing || !amIDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (drawCircle && startPos) {
      // 預覽用：清空畫布後重畫背景（這邊簡化處理）
      Redo() // ← 使用你已有的函數還原背景
      const dx = x - startPos.x
      const dy = y - startPos.y
      const radius = Math.sqrt(dx * dx + dy * dy)

      ctx.beginPath()
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushWeight
      ctx.stroke()
      ctx.closePath()
      return
    }

    if (drawSquare && startPos) {
      Redo() // ← 使用你已有的函數還原背景
      const dx = x - startPos.x
      const dy = y - startPos.y
      ctx.beginPath()
      ctx.rect(startPos.x, startPos.y, dx, dy)
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushWeight
      ctx.stroke()
      ctx.closePath()
      return
    }

    if (drawTriangle && startPos) {
      Redo() // ← 使用你已有的函數還原背景
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(x, y)
      ctx.lineTo(startPos.x + (x - startPos.x) / 2, startPos.y - Math.abs(x - startPos.x))
      ctx.closePath()
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushWeight
      ctx.stroke()
      return
    }

    if (drawStar && startPos) {
      Redo()

      const centerX = startPos.x
      const centerY = startPos.y

      const dx = x - centerX
      const dy = y - centerY
      const outerRadius = Math.sqrt(dx * dx + dy * dy)
      const innerRadius = outerRadius / 2.5
      const spikes = 5

      ctx.beginPath()

      for (let i = 0; i < spikes * 2; i++) {
        const angle = (Math.PI / spikes) * i
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const px = centerX + radius * Math.cos(angle - Math.PI / 2)
        const py = centerY + radius * Math.sin(angle - Math.PI / 2)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }

      ctx.closePath()
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushWeight
      ctx.stroke()
      return
    }

    // 原本畫筆或橡皮擦等邏輯保留
    if (eraserActive) {
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = brushWeight * 2
      ctx.beginPath()
      if (lastDrawPos) {
        ctx.moveTo(lastDrawPos.x, lastDrawPos.y)
      } else {
        ctx.moveTo(x, y)
      }
      ctx.lineTo(x, y)
      ctx.stroke()
      setLastDrawPos({ x, y })
      return
    }

    // 一般畫筆模式
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushWeight
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    if (lastDrawPos) {
      ctx.moveTo(lastDrawPos.x, lastDrawPos.y)
    } else {
      ctx.moveTo(x, y)
    }
    ctx.lineTo(x, y)
    ctx.stroke()
    setLastDrawPos({ x, y })
  }

  const artistDisconnectClearCanvas = () => {
    const canvas = canvasRef.current
      if (!canvas) return //if canvas is not ready
      const ctx = canvas.getContext("2d")
      if (!ctx) return //if context is not ready

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setLastDrawPos(null) // Reset last position
  }

  const clearCanvas = () => {
    const amIDrawing = players.find((player) => player.name === myname)?.isDrawing
    if (!amIDrawing) return //if not the current player
    const canvas = canvasRef.current
    if (!canvas) return //if canvas is not ready
    const ctx = canvas.getContext("2d")
    if (!ctx) return //if context is not ready

    saveCanvas() // Save the current canvas state to the previousCanvasRef for redo

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setLastDrawPos(null) // Reset last position
    uploadCanvas()
  }

  const saveCanvas = () => {
    const amIDrawing = players.find((player) => player.name === myname)?.isDrawing
    if (!amIDrawing) return //if not the current player
    const canvas = canvasRef.current
    if (!canvas) return //if canvas is not ready
    const ctx = canvas.getContext("2d")
    if (!ctx) return //if context is not ready

    // Save the current canvas state to the previousCanvasRef for redo
    if (!isDrawing) {
      const previousCanvas = previousCanvasRef.current
      if (previousCanvas) {
        const previousCtx = previousCanvas.getContext("2d")
        if (previousCtx) {
          previousCtx.clearRect(0, 0, previousCanvas.width, previousCanvas.height)
          previousCtx.drawImage(canvas, 0, 0)
        }
      }
    }
  }

  const Redo = () => {
    const amIDrawing = players.find((player) => player.name === myname)?.isDrawing
  
    if (!amIDrawing) return //if not the current player

    const canvas = canvasRef.current
    if (!canvas) return //if canvas is not ready
    const ctx = canvas.getContext("2d")
    if (!ctx) return //if context is not ready


    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const previousCanvas = previousCanvasRef.current
    if (previousCanvas) {
      const previousCtx = previousCanvas.getContext("2d")
      if (previousCtx) {
        ctx.drawImage(previousCanvas, 0, 0)
        uploadCanvas();
      }
    }
  }
  
  const uploadCanvas = () => {
    const canvas = canvasRef.current;
    if (
      canvas &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pixelBuffer = new Uint32Array(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
      );
      const isBlank = !pixelBuffer.some((color) => color !== 0);
      if (isBlank) return;

      const base64Image = canvas.toDataURL("image/png");
      socketRef.current.send(
        JSON.stringify({
          type: "canvasUpdate",
          image: base64Image,
        })
      );
    }
  };

  const questionShowHint = (hintLevel: number, setword: string) => {
    if (hintLevel <= 0) {
      const word = setword.split("").map((char) => "_").join(" ")
      setGuessShowWord(word)
    }
    else if (hintLevel < 4) {
      let currentguess = ""
      for (let i = 0; i < hintLevel - 1; i++)
        currentguess += setword[i] + " "
      for (let i = hintLevel - 1; i < setword.length; i++) { 
        if (setword[i] === " ") {
          currentguess += " "
        }
        else {
          currentguess += "_ "
        }
      }
      setGuessShowWord(currentguess)
    }
    else {
      setBottomNotification(true)
      setBottomNotificationMessage("No more hints available.")
      setTimeout(() => {
        setBottomNotification(false)
      }, 3000)
    }
    setShowHint(hintLevel)
  }

  // Player component
  const PlayerItem = ({ player }: { player: { name: string; score: number; isDrawing: boolean } }) => (
    <div
      className={`w-full py-3 px-4 bg-white/80 dark:bg-zinc-800/80 rounded-lg flex items-center justify-between mb-2 transition-all ${player.isDrawing ? "border-l-4 border-indigo-500" : ""}`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${player.isDrawing ? "bg-indigo-500" : "bg-gray-500"}`}
        >
          {player.name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{player.name}</span>
          {player.isDrawing && (
            <Badge
              variant="outline"
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs"
            >
              Drawing now
            </Badge>
          )}
        </div>
      </div>
      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{player.score}</span>
    </div>
  )

  // Chat message component
  const ChatMessage = ({ message }: { message: { playerName: string; message: string; isCurrentUser: boolean } }) => {
    const isSystem = message.playerName === "System"

    return (
      <div
        className={`mb-3 p-3 rounded-lg ${
          isSystem
            ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200"
            : message.isCurrentUser
              ? "bg-blue-100 dark:bg-blue-900/30 ml-4"
              : "bg-gray-100 dark:bg-zinc-800/80 mr-4"
        }`}
      >
        <div className="flex items-center mb-1">
          <span className={`font-medium text-sm ${isSystem ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
            {message.playerName}
          </span>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300">{message.message}</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden ml-auto mr-auto">
      {
        bottomNotification && <BottomNotificationComp bottomNotificationMessage={bottomNotificationMessage} />
      }
      {showNamePopup && <PopUpSetName
        name={myname}
        setName={setmyname}
        onSubmit={() => {
          if (myname.trim()) {
            // send name to server
            socketRef.current?.send(
              JSON.stringify({
                type: "setName",
                name: myname,
                clientId: clientId.current,
                token: Date.now(),
              })
            )
            
            localStorage.setItem("playerName", myname)
            setmyname(myname) // 更新狀態
            setShowNamePopup(false) // 關閉彈窗
          }
        }}
        nameError={nameError}
      />}
      {
        showQuestionSelection && (
          <QuestionSelection
            question1={question1}
            question2={question2}
            selectQuestion={(question) => {
              setShowQuestionSelection(false)
              socketRef.current?.send(
                JSON.stringify({
                  type: "selectWord",
                  word: question,
                  clientId: clientId.current,
                })
              )
              setCurrentWord(question)
              setShowHint(0)
            }}
          />
        )
      }
      {/* Footer */}

      {/* Chat section */}

      {/* Dynamic Background */}
      <BackgroundLayout />

      {/* <HeaderLayout /> */}

      {/* Game status bar */}
      <div className="container z-10 mt-4 mb-2 ml-auto mr-auto">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Time left</div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{timeLeft}s</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Current drawer</div>
            <div className="text-xl font-bold">{currentDrawer}</div>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Current word</div>
              <div className="text-xl font-bold tracking-wider">
                {players.find((p) => p.name === myname)?.isDrawing
                  ? currentWord
                  : guessShowWord}
              </div>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
              <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container z-10 flex flex-1 flex-col md:flex-row gap-4 mb-6 ml-auto mr-auto overflow-hidden">
        {/* Players section */}
        <div className="w-full md:w-1/4 flex flex-col">
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-xl p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Players</h2>
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Round {round}
              </Badge>
            </div>

            <div className="space-y-1" id="playersList">
              {players.map((player, index) => (
                <PlayerItem key={index} player={player} />
              ))}
            </div>

            <Separator className="my-4" />

            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">Waiting for more players... (3 players to start)</div>
          </div>
        </div>

        {/* Drawing area */}
        <div className="w-full md:w-2/4 flex flex-col">
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-xl p-4 h-full">
            {/* Canvas */}
            {/* save previous canvas for redo */}
            <canvas
              id="drawingCanvas"
              width={800}
              height={600}
              ref={previousCanvasRef}
              className="w-full aspect-video bg-white rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-md mb-4 hidden"></canvas>
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => {
                saveCanvas()
                setDrawing(true)

                const canvas = canvasRef.current
                if (!canvas) return
                const rect = canvas.getBoundingClientRect()
                const scaleX = canvas.width / rect.width
                const scaleY = canvas.height / rect.height
                const x = (e.clientX - rect.left) * scaleX
                const y = (e.clientY - rect.top) * scaleY

                if (drawCircle || drawSquare || drawTriangle || drawStar) {
                  setStartPos({ x, y }) // 記錄起點
                }
              }}
              onClick={OtherEvents}
              onMouseMove={Draw}
              onMouseUp={(e) => {
                setDrawing(false)
                setLastDrawPos(null)

                const amIDrawing = players.find((player) => player.name === myname)?.isDrawing
                if (!amIDrawing) return //if not the current player

                if (drawCircle && startPos) {
                  const canvas = canvasRef.current
                  if (!canvas) return
                  const ctx = canvas.getContext("2d")
                  if (!ctx) return

                  const rect = canvas.getBoundingClientRect()
                  const scaleX = canvas.width / rect.width
                  const scaleY = canvas.height / rect.height
                  const x = (e.clientX - rect.left) * scaleX
                  const y = (e.clientY - rect.top) * scaleY

                  const dx = x - startPos.x
                  const dy = y - startPos.y
                  const radius = Math.sqrt(dx * dx + dy * dy)

                  ctx.beginPath()
                  ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2)
                  ctx.strokeStyle = brushColor
                  ctx.lineWidth = brushWeight
                  ctx.stroke()
                  ctx.closePath()

                  setStartPos(null)
                  setDrawCircle(false)
                }

                if (drawSquare && startPos) {
                  const canvas = canvasRef.current
                  if (!canvas) return
                  const ctx = canvas.getContext("2d")
                  if (!ctx) return

                  const rect = canvas.getBoundingClientRect()
                  const scaleX = canvas.width / rect.width
                  const scaleY = canvas.height / rect.height
                  const x = (e.clientX - rect.left) * scaleX
                  const y = (e.clientY - rect.top) * scaleY

                  ctx.beginPath()
                  ctx.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y)
                  ctx.strokeStyle = brushColor
                  ctx.lineWidth = brushWeight
                  ctx.stroke()
                  ctx.closePath()

                  setStartPos(null)
                  setDrawSquare(false)
                }

                if (drawTriangle && startPos) {
                  const canvas = canvasRef.current
                  if (!canvas) return
                  const ctx = canvas.getContext("2d")
                  if (!ctx) return

                  const rect = canvas.getBoundingClientRect()
                  const scaleX = canvas.width / rect.width
                  const scaleY = canvas.height / rect.height
                  const x = (e.clientX - rect.left) * scaleX
                  const y = (e.clientY - rect.top) * scaleY

                  ctx.beginPath()
                  ctx.moveTo(startPos.x, startPos.y)
                  ctx.lineTo(x, y)
                  ctx.lineTo(startPos.x + (x - startPos.x) / 2, startPos.y - Math.abs(x - startPos.x))
                  ctx.closePath()
                  ctx.strokeStyle = brushColor
                  ctx.lineWidth = brushWeight
                  ctx.stroke()

                  setStartPos(null)
                  setDrawTriangle(false)
                }

                if (drawStar && startPos) {
                  const canvas = canvasRef.current
                  if (!canvas) return
                  const ctx = canvas.getContext("2d")
                  if (!ctx) return

                  const rect = canvas.getBoundingClientRect()
                  const scaleX = canvas.width / rect.width
                  const scaleY = canvas.height / rect.height
                  const x = (e.clientX - rect.left) * scaleX
                  const y = (e.clientY - rect.top) * scaleY

                  const centerX = startPos.x
                  const centerY = startPos.y
                  const dx = x - centerX
                  const dy = y - centerY
                  const outerRadius = Math.sqrt(dx * dx + dy * dy)
                  const innerRadius = outerRadius / 2.5
                  const spikes = 5

                  ctx.beginPath()
                  for (let i = 0; i < spikes * 2; i++) {
                    const angle = (Math.PI / spikes) * i
                    const radius = i % 2 === 0 ? outerRadius : innerRadius
                    const px = centerX + radius * Math.cos(angle - Math.PI / 2)
                    const py = centerY + radius * Math.sin(angle - Math.PI / 2)
                    if (i === 0) ctx.moveTo(px, py)
                    else ctx.lineTo(px, py)
                  }

                  ctx.closePath()
                  ctx.strokeStyle = brushColor
                  ctx.lineWidth = brushWeight
                  ctx.stroke()

                  setDrawing(false)
                  setStartPos(null)
                  setDrawStar(false)
                }
              }}
              onMouseLeave={() => {
                setDrawing(false)
                setLastDrawPos(null)
                setStartPos(null)
              }}
              className="w-full aspect-video bg-white rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-md mb-4"
            />


            {/* Tools */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
              {/* 灰幕遮罩 */}
              {!players.find((player) => player.name === myname)?.isDrawing && (
                <div className="absolute mt-[58%] h-90 sm:h-128 inset-0 bg-gray-500 opacity-75 z-10 flex items-center justify-center rounded-lg">
                  <span className="text-white font-bold">Only the drawer can use tools</span>
                </div>
              )}
              {/* Color palette */}
              <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Colors</div>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={`w-8 h-8 rounded-md transition-transform border-1 ${brushColor === color ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : ""}`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              handleColorChange(color)
                              setEraserActive(false) // Disable eraser when color is selected
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{color}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              {/* Brush settings */}
              <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
                  Brush Size: {brushWeight}px
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushWeight}
                  onChange={
                    handleBrushWeightChange
                  }
                  onMouseDown={() => {
                    setEraserActive(false)
                    setFillActive(false) // Disable fill when brush size is changed
                  }} // Disable eraser when brush size is changed
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="line-simulate w-full h-[70%] flex items-center justify-between mt-2 align-middle">
                  <div
                    className="w-full h-2 bg-gray-300 rounded-lg items-center justify-center align-middle"
                    style={{                      
                      backgroundColor: brushColor,
                      transition: "width 0.3s ease",
                      height: `${brushWeight}px`,
                      border: '1px solid #ccc', 
                    }}
                  ></div>
                </div>
              </div>

              {/* Tools */}
              <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Tools</div>
                <div className="grid grid-cols-4 gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button ref={buttonEraser} className={`w-10 h-10 bg-white dark:bg-zinc-700 ${eraserActive ? "ring-2 ring-offset-2 ring-indigo-500" : ""} rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer`} onClick={() => {
                          setEraserActive(!eraserActive)
                          setFillActive(false) // Disable fill when eraser is selected
                          setDrawCircle(false)
                          setDrawSquare(false)
                          setDrawTriangle(false)
                          setDrawStar(false)
                        }
                        }>
                          <Eraser className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eraser</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className={`w-10 h-10 bg-white ${fillActive ? "ring-2 ring-offset-2 ring-indigo-500" : ""} dark:bg-zinc-700 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer`} onClick={() => {
                            setFillActive(true)
                            setEraserActive(false) // Disable eraser when fill is selected
                            setDrawCircle(false)
                            setDrawSquare(false)
                            setDrawTriangle(false)
                            setDrawStar(false)
                          }}>
                          <PaintBucket className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fill</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer" onClick={() => {
                            Redo()
                            setEraserActive(false)
                            setFillActive(false)
                            setDrawCircle(false)
                            setDrawSquare(false)
                            setDrawTriangle(false)
                            setDrawStar(false)
                          }}>
                          <RotateCcw className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Undo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer" onClick={() => {
                          clearCanvas()
                          setEraserActive(false)
                          setFillActive(false)
                          setDrawCircle(false)
                          setDrawSquare(false)
                          setDrawTriangle(false)
                          setDrawStar(false)
                          }}>
                          <Trash className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear All</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Shapes */}
              <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Shapes</div>
                <div className="grid grid-cols-4 gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className={`w-10 h-10 bg-white dark:bg-zinc-700 rounded-md flex items-center justify-center ${drawCircle ? "ring-2 ring-offset-2 ring-indigo-500" : ""} hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer`} onClick={() => {
                          setDrawCircle(true)
                          setDrawSquare(false)
                          setDrawTriangle(false)
                          setDrawStar(false)
                          setEraserActive(false) // Disable eraser when shape is selected
                          setFillActive(false) // Disable fill when shape is selected
                        }}>
                          <Circle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Circle</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className={`w-10 h-10 bg-white dark:bg-zinc-700 rounded-md flex items-center justify-center ${drawSquare ? "ring-2 ring-offset-2 ring-indigo-500" : ""} hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer`} onClick={() => {
                          setDrawCircle(false)
                          setDrawSquare(true)
                          setDrawTriangle(false)
                          setDrawStar(false)
                          setEraserActive(false) // Disable eraser when shape is selected
                          setFillActive(false) // Disable fill when shape is selected
                        }}>
                          <Square className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Square</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className={`w-10 h-10 bg-white dark:bg-zinc-700 rounded-md flex items-center justify-center ${drawTriangle ? "ring-2 ring-offset-2 ring-indigo-500" : ""} hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer`} onClick={() => {
                          setDrawCircle(false)
                          setDrawSquare(false)
                          setDrawTriangle(true)
                          setDrawStar(false)
                          setEraserActive(false) // Disable eraser when shape is selected
                          setFillActive(false) // Disable fill when shape is selected
                        }}>
                          <Triangle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Triangle</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className={`w-10 h-10 bg-white dark:bg-zinc-700 rounded-md flex items-center justify-center ${drawStar ? "ring-2 ring-offset-2 ring-indigo-500" : ""} hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors hover:cursor-pointer`} onClick={() => {
                          setDrawCircle(false)
                          setDrawSquare(false)
                          setDrawTriangle(false)
                          setDrawStar(true)
                          setEraserActive(false) // Disable eraser when shape is selected
                          setFillActive(false) // Disable fill when shape is selected
                        }}>
                          <Star className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Star</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Button
                variant="outline"
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-300 hover:cursor-pointer dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 dark:text-indigo-300 dark:border-indigo-700"
                onClick={() => {
                  socketRef.current?.send(JSON.stringify({
                    type: "showHint",
                    hintLevel: showHint + 1,
                    word: currentWord,
                  }))
                  setShowHint(showHint + 1)
                }}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Show Hint
              </Button>
              <Button
                variant="outline"
                className="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300 hover:cursor-pointer dark:bg-amber-900/30 dark:hover:bg-amber-800/50 dark:text-amber-300 dark:border-amber-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                New Word
              </Button>
              <Button
                variant="outline"
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300 hover:cursor-pointer dark:bg-rose-900/30 dark:hover:bg-rose-800/50 dark:text-rose-300 dark:border-rose-700"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Turn
              </Button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="w-full md:w-1/4 flex flex-col overflow-hidden">
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-xl p-4 h-full flex flex-col">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">Chat</h2>

            {/* Messages auto scroll when change */}
            <div ref={messageScrollRef} className="flex-1 max-h-155 h-full overflow-auto mb-4 pr-2 space-y-1 [&::scrollbar-width]:w-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
              {chatMessages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
            </div>

            {/* Input */}
            <div className="relative">
              <input
                id="chatInput"
                type="text"
                placeholder="Type your guess..."
                className="w-full p-3 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={handleKeyDown}
                disabled={currentDrawer === myname || guessed} // Disable input if not the current player or guessed
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                onClick={handleSendChat}
              >
                <Send className="h-5 w-5" />
              </button>
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

        --shaking: horizontal-shaking 0.2s ease-in-out;

        @keyframes horizontal-shaking {
          0% { transform: translateX(0) }
          25% { transform: translateX(5px) }
          50% { transform: translateX(-5px) }
          75% { transform: translateX(5px) }
          100% { transform: translateX(0) }
          }
      `}</style>
    </div>
  )
}
