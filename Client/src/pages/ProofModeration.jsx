import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Eye, User, Calendar, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminSidebar } from '@/components/AdminSidebar'
import { MouseFollower } from '@/components/mouse-follower'
import { ScrollProgress } from '@/components/scroll-progress'
import ApiService from '@/services/api'
import AlertService from '@/services/alertService'

const ProofModeration = () => {
  const navigate = useNavigate()
  
  const [proofs, setProofs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all')
  
  // Rejection dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedProofForRejection, setSelectedProofForRejection] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false)

  // Media modal state
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)

  const proofsPerPage = 12

  useEffect(() => {
    loadProofs()
  }, [currentPage, searchTerm, statusFilter, mediaTypeFilter])

  const loadProofs = async () => {
    try {
      setLoading(true)
      // Try both endpoints to see which one works
      let response
      try {
        response = await ApiService.getAllProofs()
      } catch (error) {
        console.log('getAllProofs failed, trying getPendingProofs:', error)
        response = await ApiService.getPendingProofs()
      }

      console.log('Raw API response:', response)

      // Apply filters - extract proofs from response like in dashboard
      let filteredProofs = response?.proofs || response || []

      // Filter by status
      if (statusFilter !== 'all') {
        filteredProofs = filteredProofs.filter(proof => proof.status === statusFilter)
      }

      if (searchTerm) {
        filteredProofs = filteredProofs.filter(proof =>
          proof.challenge?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proof.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (mediaTypeFilter !== 'all') {
        filteredProofs = filteredProofs.filter(proof => proof.mediaType === mediaTypeFilter)
      }
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * proofsPerPage
      const endIndex = startIndex + proofsPerPage
      const paginatedProofs = filteredProofs.slice(startIndex, endIndex)
      
      setProofs(paginatedProofs)
      setTotalCount(filteredProofs.length)
      setTotalPages(Math.ceil(filteredProofs.length / proofsPerPage))

      // Debug logging
      console.log('📊 [PROOF MODERATION] Proofs loaded successfully:', {
        totalProofs: filteredProofs.length,
        currentPage: currentPage,
        proofsPerPage: proofsPerPage,
        displayedProofs: paginatedProofs.length,
        totalPages: Math.ceil(filteredProofs.length / proofsPerPage),
        filters: {
          searchTerm,
          statusFilter,
          mediaTypeFilter
        },
        proofIds: paginatedProofs.map(p => p._id),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to load proofs:', error)
      AlertService.error("Failed to Load Proofs", "Unable to load pending proofs. Please try refreshing the page.");
    } finally {
      setLoading(false)
    }
  }

  const handleApproveProof = async (proof) => {
    const isConfirmed = await AlertService.confirm(
      "Approve This Proof?",
      `You're about to approve ${proof.user?.username}'s submission for "${proof.challenge?.title}". They will receive ${proof.challenge?.points || 20} points and a notification.`,
      "Approve",
      "Cancel"
    );

    if (!isConfirmed) return;

    console.log("🔍 [PROOF MODERATION] Starting proof approval process:", {
      proofId: proof._id,
      userId: proof.user?._id,
      username: proof.user?.username,
      challengeId: proof.challenge?._id,
      challengeTitle: proof.challenge?.title,
      challengePoints: proof.challenge?.points,
      mediaType: proof.mediaType,
      currentStatus: proof.status,
      timestamp: new Date().toISOString()
    })

    try {
      console.log("📤 [PROOF MODERATION] Sending approval request to API...")
      const response = await ApiService.verifyProof(proof._id, true, "")

      console.log("✅ [PROOF MODERATION] Proof approved successfully:", {
        proofId: proof._id,
        response: response,
        timestamp: new Date().toISOString()
      })

      setProofs(prev => prev.filter(p => p._id !== proof._id))

      AlertService.success("Proof Approved!", `${proof.user?.username} will receive ${proof.challenge?.points || 20} points and a notification about the approval.`);

      console.log("🎉 [PROOF MODERATION] Approval process completed successfully")
    } catch (error) {
      console.error("❌ [PROOF MODERATION] Approve proof error:", {
        proofId: proof._id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })

      AlertService.error("Approval Failed", error.message || "Failed to approve proof. Please try again.");
    }
  }

  const handleRejectProof = (proof) => {
    setSelectedProofForRejection(proof)
    setRejectionReason("")
    setShowRejectDialog(true)
  }

  const handleSubmitRejection = async () => {
    if (!selectedProofForRejection || !rejectionReason.trim()) {
      console.log("⚠️ [PROOF MODERATION] Rejection validation failed:", {
        hasProof: !!selectedProofForRejection,
        hasReason: !!rejectionReason.trim(),
        reasonLength: rejectionReason.length
      })

      AlertService.warning("Rejection Reason Required", "Please provide a clear reason for rejecting this proof submission.");
      return
    }

    console.log("🔍 [PROOF MODERATION] Starting proof rejection process:", {
      proofId: selectedProofForRejection._id,
      userId: selectedProofForRejection.user?._id,
      username: selectedProofForRejection.user?.username,
      challengeId: selectedProofForRejection.challenge?._id,
      challengeTitle: selectedProofForRejection.challenge?.title,
      rejectionReason: rejectionReason.trim(),
      reasonLength: rejectionReason.trim().length,
      currentStatus: selectedProofForRejection.status,
      timestamp: new Date().toISOString()
    })

    try {
      setIsSubmittingRejection(true)

      console.log("📤 [PROOF MODERATION] Sending rejection request to API...")
      const response = await ApiService.verifyProof(selectedProofForRejection._id, false, rejectionReason.trim())

      console.log("✅ [PROOF MODERATION] Proof rejected successfully:", {
        proofId: selectedProofForRejection._id,
        response: response,
        timestamp: new Date().toISOString()
      })

      setProofs(prev => prev.filter(p => p._id !== selectedProofForRejection._id))

      AlertService.success("Proof Rejected", `${selectedProofForRejection.user?.username} will receive a notification with your feedback about why the submission was rejected.`);

      setShowRejectDialog(false)
      setSelectedProofForRejection(null)
      setRejectionReason("")

      console.log("🎯 [PROOF MODERATION] Rejection process completed successfully")
    } catch (error) {
      console.error("❌ [PROOF MODERATION] Reject proof error:", {
        proofId: selectedProofForRejection._id,
        error: error.message,
        stack: error.stack,
        rejectionReason: rejectionReason.trim(),
        timestamp: new Date().toISOString()
      })

      AlertService.error("Rejection Failed", error.message || "Failed to reject proof. Please try again.");
    } finally {
      setIsSubmittingRejection(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', label: 'Pending' },
      APPROVED: { color: 'bg-green-500/20 text-green-400 border-green-500/50', label: 'Approved' },
      REJECTED: { color: 'bg-red-500/20 text-red-400 border-red-500/50', label: 'Rejected' }
    }
    
    const config = statusConfig[status] || statusConfig.PENDING
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getMediaTypeIcon = (mediaType) => {
    switch (mediaType) {
      case 'IMAGE': return '🖼️'
      case 'VIDEO': return '🎥'
      case 'DOCUMENT': return '📄'
      default: return '📎'
    }
  }

  const getMediaUrl = (url) => {
    if (!url) return "/placeholder.svg"
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
  }

  const handleMediaClick = (proof) => {
    setSelectedMedia(proof)
    setShowMediaModal(true)
  }

  const closeMediaModal = () => {
    setShowMediaModal(false)
    setSelectedMedia(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <MouseFollower />
        <ScrollProgress />

        <div className="relative flex">
          <AdminSidebar />
          <div className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      <AdminSidebar />
      <div className="flex-1 relative z-10">
        
        {/* Main Content */}
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600 mb-2">
              Proof Moderation
            </h1>
            <p className="text-zinc-400">Manage and moderate user submissions</p>

            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="text-zinc-300 border-zinc-600">
                {totalCount} Total Proofs
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-zinc-900/50 border-zinc-700/50 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search by challenge or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-800/50 border-zinc-600 text-white placeholder-zinc-400 focus:border-blue-500"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-zinc-800/50 border-zinc-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="all">All Status</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
                  <SelectTrigger className="w-48 bg-zinc-800/50 border-zinc-600 text-white">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IMAGE">Images</SelectItem>
                    <SelectItem value="VIDEO">Videos</SelectItem>
                    <SelectItem value="DOCUMENT">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Proofs Grid */}
          {proofs.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-700/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Proofs Found</h3>
                <p className="text-zinc-400">No proofs match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {proofs.map((proof) => (
                <Card key={proof._id} className="bg-zinc-900/50 border-zinc-700/50 backdrop-blur-sm hover:border-zinc-600 transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMediaTypeIcon(proof.mediaType)}</span>
                        {getStatusBadge(proof.status)}
                      </div>
                    </div>
                    <CardTitle className="text-sm text-white line-clamp-2">
                      {proof.challenge?.title || 'Unknown Challenge'}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Proof Preview */}
                    <div
                      className="aspect-video bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-700/50 cursor-pointer hover:border-zinc-600 transition-colors"
                      onClick={() => handleMediaClick(proof)}
                    >
                      {proof.mediaType === "IMAGE" && proof.url ? (
                        <img
                          src={getMediaUrl(proof.url)}
                          alt="Proof"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                          }}
                        />
                      ) : proof.mediaType === "VIDEO" && proof.url ? (
                        <div className="relative w-full h-full">
                          <video
                            src={getMediaUrl(proof.url)}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                            <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">{getMediaTypeIcon(proof.mediaType)}</div>
                            <p className="text-sm text-zinc-400">{proof.mediaType} Proof</p>
                            {proof.description && (
                              <p className="text-xs text-zinc-500 mt-2 max-w-xs line-clamp-3">
                                {proof.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <User className="h-4 w-4" />
                      <span>{proof.user?.username || 'Unknown User'}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(proof.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    {proof.status === 'PENDING' && (
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex-1 transition-colors"
                          onClick={() => handleApproveProof(proof)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 transition-colors"
                          onClick={() => handleRejectProof(proof)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700/50 backdrop-blur-sm"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page
                      ? "bg-blue-600 hover:bg-blue-700 backdrop-blur-sm"
                      : "border-zinc-600 text-zinc-300 hover:bg-zinc-700/50 backdrop-blur-sm"
                    }
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700/50 backdrop-blur-sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900/90 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Reject Proof Submission
            </h3>
            
            {selectedProofForRejection && (
              <div className="mb-4 p-3 bg-zinc-700/50 rounded-lg">
                <p className="text-sm text-zinc-300">
                  <strong>Challenge:</strong> {selectedProofForRejection.challenge?.title}
                </p>
                <p className="text-sm text-zinc-300">
                  <strong>User:</strong> {selectedProofForRejection.user?.username}
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Reason for rejection <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason why this proof doesn't meet the requirements..."
                className="w-full h-24 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-zinc-400 mt-1">
                {rejectionReason.length}/500 characters
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setSelectedProofForRejection(null)
                  setRejectionReason("")
                }}
                className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                disabled={isSubmittingRejection}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmitRejection}
                className="flex-1"
                disabled={isSubmittingRejection || !rejectionReason.trim()}
              >
                {isSubmittingRejection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Reject Proof
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeMediaModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Media content */}
            <div className="w-full h-full flex items-center justify-center">
              {selectedMedia.mediaType === "IMAGE" && selectedMedia.url ? (
                <img
                  src={getMediaUrl(selectedMedia.url)}
                  alt="Proof"
                  className="max-w-full max-h-full object-contain"
                  style={{ maxWidth: '720px', maxHeight: '990px' }}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                  }}
                />
              ) : selectedMedia.mediaType === "VIDEO" && selectedMedia.url ? (
                <video
                  src={getMediaUrl(selectedMedia.url)}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxWidth: '720px', maxHeight: '990px' }}
                  controls
                  autoPlay
                />
              ) : (
                <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
                  <div className="text-6xl mb-4">{getMediaTypeIcon(selectedMedia.mediaType)}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedMedia.mediaType} Proof</h3>
                  {selectedMedia.description && (
                    <p className="text-zinc-400">{selectedMedia.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Media info overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-md">
              <h3 className="font-semibold mb-1">{selectedMedia.challenge?.title || 'Unknown Challenge'}</h3>
              <p className="text-sm text-zinc-300 mb-2">By {selectedMedia.user?.username || 'Unknown User'}</p>
              {selectedMedia.description && (
                <p className="text-sm text-zinc-400">{selectedMedia.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProofModeration
