"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Target, Award, Download, Calendar, Globe, Zap } from "lucide-react"
import api from "@/services/api"

export default function Statistics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    mostPlayedODDs: [],
    mostCompletedChallenges: [],
    participants: 0,
    totalPoints: 0,
    monthlyGrowth: 0,
    averageScore: 0,
    newToday: 0
  })
  const styles = {
      user_registration: "bg-green-500/20 text-green-400 border-green-500/50",
    }
    const labels = {
      Challenge: "Challenge",

    }


  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        // Fetch comprehensive stats which now includes all needed data
        const comprehensiveStats = await api.getComprehensiveStats();
        
        setStats({
          mostPlayedODDs: comprehensiveStats.mostPlayedODDs || [],
          mostCompletedChallenges: comprehensiveStats.mostCompletedChallenges || [],
          participants: comprehensiveStats.participants || 0, // Total users from comprehensive stats
          totalPoints: comprehensiveStats.totalPoints || 0,
          monthlyGrowth: comprehensiveStats.monthlyGrowth || 0, // Monthly growth from comprehensive stats
          averageScore: comprehensiveStats.averageScore || 0,
          newToday: comprehensiveStats.newToday || 0 // Users who joined today from comprehensive stats
        })
        
        console.log('📊 Stats loaded successfully:', {
          mostPlayedODDs: comprehensiveStats.mostPlayedODDs?.length || 0,
          mostCompletedChallenges: comprehensiveStats.mostCompletedChallenges?.length || 0,
          participants: comprehensiveStats.participants || 0,
          totalPoints: comprehensiveStats.totalPoints || 0,
          monthlyGrowth: comprehensiveStats.monthlyGrowth || 0,
          averageScore: comprehensiveStats.averageScore || 0,
          newToday: comprehensiveStats.newToday || 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep the current state or set to empty values
        setStats({
          mostPlayedODDs: [],
          mostCompletedChallenges: [],
          participants: 0,
          totalPoints: 0,
          monthlyGrowth: 0,
          averageScore: 0,
          newToday: 0
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats();
  }, [])


  // const getUsersRegisteredToday = (users = []) => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   return users.filter(user => {
  //     if (!user.created_at) return false;
  //     const dateCreation = new Date(user.created_at);
  //     dateCreation.setHours(0, 0, 0, 0);
  //     return dateCreation.getTime() === today.getTime();
  //   }).length;
  // }
  

  const handleExportCSV = () => {
    // Simulate CSV export
    const csvData =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      "Total Participants," +
      stats.participants +
      "\n" +
      "Total Points," +
      stats.totalPoints +
      "\n" +
      "Monthly Growth," +
      stats.monthlyGrowth +
      "%\n" +
      "Average Score," +
      stats.averageScore +
      "\n"

    const encodedUri = encodeURI(csvData)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "sustainability_stats.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <AdminSidebar />

      <div className="flex-1 relative z-10 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600 mb-2">
            Advanced Statistics
          </h1>
          <p className="text-zinc-400">Comprehensive analytics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border border-blue-900/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-white">Participants</CardTitle>
              <Users className="h-8 w-8 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.participants}</div>
              <div className={
                stats.newToday > 0 ? 'text-green-400' :
                stats.newToday < 0 ? 'text-red-400' :
                'text-zinc-400'
              }>
                {stats.newToday > 0 ? '+' : stats.newToday < 0 ? '' : ''}{stats.newToday} participants today
              </div>
            </CardContent>
          </Card>
          <StatCard
            title="Total Points Earned"
            value={stats.totalPoints}
            icon={Award}
            color="yellow"
            trend="Across all users"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={TrendingUp}
            color="green"
            trend="User performance"
          />
          <Card className="bg-zinc-900 border border-green-900/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-white">Monthly Growth</CardTitle>
              <Zap className="h-8 w-8 text-white" />
            </CardHeader>
            <CardContent>
              <div className={
                Number(stats.monthlyGrowth) > 0 ? 'text-green-400 text-2xl font-bold' :
                Number(stats.monthlyGrowth) < 0 ? 'text-red-400 text-2xl font-bold' :
                'text-zinc-400 text-2xl font-bold'
              }>
                {Number(stats.monthlyGrowth) > 0 ? '+' : Number(stats.monthlyGrowth) < 0 ? '' : ''}{stats.monthlyGrowth}%
              </div>
              <div className="text-zinc-400 text-sm mt-2">Growth in participants this month</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          {/* Most Played ODDs
          <Card className="bg-zinc-900 border border-blue-900/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Most Played ODDs
              </CardTitle>
              <CardDescription>Top performing Sustainable Development Goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.mostPlayedODDs.length > 0 ? (
                  stats.mostPlayedODDs.map((odd, index) => (
                    <div key={odd.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            ODD {odd.id}: {odd.name}
                          </p>
                          <p className="text-sm text-zinc-400">{odd.plays} plays</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                          {odd.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ODD data available yet</p>
                    <p className="text-sm">Start completing challenges to see statistics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}

          /* Most Completed Challenges */
          <Card className="bg-zinc-900 border border-green-900/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Most Completed Challenges
              </CardTitle>
              <CardDescription>Top performing challenges and quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.mostCompletedChallenges.length > 0 ? (
                  stats.mostCompletedChallenges.map((challenge, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{challenge.title}</p>
                          <p className="text-sm text-zinc-400">{challenge.completions} completions</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          challenge.type === "Quiz"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                            : "bg-green-500/20 text-green-400 border-green-500/50"
                        }
                      >
                        {challenge.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No challenge data available yet</p>
                    <p className="text-sm">Start completing challenges to see statistics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Export Section */}
          <Card className="bg-zinc-900 border border-blue-900/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Export Data
              </CardTitle>
              <CardDescription>Download comprehensive analytics data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 mb-4">
                Export all statistical data including user metrics, challenge performance, ODD engagement, and
                participation trends for advanced analysis.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleExportCSV}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Monthly Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Eco Heroes Section */}
          <Card className="bg-zinc-900 border border-purple-900/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Wall of Eco Heroes
              </CardTitle>
              <CardDescription>Recognition and leaderboard features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <h4 className="font-medium text-purple-300 mb-2">🏆 Top 10 of the Month</h4>
                  <p className="text-sm text-zinc-400">Monthly leaderboard with special recognition</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <h4 className="font-medium text-purple-300 mb-2">🎖️ Top 3 Votes Bonus</h4>
                  <p className="text-sm text-zinc-400">Extra points for community-voted achievements</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <h4 className="font-medium text-purple-300 mb-2">🌟 Hall of Fame</h4>
                  <p className="text-sm text-zinc-400">Permanent recognition for outstanding contributors</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  <Award className="h-4 w-4 mr-2" />
                  View Podium
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
// Stat Card Component
function StatCard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: "bg-zinc-900 border border-blue-900/60 text-blue-400 shadow-lg",
    green: "bg-zinc-900 border border-green-900/60 text-green-400 shadow-lg",
    yellow: "bg-zinc-900 border border-yellow-900/60 text-yellow-400 shadow-lg",
    purple: "bg-zinc-900 border border-purple-900/60 text-purple-400 shadow-lg",
  }

  return (
    <Card
      className={`${colorClasses[color]}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl font-bold text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {trend && <p className="text-xs text-white/60 mt-1">{trend}</p>}
          </div>
          <Icon className="h-8 w-8 text-white/80" />
        </div>
      </CardContent>
    </Card>
  )
}

