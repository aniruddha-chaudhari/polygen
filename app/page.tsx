"use client"

import { useState } from "react"
import { LeftSidebar } from "@/components/left-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { PreviewArea } from "@/components/preview-area"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Home() {
  const [mode, setMode] = useState<"template" | "gradient" | "fractal">("gradient")
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [gradientColors, setGradientColors] = useState(["#a78bfa", "#ec4899"])
  const [canvasBackgrounds, setCanvasBackgrounds] = useState<string[]>([])
  const [selectedBgIndex, setSelectedBgIndex] = useState<number | null>(null)
  const [fractalParams, setFractalParams] = useState({
    sides: 6,
    iterations: 5,
    scale: 1,
    rotation: 0,
  })
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme)
    if (typeof window !== "undefined") {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="flex h-screen bg-background text-foreground">
        {/* Top Header - Retro style */}
        <div className="fixed top-0 left-0 right-0 h-14 border-b-4 border-foreground/20 bg-background/95 backdrop-blur flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-sm border-2 border-foreground bg-gradient-to-br from-purple-400 to-pink-500" />
            <span className="text-lg font-black tracking-wider">POLYGEN</span>
          </div>
          <ThemeSwitcher theme={theme} setTheme={handleThemeChange} />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 pt-14">
          {/* Left Sidebar - Collapsible */}
          <div
            className={`transition-all duration-300 border-r-4 border-foreground/10 overflow-hidden ${
              leftSidebarOpen ? "w-64" : "w-0"
            }`}
          >
            <LeftSidebar
              mode={mode}
              setMode={setMode}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              gradientColors={gradientColors}
              setGradientColors={setGradientColors}
              fractalParams={fractalParams}
              setFractalParams={setFractalParams}
            />
          </div>

          {/* Toggle Left Sidebar Button */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="group w-8 border-r-2 border-foreground/10 hover:bg-secondary/50 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!leftSidebarOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Center Canvas Area */}
          <PreviewArea
            mode={mode}
            selectedTemplate={selectedTemplate}
            gradientColors={gradientColors}
            fractalParams={fractalParams}
            canvasBackgrounds={canvasBackgrounds}
            selectedBgIndex={selectedBgIndex}
          />

          {/* Toggle Right Sidebar Button */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="group w-8 border-l-2 border-foreground/10 hover:bg-secondary/50 flex items-center justify-center transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${!rightSidebarOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Right Sidebar - Collapsible */}
          <div
            className={`transition-all duration-300 border-l-4 border-foreground/10 overflow-hidden ${
              rightSidebarOpen ? "w-80" : "w-0"
            }`}
          >
            <RightSidebar
              mode={mode}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              gradientColors={gradientColors}
              setGradientColors={setGradientColors}
              fractalParams={fractalParams}
              setFractalParams={setFractalParams}
              canvasBackgrounds={canvasBackgrounds}
              setCanvasBackgrounds={setCanvasBackgrounds}
              selectedBgIndex={selectedBgIndex}
              setSelectedBgIndex={setSelectedBgIndex}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
