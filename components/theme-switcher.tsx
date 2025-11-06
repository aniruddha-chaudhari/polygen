"use client"

import { Moon, Sun } from "lucide-react"

interface ThemeSwitcherProps {
  theme: "dark" | "light"
  setTheme: (theme: "dark" | "light") => void
}

export function ThemeSwitcher({ theme, setTheme }: ThemeSwitcherProps) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 hover:bg-muted rounded-md transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
