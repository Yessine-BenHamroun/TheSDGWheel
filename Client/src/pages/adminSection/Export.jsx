"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Database, Users, Target, FileCheck, BarChart3, Settings, AlertCircle } from "lucide-react"
import api from "@/services/api"
import { 
  convertMultipleDatasets, 
  downloadMultipleFiles, 
  getFileSizeEstimate 
} from "@/utils/exportUtils"

export default function Export() {
  const [selectedExports, setSelectedExports] = useState([])
  const [exportFormat, setExportFormat] = useState("csv")
  const [dateRange, setDateRange] = useState("all")
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState({ type: '', message: '' })
  const [realDataStats, setRealDataStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealDataStats()
  }, [])

  const fetchRealDataStats = async () => {
    try {
      setLoading(true)
      // For now, we'll use placeholder stats
      // In a real app, you'd fetch actual counts from your API
      setRealDataStats({
        users: { count: 0, size: '0 KB' },
        challenges: { count: 0, size: '0 KB' },
        proofs: { count: 0, size: '0 KB' },
        votes: { count: 0, size: '0 KB' },
        wheel_spins: { count: 0, size: '0 KB' },
        activity_logs: { count: 0, size: '0 KB' },
        statistics: { count: 0, size: '0 KB' },
        odds: { count: 17, size: '45 KB' }, // Static for ODDs
      })
    } catch (error) {
      console.error('Failed to fetch data stats:', error)
      setExportStatus({ type: 'error', message: 'Failed to fetch data statistics' })
    } finally {
      setLoading(false)
    }
  }

  const exportOptions = [
    {
      id: "users",
      title: "User Data",
      description: "User profiles, registration dates, countries, points, levels",
      icon: Users,
      color: "blue",
      estimatedSize: realDataStats.users?.size || "0 KB",
      recordCount: `${realDataStats.users?.count || 0} users`,
    },
    {
      id: "challenges",
      title: "Challenges & Quizzes",
      description: "All challenges, quizzes, completions, and submissions",
      icon: Target,
      color: "green",
      estimatedSize: realDataStats.challenges?.size || "0 KB",
      recordCount: `${realDataStats.challenges?.count || 0} challenges`,
    },
    {
      id: "proofs",
      title: "Proof Submissions",
      description: "User proof submissions, validation status, media files",
      icon: FileCheck,
      color: "orange",
      estimatedSize: realDataStats.proofs?.size || "0 KB",
      recordCount: `${realDataStats.proofs?.count || 0} proofs`,
    },
    {
      id: "votes",
      title: "Community Votes",
      description: "Community voting data, ratings, and feedback",
      icon: BarChart3,
      color: "purple",
      estimatedSize: realDataStats.votes?.size || "0 KB",
      recordCount: `${realDataStats.votes?.count || 0} votes`,
    },
    {
      id: "wheel_spins",
      title: "Wheel Spins",
      description: "SDG wheel spin results, timestamps, and outcomes",
      icon: Settings,
      color: "pink",
      estimatedSize: realDataStats.wheel_spins?.size || "0 KB",
      recordCount: `${realDataStats.wheel_spins?.count || 0} spins`,
    },
    {
      id: "activity_logs",
      title: "Activity Logs",
      description: "Complete activity history, user actions, system events",
      icon: FileText,
      color: "cyan",
      estimatedSize: realDataStats.activity_logs?.size || "0 KB",
      recordCount: `${realDataStats.activity_logs?.count || 0} activities`,
    },
    {
      id: "statistics",
      title: "Platform Statistics",
      description: "Aggregated statistics, performance metrics, analytics",
      icon: BarChart3,
      color: "yellow",
      estimatedSize: realDataStats.statistics?.size || "0 KB",
      recordCount: "Monthly reports",
    },
    {
      id: "odds",
      title: "ODD Configuration",
      description: "Sustainable Development Goals setup and weights",
      icon: Database,
      color: "red",
      estimatedSize: realDataStats.odds?.size || "45 KB",
      recordCount: `${realDataStats.odds?.count || 17} ODDs`,
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
    setExportStatus({ type: 'info', message: 'Preparing export...' })

    try {
      // Prepare the export request
      let dateFilter = undefined
      if (dateRange !== 'all') {
        if (dateRange === 'custom') {
          if (customDateRange.start && customDateRange.end) {
            dateFilter = {
              start: customDateRange.start,
              end: customDateRange.end
            }
          }
        } else {
          dateFilter = dateRange
        }
      }

      const exportRequest = {
        exportTypes: selectedExports,
        format: exportFormat,
        dateRange: dateFilter
      }

      console.log('🚀 Starting export with:', exportRequest)

      // Call the backend API
      const result = await api.exportData(exportRequest)
      
      if (!result || !result.data) {
        throw new Error('No data received from server')
      }

      console.log('✅ Export data received:', Object.keys(result.data))
      setExportStatus({ type: 'info', message: 'Processing data for download...' })

      // Convert the data to the requested format and prepare for download
      const files = convertMultipleDatasets(result.data, exportFormat, 'sustainability_export')
      
      if (!files || files.length === 0) {
        throw new Error('No files generated from export data')
      }

      console.log('📁 Generated files:', files.map(f => f.filename))
      setExportStatus({ type: 'info', message: `Downloading ${files.length} file(s)...` })

      // Download the files
      const downloadSuccess = await downloadMultipleFiles(files)
      
      if (downloadSuccess) {
        setExportStatus({ 
          type: 'success', 
          message: `Successfully exported ${files.length} file(s) with ${selectedExports.length} dataset(s)` 
        })
      } else {
        throw new Error('Download failed')
      }
      
    } catch (error) {
      console.error('❌ Export failed:', error)
      setExportStatus({ 
        type: 'error', 
        message: `Export failed: ${error.message}` 
      })
    } finally {
      setIsExporting(false)
      // Clear status after 5 seconds
      setTimeout(() => setExportStatus({ type: '', message: '' }), 5000)
    }
  }

  const getTotalSize = () => {
    if (loading) return '0'
    
    return selectedExports
      .reduce((total, id) => {
        const option = exportOptions.find((opt) => opt.id === id)
        if (!option || !option.estimatedSize) return total
        
        const sizeStr = option.estimatedSize.toString()
        const size = parseFloat(sizeStr)
        
        if (sizeStr.includes("MB")) {
          return total + size
        } else if (sizeStr.includes("KB")) {
          return total + (size / 1024)
        } else if (sizeStr.includes("GB")) {
          return total + (size * 1024)
        }
        return total
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                    <span className="ml-3 text-zinc-400">Loading data statistics...</span>
                  </div>
                ) : (
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
                )}
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
                  
                  {dateRange === 'custom' && (
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={customDateRange.start}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">End Date</label>
                        <input
                          type="date"
                          value={customDateRange.end}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}
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
                  disabled={selectedExports.length === 0 || isExporting || loading}
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

                {/* Export Status */}
                {exportStatus.message && (
                  <div className={`p-3 rounded-lg border flex items-center space-x-2 ${
                    exportStatus.type === 'success' 
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : exportStatus.type === 'error'
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  }`}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{exportStatus.message}</span>
                  </div>
                )}
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
