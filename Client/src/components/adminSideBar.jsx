"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  Settings,
  BarChart3,
  FileCheck,
  Target,
  History,
  Download,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAvatarUrl } from "@/utils/avatarUtils"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "./LanguageSwitcher"

export function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const sidebarItems = [
    {
      label: "Dashboard",
      tab: "overview",
      icon: BarChart3,
      route: "/admin",
      color: "text-blue-400",
    },
    {
      label: "Proof Moderation",
      tab: "proofs",
      icon: FileCheck,
      route: "/admin/proof-moderation",
      color: "text-orange-400",
    },
    {
      label: "Challenges & Quizzes",
      tab: "challenges",
      icon: Target,
      route: "/adminSection/QuizzChallenge",
      color: "text-green-400",
    },
    {
      label: "SDG Management",
      tab: "odds",
      icon: Settings,
      route: "/adminSection/SdgManagement",
      color: "text-purple-400",
    },
    {
      label: "User Moderation",
      tab: "users",
      icon: Users,
      route: "/adminSection/UserModeration",
      color: "text-cyan-400",
    },
    {
      label: "Messages",
      tab: "messages",
      icon: MessageSquare,
      route: "/adminSection/MessageManagement",
      color: "text-indigo-400",
    },
    {
      label: "Advanced Statistics",
      tab: "stats",
      icon: TrendingUp,
      route: "/adminSection/Statistics",
      color: "text-pink-400",
    },
    {
      label: "History",
      tab: "history",
      icon: History,
      route: "/adminSection/History",
      color: "text-yellow-400",
    },
    {
      label: "Data Export",
      tab: "export",
      icon: Download,
      route: "/adminSection/Export",
      color: "text-red-400",
    },
  ]

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  const isActive = (route) => {
    return location.pathname === route
  }

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-72"} bg-gradient-to-b from-zinc-900/95 to-zinc-800/95 backdrop-blur-sm border-r border-zinc-700/50 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative`}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 z-10 bg-zinc-800 border border-zinc-700 rounded-full p-1 hover:bg-zinc-700"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Header */}
      <div className="p-6 border-b border-zinc-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
                Admin Panel
              </h1>
              <p className="text-xs text-zinc-400">Management Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-zinc-700/50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
            <AvatarImage 
              src={getAvatarUrl(user?.avatar)} 
              alt={user?.username} 
            />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs">
                  Administrator
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-red-400 hover:text-red-300"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.route)

          return (
            <Button
              key={item.tab}
              variant="ghost"
              className={`w-full ${collapsed ? "px-2" : "justify-start px-4"} py-3 h-auto transition-all duration-200 ${
                active
                  ? `bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 ${item.color} shadow-lg`
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => navigate(item.route)}
            >
              <Icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"} ${active ? item.color : ""}`} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {active && !collapsed && <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
            </Button>
          )
        })}
      </nav>

      {/* Language Switcher at bottom */}
      <div className="p-4 border-t border-zinc-700">
        <div className={`${collapsed ? "flex justify-center" : ""}`}>
          <LanguageSwitcher 
            variant="ghost" 
            size="sm" 
            className={`${collapsed ? "w-auto px-2" : "w-full justify-start"} text-zinc-400 hover:text-white`}
          />
        </div>
      </div>
    </aside>
  )
}
