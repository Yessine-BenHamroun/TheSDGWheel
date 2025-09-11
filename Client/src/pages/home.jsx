import { ArrowRight, Github, Linkedin, Mail, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/project-card"
import { SkillBadge } from "@/components/skill-badge"
import { Timeline } from "@/components/timeline"
import { ContactForm } from "@/components/contact-form"
import { CreativeHero } from "@/components/creative-hero"
import { FloatingNav } from "@/components/floating-nav"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { SectionHeading } from "@/components/section-heading"
import { GlassmorphicCard } from "@/components/glassmorphic-card"
import { SDGWheel } from "@/components/sdg-wheel"
import { useTranslation } from "react-i18next"


export default function Portfolio() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white overflow-hidden">
      <MouseFollower />
      <ScrollProgress />
      <FloatingNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              {/* <div className="relative px-3 py-1 text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                <span className="relative z-10">Software Engineer & Creative Developer</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></span>
              </div> */}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="block">{t('hero.welcome')}</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-[600px]">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                className="relative overflow-hidden group bg-gradient-to-r from-green-500 to-blue-500 border-0"
                onClick={() => {
                  const aboutSection = document.getElementById('about');
                  aboutSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="relative z-10 flex items-center">
                  {t('hero.exploreButton')} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <CreativeHero />
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center items-start p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title={t('about.title')} subtitle={t('about.subtitle')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <SDGWheel />

            <div className="space-y-6">
              <GlassmorphicCard>
                <h3 className="text-2xl font-bold mb-4 text-gradient bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
                  {t('about.projectOverview.title')}
                </h3>
                <p className="text-lg text-zinc-300">
                  {t('about.projectOverview.description1')}
                </p>
                <p className="text-lg text-zinc-300 mt-4">
                  {t('about.projectOverview.description2')}
                </p>

                <div className="grid grid-cols-1 gap-4 mt-8">
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">{t('about.projectOverview.targetAudience.label')}</div>
                    <div className="font-medium">{t('about.projectOverview.targetAudience.value')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">{t('about.projectOverview.focusAreas.label')}</div>
                    <div className="font-medium text-green-500">{t('about.projectOverview.focusAreas.value')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">{t('about.projectOverview.engagementMethod.label')}</div>
                    <div className="font-medium">{t('about.projectOverview.engagementMethod.value')}</div>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="key_features" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title={t('keyFeatures.title')} subtitle={t('keyFeatures.subtitle')} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('keyFeatures.sdgWheel.title')}</h3>
              <p className="text-zinc-400">
                {t('keyFeatures.sdgWheel.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('keyFeatures.challengesQuizzes.title')}</h3>
              <p className="text-zinc-400">
                {t('keyFeatures.challengesQuizzes.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('keyFeatures.userProgress.title')}</h3>
              <p className="text-zinc-400">
                {t('keyFeatures.userProgress.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('keyFeatures.userAccounts.title')}</h3>
              <p className="text-zinc-400">
                {t('keyFeatures.userAccounts.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('keyFeatures.monthlyPodium.title')}</h3>
              <p className="text-zinc-400">
                {t('keyFeatures.monthlyPodium.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('keyFeatures.proofSystem.title')}</h3>
              <p className="text-zinc-400">
                {t('keyFeatures.proofSystem.description')}
              </p>
            </GlassmorphicCard>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="objectives" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title={t('objectives.title')} subtitle={t('objectives.subtitle')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">{t('objectives.climateAwareness.title')}</h3>
              </div>
              <p className="text-zinc-300">
                {t('objectives.climateAwareness.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">{t('objectives.individualAction.title')}</h3>
              </div>
              <p className="text-zinc-300">
                {t('objectives.individualAction.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">{t('objectives.engagementRecognition.title')}</h3>
              </div>
              <p className="text-zinc-300">
                {t('objectives.engagementRecognition.description')}
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-xl font-bold">{t('objectives.adaptableTool.title')}</h3>
              </div>
              <p className="text-zinc-300">
                {t('objectives.adaptableTool.description')}
              </p>
            </GlassmorphicCard>
          </div>

          
        </div>
      </section>

      {/* Scoring System Section */}
      <section id="scoring_system" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title={t('scoringSystem.title')} subtitle={t('scoringSystem.subtitle')} />
          <div className="mt-16">
            <GlassmorphicCard>
              <h3 className="text-2xl font-bold mb-6 text-center">{t('scoringSystem.hybridSystem.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">+20</div>
                  <div className="text-sm text-zinc-400">{t('scoringSystem.hybridSystem.basePoints.label')}</div>
                  <div className="text-xs text-zinc-500">{t('scoringSystem.hybridSystem.basePoints.description')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">+1</div>
                  <div className="text-sm text-zinc-400">{t('scoringSystem.hybridSystem.perVote.label')}</div>
                  <div className="text-xs text-zinc-500">{t('scoringSystem.hybridSystem.perVote.description')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">+15</div>
                  <div className="text-sm text-zinc-400">{t('scoringSystem.hybridSystem.topBonus.label')}</div>
                  <div className="text-xs text-zinc-500">{t('scoringSystem.hybridSystem.topBonus.description')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">🏆</div>
                  <div className="text-sm text-zinc-400">{t('scoringSystem.hybridSystem.recognition.label')}</div>
                  <div className="text-xs text-zinc-500">{t('scoringSystem.hybridSystem.recognition.description')}</div>
                </div>
              </div>
            </GlassmorphicCard>
          </div>

          <div className="mt-16 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassmorphicCard>
                <h3 className="text-xl font-bold mb-4">{t('scoringSystem.userJourney.title')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                    <span>{t('scoringSystem.userJourney.steps.step1')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                    <span>{t('scoringSystem.userJourney.steps.step2')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                    <span>{t('scoringSystem.userJourney.steps.step3')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">4</div>
                    <span>{t('scoringSystem.userJourney.steps.step4')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">5</div>
                    <span>{t('scoringSystem.userJourney.steps.step5')}</span>
                  </div>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard>
                <h3 className="text-xl font-bold mb-4">{t('scoringSystem.progressionLevels.title')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <span className="text-xl">🔍</span>
                    </div>
                    <div>
                      <div className="font-medium">{t('scoringSystem.progressionLevels.explorer.title')}</div>
                      <div className="text-sm text-zinc-400">{t('scoringSystem.progressionLevels.explorer.description')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-xl">⚡</span>
                    </div>
                    <div>
                      <div className="font-medium">{t('scoringSystem.progressionLevels.engagedActor.title')}</div>
                      <div className="text-sm text-zinc-400">{t('scoringSystem.progressionLevels.engagedActor.description')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                      <span className="text-xl">👑</span>
                    </div>
                    <div>
                      <div className="font-medium">{t('scoringSystem.progressionLevels.sdgAmbassador.title')}</div>
                      <div className="text-sm text-zinc-400">{t('scoringSystem.progressionLevels.sdgAmbassador.description')}</div>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title={t('contact.title')} subtitle={t('contact.subtitle')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <GlassmorphicCard>
              <h3 className="text-2xl font-bold mb-6">{t('contact.projectInfo.title')}</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">{t('contact.projectInfo.focus.label')}</div>
                    <div className="font-medium">{t('contact.projectInfo.focus.value')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">{t('contact.projectInfo.target.label')}</div>
                    <div className="font-medium">{t('contact.projectInfo.target.value')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">{t('contact.projectInfo.method.label')}</div>
                    <div className="font-medium">{t('contact.projectInfo.method.value')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <h4 className="text-lg font-medium mb-4">{t('contact.projectStatus.title')}</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span>{t('contact.projectStatus.message')}</span>
                </div>
              </div>
            </GlassmorphicCard>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <a href="/" className="font-bold text-xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">{t('footer.brand.part1')}</span>
              <span className="text-white">{t('footer.brand.part2')}</span>
            </a>
            <p className="text-sm text-zinc-500 mt-2">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
            <a href="https://www.linkedin.com/in/shinekyawkyawaung/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </a>
            <a href="mailto:hello@example.com">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Button>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
  
}
