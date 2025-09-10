"use client"

import { useEffect, useState } from "react"
import ApiService from "../services/api"
import AlertService from "../services/alertService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../../components/ui/dialog"
import { Plus, Edit, Trash2, BookOpen, Target as TargetIcon, Eye } from "lucide-react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"

export default function QuizzChallengeAdmin() {
  const [tab, setTab] = useState("quizzes")

  // Quizzes
  const [quizzes, setQuizzes] = useState([])
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [quizEdit, setQuizEdit] = useState(null)
  const [quizPage, setQuizPage] = useState(1)
  const quizzesPerPage = 10
  const quizPageCount = Math.ceil(quizzes.length / quizzesPerPage)

  // Challenges
  const [challenges, setChallenges] = useState([])
  const [challengeModalOpen, setChallengeModalOpen] = useState(false)
  const [challengeEdit, setChallengeEdit] = useState(null)
  const [challengePage, setChallengePage] = useState(1)
  const challengesPerPage = 10
  const challengePageCount = Math.ceil(challenges.length / challengesPerPage)

  // Form states
  const [quizForm, setQuizForm] = useState({
    title: "",
    question: "",
    choices: ["", "", "", ""],
    correctAnswer: 0,
    associatedODD: "",
    points: 10,
    difficulty: "EASY",
  })
  const [challengeForm, setChallengeForm] = useState({
    title: "",
    description: "",
    associatedODD: "",
  })
  const [odds, setOdds] = useState([])
  const [loading, setLoading] = useState(false)

  // Ajout état pour le modal de détails
  const [challengeDetails, setChallengeDetails] = useState(null)
  const [quizDetails, setQuizDetails] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [quizRes, challengeRes, oddsRes] = await Promise.all([
        ApiService.getAllQuizzes(),
        ApiService.getAllChallenges(),
        ApiService.getAllODDs(),
      ])
      setQuizzes(quizRes.quizzes || [])
      setChallenges(challengeRes.challenges || [])
      setOdds(oddsRes.odds || [])
    } catch (e) {
      AlertService.error("Failed to Load Data", e.message);
    } finally {
      setLoading(false)
    }
  }

  // --- Quiz CRUD ---
  const openQuizModal = (quiz = null) => {
    setQuizEdit(quiz)
    setQuizForm(
      quiz
        ? { ...quiz, associatedODD: quiz.associatedODD?._id || "" }
        : {
            title: "",
            question: "",
            choices: ["", "", "", ""],
            correctAnswer: 0,
            associatedODD: "",
            points: 10,
            difficulty: "EASY",
          },
    )
    setQuizModalOpen(true)
  }

  const closeQuizModal = () => {
    setQuizModalOpen(false)
    setTimeout(() => setQuizEdit(null), 300)
  }

  const handleQuizFormChange = (e, idx = null) => {
    if (idx !== null) {
      const newChoices = [...quizForm.choices]
      newChoices[idx] = e.target.value
      setQuizForm({ ...quizForm, choices: newChoices })
    } else {
      setQuizForm({ ...quizForm, [e.target.name]: e.target.value })
    }
  }

  const handleQuizSubmit = async (e) => {
    e.preventDefault()
    try {
      if (quizEdit) {
        const { _id, createdAt, updatedAt, isActive, __v, ...quizData } = quizForm
        await ApiService.updateQuiz(quizEdit._id, quizData)
        AlertService.success("Quiz Updated!", "The quiz has been updated successfully.");
      } else {
        await ApiService.createQuiz(quizForm)
        AlertService.success("Quiz Created!", "A new quiz has been added to the system.");
      }
      closeQuizModal()
      fetchAll()
    } catch (err) {
      AlertService.error("Operation Failed", err.message);
    }
  }

  const handleQuizDelete = async (quiz) => {
    const isConfirmed = await AlertService.deleteConfirm(
      "Delete Quiz",
      `Are you sure you want to delete "${quiz.question}"? This will permanently remove the quiz and cannot be undone.`,
      "Delete Quiz"
    );

    if (!isConfirmed) return;

    try {
      await ApiService.deleteQuiz(quiz._id)
      AlertService.success("Quiz Deleted", "The quiz has been permanently removed from the system.");
      fetchAll()
    } catch (err) {
      AlertService.error("Delete Failed", err.message);
    }
  }

  // --- Challenge CRUD ---
  const openChallengeModal = (challenge = null) => {
    setChallengeEdit(challenge)
    setChallengeForm(
      challenge
        ? { ...challenge, associatedODD: challenge.associatedODD?._id || "" }
        : { title: "", description: "", associatedODD: "" },
    )
    setChallengeModalOpen(true)
  }

  const closeChallengeModal = () => {
    setChallengeModalOpen(false)
    setTimeout(() => setChallengeEdit(null), 300)
  }

  const handleChallengeFormChange = (e) => {
    setChallengeForm({ ...challengeForm, [e.target.name]: e.target.value })
  }

  const handleChallengeSubmit = async (e) => {
    e.preventDefault()
    try {
      if (challengeEdit) {
        const { _id, isActive, completionCount, createdAt, updatedAt,__v, ...challengeData } = challengeForm
        await ApiService.updateChallenge(challengeEdit._id, challengeData)
        AlertService.success("Challenge Updated!", "The challenge has been updated successfully.");
      } else {
        await ApiService.createChallenge(challengeForm)
        AlertService.success("Challenge Created!", "A new challenge has been added to the system.");
      }
      closeChallengeModal()
      fetchAll()
    } catch (err) {
      AlertService.error("Operation Failed", err.message);
    }
  }

  const handleChallengeDelete = async (challenge) => {
    const isConfirmed = await AlertService.deleteConfirm(
      "Delete Challenge",
      `Are you sure you want to delete "${challenge.title}"? This will permanently remove the challenge and cannot be undone.`,
      "Delete Challenge"
    );

    if (!isConfirmed) return;

    try {
      await ApiService.deleteChallenge(challenge._id)
      AlertService.success("Challenge Deleted", "The challenge has been permanently removed from the system.");
      fetchAll()
    } catch (err) {
      AlertService.error("Delete Failed", err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <AdminSidebar />

      <div className="flex-1 relative z-10 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600 mb-2">
            Challenges & Quizzes
          </h1>
          <p className="text-zinc-400">Create and manage platform content</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <Button
            variant={tab === "quizzes" ? "default" : "outline"}
            onClick={() => setTab("quizzes")}
            className={
              tab === "quizzes"
                ? "bg-blue-800 hover:bg-blue-900 text-white border-blue-700 border-2 flex items-center gap-2 shadow-lg"
                : "bg-zinc-800 hover:bg-blue-900 text-blue-300 border border-blue-700 flex items-center gap-2"
            }
          >
            <BookOpen className="h-5 w-5 mr-1" />
            Quizzes
          </Button>
          <Button
            variant={tab === "challenges" ? "default" : "outline"}
            onClick={() => setTab("challenges")}
            className={
              tab === "challenges"
                ? "bg-green-800 hover:bg-green-900 text-white border-green-700 border-2 flex items-center gap-2 shadow-lg"
                : "bg-zinc-800 hover:bg-green-900 text-green-300 border border-green-700 flex items-center gap-2"
            }
          >
            <TargetIcon className="h-5 w-5 mr-1" />
            Challenges
          </Button>
        </div>

        {/* Quizzes Section */}
        {tab === "quizzes" && (
          <Card className="bg-zinc-900 border border-blue-900/60 shadow-lg mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-blue-400">Quiz Management</CardTitle>
                <p className="text-zinc-400 text-sm mt-1">Create and manage knowledge quizzes</p>
              </div>
              <Button
                onClick={() => openQuizModal()}
                className="bg-blue-800 hover:bg-blue-900 text-white border-blue-700 border-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Quiz
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-400 border-b border-zinc-700">
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Question</th>
                      <th className="px-4 py-3 font-medium">Choices</th>
                      <th className="px-4 py-3 font-medium">Correct</th>
                      <th className="px-4 py-3 font-medium">ODD</th>
                      <th className="px-4 py-3 font-medium">Points</th>
                      <th className="px-4 py-3 font-medium">Difficulty</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.slice((quizPage-1)*quizzesPerPage, quizPage*quizzesPerPage).map((quiz) => (
                      <tr key={quiz._id} className="border-b border-zinc-800 hover:bg-zinc-800/60 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{quiz.title}</td>
                        <td className="px-4 py-3 text-zinc-300 max-w-xs truncate">{quiz.question}</td>
                        <td className="px-4 py-3">
                          <ul className="list-decimal ml-4 text-sm">
                            {quiz.choices.map((c, i) => (
                              <li
                                key={i}
                                className={i === quiz.correctAnswer ? "text-green-400 font-bold" : "text-zinc-400"}
                              >
                                {c.length > 20 ? c.substring(0, 20) + "..." : c}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                            {quiz.correctAnswer + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                            {quiz.associatedODD?.oddId ? `SDG ${quiz.associatedODD.oddId} - ${quiz.associatedODD.name?.en}` : (quiz.associatedODD?.name?.en || "-")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-yellow-400 font-medium">{quiz.points}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              quiz.difficulty === "EASY"
                                ? "bg-green-500/20 text-green-400"
                                : quiz.difficulty === "MEDIUM"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : quiz.difficulty === "HARD"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {quiz.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openQuizModal(quiz)}
                            className="hover:bg-blue-500/20"
                          >
                            <Edit className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuizDelete(quiz)}
                            className="hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setQuizDetails(quiz)}
                            className="hover:bg-purple-500/20 text-purple-400"
                          >
                            <Eye className="h-4 w-4 text-purple-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {quizzes.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="8" width="40" height="32" rx="4" fill="#3B82F6"/>
                      <rect x="10" y="14" width="28" height="4" rx="2" fill="#fff"/>
                      <rect x="10" y="22" width="20" height="4" rx="2" fill="#fff"/>
                      <rect x="10" y="30" width="12" height="4" rx="2" fill="#fff"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No quizzes yet</h3>
                  <p className="text-zinc-400">Create your first quiz to get started</p>
                </div>
              )}
              {/* Pagination Controls for Quizzes */}
              {quizPageCount > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setQuizPage(quizPage-1)} disabled={quizPage === 1}>Previous</Button>
                  <span className="text-zinc-400">Page {quizPage} of {quizPageCount}</span>
                  <Button size="sm" variant="outline" onClick={() => setQuizPage(quizPage+1)} disabled={quizPage === quizPageCount}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Challenges Section */}
        {tab === "challenges" && (
          <Card className="bg-zinc-900 border border-green-900/60 shadow-lg mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-green-400">Challenge Management</CardTitle>
                <p className="text-zinc-400 text-sm mt-1">Create and manage action challenges</p>
              </div>
              <Button
                onClick={() => openChallengeModal()}
                className="bg-green-800 hover:bg-green-900 text-white border-green-700 border-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Challenge
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-400 border-b border-zinc-700">
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">ODD</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.slice((challengePage-1)*challengesPerPage, challengePage*challengesPerPage).map((challenge) => (
                      <tr
                        key={challenge._id}
                        className="border-b border-zinc-800 hover:bg-zinc-800/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-white">{challenge.title}</td>
                        <td className="px-4 py-3 text-zinc-300 max-w-xs truncate">{challenge.description}</td>
                        
                        <td className="px-4 py-3">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                            {challenge.associatedODD?.oddId ? `SDG ${challenge.associatedODD.oddId} - ${challenge.associatedODD.name?.en}` : (challenge.associatedODD?.name?.en || "-")}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openChallengeModal(challenge)}
                            className="hover:bg-green-500/20"
                          >
                            <Edit className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleChallengeDelete(challenge)}
                            className="hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setChallengeDetails(challenge)}
                            className="hover:bg-purple-500/20 text-purple-400"
                          >
                            <Eye className="h-4 w-4 text-purple-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {challenges.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="24" r="20" fill="#22C55E"/>
                      <circle cx="24" cy="24" r="12" fill="#fff"/>
                      <circle cx="24" cy="24" r="6" fill="#22C55E"/>
                      <path d="M24 10v8M24 30v8M10 24h8M30 24h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No challenges yet</h3>
                  <p className="text-zinc-400">Create your first challenge to get started</p>
                </div>
              )}
              {/* Pagination Controls for Challenges */}
              {challengePageCount > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setChallengePage(challengePage-1)} disabled={challengePage === 1}>Previous</Button>
                  <span className="text-zinc-400">Page {challengePage} of {challengePageCount}</span>
                  <Button size="sm" variant="outline" onClick={() => setChallengePage(challengePage+1)} disabled={challengePage === challengePageCount}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quiz Modal */}
        <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
          <DialogContent className="bg-zinc-900/95 border border-blue-900/60 shadow-lg max-w-2xl">
            <form onSubmit={handleQuizSubmit}>
              <DialogHeader>
                <DialogTitle className="text-blue-400 text-xl">
                  {quizEdit ? "Edit Quiz" : "Create New Quiz"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Title</label>
                    <input
                      name="title"
                      value={quizForm.title}
                      onChange={handleQuizFormChange}
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                      minLength={5}
                      maxLength={200}
                      placeholder="Enter quiz title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Points</label>
                    <input
                      name="points"
                      type="number"
                      value={quizForm.points}
                      onChange={handleQuizFormChange}
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      min={1}
                      max={1000}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Question</label>
                  <textarea
                    name="question"
                    value={quizForm.question}
                    onChange={handleQuizFormChange}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                    minLength={5}
                    maxLength={1000}
                    rows={3}
                    placeholder="Enter your question..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Answer Choices</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizForm.choices.map((choice, idx) => (
                      <div key={idx} className="relative">
                        <input
                          value={choice}
                          onChange={(e) => handleQuizFormChange(e, idx)}
                          className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                          minLength={1}
                          maxLength={300}
                          placeholder={`Choice ${idx + 1}`}
                        />
                        <span className="absolute left-3 top-3 text-xs text-zinc-500">{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Correct Answer</label>
                    <select
                      name="correctAnswer"
                      value={quizForm.correctAnswer}
                      onChange={handleQuizFormChange}
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <option key={i} value={i}>{`Choice ${i + 1}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Difficulty</label>
                    <select
                      name="difficulty"
                      value={quizForm.difficulty}
                      onChange={handleQuizFormChange}
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Associated ODD</label>
                    <select
                      name="associatedODD"
                      value={quizForm.associatedODD}
                      onChange={handleQuizFormChange}
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="">Select ODD</option>
                      {odds.map((odd) => (
                        <option key={odd._id} value={odd._id}>
                          {odd.name?.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex-1"
                >
                  {quizEdit ? "Update Quiz" : "Create Quiz"}
                </Button>
                <DialogClose>
                  <Button type="button" variant="outline" className="flex-1 bg-zinc-800 text-white border border-zinc-500 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white transition">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Challenge Modal */}
        <Dialog open={challengeModalOpen} onOpenChange={setChallengeModalOpen}>
          <DialogContent className="bg-zinc-900/95 border border-green-900/60 shadow-lg max-w-2xl">
            <form onSubmit={handleChallengeSubmit}>
              <DialogHeader>
                <DialogTitle className="text-green-400 text-xl">
                  {challengeEdit ? "Edit Challenge" : "Create New Challenge"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <input
                    name="title"
                    value={challengeForm.title}
                    onChange={handleChallengeFormChange}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    required
                    minLength={5}
                    maxLength={200}
                    placeholder="Enter challenge title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    name="description"
                    value={challengeForm.description}
                    onChange={handleChallengeFormChange}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    placeholder="Describe the challenge..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Associated SDG</label>
                  <select
                    name="associatedODD"
                    value={challengeForm.associatedODD}
                    onChange={handleChallengeFormChange}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  >
                    <option value="">Select SDG</option>
                    {odds.map((odd) => (
                      <option key={odd._id} value={odd._id}>
                        {odd.name?.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex-1"
                >
                  {challengeEdit ? "Update Challenge" : "Create Challenge"}
                </Button>
                <DialogClose>
                  <Button type="button" variant="outline" className="flex-1 bg-zinc-800 text-white border border-zinc-500 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white transition">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de détails Challenge */}
        <Dialog open={!!challengeDetails} onOpenChange={() => setChallengeDetails(null)}>
          <DialogContent className="bg-zinc-900/95 border border-purple-900/60 shadow-lg max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-purple-400 text-xl">Challenge Details</DialogTitle>
            </DialogHeader>
            {challengeDetails && (
              <div className="mt-4 text-white space-y-3">
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Title</div>
                  <div>{challengeDetails.title}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Description</div>
                  <div>{challengeDetails.description}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">ODD</div>
                  <div className="text-blue-400">{challengeDetails.associatedODD?.oddId ? `SDG ${challengeDetails.associatedODD.oddId} - ${challengeDetails.associatedODD.name?.en}` : (challengeDetails.associatedODD?.name?.en || '-')}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Created</div>
                  <div className="text-zinc-400">{new Date(challengeDetails.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Updated</div>
                  <div className="text-zinc-400">{new Date(challengeDetails.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            )}
            <DialogFooter className="mt-6">
              <DialogClose>
                <Button type="button" variant="outline" className="flex-1 bg-zinc-800 text-white border border-zinc-500 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white transition">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de détails Quiz */}
        <Dialog open={!!quizDetails} onOpenChange={() => setQuizDetails(null)}>
          <DialogContent className="bg-zinc-900/95 border border-purple-900/60 shadow-lg max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-purple-400 text-xl">Quiz Details</DialogTitle>
            </DialogHeader>
            {quizDetails && (
              <div className="mt-4 text-white space-y-3">
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Title</div>
                  <div>{quizDetails.title}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Question</div>
                  <div>{quizDetails.question}</div>
                </div>
                <div className="flex items-start">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Choices</div>
                  <ul className="ml-4 list-decimal text-zinc-300">
                    {quizDetails.choices.map((c, i) => (
                      <li key={i} className={i === quizDetails.correctAnswer ? "text-green-400 font-bold" : ""}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Correct Answer</div>
                  <div className="text-green-400">Choice {quizDetails.correctAnswer + 1}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">SDG</div>
                  <div className="text-blue-400">{quizDetails.associatedODD?.oddId ? `SDG ${quizDetails.associatedODD.oddId} - ${quizDetails.associatedODD.name?.en}` : (quizDetails.associatedODD?.name?.en || '-')}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Points</div>
                  <div className="text-yellow-400">{quizDetails.points}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Difficulty</div>
                  <div className="text-purple-400">{quizDetails.difficulty}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Created</div>
                  <div className="text-zinc-400">{new Date(quizDetails.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-zinc-400 font-semibold min-w-[130px]">Updated</div>
                  <div className="text-zinc-400">{new Date(quizDetails.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            )}
            <DialogFooter className="mt-6">
              <DialogClose>
                <Button type="button" variant="outline" className="flex-1 bg-zinc-800 text-white border border-zinc-500 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white transition">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
