"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"
import api from "../services/api"
import AlertService from "../services/alertService"

export function ContactForm() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      AlertService.warning(t('contactForm.validation.missingInfo.title'), t('contactForm.validation.missingInfo.message'));
      return;
    }

    setIsSubmitting(true)

    try {
      AlertService.loading(t('contactForm.sending.title'), t('contactForm.sending.message'));
      
      await api.submitContactMessage(formData)
      
      AlertService.close();
      AlertService.success(t('contactForm.success.title'), t('contactForm.success.message'));

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Contact form error:', error)
      AlertService.close();
      
      if (error.message.includes('email')) {
        AlertService.error(t('contactForm.errors.invalidEmail.title'), t('contactForm.errors.invalidEmail.message'));
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        AlertService.networkError();
      } else {
        AlertService.error(t('contactForm.errors.sendFailed.title'), error.message || t('contactForm.errors.sendFailed.message'));
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-6 transition-all duration-300 hover:border-purple-500/50">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

        <div className="relative">
          <h3 className="text-2xl font-bold mb-6">{t('contactForm.title')}</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                name="name"
                placeholder={t('contactForm.form.namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder={t('contactForm.form.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Input
                name="subject"
                placeholder={t('contactForm.form.subjectPlaceholder')}
                value={formData.subject}
                onChange={handleChange}
                required
                className="bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                name="message"
                placeholder={t('contactForm.form.messagePlaceholder')}
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
                className="bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>{t('contactForm.form.sendingButton')}</>
              ) : (
                <>
                  {t('contactForm.form.sendButton')} <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
