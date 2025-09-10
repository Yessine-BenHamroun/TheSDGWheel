"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, 
  Reply, 
  Trash2, 
  Search, 
  Filter,
  Mail,
  MailOpen,
  Clock,
  CheckCircle,
  Archive,
  AlertCircle,
  Send,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import AlertService from "@/services/alertService"

export default function MessageManagement() {
  const { toast } = useToast()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, replied: 0, archived: 0 })
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadMessages();
  }, [currentPage, filters]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await api.getAllMessages(params);
      setMessages(response.messages);
      setStats(response.stats);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading messages:', error);
      AlertService.error("Failed to Load Messages", "Unable to retrieve messages from the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      AlertService.warning("Missing Reply", "Please enter a reply message before sending.");
      return;
    }

    try {
      setIsReplying(true);
      AlertService.loading("Sending Reply", "Please wait while we send your reply...");
      
      const response = await api.replyToMessage(selectedMessage._id, replyText);
      
      // Send email via EmailJS if email data is provided
      if (response.emailData) {
        try {
          const { sendMessageReply } = await import('../../services/emailService');
          await sendMessageReply(
            selectedMessage.email,
            selectedMessage.name,
            `Re: ${selectedMessage.subject}`,
            selectedMessage.message,
            replyText
          );
          console.log('📧 Reply email sent via EmailJS');
        } catch (emailError) {
          console.error('📧 Failed to send email via EmailJS:', emailError);
          AlertService.warning("Email Warning", "Reply saved but email notification failed to send.");
        }
      }
      
      // Optimistic update
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === selectedMessage._id 
            ? { 
                ...msg, 
                status: 'replied', 
                adminReply: replyText,
                repliedAt: new Date().toISOString(),
                isRead: true
              }
            : msg
        )
      );
      
      AlertService.close();
      AlertService.success("Reply Sent! ✉️", "Your reply has been sent successfully and the user will be notified via email.");
      
      setShowReplyModal(false);
      setReplyText('');
      setSelectedMessage(null);
      
      // Reload to update stats
      loadMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      AlertService.close();
      AlertService.error("Failed to Send Reply", error.message || "An error occurred while sending the reply. Please try again.");
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      // Optimistic update
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, status: newStatus }
            : msg
        )
      );

      await api.updateMessageStatus(messageId, { status: newStatus });
      
      AlertService.toast.success(`Message marked as ${newStatus}`);
      
      // Reload to update stats
      loadMessages();
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Revert on error - reload to get correct state
      loadMessages();
      
      AlertService.toast.error("Failed to update message status");
    }
  };



  const handleDeleteMessage = async (messageId) => {
    const result = await AlertService.confirmDelete("this message");
    
    if (!result.isConfirmed) {
      return;
    }

    try {
      AlertService.loading("Deleting Message", "Please wait...");
      await api.deleteMessage(messageId);
      AlertService.close();
      AlertService.success("Message Deleted", "The message has been permanently deleted from the system.");
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      AlertService.close();
      AlertService.error("Delete Failed", error.message || "Failed to delete the message. Please try again.");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'normal': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'low': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'replied': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'archived': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            Message Management
          </h1>
          <p className="text-zinc-400">Manage and reply to contact form messages</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">Pending Messages</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">Replied Messages</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.replied}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">Archived Messages</p>
                  <p className="text-3xl font-bold text-gray-400 mt-2">{stats.archived}</p>
                </div>
                <div className="p-3 bg-gray-500/20 rounded-full">
                  <Archive className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Filters */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 bg-zinc-900/50 border-zinc-600"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 bg-zinc-900/50 border border-zinc-600 rounded-md text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 bg-zinc-900/50 border border-zinc-600 rounded-md text-white"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-zinc-400 mt-4">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No messages found</h3>
            <p className="text-zinc-400">No contact messages match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message._id} className={`bg-zinc-800/50 border-zinc-700 transition-all duration-200 hover:border-zinc-600 ${!message.isRead ? 'ring-1 ring-blue-500/30' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {message.isRead ? (
                          <MailOpen className="h-4 w-4 text-zinc-400" />
                        ) : (
                          <Mail className="h-4 w-4 text-blue-400" />
                        )}
                        <h3 className="text-lg font-semibold text-white truncate">
                          {message.subject}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-zinc-400 mb-2">
                      <strong className="text-zinc-300">{message.name}</strong> • {message.email}
                    </div>
                    
                    <p className="text-zinc-300 mb-3 line-clamp-2">
                      {message.message}
                    </p>
                    
                    <div className="text-xs text-zinc-500">
                      {formatDate(message.createdAt)}
                      {message.repliedAt && (
                        <span className="ml-4">
                          Replied: {formatDate(message.repliedAt)}
                        </span>
                      )}
                    </div>

                    {message.adminReply && (
                      <div className="mt-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-600">
                        <div className="text-xs text-zinc-400 mb-1">Admin Reply:</div>
                        <p className="text-sm text-zinc-300">{message.adminReply}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {message.status !== 'replied' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowReplyModal(true);
                        }}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(message._id, message.status === 'archived' ? 'pending' : 'archived')}
                      className="border-gray-600 text-gray-400 hover:bg-gray-600/20"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMessage(message._id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-purple-600" : "border-zinc-600"}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowReplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Reply to Message</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-900/50 p-4 rounded-lg">
                  <div className="text-sm text-zinc-400 mb-2">Original Message:</div>
                  <div className="text-sm">
                    <strong className="text-white">{selectedMessage.name}</strong> • {selectedMessage.email}
                  </div>
                  <div className="text-sm text-zinc-400 mb-2">{selectedMessage.subject}</div>
                  <p className="text-zinc-300">{selectedMessage.message}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your Reply
                  </label>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={6}
                    className="bg-zinc-900/50 border-zinc-600 text-white"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowReplyModal(false)}
                    className="border-zinc-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReply}
                    disabled={isReplying || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isReplying ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
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
