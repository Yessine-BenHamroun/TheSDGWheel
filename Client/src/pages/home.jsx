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


export default function Portfolio() {
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
              <span className="block">Welcome to</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
                The SDG Wheel
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-[600px]">
              A gamified web application to raise awareness about the 17 Sustainable Development Goals (SDGs) with a special focus on climate-related themes.
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
                  Explore the Wheel <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          <SectionHeading title="About The SDG Wheel" subtitle="Gamifying sustainable development awareness" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <SDGWheel />

            <div className="space-y-6">
              <GlassmorphicCard>
                <h3 className="text-2xl font-bold mb-4 text-gradient bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
                  Project Overview
                </h3>
                <p className="text-lg text-zinc-300">
                  The SDG Wheel is a gamified web application designed to raise awareness among citizens, particularly
                  youth, about the 17 Sustainable Development Goals (SDGs), with a special focus on climate-related
                  themes.
                </p>
                <p className="text-lg text-zinc-300 mt-4">
                  Users spin an interactive wheel representing the 17 SDGs, draw challenges or quizzes, respond, justify
                  their actions with proof (photos/videos), accumulate points, and progress in their sustainable
                  engagement profile.
                </p>

                <div className="grid grid-cols-1 gap-4 mt-8">
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">Target Audience</div>
                    <div className="font-medium">Citizens & Youth interested in sustainability</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">Focus Areas</div>
                    <div className="font-medium text-green-500">Climate SDGs: 13, 7, 6, 12, 15, 2</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">Engagement Method</div>
                    <div className="font-medium">Gamification with badges, rankings & rewards</div>
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
          <SectionHeading title="Key Features" subtitle="Core functionalities of The SDG Wheel" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-2">SDG Wheel</h3>
              <p className="text-zinc-400">
                Interactive circular wheel with 17 segments featuring SDG colors and icons. Random drawing influenced by customizable weights.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Challenges & Quizzes</h3>
              <p className="text-zinc-400">
                Database of content with 2 types: multiple-choice quizzes and challenges requiring proof justification.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-2">User Progress</h3>
              <p className="text-zinc-400">
                Cumulative scores, badges per validated SDG, and progression levels: Explorer, Engaged Actor, SDG Ambassador.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-bold mb-2">User Accounts</h3>
              <p className="text-zinc-400">
                Account creation with username/email, optional avatar and country, personal dashboard with scores and history.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Monthly Podium</h3>
              <p className="text-zinc-400">
                Top 10 users ranking with points + proof bonuses + community votes. "Wall of Eco Heroes" section.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Proof System</h3>
              <p className="text-zinc-400">
                Photo/video upload or external links with admin validation interface and community voting system.
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
          <SectionHeading title="Project Objectives" subtitle="Goals and impact targets" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Climate Awareness</h3>
              </div>
              <p className="text-zinc-300">
                Raise awareness about the 17 SDGs in a playful way, with special focus on climate themes 
                (SDG 13, 7, 6, 12, 15, 2).
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Individual Action</h3>
              </div>
              <p className="text-zinc-300">
                Encourage concrete and visible individual actions that contribute to sustainable development goals.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Engagement Recognition</h3>
              </div>
              <p className="text-zinc-300">
                Value engagement through badges, rankings, and rewards to motivate continued participation.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-xl font-bold">Adaptable Tool</h3>
              </div>
              <p className="text-zinc-300">
                Provide an adaptable tool for targeted campaigns and educational initiatives.
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
          <SectionHeading title="Scoring System" subtitle="Rewards" />
          <div className="mt-16">
            <GlassmorphicCard>
              <h3 className="text-2xl font-bold mb-6 text-center">Hybrid Scoring System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">+20</div>
                  <div className="text-sm text-zinc-400">Base Points</div>
                  <div className="text-xs text-zinc-500">Challenge completion with validated proof</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">+1</div>
                  <div className="text-sm text-zinc-400">Per Vote</div>
                  <div className="text-xs text-zinc-500">Community votes (max +10 points)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">+15</div>
                  <div className="text-sm text-zinc-400">Top 3 Bonus</div>
                  <div className="text-xs text-zinc-500">Monthly top 3 voted challenges</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">🏆</div>
                  <div className="text-sm text-zinc-400">Recognition</div>
                  <div className="text-xs text-zinc-500">Real actions + community approval</div>
                </div>
              </div>
            </GlassmorphicCard>
          </div>

          <div className="mt-16 space-y-8">
            {/* <GlassmorphicCard>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-green-400">Frontend</h3>
                  <div className="space-y-2">
                    <SkillBadge name="React.js" level={95} />
                    <SkillBadge name="Tailwind CSS" level={90} />
                    <SkillBadge name="Framer Motion" level={85} />
                    <SkillBadge name="TypeScript" level={88} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-blue-400">Backend</h3>
                  <div className="space-y-2">
                    <SkillBadge name="Node.js" level={90} />
                    <SkillBadge name="Express.js" level={92} />
                    <SkillBadge name="MongoDB" level={85} />
                    <SkillBadge name="JWT Auth" level={88} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-purple-400">Features</h3>
                  <div className="space-y-2">
                    <SkillBadge name="Gamification" level={95} />
                    <SkillBadge name="File Upload" level={90} />
                    <SkillBadge name="Admin Panel" level={88} />
                    <SkillBadge name="Responsive" level={95} />
                  </div>
                </div>
              </div>
            </GlassmorphicCard> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassmorphicCard>
                <h3 className="text-xl font-bold mb-4">User Journey</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                    <span>Spin the interactive SDG wheel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                    <span>Receive challenge or quiz</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                    <span>Complete and provide proof</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">4</div>
                    <span>Earn points and badges</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">5</div>
                    <span>Progress through levels</span>
                  </div>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard>
                <h3 className="text-xl font-bold mb-4">Progression Levels</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <span className="text-xl">🔍</span>
                    </div>
                    <div>
                      <div className="font-medium">Explorer</div>
                      <div className="text-sm text-zinc-400">Starting your sustainability journey</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-xl">⚡</span>
                    </div>
                    <div>
                      <div className="font-medium">Engaged Actor</div>
                      <div className="text-sm text-zinc-400">Actively participating in challenges</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                      <span className="text-xl">👑</span>
                    </div>
                    <div>
                      <div className="font-medium">SDG Ambassador</div>
                      <div className="text-sm text-zinc-400">Leading by example in sustainability</div>
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
          <SectionHeading title="Get Involved" subtitle="Join the sustainable development movement" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <GlassmorphicCard>
              <h3 className="text-2xl font-bold mb-6">Project Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Focus</div>
                    <div className="font-medium">17 UN Sustainable Development Goals</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Target</div>
                    <div className="font-medium">Climate-aware citizens & youth</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Method</div>
                    <div className="font-medium">Gamified learning & engagement</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <h4 className="text-lg font-medium mb-4">Project Status</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span>In active development - Join us in creating positive impact!</span>
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">The SDG</span>
              <span className="text-white"> Wheel</span>
            </a>
            <p className="text-sm text-zinc-500 mt-2">
              © {new Date().getFullYear()} The SDG Wheel Project. Building a sustainable future together.
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
