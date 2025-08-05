"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import { motion, AnimatePresence } from "framer-motion"
import { Play, RotateCcw, Trophy, Upload, Camera } from "lucide-react"

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
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [showProofModal, setShowProofModal] = useState(false)
  const [proofData, setProofData] = useState({
    mediaType: "IMAGE",
    url: "",
    file: null,
  })
  const [odds, setOdds] = useState([])

  useEffect(() => {
    loadODDs()
    loadLastSpin()
  }, [])

  const loadLastSpin = async () => {
    if (!isAuthenticated) return
    
    try {
      const lastSpin = await ApiService.getLastWheelSpin()
      if (lastSpin && lastSpin.odd) {
        setSelectedODD(lastSpin.odd)
        setCurrentChallenge(lastSpin.challenge)
      }
    } catch (error) {
      console.error("Failed to load last spin:", error)
    }
  }

  const loadODDs = async () => {
    try {
      const oddsData = await ApiService.getAllODDs()
      setOdds(oddsData)
    } catch (error) {
      console.error("Failed to load ODDs:", error)
             // Fallback to default ODDs - matching SDG wheel data
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

    try {
      // Get weighted random ODD from backend
      const spinResult = await ApiService.spinWheel()
      const { odd, challenge } = spinResult

      // Set the selected ODD immediately and start spinning
      setSelectedODD(odd)
      setCurrentChallenge(challenge)
      setIsSpinning(true)

      // Show toast after wheel animation completes
      setTimeout(() => {
        toast({
          title: "ODD Selected!",
          description: `You got ODD ${odd.oddId}: ${odd.name.en}`,
        })
      }, 4000) // Wait for wheel animation to complete
      
    } catch (error) {
      console.error("Spin wheel error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to spin the wheel",
        variant: "destructive",
      })
    }
  }

  const handleSubmitProof = async () => {
    try {
      if (!proofData.url && !proofData.file) {
        toast({
          title: "Proof Required",
          description: "Please provide a proof URL or upload a file",
          variant: "destructive",
        })
        return
      }

      let proofUrl = proofData.url

      // If file is uploaded, you would typically upload it to a file storage service
      // For now, we'll use a placeholder URL
      if (proofData.file) {
        proofUrl = URL.createObjectURL(proofData.file)
      }

      await ApiService.createProof({
        challenge: currentChallenge._id,
        mediaType: proofData.mediaType,
        url: proofUrl,
      })

      toast({
        title: "Proof Submitted!",
        description: "Your proof has been submitted for validation",
      })

      setShowProofModal(false)
      setProofData({
        mediaType: "IMAGE",
        url: "",
        file: null,
      })
      setCurrentChallenge(null)
      setSelectedODD(null)
    } catch (error) {
      console.error("Submit proof error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit proof",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProofData((prev) => ({
        ...prev,
        file,
        url: URL.createObjectURL(file),
      }))
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
            Spin the wheel to discover your next sustainable challenge and make a positive impact on the world!
          </p>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Wheel */}
          <div className="flex flex-col items-center space-y-8">
                         <SDGWheel 
               isSpinning={isSpinning}
               selectedSDG={selectedODD}
               onSpinComplete={(sdgId) => {
                 console.log("Wheel stopped on SDG:", sdgId)
                 setIsSpinning(false)
                 
                 // Verify the selected ODD matches the wheel result
                 if (selectedODD && selectedODD.oddId === sdgId) {
                   console.log("Wheel and database ODD match!")
                 } else {
                   console.warn("Wheel and database ODD mismatch:", { wheelSDG: sdgId, databaseODD: selectedODD?.oddId })
                 }
               }}
             />

            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full"
            >
              {isSpinning ? (
                <>
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                  Spinning...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Spin the Wheel
                </>
              )}
            </Button>
          </div>

          {/* Challenge Display */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {selectedODD && currentChallenge ? (
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
                            ODD {selectedODD.oddId}: {selectedODD.name.en}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${selectedODD.color}20`,
                              borderColor: `${selectedODD.color}50`,
                              color: selectedODD.color,
                            }}
                          >
                            ODD {selectedODD.oddId}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-500 font-bold">{currentChallenge.points} points</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-zinc-300 text-lg">{currentChallenge.description}</p>

                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                          {currentChallenge.type}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                          {currentChallenge.difficulty}
                        </Badge>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          onClick={() => setShowProofModal(true)}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Proof
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentChallenge(null)
                            setSelectedODD(null)
                          }}
                          className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                        >
                          Skip Challenge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
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
                        Spin the wheel to discover your next sustainable development challenge!
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
          {showProofModal && (
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
                <h3 className="text-xl font-bold text-white mb-4">Submit Your Proof</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Media Type</label>
                    <div className="flex space-x-2">
                      <Button
                        variant={proofData.mediaType === "IMAGE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProofData((prev) => ({ ...prev, mediaType: "IMAGE" }))}
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Image
                      </Button>
                      <Button
                        variant={proofData.mediaType === "VIDEO" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProofData((prev) => ({ ...prev, mediaType: "VIDEO" }))}
                        className="flex-1"
                      >
                        📹 Video
                      </Button>
                      <Button
                        variant={proofData.mediaType === "DOCUMENT" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProofData((prev) => ({ ...prev, mediaType: "DOCUMENT" }))}
                        className="flex-1"
                      >
                        📄 Document
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Upload File</label>
                    <Input
                      type="file"
                      accept={
                        proofData.mediaType === "IMAGE"
                          ? "image/*"
                          : proofData.mediaType === "VIDEO"
                            ? "video/*"
                            : "*/*"
                      }
                      onChange={handleFileUpload}
                      className="bg-zinc-700 border-zinc-600"
                    />
                    {proofData.url && (
                      <div className="mt-2">
                        {proofData.mediaType === "IMAGE" ? (
                          <img
                            src={proofData.url || "/placeholder.svg"}
                            alt="Proof preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <span className="text-zinc-400">File uploaded</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Or provide URL</label>
                    <Input
                      type="url"
                      value={proofData.url}
                      onChange={(e) => setProofData((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                      className="bg-zinc-700 border-zinc-600"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleSubmitProof}
                      disabled={!proofData.url && !proofData.file}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      Submit Proof
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProofModal(false)}
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
