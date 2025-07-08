"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import ApiService from "@/services/api"
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CircleOff,
  Command,
  Cpu,
  Database,
  Download,
  Globe,
  HardDrive,
  Hexagon,
  LineChart,
  Lock,
  MessageSquare,
  Mic,
  Moon,
  Radio,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sun,
  Terminal,
  Wifi,
  Zap,
  LogOut,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [theme, setTheme] = useState("dark")
  const [systemStatus, setSystemStatus] = useState(85)
  const [cpuUsage, setCpuUsage] = useState(42)
  const [memoryUsage, setMemoryUsage] = useState(68)
  const [networkStatus, setNetworkStatus] = useState(92)
  const [securityLevel, setSecurityLevel] = useState(75)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 30)
      setMemoryUsage(Math.floor(Math.random() * 20) + 60)
      setNetworkStatus(Math.floor(Math.random() * 15) + 80)
      setSystemStatus(Math.floor(Math.random() * 10) + 80)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Particle effect with your project's colors
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = []
    const particleCount = 50

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        // Use your project's purple/pink colors
        const hue = Math.random() * 60 + 270 // 270-330 range for purples and pinks
        this.color = `hsl(${hue}, 70%, 60%)`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleLogout = () => {
    logout() // Call the logout from auth context
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system.",
    })
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white overflow-hidden">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects - Using your project's style */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Background particle effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-pink-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-purple-400 font-mono text-sm tracking-wider">SYSTEM INITIALIZING</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        {/* Header - Updated with your design */}
        <header className="flex items-center justify-between py-4 border-b border-zinc-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                The SDG Wheel
              </span>
              <span className="text-white"> Dashboard</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-1 bg-zinc-800/50 rounded-full px-3 py-1.5 border border-zinc-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search systems..."
                className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-purple-500 rounded-full animate-pulse"></span>
              </Button>

              {/* <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-400 hover:text-white">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button> */}

              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-white">
                <LogOut className="h-5 w-5" />
              </Button>

              <Avatar>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username || "User"} />
                <AvatarFallback className="bg-zinc-700 text-purple-400">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        {user && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome {user.username}! 👋
            </h1>
            <p className="text-zinc-400">
              {user.country && `From ${user.country} • `}
              Level: {user.level || 'BEGINNER'} • 
              Points: {user.totalPoints || 0}
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Updated with glassmorphic design */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 h-full transition-all duration-300 hover:border-purple-500/50">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

              <div className="relative p-4">
                <nav className="space-y-2">
                  <NavItem icon={Command} label="Dashboard" active />
                  <NavItem icon={Activity} label="Diagnostics" />
                  <NavItem icon={Database} label="Data Center" />
                  <NavItem icon={Globe} label="Network" />
                  <NavItem icon={Shield} label="Security" />
                  <NavItem icon={Terminal} label="Console" />
                  <NavItem icon={MessageSquare} label="Communications" />
                  <NavItem icon={Settings} label="Settings" />
                </nav>

                <div className="mt-8 pt-6 border-t border-zinc-700/50">
                  <div className="text-xs text-zinc-500 mb-2 font-mono">SYSTEM STATUS</div>
                  <div className="space-y-3">
                    <StatusItem label="Core Systems" value={systemStatus} color="purple" />
                    <StatusItem label="Security" value={securityLevel} color="green" />
                    <StatusItem label="Network" value={networkStatus} color="blue" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7">
            <div className="grid gap-6">
              {/* System overview - Updated with glassmorphic design */}
              <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                <div className="relative">
                  <div className="border-b border-zinc-700/50 p-6 pb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-purple-500" />
                        System Overview
                      </h2>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="bg-zinc-800/50 text-purple-400 border-purple-500/50 text-xs"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1 animate-pulse"></div>
                          LIVE
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <MetricCard
                        title="CPU Usage"
                        value={cpuUsage}
                        icon={Cpu}
                        trend="up"
                        color="purple"
                        detail="3.8 GHz | 12 Cores"
                      />
                      <MetricCard
                        title="Memory"
                        value={memoryUsage}
                        icon={HardDrive}
                        trend="stable"
                        color="pink"
                        detail="16.4 GB / 24 GB"
                      />
                      <MetricCard
                        title="Network"
                        value={networkStatus}
                        icon={Wifi}
                        trend="down"
                        color="blue"
                        detail="1.2 GB/s | 42ms"
                      />
                    </div>

                    <div className="mt-8">
                      <Tabs defaultValue="performance" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <TabsList className="bg-zinc-800/50 p-1">
                            <TabsTrigger
                              value="performance"
                              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-purple-400"
                            >
                              Performance
                            </TabsTrigger>
                            <TabsTrigger
                              value="processes"
                              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-purple-400"
                            >
                              Processes
                            </TabsTrigger>
                            <TabsTrigger
                              value="storage"
                              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-purple-400"
                            >
                              Storage
                            </TabsTrigger>
                          </TabsList>

                          <div className="flex items-center space-x-2 text-xs text-zinc-400">
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
                              CPU
                            </div>
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-pink-500 mr-1"></div>
                              Memory
                            </div>
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                              Network
                            </div>
                          </div>
                        </div>

                        <TabsContent value="performance" className="mt-0">
                          <div className="h-64 w-full relative bg-zinc-800/30 rounded-lg border border-zinc-700/50 overflow-hidden">
                            <PerformanceChart />
                            <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-sm rounded-md px-3 py-2 border border-zinc-700/50">
                              <div className="text-xs text-zinc-400">System Load</div>
                              <div className="text-lg font-mono text-purple-400">{cpuUsage}%</div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="processes" className="mt-0">
                          <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/50 overflow-hidden">
                            <div className="grid grid-cols-12 text-xs text-zinc-400 p-3 border-b border-zinc-700/50 bg-zinc-800/50">
                              <div className="col-span-1">PID</div>
                              <div className="col-span-4">Process</div>
                              <div className="col-span-2">User</div>
                              <div className="col-span-2">CPU</div>
                              <div className="col-span-2">Memory</div>
                              <div className="col-span-1">Status</div>
                            </div>

                            <div className="divide-y divide-zinc-700/30">
                              <ProcessRow
                                pid="1024"
                                name="sdg_wheel_core.exe"
                                user="SYSTEM"
                                cpu={12.4}
                                memory={345}
                                status="running"
                              />
                              <ProcessRow
                                pid="1842"
                                name="challenge_service.exe"
                                user="SYSTEM"
                                cpu={8.7}
                                memory={128}
                                status="running"
                              />
                              <ProcessRow
                                pid="2156"
                                name="user_manager.exe"
                                user="ADMIN"
                                cpu={5.2}
                                memory={96}
                                status="running"
                              />
                              <ProcessRow
                                pid="3012"
                                name="scoring_engine.exe"
                                user="SYSTEM"
                                cpu={3.8}
                                memory={84}
                                status="running"
                              />
                              <ProcessRow
                                pid="4268"
                                name="web_interface.exe"
                                user="USER"
                                cpu={15.3}
                                memory={256}
                                status="running"
                              />
                              <ProcessRow
                                pid="5124"
                                name="analytics_service.exe"
                                user="ADMIN"
                                cpu={22.1}
                                memory={512}
                                status="running"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="storage" className="mt-0">
                          <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/50 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <StorageItem name="System Drive (C:)" total={512} used={324} type="SSD" />
                              <StorageItem name="Data Drive (D:)" total={2048} used={1285} type="HDD" />
                              <StorageItem name="Backup Drive (E:)" total={4096} used={1865} type="HDD" />
                              <StorageItem name="External Drive (F:)" total={1024} used={210} type="SSD" />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Alerts - Updated with glassmorphic design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-white flex items-center mb-4">
                      <Shield className="mr-2 h-5 w-5 text-green-500" />
                      Security Status
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-400">Firewall</div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-400">Intrusion Detection</div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-400">Encryption</div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-400">Threat Database</div>
                        <div className="text-sm text-purple-400">
                          Updated <span className="text-zinc-500">12 min ago</span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-zinc-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">Security Level</div>
                          <div className="text-sm text-purple-400">{securityLevel}%</div>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${securityLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-white flex items-center mb-4">
                      <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                      System Alerts
                    </h3>

                    <div className="space-y-3">
                      <AlertItem
                        title="Security Scan Complete"
                        time="14:32:12"
                        description="No threats detected in system scan"
                        type="info"
                      />
                      <AlertItem
                        title="High User Activity"
                        time="13:45:06"
                        description="Unusual spike in SDG wheel spins detected"
                        type="warning"
                      />
                      <AlertItem
                        title="System Update Available"
                        time="09:12:45"
                        description="Version 2.1.3 ready to install"
                        type="update"
                      />
                      <AlertItem
                        title="Backup Completed"
                        time="04:30:00"
                        description="User data backup successful"
                        type="success"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Communications - Updated with glassmorphic design */}
              <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                <div className="relative">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
                      Communications Log
                    </h3>
                    <Badge variant="outline" className="bg-zinc-800/50 text-blue-400 border-blue-500/50">
                      4 New Messages
                    </Badge>
                  </div>

                  <div className="px-6 pb-4">
                    <div className="space-y-3">
                      <CommunicationItem
                        sender="System Administrator"
                        time="15:42:12"
                        message="Scheduled maintenance will occur at 02:00. All systems will be temporarily offline."
                        avatar="https://via.placeholder.com/40x40"
                        unread
                      />
                      <CommunicationItem
                        sender="Security Module"
                        time="14:30:45"
                        message="Unusual login attempt blocked from IP 192.168.1.45. Added to watchlist."
                        avatar="https://via.placeholder.com/40x40"
                        unread
                      />
                      <CommunicationItem
                        sender="SDG Analytics"
                        time="12:15:33"
                        message="Weekly engagement report: 15% increase in challenge completions."
                        avatar="https://via.placeholder.com/40x40"
                        unread
                      />
                      <CommunicationItem
                        sender="Data Center"
                        time="09:05:18"
                        message="Backup verification complete. All data integrity checks passed."
                        avatar="https://via.placeholder.com/40x40"
                        unread
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-700/50 p-4">
                    <div className="flex items-center w-full space-x-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button size="icon" className="bg-purple-600 hover:bg-purple-700">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - Updated with glassmorphic design */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {/* System time */}
              <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 border-b border-zinc-700/50">
                    <div className="text-center">
                      <div className="text-xs text-zinc-500 mb-1 font-mono">SYSTEM TIME</div>
                      <div className="text-3xl font-mono text-purple-400 mb-1">{formatTime(currentTime)}</div>
                      <div className="text-sm text-zinc-400">{formatDate(currentTime)}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
                        <div className="text-xs text-zinc-500 mb-1">Uptime</div>
                        <div className="text-sm font-mono text-zinc-200">14d 06:42:18</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
                        <div className="text-xs text-zinc-500 mb-1">Time Zone</div>
                        <div className="text-sm font-mono text-zinc-200">UTC-08:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                <div className="relative p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton icon={Shield} label="Security Scan" />
                    <ActionButton icon={RefreshCw} label="Sync Data" />
                    <ActionButton icon={Download} label="Backup" />
                    <ActionButton icon={Terminal} label="Console" />
                  </div>
                </div>
              </div>

              {/* Resource allocation */}
              <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                <div className="relative p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Resource Allocation</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-zinc-400">Processing Power</div>
                        <div className="text-xs text-purple-400">42% allocated</div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          style={{ width: "42%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-zinc-400">Memory Allocation</div>
                        <div className="text-xs text-pink-400">68% allocated</div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: "68%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-zinc-400">Network Bandwidth</div>
                        <div className="text-xs text-blue-400">35% allocated</div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-700/50">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-zinc-400">Priority Level</div>
                        <div className="flex items-center">
                          <Slider defaultValue={[3]} max={5} step={1} className="w-24 mr-2" />
                          <span className="text-purple-400">3/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment controls */}
              <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                <div className="relative p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Environment Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Radio className="text-purple-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-zinc-400">Power Management</Label>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lock className="text-purple-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-zinc-400">Security Protocol</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="text-purple-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-zinc-400">Power Saving Mode</Label>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleOff className="text-purple-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-zinc-400">Auto Shutdown</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for nav items
function NavItem({ icon: Icon, label, active }) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start ${active ? "bg-zinc-800/70 text-purple-400" : "text-zinc-400 hover:text-white"}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

// Component for status items
function StatusItem({ label, value, color }) {
  const getColor = () => {
    switch (color) {
      case "purple":
        return "from-purple-500 to-pink-500"
      case "green":
        return "from-green-500 to-emerald-500"
      case "blue":
        return "from-blue-500 to-indigo-500"
      default:
        return "from-purple-500 to-pink-500"
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-zinc-400">{label}</div>
        <div className="text-xs text-zinc-400">{value}%</div>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${getColor()} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

// Component for metric cards
function MetricCard({ title, value, icon: Icon, trend, color, detail }) {
  const getColor = () => {
    switch (color) {
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      case "pink":
        return "from-pink-500 to-purple-500 border-pink-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      default:
        return "from-purple-500 to-pink-500 border-purple-500/30"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <BarChart3 className="h-4 w-4 text-amber-500" />
      case "down":
        return <BarChart3 className="h-4 w-4 rotate-180 text-green-500" />
      case "stable":
        return <LineChart className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className={`bg-zinc-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-zinc-400">{title}</div>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-white to-zinc-300">
        {value}%
      </div>
      <div className="text-xs text-zinc-500">{detail}</div>
      <div className="absolute bottom-2 right-2 flex items-center">{getTrendIcon()}</div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-purple-500 to-pink-500"></div>
    </div>
  )
}

// Performance chart component
function PerformanceChart() {
  return (
    <div className="h-full w-full flex items-end justify-between px-4 pt-4 pb-8 relative">
      {/* Y-axis labels */}
      <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-4">
        <div className="text-xs text-zinc-500">100%</div>
        <div className="text-xs text-zinc-500">75%</div>
        <div className="text-xs text-zinc-500">50%</div>
        <div className="text-xs text-zinc-500">25%</div>
        <div className="text-xs text-zinc-500">0%</div>
      </div>

      {/* X-axis grid lines */}
      <div className="absolute left-0 right-0 top-0 h-full flex flex-col justify-between py-4 px-10">
        <div className="border-b border-zinc-700/30 w-full"></div>
        <div className="border-b border-zinc-700/30 w-full"></div>
        <div className="border-b border-zinc-700/30 w-full"></div>
        <div className="border-b border-zinc-700/30 w-full"></div>
        <div className="border-b border-zinc-700/30 w-full"></div>
      </div>

      {/* Chart bars */}
      <div className="flex-1 h-full flex items-end justify-between px-2 z-10">
        {Array.from({ length: 24 }).map((_, i) => {
          const cpuHeight = Math.floor(Math.random() * 60) + 20
          const memHeight = Math.floor(Math.random() * 40) + 40
          const netHeight = Math.floor(Math.random() * 30) + 30

          return (
            <div key={i} className="flex space-x-0.5">
              <div
                className="w-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm"
                style={{ height: `${cpuHeight}%` }}
              ></div>
              <div
                className="w-1 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-sm"
                style={{ height: `${memHeight}%` }}
              ></div>
              <div
                className="w-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
                style={{ height: `${netHeight}%` }}
              ></div>
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
        <div className="text-xs text-zinc-500">00:00</div>
        <div className="text-xs text-zinc-500">06:00</div>
        <div className="text-xs text-zinc-500">12:00</div>
        <div className="text-xs text-zinc-500">18:00</div>
        <div className="text-xs text-zinc-500">24:00</div>
      </div>
    </div>
  )
}

// Process row component
function ProcessRow({ pid, name, user, cpu, memory, status }) {
  return (
    <div className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-zinc-800/50">
      <div className="col-span-1 text-zinc-500">{pid}</div>
      <div className="col-span-4 text-zinc-300">{name}</div>
      <div className="col-span-2 text-zinc-400">{user}</div>
      <div className="col-span-2 text-purple-400">{cpu}%</div>
      <div className="col-span-2 text-pink-400">{memory} MB</div>
      <div className="col-span-1">
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
          {status}
        </Badge>
      </div>
    </div>
  )
}

// Storage item component
function StorageItem({ name, total, used, type }) {
  const percentage = Math.round((used / total) * 100)

  return (
    <div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-zinc-300">{name}</div>
        <Badge variant="outline" className="bg-zinc-700/50 text-zinc-300 border-zinc-600/50 text-xs">
          {type}
        </Badge>
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-zinc-500">
            {used} GB / {total} GB
          </div>
          <div className="text-xs text-zinc-400">{percentage}%</div>
        </div>
        <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-purple-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="text-zinc-500">Free: {total - used} GB</div>
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-zinc-400 hover:text-zinc-100">
          Details
        </Button>
      </div>
    </div>
  )
}

// Alert item component
function AlertItem({ title, time, description, type }) {
  const getTypeStyles = () => {
    switch (type) {
      case "info":
        return { icon: AlertCircle, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
      case "warning":
        return { icon: AlertCircle, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" }
      case "error":
        return { icon: AlertCircle, color: "text-red-500 bg-red-500/10 border-red-500/30" }
      case "success":
        return { icon: Shield, color: "text-green-500 bg-green-500/10 border-green-500/30" }
      case "update":
        return { icon: Download, color: "text-purple-500 bg-purple-500/10 border-purple-500/30" }
      default:
        return { icon: AlertCircle, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
    }
  }

  const { icon: Icon, color } = getTypeStyles()

  return (
    <div className="flex items-start space-x-3">
      <div className={`mt-0.5 p-1 rounded-full ${color.split(" ")[1]} ${color.split(" ")[2]}`}>
        <Icon className={`h-3 w-3 ${color.split(" ")[0]}`} />
      </div>
      <div>
        <div className="flex items-center">
          <div className="text-sm font-medium text-zinc-200">{title}</div>
          <div className="ml-2 text-xs text-zinc-500">{time}</div>
        </div>
        <div className="text-xs text-zinc-400">{description}</div>
      </div>
    </div>
  )
}

// Communication item component
function CommunicationItem({ sender, time, message, avatar, unread }) {
  return (
    <div className={`flex space-x-3 p-2 rounded-md ${unread ? "bg-zinc-800/50 border border-zinc-700/50" : ""}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar || "/placeholder.svg"} alt={sender} />
        <AvatarFallback className="bg-zinc-700 text-purple-500">{sender.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-200">{sender}</div>
          <div className="text-xs text-zinc-500">{time}</div>
        </div>
        <div className="text-xs text-zinc-400 mt-1">{message}</div>
      </div>
      {unread && (
        <div className="flex-shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
        </div>
      )}
    </div>
  )
}

// Action button component
function ActionButton({ icon: Icon, label }) {
  return (
    <Button
      variant="outline"
      className="h-auto py-3 px-3 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 flex flex-col items-center justify-center space-y-1 w-full"
    >
      <Icon className="h-5 w-5 text-purple-500" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}
