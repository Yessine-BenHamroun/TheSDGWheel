"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Database, Users, Target, FileCheck, BarChart3, Settings } from "lucide-react"

export default function Export() {
  const [selectedExports, setSelectedExports] = useState([])
  const [exportFormat, setExportFormat] = useState("csv")
  const [dateRange, setDateRange] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = [
    {
      id: "users",
      title: "User Data",
      description: "User profiles, registration dates, countries, points, levels",
      icon: Users,
      color: "blue",
      estimatedSize: "2.3 MB",
      recordCount: "1,247 users",
    },
    {
      id: "challenges",
      title: "Challenges & Quizzes",
      description: "All challenges, quizzes, completions, and submissions",
      icon: Target,
      color: "green",
      estimatedSize: "1.8 MB",
      recordCount: "456 challenges",
    },
    {
      id: "proofs",
      title: "Proof Submissions",
      description: "User proof submissions, validation status, media files",
      icon: FileCheck,
      color: "orange",
      estimatedSize: "15.7 MB",
      recordCount: "3,892 proofs",
    },
    {
      id: "votes",
      title: "Community Votes",
      description: "Community voting data, ratings, and feedback",
      icon: BarChart3,
      color: "purple",
      estimatedSize: "890 KB",
      recordCount: "2,156 votes",
    },
    {
      id: "wheel_spins",
      title: "Wheel Spins",
      description: "SDG wheel spin results, timestamps, and outcomes",
      icon: Settings,
      color: "pink",
      estimatedSize: "1.2 MB",
      recordCount: "5,678 spins",
    },
    {
      id: "activity_logs",
      title: "Activity Logs",
      description: "Complete activity history, user actions, system events",
      icon: FileText,
      color: "cyan",
      estimatedSize: "4.5 MB",
      recordCount: "12,345 activities",
    },
    {
      id: "statistics",
      title: "Platform Statistics",
      description: "Aggregated statistics, performance metrics, analytics",
      icon: BarChart3,
      color: "yellow",
      estimatedSize: "567 KB",
      recordCount: "Monthly reports",
    },
    {
      id: "odds",
      title: "ODD Configuration",
      description: "Sustainable Development Goals setup and weights",
      icon: Database,
      color: "red",
      estimatedSize: "45 KB",
      recordCount: "17 ODDs",
    },
  ]

  const handleExportToggle = (exportId) => {
    setSelectedExports((prev) => (prev.includes(exportId) ? prev.filter((id) => id !== exportId) : [...prev, exportId]))
  }

  const handleSelectAll = () => {
    if (selectedExports.length === exportOptions.length) {
      setSelectedExports([])
    } else {
      setSelectedExports(exportOptions.map((option) => option.id))
    }
  }

  const handleExport = async () => {
    if (selectedExports.length === 0) return

    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Create and download a sample CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Export Type,Records,Date\n" +
      selectedExports
        .map((id) => {
          const option = exportOptions.find((opt) => opt.id === id)
          return `${option.title},${option.recordCount},${new Date().toISOString()}`
        })
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sustainability_export_${new Date().toISOString().split("T")[0]}.${exportFormat}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setIsExporting(false)
  }

  const getTotalSize = () => {
    return selectedExports
      .reduce((total, id) => {
        const option = exportOptions.find((opt) => opt.id === id)
        const size = Number.parseFloat(option.estimatedSize)
        const unit = option.estimatedSize.includes("MB") ? 1 : 0.001
        return total + size * unit
      }, 0)
      .toFixed(1)
  }

  const getColorClasses = (color) => {
    const classes = {
      blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
      green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
      orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400",
      purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
      pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400",
      cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400",
      yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
      red: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
    }
    return classes[color] || classes.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <AdminSidebar />

      <div className="flex-1 relative z-10 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-amber-600 mb-2">
            Data Export
          </h1>
          <p className="text-zinc-400">Export platform data for analysis and backup</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Options */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-zinc-900 border border-blue-900/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-red-400">Select Data to Export</CardTitle>
                    <CardDescription>Choose which data sets to include in your export</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="border-zinc-600 bg-zinc-600"
                  >
                    {selectedExports.length === exportOptions.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exportOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = selectedExports.includes(option.id)

                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? `bg-gradient-to-br ${getColorClasses(option.color)} border`
                            : "bg-zinc-700/30 border-zinc-600 hover:bg-zinc-700/50"
                        }`}
                        onClick={() => handleExportToggle(option.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleExportToggle(option.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Icon
                                className={`h-5 w-5 ${isSelected ? (option.color === "yellow" ? "text-yellow-400" : `text-${option.color}-400`) : "text-zinc-400"}`}
                              />
                              <h3 className={`font-medium ${isSelected ? "text-white" : "text-zinc-300"}`}>
                                {option.title}
                              </h3>
                            </div>
                            <p className={`text-sm ${isSelected ? "text-white/80" : "text-zinc-400"} mb-3`}>
                              {option.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isSelected ? "text-white/70" : "text-zinc-500"}>
                                {option.recordCount}
                              </span>
                              <Badge
                                variant="outline"
                                className={`${isSelected ? "border-white/30 text-white/70" : "border-zinc-500 text-zinc-500"} text-xs`}
                              >
                                {option.estimatedSize}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Configuration */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border border-green-900/60 shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-400">Export Configuration</CardTitle>
                <CardDescription>Configure your export settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Export Format</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:border-amber-500"
                  >
                    <option value="csv">CSV (Comma Separated)</option>
                    <option value="json">JSON (JavaScript Object)</option>
                    <option value="xlsx">Excel (XLSX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:border-amber-500"
                  >
                    <option value="all">All Time</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {selectedExports.length > 0 && (
                  <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Export Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Selected datasets:</span>
                        <span className="text-white">{selectedExports.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Estimated size:</span>
                        <span className="text-white">{getTotalSize()} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Format:</span>
                        <span className="text-white uppercase">{exportFormat}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleExport}
                  disabled={selectedExports.length === 0 || isExporting}
                  className="w-full bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Exports */}
            <Card className="bg-zinc-900 border border-purple-900/60 shadow-lg">
              <CardHeader>
                <CardTitle className="text-zinc-300">Recent Exports</CardTitle>
                <CardDescription>Your recent export history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Full Data Export</p>
                      <p className="text-xs text-zinc-400">March 15, 2024</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      CSV
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">User Analytics</p>
                      <p className="text-xs text-zinc-400">March 10, 2024</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      JSON
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Monthly Report</p>
                      <p className="text-xs text-zinc-400">March 1, 2024</p>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      XLSX
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
