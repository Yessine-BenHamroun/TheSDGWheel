"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import SDGSegment from "./SDGSegment"

const sdgData = [
  { id: 1, title: "No Poverty", fullTitle: "End poverty in all its forms everywhere", color: "#E5243B", icon: "🏠" },
  { id: 2, title: "Zero Hunger", fullTitle: "End hunger, achieve food security", color: "#DDA63A", icon: "🌾" },
  { id: 3, title: "Good Health", fullTitle: "Ensure healthy lives and well-being", color: "#4C9F38", icon: "❤️" },
  {
    id: 4,
    title: "Quality Education",
    fullTitle: "Ensure inclusive and equitable education",
    color: "#C5192D",
    icon: "📚",
  },
  { id: 5, title: "Gender Equality", fullTitle: "Achieve gender equality", color: "#FF3A21", icon: "⚖️" },
  { id: 6, title: "Clean Water", fullTitle: "Ensure water and sanitation for all", color: "#26BDE2", icon: "💧" },
  { id: 7, title: "Clean Energy", fullTitle: "Ensure access to affordable clean energy", color: "#FCC30B", icon: "⚡" },
  { id: 8, title: "Decent Work", fullTitle: "Promote sustained economic growth", color: "#A21942", icon: "💼" },
  { id: 9, title: "Innovation", fullTitle: "Build resilient infrastructure", color: "#FD6925", icon: "🏭" },
  {
    id: 10,
    title: "Reduced Inequalities",
    fullTitle: "Reduce inequality within countries",
    color: "#DD1367",
    icon: "📊",
  },
  {
    id: 11,
    title: "Sustainable Cities",
    fullTitle: "Make cities inclusive and sustainable",
    color: "#FD9D24",
    icon: "🏙️",
  },
  {
    id: 12,
    title: "Responsible Consumption",
    fullTitle: "Ensure sustainable consumption patterns",
    color: "#BF8B2E",
    icon: "♻️",
  },
  { id: 13, title: "Climate Action", fullTitle: "Take urgent action on climate change", color: "#3F7E44", icon: "🌍" },
  { id: 14, title: "Life Below Water", fullTitle: "Conserve and use oceans sustainably", color: "#0A97D9", icon: "🐟" },
  {
    id: 15,
    title: "Life on Land",
    fullTitle: "Protect and restore terrestrial ecosystems",
    color: "#56C02B",
    icon: "🌳",
  },
  {
    id: 16,
    title: "Peace & Justice",
    fullTitle: "Promote peaceful and inclusive societies",
    color: "#00689D",
    icon: "⚖️",
  },
  { id: 17, title: "Partnerships", fullTitle: "Strengthen global partnerships", color: "#19486A", icon: "🤝" },
]

export function SDGWheel({ isSpinning = false, selectedSDG = null, onSpinComplete = null }) {
  const [isMobile, setIsMobile] = useState(false)
  const [wheelSize, setWheelSize] = useState(600)
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const audioContextRef = useRef(null)
  const tickIntervalRef = useRef(null)
  const lastRotationRef = useRef(0)
  const [rotationSpeed, setRotationSpeed] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const lastSegmentRef = useRef(-1)
  const segmentAngle = (2 * Math.PI) / sdgData.length // Declare segmentAngle here

  useEffect(() => {
    setIsClient(true)
  }, [])

  const createTickSound = () => {
    if (!isClient || typeof window === "undefined") return

    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return
        audioContextRef.current = new AudioContext()
      }

      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(400, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05)

      // Low-pass filter for softer, warmer sound
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(1000, ctx.currentTime)

      // Softer attack and longer decay for Wheel of Fortune style
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.005)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.08)
    } catch (error) {
      console.warn("Audio not supported:", error)
    }
  }

  const createWheelOfFortuneSound = () => {
    if (!isClient || typeof window === "undefined") return

    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return
        audioContextRef.current = new AudioContext()
      }

      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      // Create a 4-second sound effect with varying tick frequency
      const duration = 4 // 4 seconds to match animation
      const tickCount = 0
      const totalTicks = 60 // Total number of ticks over 4 seconds

      const playTick = (time, intensity = 1) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        // Wheel of Fortune style tick sound
        oscillator.frequency.setValueAtTime(400 * intensity, time)
        oscillator.frequency.exponentialRampToValueAtTime(200 * intensity, time + 0.05)

        // Low-pass filter for softer, warmer sound
        filter.type = "lowpass"
        filter.frequency.setValueAtTime(1000, time)

        // Volume decreases over time as wheel slows down
        const volume = 0.08 * intensity
        gainNode.gain.setValueAtTime(0, time)
        gainNode.gain.linearRampToValueAtTime(volume, time + 0.005)
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08)

        oscillator.start(time)
        oscillator.stop(time + 0.08)
      }

      // Schedule ticks with decreasing frequency over 4 seconds
      for (let i = 0; i < totalTicks; i++) {
        const progress = i / totalTicks
        // Start fast, slow down exponentially
        const timeOffset = progress * progress * duration
        const intensity = Math.max(0.3, 1 - progress * 0.7) // Fade intensity

        setTimeout(() => {
          playTick(ctx.currentTime, intensity)
        }, timeOffset * 1000)
      }
    } catch (error) {
      console.warn("Audio not supported:", error)
    }
  }

  useEffect(() => {
    if (isAnimating && isClient) {
      createWheelOfFortuneSound()
    }
  }, [isAnimating, isClient])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      let size
      if (window.innerWidth < 768) {
        size = window.innerWidth < 480 ? Math.min(300, window.innerWidth - 40) : Math.min(350, window.innerWidth - 60)
      } else {
        const availableWidth = window.innerWidth - 100
        const availableHeight = window.innerHeight - 200
        const maxSize = Math.min(availableWidth, availableHeight, 600)
        size = Math.max(400, maxSize)
      }
      setWheelSize(size)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isSpinning && selectedSDG) {
      setIsAnimating(true)
      const targetId = selectedSDG.oddId || selectedSDG.id
      const targetIndex = sdgData.findIndex((sdg) => sdg.id === targetId)

      console.log("🎯 Backend selected SDG:", targetId)
      console.log("🎯 Found at index:", targetIndex)
      console.log("🎯 SDG data:", sdgData[targetIndex])
      console.log("🎯 Segment angle (degrees):", (segmentAngle * 180) / Math.PI)

      if (targetIndex === -1) {
        console.error("❌ Target SDG not found in sdgData:", targetId)
        return
      }

      const segmentCenterAngle = targetIndex * segmentAngle + segmentAngle / 2
      const arrowAngle = -Math.PI / 2 // -90 degrees (top position)
      const targetAngle = arrowAngle - segmentCenterAngle
      const fullRotations = 8
      const finalRotation = targetAngle - fullRotations * 2 * Math.PI

      console.log("🔄 Segment center angle (degrees):", (segmentCenterAngle * 180) / Math.PI)
      console.log("🔄 Target angle (degrees):", (targetAngle * 180) / Math.PI)
      console.log("🔄 Final rotation (degrees):", (finalRotation * 180) / Math.PI)

      setTimeout(() => {
        setRotation(finalRotation)
        setIsAnimating(false)
        if (onSpinComplete) onSpinComplete(targetId)
      }, 4000)
      setRotation(finalRotation)
    } else if (selectedSDG && !isSpinning) {
      const targetId = selectedSDG.oddId || selectedSDG.id
      const targetIndex = sdgData.findIndex((sdg) => sdg.id === targetId)
      if (targetIndex !== -1) {
        const segmentCenterAngle = targetIndex * segmentAngle + segmentAngle / 2
        const arrowAngle = -Math.PI / 2
        const targetAngle = arrowAngle - segmentCenterAngle
        setRotation(targetAngle)
      }
    }
  }, [isSpinning, selectedSDG])

  const center = { x: wheelSize / 2, y: wheelSize / 2 }
  const outerRadius = wheelSize * 0.45
  const innerRadius = wheelSize * 0.15

  return (
    <motion.div
      className="relative flex items-center justify-center p-4"
      style={{
        width: `${wheelSize + 100}px`,
        height: `${wheelSize + 100}px`,
        minWidth: `${wheelSize + 100}px`,
        minHeight: `${wheelSize + 100}px`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {!isMobile && (
        <>
          <div
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 blur-3xl animate-pulse"
            style={{
              width: `${wheelSize + 80}px`,
              height: `${wheelSize + 80}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute rounded-full bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-green-500/15 blur-2xl"
            style={{
              width: `${wheelSize + 40}px`,
              height: `${wheelSize + 40}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: "pulse 3s ease-in-out infinite alternate",
            }}
          />
        </>
      )}

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
        <div className="relative">
          <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-t-[40px] border-l-transparent border-r-transparent border-t-gradient-to-r from-red-500 to-red-600 drop-shadow-2xl filter blur-[0.5px]"></div>
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[35px] border-l-transparent border-r-transparent border-t-red-500 ml-[4px] -mt-[8px] drop-shadow-lg"></div>
          <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-red-400 ml-[8px] -mt-[7px]"></div>
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[21px] border-l-transparent border-r-transparent border-t-white ml-[12px] -mt-[7px]"></div>
        </div>
      </div>

      <div 
        className="relative rounded-full overflow-hidden border-4 border-white/20 shadow-2xl backdrop-blur-sm flex items-center justify-center"
        style={{
          width: `${wheelSize}px`,
          height: `${wheelSize}px`,
          minWidth: `${wheelSize}px`,
          minHeight: `${wheelSize}px`,
        }}
      >
        <svg
          width={wheelSize}
          height={wheelSize}
          viewBox={`0 0 ${wheelSize} ${wheelSize}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `rotate(${rotation}rad)`,
            transition: isAnimating ? "transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
            filter: "drop-shadow(0 0 30px rgba(139, 92, 246, 0.4))",
            display: "block",
            aspectRatio: "1 / 1",
          }}
        >
          <circle cx={center.x} cy={center.y} r={outerRadius + 5} fill="rgba(0,0,0,0.1)" />

          {sdgData.map((sdg, idx) => {
            const startAngle = idx * segmentAngle
            const endAngle = startAngle + segmentAngle
            const isSelected = selectedSDG && sdg.id === (selectedSDG.oddId || selectedSDG.id)
            return (
              <SDGSegment
                key={sdg.id}
                angle={segmentAngle}
                color={sdg.color}
                icon={sdg.icon}
                title={sdg.id}
                radius={outerRadius}
                center={center}
                startAngle={startAngle}
                endAngle={endAngle}
                isSelected={isSelected}
              />
            )
          })}

          <defs>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
              <stop offset="100%" stopColor="#6F0059" stopOpacity="1" />
            </radialGradient>
            <filter id="centerShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.4" />
            </filter>
          </defs>

          <circle cx={center.x} cy={center.y} r={innerRadius + 5} fill="rgba(255,255,255,0.1)" />
          <circle
            cx={center.x}
            cy={center.y}
            r={innerRadius}
            fill="url(#centerGradient)"
            stroke="#ffffff"
            strokeWidth={4}
            filter="url(#centerShadow)"
          />

          <text
            x={center.x}
            y={center.y - 12}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={wheelSize * 0.035}
            fontWeight="800"
            fill="#ffffff"
            style={{
              fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
              letterSpacing: "1px",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
            }}
          >
            THE SDG
          </text>
          <text
            x={center.x}
            y={center.y + 16}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={wheelSize * 0.032}
            fontWeight="600"
            fill="#ffffff"
            style={{
              fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
              letterSpacing: "2px",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
            }}
          >
            WHEEL
          </text>
        </svg>
      </div>

      {!isMobile && (
        <>
          <div
            className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce opacity-60"
            style={{
              top: `${-16}px`,
              right: `${-16}px`,
            }}
          ></div>
          <div
            className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500 animate-bounce opacity-60"
            style={{
              bottom: `${-12}px`,
              left: `${-12}px`,
              animationDelay: "0.5s",
            }}
          ></div>
          <div
            className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse opacity-40"
            style={{
              top: "25%",
              left: `${-24}px`,
            }}
          ></div>
          <div
            className="absolute w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse opacity-40"
            style={{
              bottom: "25%",
              right: `${-24}px`,
              animationDelay: "1s",
            }}
          />
        </>
      )}
    </motion.div>
  )
}