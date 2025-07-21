"use client"

import { useState, useEffect } from "react"
import ApiService from "@/services/api"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { HistoryIcon, Search, Calendar, User, Target, FileCheck, Settings, Zap, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

export default function History() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [activities, setActivities] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await ApiService.getActivityLogs()
      setActivities(res.logs || [])
    } catch (e) {
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const getUserName = (activity) => {
    if (!activity.user) return "";
    if (typeof activity.user === "string") return activity.user;
    if (typeof activity.user === "object" && activity.user.username) return activity.user.username;
    return "";
  }

  const filteredActivities = activities.filter((activity) => {
    const userName = getUserName(activity)
    const action = activity.action || ""
    const details = activity.details || ""
    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || activity.type === filterType
    return matchesSearch && matchesFilter
  })

  const getActivityIcon = (type) => {
    switch (type) {
      case "user_registration":
        return <User className="h-4 w-4 text-blue-400" />
      case "challenge_completion":
        return <Target className="h-4 w-4 text-green-400" />
      case "proof_validation":
        return <FileCheck className="h-4 w-4 text-orange-400" />
      case "wheel_spin":
        return <Zap className="h-4 w-4 text-purple-400" />
      case "quiz_completion":
        return <Target className="h-4 w-4 text-cyan-400" />
      case "admin_action":
        return <Settings className="h-4 w-4 text-red-400" />
      case "community_vote":
        return <User className="h-4 w-4 text-pink-400" />
      case "badge_earned":
        return <Target className="h-4 w-4 text-yellow-400" />
      case "system_action":
        return <Settings className="h-4 w-4 text-zinc-400" />
      default:
        return <HistoryIcon className="h-4 w-4 text-zinc-400" />
    }
  }

  const getActivityBadge = (type) => {
    const styles = {
      user_registration: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      challenge_completion: "bg-green-500/20 text-green-400 border-green-500/50",
      proof_validation: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      wheel_spin: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      quiz_completion: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      admin_action: "bg-red-500/20 text-red-400 border-red-500/50",
      community_vote: "bg-pink-500/20 text-pink-400 border-pink-500/50",
      badge_earned: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      system_action: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50",
    }

    const labels = {
      user_registration: "Registration",
      challenge_completion: "Challenge",
      proof_validation: "Validation",
      wheel_spin: "Wheel Spin",
      quiz_completion: "Quiz",
      admin_action: "Admin",
      community_vote: "Vote",
      badge_earned: "Badge",
      system_action: "System",
    }

    return (
      <Badge variant="outline" className={styles[type]}>
        {labels[type]}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <AdminSidebar />

      <div className="flex-1 relative z-10 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-600 mb-2">
            Activity History
          </h1>
          <p className="text-zinc-400">Complete log of user and system activities</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search activities by user, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-yellow-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white focus:border-yellow-500"
            >
              <option value="all">All Activities</option>
              <option value="user_registration">Registrations</option>
              <option value="challenge_completion">Challenges</option>
              <option value="proof_validation">Validations</option>
              <option value="wheel_spin">Wheel Spins</option>
              <option value="quiz_completion">Quizzes</option>
              <option value="admin_action">Admin Actions</option>
              <option value="community_vote">Community Votes</option>
              <option value="badge_earned">Badges</option>
              <option value="system_action">System</option>
            </select>
            <Button variant="outline" className="border-zinc-700 bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border border-yellow-900/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Activities</p>
                  <p className="text-2xl font-bold text-white">{activities.length}</p>
                </div>
                <HistoryIcon className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-green-900/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Today</p>
                  <p className="text-2xl font-bold text-white">
                    {
                      activities.filter((a) => new Date(a.timestamp).toDateString() === new Date().toDateString())
                        .length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-purple-900/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">User Actions</p>
                  <p className="text-2xl font-bold text-white">
                    {activities.filter((a) => !["admin_action", "system_action"].includes(a.type)).length}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-orange-900/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Admin Actions</p>
                  <p className="text-2xl font-bold text-white">
                    {activities.filter((a) => ["admin_action", "system_action"].includes(a.type)).length}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="bg-zinc-800/90 border border-zinc-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-yellow-400">Activity Timeline</CardTitle>
            <CardDescription>Chronological log of all platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const { date, time } = formatTimestamp(activity.timestamp)
                return (
                  <div
                    key={activity._id || activity.id}
                    className="flex items-start space-x-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(activity)}
                  >
                    <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-white">{activity.action}</h4>
                          {getActivityBadge(activity.type)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {date} at {time}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 mb-2">{activity.details}</p>
                      <div className="flex items-center space-x-4 text-xs text-zinc-400">
                        <span>
                          User: <span className="text-white">{getUserName(activity)}</span>
                        </span>
                        {activity.points && (
                          <span>
                            Points: <span className="text-yellow-400">+{activity.points}</span>
                          </span>
                        )}
                        {activity.score && (
                          <span>
                            Score: <span className="text-green-400">{activity.score}%</span>
                          </span>
                        )}
                        {activity.target && (
                          <span>
                            Target: <span className="text-blue-400">{activity.target}</span>
                          </span>
                        )}
                        {activity.ip && (
                          <span>
                            IP: <span className="text-zinc-300">{activity.ip}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <div className="flex justify-center items-center mb-4">
                  <svg
                    viewBox="0 0 48 48"
                    width="50"
                    height="50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: "block" }}
                  >
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#ff7575"
                      strokeWidth="3"
                      fill="transparent"
                      style={{
                        filter: "drop-shadow(0 0 6px #ff7575aa)",
                        opacity: 0.7,
                        animation: "pulseCircle 1.5s infinite"
                      }}
                    />
                    <g>
                      <line
                        x1="16"
                        y1="16"
                        x2="32"
                        y2="32"
                        stroke="#ff7575"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                          animation: "cross1 1.5s infinite"
                        }}
                      />
                      <line
                        x1="32"
                        y1="16"
                        x2="16"
                        y2="32"
                        stroke="#ff7575"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                          animation: "cross2 1.5s infinite"
                        }}
                      />
                    </g>
                    <style>
                      {`
                        @keyframes pulseCircle {
                          0% { opacity: 0.7; r: 20; }
                          50% { opacity: 1; r: 22; }
                          100% { opacity: 0.7; r: 20; }
                        }
                        @keyframes cross1 {
                          0% { stroke-dasharray: 0 24; }
                          30% { stroke-dasharray: 24 0; }
                          100% { stroke-dasharray: 24 0; }
                        }
                        @keyframes cross2 {
                          0% { stroke-dasharray: 0 24; }
                          60% { stroke-dasharray: 24 0; }
                          100% { stroke-dasharray: 24 0; }
                        }
                      `}
                    </style>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No activities found</h3>
                <p className="text-zinc-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de détails du log */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-purple-900/60 shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-400 text-2xl font-bold flex items-center gap-2">
              {selectedLog?.action?.includes('Quiz') ? 'Quiz Update' : selectedLog?.action?.includes('Challenge') ? 'Challenge Update' : 'Log Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && selectedLog.old && selectedLog.updated ? (
            <div className="space-y-6 mt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">By <span className="text-blue-400 font-semibold">{getUserName(selectedLog)}</span></div>
                  <div className="text-xs text-zinc-500">{formatTimestamp(selectedLog.timestamp).date} at {formatTimestamp(selectedLog.timestamp).time}</div>
                </div>
                <Badge className="bg-purple-700/30 text-purple-300 border border-purple-700 ml-2">Modification</Badge>
              </div>
              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/80 shadow-lg">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-800 text-zinc-400">
                      <th className="px-4 py-2">Field</th>
                      <th className="px-4 py-2">Old</th>
                      <th></th>
                      <th className="px-4 py-2">New</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(selectedLog.updated).map((field) => (
                      selectedLog.old[field] !== selectedLog.updated[field] && (
                        <tr key={field} className="transition-all hover:bg-zinc-800/60 animate-fade-in">
                          <td className="px-4 py-2 font-bold text-white flex items-center gap-2">
                            {field}
                            <span className="ml-2 px-2 py-0.5 rounded bg-yellow-700/30 text-yellow-300 text-xs">modified</span>
                          </td>
                          <td className="px-4 py-2 text-red-400 line-through">{String(selectedLog.old[field])}</td>
                          <td className="px-2 py-2 text-zinc-400"><ArrowRight className="h-4 w-4" /></td>
                          <td className="px-4 py-2 text-green-400 font-semibold">{String(selectedLog.updated[field])}</td>
                          <td></td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : selectedLog && (
            <div className="space-y-2 mt-4">
              <div><span className="font-bold text-white">Type:</span> <span className="text-zinc-300">{selectedLog.type}</span></div>
              <div><span className="font-bold text-white">Action:</span> <span className="text-zinc-300">{selectedLog.action}</span></div>
              <div><span className="font-bold text-white">Details:</span> <span className="text-zinc-300">{selectedLog.details}</span></div>
              {/* Ajoute d'autres champs si besoin */}
            </div>
          )}
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-2/3 mx-auto block bg-zinc-800 text-white border border-zinc-500 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white transition">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
