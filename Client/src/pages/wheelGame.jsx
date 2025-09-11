"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import AlertService from "../services/alertService"
import { motion, AnimatePresence } from "framer-motion"
import { Play, RotateCcw, CheckCircle, XCircle, Upload, FileText, Trophy, Camera } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { SDGWheel } from "../components/sdg-wheel"
import { MouseFollower } from "../components/mouse-follower"
import { ScrollProgress } from "../components/scroll-progress"
import { useToast } from "../hooks/use-toast"
import UserNavbar from "../components/UserNavbar"
import QuizModal from "../components/QuizModal"
import ChallengeModal from "../components/ChallengeModal"
import { useTranslation } from "react-i18next"

export default function WheelGame() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedODD, setSelectedODD] = useState(null)
  const [currentScenario, setCurrentScenario] = useState(null) // 'QUIZ' or 'CHALLENGE'
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [pendingChallenges, setPendingChallenges] = useState([])
  const [canSpinToday, setCanSpinToday] = useState(true)
  const [nextSpinTime, setNextSpinTime] = useState(null)

  // Store spin result temporarily until wheel animation completes
  const [pendingSpinResult, setPendingSpinResult] = useState(null)
  
  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const [showQuizModal, setShowQuizModal] = useState(false)
  
  // Challenge state
  const [challengeDecision, setChallengeDecision] = useState(null) // 'accepted', 'declined', null
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  
  // Proof submission modal state
  const [showProofModal, setShowProofModal] = useState(false)
  const [selectedChallengeForProof, setSelectedChallengeForProof] = useState(null)
  const [proofText, setProofText] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [proofSubmitting, setProofSubmitting] = useState(false)

  const [odds, setOdds] = useState([])

  useEffect(() => {
    loadODDs()
    loadSpinStatus()
  }, [])

  const loadSpinStatus = async () => {
    if (!isAuthenticated) return
    
    try {
      const status = await ApiService.getSpinStatus()
      setCanSpinToday(status.canSpinToday)
      setNextSpinTime(status.nextSpinTime)
      setPendingChallenges(status.pendingChallenges || [])
      
      if (status.todaysSpin) {
        setSelectedODD(status.todaysSpin.selectedODD)
        setCurrentScenario(status.todaysSpin.scenarioType)
        
        if (status.todaysSpin.scenarioType === 'QUIZ') {
          setCurrentQuiz(status.todaysSpin.quizId)
          setQuizSubmitted(status.todaysSpin.isCompleted)
          if (status.todaysSpin.isCompleted) {
            setQuizResult({
              isCorrect: status.todaysSpin.isQuizCorrect,
              userAnswer: status.todaysSpin.quizAnswer,
              correctAnswer: status.todaysSpin.quizId?.correctAnswer,
              pointsAwarded: status.todaysSpin.pointsAwarded
            })
          }
        } else if (status.todaysSpin.scenarioType === 'CHALLENGE') {
          setCurrentChallenge(status.todaysSpin.challengeId)
          if (status.todaysSpin.challengeAccepted !== undefined) {
            setChallengeDecision(status.todaysSpin.challengeAccepted ? 'accepted' : 'declined')
          }
        }
      }
    } catch (error) {
      console.error("Failed to load spin status:", error)
    }
  }

  const loadODDs = async () => {
    try {
      const oddsData = await ApiService.getAllODDs()
      setOdds(oddsData)
    } catch (error) {
      console.error("Failed to load ODDs:", error)
      // Fallback to default ODDs
      setOdds([
        { oddId: 1, name: { en: "No Poverty" }, color: "#E5243B" },
        { oddId: 2, name: { en: "Zero Hunger" }, color: "#DDA63A" },
        { oddId: 3, name: { en: "Good Health" }, color: "#4C9F38" },
        { oddId: 4, name: { en: "Quality Education" }, color: "#C5192D" },
        { oddId: 5, name: { en: "Gender Equality" }, color: "#FF3A21" },
        { oddId: 6, name: { en: "Clean Water" }, color: "#26BDE2" },
        { oddId: 7, name: { en: "Clean Energy" }, color: "#FCC30B" },
        { oddId: 8, name: { en: "Decent Work" }, color: "#A21942" },
        { oddId: 9, name: { en: "Innovation" }, color: "#FD6925" },
        { oddId: 10, name: { en: "Reduced Inequalities" }, color: "#DD1367" },
        { oddId: 11, name: { en: "Sustainable Cities" }, color: "#FD9D24" },
        { oddId: 12, name: { en: "Responsible Consumption" }, color: "#BF8B2E" },
        { oddId: 13, name: { en: "Climate Action" }, color: "#3F7E44" },
        { oddId: 14, name: { en: "Life Below Water" }, color: "#0A97D9" },
        { oddId: 15, name: { en: "Life on Land" }, color: "#56C02B" },
        { oddId: 16, name: { en: "Peace & Justice" }, color: "#00689D" },
        { oddId: 17, name: { en: "Partnerships" }, color: "#19486A" },
      ])
    }
  }

  const handleSpin = async () => {
    if (!isAuthenticated) {
      AlertService.warning(t('wheel.loginRequired'), t('wheel.loginRequiredMessage'));
      return
    }

    if (!canSpinToday) {
      AlertService.info(t('wheel.dailySpinUsed'), t('wheel.cannotSpin'));
      return
    }

    try {
      setIsSpinning(true)

      // Get spin result from backend
      const spinResult = await ApiService.spinWheel()
      const { odd, scenarioType, quiz, challenge } = spinResult

      console.log("🎲 Backend spin result:", spinResult)

      // Store the result temporarily - don't show scenario until wheel stops
      setPendingSpinResult({ odd, scenarioType, quiz, challenge })

      // Only set the selected ODD for wheel animation
      setSelectedODD(odd)

      // Update spin status
      setCanSpinToday(false)
      setNextSpinTime(spinResult.nextSpinTime)
      
    } catch (error) {
      console.error("Spin error:", error)
      setIsSpinning(false)
      
      if (error.message.includes('already spun')) {
        setCanSpinToday(false)
        AlertService.info(t('wheel.dailySpinUsed'), error.message);
      } else {
        AlertService.error(t('wheel.spinFailed'), error.message || t('wheel.spinFailedMessage'));
      }
    }
  }

  // Quiz handlers
  const handleQuizSubmit = async () => {
    if (selectedAnswer === null) {
      AlertService.warning("Answer Required", "Please select an answer before submitting your quiz response.");
      return
    }

    try {
      const result = await ApiService.submitQuizAnswer(selectedAnswer)
      setQuizResult(result)
      setQuizSubmitted(true)
      
      if (result.isCorrect) {
        toast({
          title: "Correct Answer! 🎉",
          description: `You earned ${result.pointsAwarded} points!`,
        })
      } else {
        toast({
          title: "Incorrect Answer",
          description: result.explanation,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Quiz submission error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit quiz answer",
        variant: "destructive",
      })
    }
  }

  // Challenge handlers
  const handleAcceptChallenge = async () => {
    try {
      await ApiService.acceptChallenge()
      setChallengeDecision('accepted')
      
      toast({
        title: t('wheel.challenge.accepted'),
        description: t('wheel.challenge.uploadReady'),
      })
      
      // Refresh pending challenges
      loadSpinStatus()
    } catch (error) {
      console.error("Accept challenge error:", error)
      toast({
        title: t('common.error'),
        description: error.message || t('wheel.challenge.acceptError'),
        variant: "destructive",
      })
    }
  }

  const handleDeclineChallenge = async () => {
    try {
      await ApiService.declineChallenge()
      setChallengeDecision('declined')
      
      toast({
        title: t('wheel.challenge.declined'),
        description: t('wheel.challenge.seeTomorrow'),
      })
    } catch (error) {
      console.error("Decline challenge error:", error)
      toast({
        title: t('common.error'),
        description: error.message || t('wheel.challenge.declineError'),
        variant: "destructive",
      })
    }
  }

  // Quiz modal handlers
  const handleQuizModalClose = () => {
    setShowQuizModal(false)
    setCurrentQuiz(null)
    setSelectedAnswer(null)
    setQuizSubmitted(false)
    setQuizResult(null)
  }

  // Challenge modal handlers
  const handleChallengeModalClose = () => {
    setShowChallengeModal(false)
    setCurrentChallenge(null)
    setChallengeDecision(null)
  }

  const handleQuizComplete = (result) => {
    setQuizResult(result)
    // Update user's points in the context if needed
    if (result?.isCorrect && user) {
      // The points are already updated on the backend
      // You might want to refresh user data here if you display points
    }
  }

  const handleChallengeComplete = (result) => {
    setChallengeDecision(result.accepted ? 'accepted' : 'declined')
    // Refresh spin status to get updated pending challenges
    loadSpinStatus()
  }

  // Proof submission handlers
  const handleOpenProofModal = (challenge) => {
    setSelectedChallengeForProof(challenge)
    setShowProofModal(true)
  }

  const handleSubmitProof = async () => {
    if (!proofText.trim() && !proofFile) {
      toast({
        title: "Proof Required",
        description: "Please provide either text description or upload a file",
        variant: "destructive",
      })
      return
    }

    try {
      setProofSubmitting(true)
      const formData = new FormData()
      formData.append('challengeId', selectedChallengeForProof._id)
      formData.append('description', proofText)

      if (proofFile) {
        formData.append('proofFile', proofFile)
      }

      await ApiService.submitChallengeProof(formData)
      
      toast({
        title: "Proof Submitted! 📤",
        description: "Your proof is pending admin verification",
      })
      
      // Reset form and close modal
      setProofText('')
      setProofFile(null)
      setShowProofModal(false)
      setSelectedChallengeForProof(null)
      
      // Refresh pending challenges
      loadSpinStatus()
    } catch (error) {
      console.error("Proof submission error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit proof",
        variant: "destructive",
      })
    } finally {
      setProofSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <MouseFollower />
      <ScrollProgress />
      <UserNavbar />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
              {t('wheel.title')}
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            {t('wheel.description')}
          </p>
        </div>

        {/* Daily Limit Warning */}
        {!canSpinToday && nextSpinTime && (
          <div className="mb-8">
            <Card className="bg-yellow-900/20 border-yellow-500/50">
              <CardContent className="p-4 text-center">
                <p className="text-yellow-400">
                  {t('wheel.dailyLimit')}
                </p>
                <p className="text-sm text-yellow-300 mt-1">
                  {t('wheel.nextSpinTime', { time: new Date(nextSpinTime).toLocaleString() })}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Challenges Alert */}
        {pendingChallenges.filter(challenge => challenge.status === 'PENDING').length > 0 && (
          <div className="mb-8">
            <Card className="bg-blue-900/20 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-blue-400">{t('wheel.pendingChallenges.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-300 mb-4">
                  {t('wheel.pendingChallenges.description', { count: pendingChallenges.filter(challenge => challenge.status === 'PENDING').length })}
                </p>
                <div className="space-y-2">
                  {pendingChallenges
                    .filter(challenge => challenge.status === 'PENDING')
                    .map((challenge) => (
                    <div key={challenge._id} className="flex items-center justify-between bg-blue-900/30 p-3 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-blue-200">{challenge.challenge?.title}</h4>
                        <p className="text-sm text-blue-300">
                          {t('wheel.pendingChallenges.accepted', { date: new Date(challenge.acceptedAt).toLocaleDateString() })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleOpenProofModal(challenge)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t('wheel.pendingChallenges.submitProof')}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submitted Proofs Alert */}
        {pendingChallenges.filter(challenge => challenge.status === 'PROOF_SUBMITTED').length > 0 && (
          <div className="mb-8">
            <Card className="bg-yellow-900/20 border-yellow-500/50">
              <CardHeader>
                <CardTitle className="text-yellow-400">{t('wheel.submittedProofs.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-300 mb-4">
                  {t('wheel.submittedProofs.description', { count: pendingChallenges.filter(challenge => challenge.status === 'PROOF_SUBMITTED').length })}
                </p>
                <div className="space-y-2">
                  {pendingChallenges
                    .filter(challenge => challenge.status === 'PROOF_SUBMITTED')
                    .map((challenge) => (
                    <div key={challenge._id} className="flex items-center justify-between bg-yellow-900/30 p-3 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-yellow-200">{challenge.challenge?.title}</h4>
                        <p className="text-sm text-yellow-300">
                          {t('wheel.submittedProofs.submitted', { date: new Date(challenge.proofSubmittedAt).toLocaleDateString() })}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        {t('wheel.submittedProofs.underReview')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completed Challenges Alert */}
        {pendingChallenges.filter(challenge => ['VERIFIED', 'REJECTED'].includes(challenge.status)).length > 0 && (
          <div className="mb-8">
            <Card className="bg-zinc-900/20 border-zinc-500/50">
              <CardHeader>
                <CardTitle className="text-zinc-300">{t('wheel.completedChallenges.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 mb-4">
                  {t('wheel.completedChallenges.description')}
                </p>
                <div className="space-y-2">
                  {pendingChallenges
                    .filter(challenge => ['VERIFIED', 'REJECTED'].includes(challenge.status))
                    .map((challenge) => (
                    <div key={challenge._id} className={`flex items-center justify-between p-3 rounded-lg ${
                      challenge.status === 'VERIFIED'
                        ? 'bg-green-900/30 border border-green-500/30'
                        : 'bg-red-900/30 border border-red-500/30'
                    }`}>
                      <div>
                        <h4 className={`font-semibold ${
                          challenge.status === 'VERIFIED' ? 'text-green-200' : 'text-red-200'
                        }`}>
                          {challenge.challenge?.title}
                        </h4>
                        <p className={`text-sm ${
                          challenge.status === 'VERIFIED' ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {challenge.status === 'VERIFIED'
                            ? t('wheel.completedChallenges.approved', { 
                                date: new Date(challenge.verifiedAt).toLocaleDateString(),
                                points: challenge.pointsAwarded || 20 
                              })
                            : t('wheel.completedChallenges.rejected', { 
                                date: new Date(challenge.updatedAt).toLocaleDateString() 
                              })
                          }
                        </p>
                        {challenge.status === 'REJECTED' && challenge.adminNotes && (
                          <p className="text-xs text-red-400 mt-1">
                            {t('wheel.completedChallenges.adminFeedback', { feedback: challenge.adminNotes })}
                          </p>
                        )}
                      </div>
                      <Badge className={
                        challenge.status === 'VERIFIED'
                          ? 'bg-green-600/50 text-green-200'
                          : 'bg-red-600/50 text-red-200'
                      }>
                        {challenge.status === 'VERIFIED' ? t('wheel.completedChallenges.approvedBadge') : t('wheel.completedChallenges.rejectedBadge')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
          {/* Wheel */}
          <div className="flex flex-col items-center space-y-20 mt-24">
            <div className="flex items-center justify-center w-full aspect-square max-w-md mx-auto relative z-10">
              <SDGWheel
                isSpinning={isSpinning}
                selectedSDG={selectedODD}
                onSpinComplete={(sdgId) => {
                console.log("🎯 Wheel stopped on SDG:", sdgId)
                console.log("🎯 Backend selected ODD:", selectedODD?.oddId)
                setIsSpinning(false)

                // Apply the pending spin result now that wheel animation is complete
                if (pendingSpinResult) {
                  const { scenarioType, quiz, challenge, odd } = pendingSpinResult
                  
                  if (scenarioType === 'QUIZ') {
                    setCurrentQuiz(quiz)
                    setCurrentScenario(scenarioType)
                    setShowQuizModal(true)
                  } else {
                    setCurrentScenario(scenarioType)
                    setCurrentChallenge(challenge)
                    setShowChallengeModal(true)
                  }

                  // Show success message
                  toast({
                    title: t('wheel.oddSelected.title'),
                    description: t('wheel.oddSelected.description', { 
                      oddId: odd.oddId, 
                      name: odd.name.en, 
                      type: scenarioType 
                    }),
                  })

                  // Clear pending result
                  setPendingSpinResult(null)
                }
              }}
              />
            </div>

            <div className="flex justify-center w-full relative z-50 mt-12">
              <Button
                onClick={handleSpin}
                disabled={isSpinning || !canSpinToday}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full disabled:opacity-50 relative z-50 cursor-pointer"
              >
                {isSpinning ? (
                  <>
                    <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                    {t('wheel.spinButton.spinning')}
                  </>
                ) : !canSpinToday ? (
                  t('wheel.spinButton.dailyLimit')
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    {t('wheel.spinButton.spin')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Scenario Display */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Quiz and Challenge scenarios are now handled by modals */}

              {/* Waiting State */}
              {!currentScenario && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardContent className="p-12 text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-2xl font-bold text-white mb-2">{t('wheel.waitingState.title')}</h3>
                      <p className="text-zinc-400">
                        {t('wheel.waitingState.description')}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Stats */}
            {isAuthenticated && user && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">{t('wheel.userStats.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{user.totalPoints || 0}</div>
                      <div className="text-sm text-zinc-400">{t('wheel.userStats.totalPoints')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{user.badges?.length || 0}</div>
                      <div className="text-sm text-zinc-400">{t('wheel.userStats.badges')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{user.level || "Explorer"}</div>
                      <div className="text-sm text-zinc-400">{t('wheel.userStats.level')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Proof Submission Modal */}
        <AnimatePresence>
          {showProofModal && selectedChallengeForProof && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-800 rounded-xl border border-zinc-700 p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-white mb-4">Submit Challenge Proof</h3>
                
                <div className="mb-4 p-3 bg-zinc-700/50 rounded-lg">
                  <h4 className="font-semibold text-zinc-200">
                    {selectedChallengeForProof.challenge?.title || "Challenge"}
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    {selectedChallengeForProof.challenge?.description || "Complete this challenge and provide proof"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Description of your completion
                    </label>
                    <textarea
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Describe how you completed this challenge..."
                      className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-md p-3 min-h-[80px] resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Upload Photo/Video (optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setProofFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="proof-file-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-700 transition-colors duration-200"
                        onClick={() => document.getElementById('proof-file-input').click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {proofFile ? 'Change File' : 'Choose File'}
                      </Button>
                    </div>
                    {proofFile && (
                      <p className="text-sm text-green-400 mt-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        File selected: {proofFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleSubmitProof}
                      disabled={proofSubmitting || (!proofText.trim() && !proofFile)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      {proofSubmitting ? "Submitting..." : "Submit Proof"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProofModal(false)
                        setProofText('')
                        setProofFile(null)
                        setSelectedChallengeForProof(null)
                      }}
                      className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz Modal */}
        <QuizModal
          quiz={currentQuiz}
          odd={selectedODD}
          isOpen={showQuizModal}
          onClose={handleQuizModalClose}
          onComplete={handleQuizComplete}
        />

        {/* Challenge Modal */}
        <ChallengeModal
          challenge={currentChallenge}
          odd={selectedODD}
          isOpen={showChallengeModal}
          onClose={handleChallengeModalClose}
          onComplete={handleChallengeComplete}
          pendingChallenges={pendingChallenges}
        />
      </div>
    </div>
  )
}
