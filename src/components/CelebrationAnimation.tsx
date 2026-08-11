import { useEffect, useState } from 'react'
import { Sparkles, Star, Zap } from 'lucide-react'

interface Props {
  show: boolean
  onComplete?: () => void
}

export function CelebrationAnimation({ show, onComplete }: Props) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  // Generate random confetti particles
  const confetti = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    rotation: Math.random() * 360,
    color: ['text-amber-400', 'text-emerald-400', 'text-blue-400', 'text-purple-400', 'text-pink-400'][
      Math.floor(Math.random() * 5)
    ],
  }))

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* Center burst effect */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center animate-ping">
          <Sparkles className="w-16 h-16 text-amber-400 opacity-75" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <Star className="w-20 h-20 text-amber-500" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-12 h-12 text-yellow-300 animate-bounce" />
        </div>
      </div>

      {/* Confetti particles */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) translateX(${particle.left - 50}vw)`,
          }}
        >
          <div
            className={`${particle.color} animate-confetti-fall`}
            style={{
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          >
            {particle.id % 3 === 0 ? (
              <Sparkles className="w-4 h-4" />
            ) : particle.id % 3 === 1 ? (
              <Star className="w-3 h-3" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-current" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
