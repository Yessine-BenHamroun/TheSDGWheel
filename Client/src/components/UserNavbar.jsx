"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  Activity,
  Bell,
  Command,
  Database,
  Globe,
  Hexagon,
  LogOut,
  Search,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import NotificationDropdown from "./NotificationDropdown"
import { getAvatarUrl } from "@/utils/avatarUtils"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "./LanguageSwitcher"

// Component for nav items
function NavItem({ icon: Icon, label, active, onClick, href, mobile = false, onMobileClick }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      navigate(href)
    }
    
    // Close mobile menu if this is a mobile nav item
    if (mobile && onMobileClick) {
      onMobileClick()
    }
  }

  return (
    <Button
      variant="ghost"
      className={`justify-start ${mobile ? 'w-full' : ''} ${active ? "bg-zinc-800/70 text-purple-400" : "text-zinc-400 hover:text-white"}`}
      onClick={handleClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

export default function UserNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  const handleLogout = () => {
    logout() // Call the logout from auth context
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system.",
    })
    navigate("/login")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-zinc-900/95 backdrop-blur-md border-b border-zinc-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0 min-w-[180px] sm:min-w-[220px]">
            <Hexagon className="h-8 w-8 text-purple-500 flex-shrink-0" />
            <span className="text-xl font-bold hidden sm:block whitespace-nowrap">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                The SDG Wheel
              </span>
            </span>
            <span className="text-lg font-bold sm:hidden whitespace-nowrap">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                SDG Wheel
              </span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
            <NavItem 
              icon={Command} 
              label={t('navigation.dashboard')} 
              active={location.pathname === "/dashboard"} 
              href="/dashboard" 
            />
            <NavItem 
              icon={Activity} 
              label={t('wheel.spinButton.spin')} 
              active={location.pathname === "/wheel"} 
              href="/wheel" 
            />
            <NavItem 
              icon={Database} 
              label={t('navigation.leaderboard')} 
              active={location.pathname === "/leaderboard"} 
              href="/leaderboard" 
            />
            <NavItem 
              icon={Globe} 
              label={t('navigation.community')} 
              active={location.pathname === "/community-feed"} 
              href="/community-feed" 
            />
            <NavItem 
              icon={Settings} 
              label={t('navigation.settings')} 
              active={location.pathname === "/settings"} 
              href="/settings" 
            />
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher variant="ghost" size="sm" />
            
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-1 bg-zinc-800/50 rounded-full px-3 py-1.5 border border-zinc-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search systems..."
                className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-zinc-500"
              />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Logout Button */}
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={getAvatarUrl(user?.avatar)} 
                alt={user?.username || "User"} 
              />
              <AvatarFallback className="bg-zinc-700 text-purple-400 text-sm">
                {user?.username ? user.username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-700/50 bg-zinc-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
                          <NavItem 
              icon={Command} 
              label={t('navigation.dashboard')} 
              active={location.pathname === "/dashboard"} 
              href="/dashboard" 
              mobile={true}
              onMobileClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem 
              icon={Activity} 
              label={t('wheel.spinButton.spin')} 
              active={location.pathname === "/wheel"} 
              href="/wheel" 
              mobile={true}
              onMobileClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem 
              icon={Database} 
              label={t('navigation.leaderboard')} 
              active={location.pathname === "/leaderboard"} 
              href="/leaderboard" 
              mobile={true}
              onMobileClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem 
              icon={Globe} 
              label={t('navigation.community')} 
              active={location.pathname === "/community-feed"} 
              href="/community-feed" 
              mobile={true}
              onMobileClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem 
              icon={Settings} 
              label={t('navigation.settings')} 
              active={location.pathname === "/settings"} 
              href="/settings" 
              mobile={true}
              onMobileClick={() => setIsMobileMenuOpen(false)}
            />
              
              {/* Language Switcher for Mobile */}
              <div className="px-2 py-2">
                <LanguageSwitcher variant="ghost" size="sm" className="w-full justify-start" />
              </div>
              
              {/* Mobile Search */}
              <div className="flex items-center space-x-1 bg-zinc-800/50 rounded-full px-3 py-1.5 border border-zinc-700/50 backdrop-blur-sm mt-2">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search systems..."
                  className="bg-transparent border-none focus:outline-none text-sm flex-1 placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 