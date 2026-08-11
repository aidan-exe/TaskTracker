import { useEffect } from 'react'
import { useTaskStore } from '../store'

interface Props {
  children: React.ReactNode
}

export function ThemeProvider({ children }: Props) {
  const darkMode = useTaskStore((s) => s.darkMode)

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  return <>{children}</>
}
