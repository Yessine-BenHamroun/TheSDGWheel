"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

// SDG data with colors and icons
const sdgData = [
  { id: 1, title: "No Poverty", color: "#E5243B", icon: "🏠" },
  { id: 2, title: "Zero Hunger", color: "#DDA63A", icon: "🌾" },
  { id: 3, title: "Good Health", color: "#4C9F38", icon: "❤️" },
  { id: 4, title: "Quality Education", color: "#C5192D", icon: "📚" },
  { id: 5, title: "Gender Equality", color: "#FF3A21", icon: "⚖️" },
  { id: 6, title: "Clean Water", color: "#26BDE2", icon: "💧" },
  { id: 7, title: "Clean Energy", color: "#FCC30B", icon: "⚡" },
  { id: 8, title: "Decent Work", color: "#A21942", icon: "💼" },
  { id: 9, title: "Innovation", color: "#FD6925", icon: "🏭" },
  { id: 10, title: "Reduced Inequalities", color: "#DD1367", icon: "📊" },
  { id: 11, title: "Sustainable Cities", color: "#FD9D24", icon: "🏙️" },
  { id: 12, title: "Responsible Consumption", color: "#BF8B2E", icon: "♻️" },
  { id: 13, title: "Climate Action", color: "#3F7E44", icon: "🌍" },
  { id: 14, title: "Life Below Water", color: "#0A97D9", icon: "🐟" },
  { id: 15, title: "Life on Land", color: "#56C02B", icon: "🌳" },
  { id: 16, title: "Peace & Justice", color: "#00689D", icon: "⚖️" },
  { id: 17, title: "Partnerships", color: "#19486A", icon: "🤝" },
]

export function SDGWheel() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      const size = Math.min(600, window.innerWidth * 0.8)
      canvas.width = size
      canvas.height = size
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
    }

    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    let rotation = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = canvas.width * 0.45
    const innerRadius = canvas.width * 0.15
    const segmentAngle = (2 * Math.PI) / sdgData.length

    // Particle system for futuristic effect
    const particles = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background particles
      particles.forEach((particle) => {
        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y += Math.sin(particle.angle) * particle.speed

        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = "#8B5CF6"
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Draw outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius + 20)
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.1)")
      gradient.addColorStop(0.7, "rgba(139, 92, 246, 0.3)")
      gradient.addColorStop(1, "rgba(139, 92, 246, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius + 20, 0, Math.PI * 2)
      ctx.fill()

      // Draw SDG segments
      sdgData.forEach((sdg, index) => {
        const startAngle = rotation + index * segmentAngle
        const endAngle = startAngle + segmentAngle

        // Create gradient for each segment
        const segmentGradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius)
        segmentGradient.addColorStop(0, sdg.color + "40")
        segmentGradient.addColorStop(0.7, sdg.color + "80")
        segmentGradient.addColorStop(1, sdg.color + "FF")

        // Draw segment
        ctx.beginPath()
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
        ctx.closePath()
        ctx.fillStyle = segmentGradient
        ctx.fill()

        // Add segment border with glow
        ctx.strokeStyle = "#FFFFFF40"
        ctx.lineWidth = 2
        ctx.stroke()

        // Add inner glow
        ctx.shadowColor = sdg.color
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.shadowBlur = 0

        // Draw SDG number and icon
        const midAngle = startAngle + segmentAngle / 2
        const textRadius = (outerRadius + innerRadius) / 2
        const textX = centerX + Math.cos(midAngle) * textRadius
        const textY = centerY + Math.sin(midAngle) * textRadius

        ctx.save()
        ctx.translate(textX, textY)
        ctx.rotate(midAngle + Math.PI / 2)

        // Draw SDG number
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 16px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(sdg.id.toString(), 0, -10)

        // Draw icon
        ctx.font = "20px Arial"
        ctx.fillText(sdg.icon, 0, 10)

        ctx.restore()
      })

      // Draw center circle with holographic effect
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius)
      centerGradient.addColorStop(0, "rgba(111, 0, 89, 0.89)")
      centerGradient.addColorStop(0.6, "rgba(111, 0, 89, 0.89)")
      centerGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")
      ctx.fillStyle = centerGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
      ctx.fill()

      // Add center glow
      ctx.strokeStyle = "#8B5CF6"
      ctx.lineWidth = 3
      ctx.shadowColor = "#8B5CF6"
      ctx.shadowBlur = 15
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw center text
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 18px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("The SDG", centerX, centerY - 10)
      ctx.font = "18px Helvetica"
      ctx.fillText("Wheel", centerX, centerY + 10)

      // Add rotating energy rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = outerRadius + 30 + i * 15
        const ringRotation = rotation * (1 + i * 0.3)

        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - i * 0.1})`
        ctx.lineWidth = 2
        ctx.setLineDash([10, 10])
        ctx.lineDashOffset = ringRotation * 50
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Update rotation
      rotation += 0.005

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 blur-3xl animate-pulse"></div>

      {/* Canvas container */}
      <div className="relative rounded-full overflow-hidden border-2 border-purple-500/30 shadow-2xl">
        <canvas ref={canvasRef} className="block" style={{ filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))" }} />

        {/* Interactive indicator
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 border border-purple-500/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-white">Interactive & Engaging</span>
        </div> */}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce opacity-60"></div>
      <div
        className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500 animate-bounce opacity-60"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div className="absolute top-1/4 -left-6 w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse opacity-40"></div>
      <div
        className="absolute bottom-1/4 -right-6 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse opacity-40"
        style={{ animationDelay: "1s" }}
      ></div>
    </motion.div>
  )
}
