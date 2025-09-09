"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Search, 
  Shield, 
  Ban, 
  UserCheck, 
  Mail, 
  MapPin, 
  Calendar,
  Award,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import { getAvatarUrl } from "@/utils/avatarUtils"

export default function UserModeration() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [actionLoading, setActionLoading] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [pagination.currentPage, searchTerm, filterStatus, filterRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        status: filterStatus === "all" ? "" : filterStatus,
        role: filterRole === "all" ? "" : filterRole
      }
      
      const response = await api.getAllUsers(params)
      setUsers(response.data || [])
      setPagination(prev => ({
        ...prev,
        ...response.pagination
      }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      setActionLoading(`${userId}-status`)
      const newStatus = !currentStatus
      
      await api.updateUserStatus(userId, newStatus)
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isActive: newStatus } : user
      ))
      
      toast({
        title: "Success",
        description: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      })
      
    } catch (error) {
      console.error('Failed to update user status:', error)
      toast({
        title: "Error",
        description: `Failed to update user status: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(`${userId}-role`)
      
      await api.updateUserRole(userId, newRole)
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ))
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole} successfully`,
      })
      
    } catch (error) {
      console.error('Failed to update user role:', error)
      toast({
        title: "Error",
        description: `Failed to update user role: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      setActionLoading(`${userId}-delete`)
      
      await api.deleteUser(userId)
      
      // Remove from local state
      setUsers(prev => prev.filter(user => user._id !== userId))
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  const handleFilterChange = (type, value) => {
    if (type === 'status') {
      setFilterStatus(value)
    } else if (type === 'role') {
      setFilterRole(value)
    }
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page
  }



  const getLevelColor = (level) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'ADVANCED':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'INTERMEDIATE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/50'
    }
  }

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-500/20 text-green-400 border-green-500/50'
      : 'bg-red-500/20 text-red-400 border-red-500/50'
  }

  const getRoleColor = (role) => {
    return role === 'admin'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <AdminSidebar />

      <div className="flex-1 relative z-10 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            User Moderation
          </h1>
          <p className="text-zinc-400">Manage users, roles, and account status</p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search users by name, email, or country..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>Total: {pagination.totalCount}</span>
            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <span>Showing {users.length} users</span>
          </div>
        </div>

        {/* Users List */}
        <Card className="bg-zinc-900 border border-zinc-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-400">Users ({pagination.totalCount})</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-zinc-400">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-400">No users found matching your criteria</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={getAvatarUrl(user.avatar)} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {user.username || user.firstName || user.email}
                            </h3>
                            <Badge variant="outline" className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(user.isActive)}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {user.level && (
                              <Badge variant="outline" className={getLevelColor(user.level)}>
                                {user.level}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-zinc-400">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.country && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{user.country}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Award className="h-3 w-3" />
                              <span>{user.totalPoints || 0} points</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-4">
                        {/* Status Toggle */}
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`status-${user._id}`} className="text-sm text-zinc-400">
                            Active/Inactive
                          </Label>
                          <Switch
                            id={`status-${user._id}`}
                            checked={user.isActive}
                            onCheckedChange={() => handleStatusToggle(user._id, user.isActive)}
                            disabled={actionLoading === `${user._id}-status`}
                          />
                        </div>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-700" />
                            
                            {user.role === 'user' ? (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(user._id, 'admin')}
                                className="text-blue-400 hover:text-blue-300"
                                disabled={actionLoading === `${user._id}-role`}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(user._id, 'user')}
                                className="text-zinc-400 hover:text-zinc-300"
                                disabled={actionLoading === `${user._id}-role`}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Make User
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator className="bg-zinc-700" />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-400 hover:text-red-300"
                              disabled={actionLoading === `${user._id}-delete`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-700">
                    <div className="text-sm text-zinc-400">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                      {pagination.totalCount} users
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev || loading}
                        className="border-zinc-700 hover:bg-zinc-800"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, pagination.currentPage - 2) + i
                          if (pageNum > pagination.totalPages) return null
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === pagination.currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                              className={
                                pageNum === pagination.currentPage
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "border-zinc-700 hover:bg-zinc-800"
                              }
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext || loading}
                        className="border-zinc-700 hover:bg-zinc-800"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
