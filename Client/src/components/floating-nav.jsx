"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "./LanguageSwitcher"

export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const navItems = [
    { name: t('navigation.about'), href: "#about" },
    { name: "Key Features", href: "#key_features" },
    { name: "Objectives", href: "#objectives" },
    { name: "Scoring System", href: "#scoring_system" },
    { name: t('navigation.contact'), href: "#contact" },
  ]

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const scrollToSection = (href) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      navigate(href)
    }
    handleNavClick()
  }

  const handleLoginClick = () => {
    navigate("/login")
  }

  return (
    <>
      <motion.div
        className="fixed top-6 right-6 z-50 opacity-100 max-w-[calc(100vw-3rem)]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative px-4 py-3 rounded-full bg-zinc-800/80 backdrop-blur-md border border-zinc-700/50 shadow-lg w-fit mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur opacity-50"></div>

          {isMobile ? (
            <div className="relative flex items-center justify-between min-w-[260px] max-w-[90vw]">
              <a href="/" className="font-bold text-lg whitespace-nowrap">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  The SDG
                </span>
                <span className="text-white"> Wheel</span>
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 ml-4"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          ) : (
            <div className="relative flex items-center gap-1 flex-wrap lg:flex-nowrap">
              <a href="/" className="font-bold text-lg mr-4 whitespace-nowrap">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  The SDG
                </span>
                <span className="text-white"> Wheel</span>
              </a>
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="px-2 py-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  {item.name}
                </button>
              ))}
              <LanguageSwitcher variant="ghost" size="sm" className="mx-2" />
              <Button
                size="sm"
                onClick={handleLoginClick}
                className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 border-0"
              >
                {t('navigation.login')}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile menu */}
      {isMobile && (
        <motion.div
          className={`fixed inset-0 z-40 bg-black/90 backdrop-blur-md ${isOpen ? "block" : "hidden"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="px-8 py-4 text-2xl font-medium text-white hover:text-purple-400 transition-colors"
              >
                {item.name}
              </button>
            ))}
            <div className="my-4">
              <LanguageSwitcher variant="ghost" size="lg" />
            </div>
            <Button
              onClick={handleLoginClick}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 border-0"
            >
              {t('navigation.login')}
            </Button>
          </div>
        </motion.div>
      )}
    </>
  )
}
