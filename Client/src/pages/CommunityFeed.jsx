"use client"

import { useState, useEffect } from "react"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, ThumbsUp, Clock, Award } from "lucide-react"
import UserNavbar from "@/components/UserNavbar"
import api from "@/services/api"
import { getAvatarUrl, getMediaUrl } from "@/utils/avatarUtils"

export default function CommunityFeed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [votingPost, setVotingPost] = useState(null)
  const [userVotes, setUserVotes] = useState(new Set())

  useEffect(() => {
    fetchCommunityPosts()
    fetchUserVotes()
  }, [])

  const fetchCommunityPosts = async () => {
    try {
      setLoading(true)
      const response = await api.getCommunityPosts()
      setPosts(response.data || [])
    } catch (error) {
      console.error('Failed to fetch community posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserVotes = async () => {
    try {
      const response = await api.getUserVotes()
      setUserVotes(new Set(response.data || []))
    } catch (error) {
      console.error('Failed to fetch user votes:', error)
    }
  }

  const handleVote = async (postId) => {
    if (userVotes.has(postId) || votingPost === postId) return

    try {
      setVotingPost(postId)
      await api.voteOnPost(postId)
      
      // Update local state
      setUserVotes(prev => new Set([...prev, postId]))
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, votes: (post.votes || 0) + 1 }
          : post
      ))
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setVotingPost(null)
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInMinutes = Math.floor((now - posted) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'under_review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white">
      <MouseFollower />
      <ScrollProgress />
      <UserNavbar />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              Community Feed
            </h1>
            <p className="text-zinc-400">Discover and vote on sustainability proofs from the community</p>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-zinc-900/50 border-zinc-700 animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-zinc-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-zinc-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-zinc-700 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-zinc-700 rounded w-full mb-4"></div>
                    <div className="h-48 bg-zinc-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">No posts yet</h3>
                <p className="text-zinc-500">Be the first to share your sustainability proof!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post._id} className="bg-zinc-900/50 border-zinc-700 hover:border-zinc-600 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={getAvatarUrl(post.user?.avatar)} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {post.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white">{post.user?.username || 'Anonymous'}</p>
                          <div className="flex items-center space-x-2 text-sm text-zinc-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            {post.user?.country && (
                              <>
                                <span>•</span>
                                <span>{post.user.country}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(post.status)}>
                        {post.status || 'SUBMITTED'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Challenge Info */}
                    {post.challenge && (
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-400 mb-1">{post.challenge.title}</h4>
                        <p className="text-sm text-zinc-400">{post.challenge.description}</p>
                      </div>
                    )}

                    {/* Post Description */}
                    {post.description && (
                      <p className="text-zinc-200">{post.description}</p>
                    )}

                    {/* Proof Media */}
                    {post.url && (
                      <div className="rounded-lg overflow-hidden bg-zinc-800/30 border border-zinc-700">
                        {post.mediaType === 'IMAGE' || post.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img 
                            src={getMediaUrl(post.url)}
                            alt="Proof submission"
                            className="w-full max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              console.error('Failed to load image:', post.url)
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                            onClick={() => window.open(getMediaUrl(post.url), '_blank')}
                          />
                        ) : post.mediaType === 'VIDEO' || post.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) ? (
                          <video 
                            src={getMediaUrl(post.url)}
                            controls
                            className="w-full max-h-96"
                            onError={(e) => {
                              console.error('Failed to load video:', post.url)
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="flex items-center justify-center h-32 text-zinc-400 p-4">
                            <div className="text-center">
                              <Award className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Document file</p>
                              <a 
                                href={getMediaUrl(post.url)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-block"
                              >
                                Open file
                              </a>
                            </div>
                          </div>
                        )}
                        {/* Fallback error display */}
                        <div className="hidden items-center justify-center h-32 text-zinc-400 p-4">
                          <div className="text-center">
                            <Award className="h-8 w-8 mx-auto mb-2 text-red-400" />
                            <p className="text-sm text-red-400">Unable to load media</p>
                            <p className="text-xs text-zinc-500 mt-1">File may be corrupted or moved</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(post._id)}
                          disabled={userVotes.has(post._id) || votingPost === post._id}
                          className={`flex items-center space-x-2 ${
                            userVotes.has(post._id) 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-zinc-400 hover:text-red-400'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${userVotes.has(post._id) ? 'fill-current' : ''}`} />
                          <span>{post.votes || 0}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-zinc-400 hover:text-blue-400">
                          <MessageCircle className="h-4 w-4" />
                          <span>Comment</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-zinc-400 hover:text-green-400">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </Button>
                      </div>

                      {post.points && (
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                          +{post.points} points
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
