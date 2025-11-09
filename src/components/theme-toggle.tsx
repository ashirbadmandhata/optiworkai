
"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === 'dark') {
      setTheme("system")
    } else {
      setTheme('light')
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="flex items-center gap-2 w-full justify-start px-2 py-1.5 text-sm h-auto">
        {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
        {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
        {theme === 'system' && <Monitor className="h-[1.2rem] w-[1.2rem]" />}
        <span className="md:hidden">Toggle Theme</span>
    </Button>
  )
}
