import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import ApiService from '../services/api';
import { useToast } from '../hooks/use-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
      }
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Set up socket event listeners
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      // Request initial unread count and notifications
      socketService.getUnreadCount();
      socketService.getUnreadNotifications();
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleNewNotification = (data) => {
      const { notification } = data;
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    };

    const handleUnreadCount = (count) => {
      setUnreadCount(count);
    };

    const handleUnreadNotifications = (notifications) => {
      setNotifications(notifications);
    };

    const handleAllNotificationsRead = () => {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    };

    const handleBroadcastNotification = (data) => {
      const { notification } = data;
      
      // Show toast for broadcast notifications
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    };

    // Register event listeners
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('new_notification', handleNewNotification);
    socketService.on('unread_count', handleUnreadCount);
    socketService.on('unread_notifications', handleUnreadNotifications);
    socketService.on('all_notifications_read', handleAllNotificationsRead);
    socketService.on('broadcast_notification', handleBroadcastNotification);

    // Cleanup listeners
    return () => {
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('new_notification', handleNewNotification);
      socketService.off('unread_count', handleUnreadCount);
      socketService.off('unread_notifications', handleUnreadNotifications);
      socketService.off('all_notifications_read', handleAllNotificationsRead);
      socketService.off('broadcast_notification', handleBroadcastNotification);
    };
  }, [toast]);

  // Load notifications from API
  const loadNotifications = async (page = 1, limit = 20) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await ApiService.getUserNotifications(page, limit);
      
      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setUnreadCount(response.unreadCount);
      return response;
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Send to server via socket
      socketService.markNotificationAsRead(notificationId);
      
      // Also call API as backup
      await ApiService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update on error
      loadNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);

      // Send to server via socket
      socketService.markAllNotificationsAsRead();
      
      // Also call API as backup
      await ApiService.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update on error
      loadNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // Optimistically update UI
      const notificationToDelete = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      await ApiService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert optimistic update on error
      loadNotifications();
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount: () => socketService.getUnreadCount(),
    refreshNotifications: () => socketService.getUnreadNotifications()
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
