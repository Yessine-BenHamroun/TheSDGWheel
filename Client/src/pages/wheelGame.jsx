"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
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

export default function WheelGame() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

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
  
  // Challenge state
  const [challengeDecision, setChallengeDecision] = useState(null) // 'accepted', 'declined', null
  
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
      toast({
        title: "Login Required",
        description: "Please login to spin the wheel",
        variant: "destructive",
      })
      return
    }

    if (!canSpinToday) {
      toast({
        title: "Daily Limit Reached",
        description: "You can only spin once per day. Come back tomorrow!",
        variant: "destructive",
      })
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
        toast({
          title: "Daily Limit Reached", 
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to spin the wheel",
          variant: "destructive",
        })
      }
    }
  }

  // Quiz handlers
  const handleQuizSubmit = async () => {
    if (selectedAnswer === null) {
      toast({
        title: "Please Select an Answer",
        description: "Choose one of the options before submitting",
        variant: "destructive",
      })
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
        title: "Challenge Accepted! 💪",
        description: "You can upload proof whenever you're ready",
      })
      
      // Refresh pending challenges
      loadSpinStatus()
    } catch (error) {
      console.error("Accept challenge error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to accept challenge",
        variant: "destructive",
      })
    }
  }

  const handleDeclineChallenge = async () => {
    try {
      await ApiService.declineChallenge()
      setChallengeDecision('declined')
      
      toast({
        title: "Challenge Declined",
        description: "See you tomorrow for another spin!",
      })
    } catch (error) {
      console.error("Decline challenge error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to decline challenge",
        variant: "destructive",
      })
    }
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
              The ODD Wheel
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Spin the wheel to discover your daily challenge or quiz and make a positive impact on the world!
          </p>
        </div>

        {/* Daily Limit Warning */}
        {!canSpinToday && nextSpinTime && (
          <div className="mb-8">
            <Card className="bg-yellow-900/20 border-yellow-500/50">
              <CardContent className="p-4 text-center">
                <p className="text-yellow-400">
                  You've already spun today! Come back tomorrow for another chance.
                </p>
                <p className="text-sm text-yellow-300 mt-1">
                  Next spin available: {new Date(nextSpinTime).toLocaleString()}
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
                <CardTitle className="text-blue-400">Pending Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-300 mb-4">
                  You have {pendingChallenges.filter(challenge => challenge.status === 'PENDING').length} accepted challenge(s) waiting for proof submission:
                </p>
                <div className="space-y-2">
                  {pendingChallenges
                    .filter(challenge => challenge.status === 'PENDING')
                    .map((challenge) => (
                    <div key={challenge._id} className="flex items-center justify-between bg-blue-900/30 p-3 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-blue-200">{challenge.challenge?.title}</h4>
                        <p className="text-sm text-blue-300">
                          Accepted: {new Date(challenge.acceptedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleOpenProofModal(challenge)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Proof
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
                <CardTitle className="text-yellow-400">Proofs Under Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-300 mb-4">
                  You have {pendingChallenges.filter(challenge => challenge.status === 'PROOF_SUBMITTED').length} proof(s) waiting for admin verification:
                </p>
                <div className="space-y-2">
                  {pendingChallenges
                    .filter(challenge => challenge.status === 'PROOF_SUBMITTED')
                    .map((challenge) => (
                    <div key={challenge._id} className="flex items-center justify-between bg-yellow-900/30 p-3 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-yellow-200">{challenge.challenge?.title}</h4>
                        <p className="text-sm text-yellow-300">
                          Submitted: {new Date(challenge.proofSubmittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        Under Review
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Wheel */}
          <div className="flex flex-col items-center space-y-8">
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
                  setCurrentScenario(scenarioType)

                  if (scenarioType === 'QUIZ') {
                    setCurrentQuiz(quiz)
                  } else {
                    setCurrentChallenge(challenge)
                  }

                  // Show success message
                  toast({
                    title: "ODD Selected!",
                    description: `You got ODD ${odd.oddId}: ${odd.name.en}`,
                  })

                  // Clear pending result
                  setPendingSpinResult(null)
                }
              }}
            />

            <Button
              onClick={handleSpin}
              disabled={isSpinning || !canSpinToday}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full disabled:opacity-50"
            >
              {isSpinning ? (
                <>
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                  Spinning...
                </>
              ) : !canSpinToday ? (
                "Daily Limit Reached"
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Spin the Wheel
                </>
              )}
            </Button>
          </div>

          {/* Scenario Display */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Quiz Scenario */}
              {currentScenario === 'QUIZ' && currentQuiz && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-white">Quiz Time! 🧠</CardTitle>
                          <CardDescription className="text-lg">
                            ODD {selectedODD?.oddId}: {selectedODD?.name?.en}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-yellow-500 font-bold">20 points</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!quizSubmitted ? (
                        <>
                          <p className="text-zinc-300 text-lg font-medium">{currentQuiz.question}</p>
                          
                          <div className="space-y-3">
                            {currentQuiz.options.map((option, index) => (
                              <Button
                                key={index}
                                variant={selectedAnswer === index ? "default" : "outline"}
                                className={`w-full justify-start text-left h-auto p-4 ${
                                  selectedAnswer === index 
                                    ? "bg-blue-600 hover:bg-blue-700" 
                                    : "border-zinc-600 hover:border-zinc-500"
                                }`}
                                onClick={() => setSelectedAnswer(index)}
                              >
                                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                                {option}
                              </Button>
                            ))}
                          </div>

                          <Button
                            onClick={handleQuizSubmit}
                            disabled={selectedAnswer === null}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          >
                            Submit Answer
                          </Button>
                        </>
                      ) : (
                        <div className="text-center space-y-4">
                          {quizResult?.isCorrect ? (
                            <div className="text-green-400">
                              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                              <h3 className="text-xl font-bold">Correct! 🎉</h3>
                              <p>You earned {quizResult.pointsAwarded} points!</p>
                            </div>
                          ) : (
                            <div className="text-red-400">
                              <XCircle className="h-16 w-16 mx-auto mb-4" />
                              <h3 className="text-xl font-bold">Incorrect</h3>
                              <p>The correct answer was: {currentQuiz.options[quizResult?.correctAnswer]}</p>
                            </div>
                          )}
                          {currentQuiz.explanation && (
                            <p className="text-zinc-400 text-sm mt-4">{currentQuiz.explanation}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Challenge Scenario */}
              {currentScenario === 'CHALLENGE' && currentChallenge && (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-white">{currentChallenge.title}</CardTitle>
                          <CardDescription className="text-lg">
                            ODD {selectedODD?.oddId}: {selectedODD?.name?.en}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-yellow-500 font-bold">20 points</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-zinc-300 text-lg">{currentChallenge.description}</p>

                      {challengeDecision === null && (
                        <div className="flex space-x-4">
                          <Button
                            onClick={handleAcceptChallenge}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept Challenge
                          </Button>
                          <Button
                            onClick={handleDeclineChallenge}
                            variant="outline"
                            className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {challengeDecision === 'accepted' && (
                        <div className="text-center space-y-4">
                          <div className="text-green-400">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                            <h3 className="text-lg font-bold">Challenge Accepted! 💪</h3>
                            <p className="text-sm">Complete the challenge and submit proof to earn 20 points</p>
                          </div>
                          {(() => {
                            const todaysPendingChallenge = pendingChallenges.find(pc =>
                              pc.challenge?._id === currentChallenge._id
                            );

                            if (todaysPendingChallenge?.status === 'PROOF_SUBMITTED') {
                              return (
                                <Button
                                  disabled
                                  className="bg-yellow-600/50 text-yellow-200 cursor-not-allowed opacity-75"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Pending Review
                                </Button>
                              );
                            } else if (todaysPendingChallenge?.status === 'PENDING') {
                              return (
                                <Button
                                  onClick={() => handleOpenProofModal(todaysPendingChallenge)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Submit Proof
                                </Button>
                              );
                            } else {
                              return (
                                <Button
                                  onClick={() => {
                                    toast({
                                      title: "Error",
                                      description: "Could not find pending challenge. Please refresh the page.",
                                      variant: "destructive",
                                    })
                                  }}
                                  variant="outline"
                                  className="border-zinc-700 text-zinc-300"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Submit Proof
                                </Button>
                              );
                            }
                          })()}
                        </div>
                      )}

                      {challengeDecision === 'declined' && (
                        <div className="text-center space-y-4">
                          <div className="text-gray-400">
                            <XCircle className="h-12 w-12 mx-auto mb-2" />
                            <h3 className="text-lg font-bold">Challenge Declined</h3>
                            <p className="text-sm">See you tomorrow for another spin!</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

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
                      <h3 className="text-2xl font-bold text-white mb-2">Ready to Make an Impact?</h3>
                      <p className="text-zinc-400">
                        Spin the wheel to discover your daily challenge or quiz!
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
                  <CardTitle className="text-white">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{user.totalPoints || 0}</div>
                      <div className="text-sm text-zinc-400">Total Points</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{user.badges?.length || 0}</div>
                      <div className="text-sm text-zinc-400">Badges</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{user.level || "Explorer"}</div>
                      <div className="text-sm text-zinc-400">Level</div>
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
      </div>
    </div>
  )
}
