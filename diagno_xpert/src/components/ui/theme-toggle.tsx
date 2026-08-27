"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Only render after mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center rounded-md p-2 w-10 h-10 bg-transparent border border-gray-300 dark:border-gray-700">
        <span className="sr-only">Loading theme</span>
      </button>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-md p-2 w-10 h-10 bg-transparent border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" && <Sun className="h-5 w-5 " />}
      {theme === "dark" && <Moon className="h-5 w-5 " />}
      {theme === "system" && <Monitor className="h-5 w-5" />}
    </button>
  )
}
