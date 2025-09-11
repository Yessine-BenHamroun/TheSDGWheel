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

  // Notification sound function
  const playNotificationSound = () => {
    try {
      // Create an audio context and play a notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher pitch
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Lower pitch
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        // Load initial data (unread count and notifications)
        loadInitialData();
      }
    } else {
      socketService.disconnect();
      // Reset state when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Load initial unread count and notifications
  const loadInitialData = async () => {
    if (!isAuthenticated) return;
    
    try {
      // Load unread count
      const countResponse = await ApiService.getUnreadNotificationsCount();
      const count = countResponse.unreadCount || 0;
      setUnreadCount(count);
      console.log('📊 Initial unread count loaded:', count);
      
      // Also load recent notifications if there are any unread
      if (count > 0) {
        const notificationsResponse = await ApiService.getUserNotifications(1, 10);
        setNotifications(notificationsResponse.notifications || []);
        console.log('📋 Initial notifications loaded:', notificationsResponse.notifications?.length);
      }
    } catch (error) {
      console.error('Failed to load initial notification data:', error);
    }
  };

  // Set up socket event listeners
  useEffect(() => {
    const handleConnected = () => {
      console.log('🔌 Socket connected - requesting initial data');
      setIsConnected(true);
      // Request initial unread count and notifications
      socketService.getUnreadCount();
      socketService.getUnreadNotifications();
    };

    const handleDisconnected = () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    };

    const handleNewNotification = (data) => {
      console.log('📢 Real-time notification received:', data);
      const { notification } = data;
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Play notification sound
      playNotificationSound();
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    };

    const handleUnreadCount = (data) => {
      console.log('📊 Unread count updated:', data);
      setUnreadCount(data.count || data || 0);
    };

    const handleUnreadNotifications = (data) => {
      console.log('📋 Unread notifications received:', data);
      setNotifications(data.notifications || []);
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
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const apiPromise = ApiService.getUserNotifications(page, limit);
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      if (page === 1) {
        setNotifications(response.notifications || []);
      } else {
        setNotifications(prev => [...prev, ...(response.notifications || [])]);
      }
      
      setUnreadCount(response.unreadCount || 0);
      return response;
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Set empty notifications on error to avoid infinite loading
      if (page === 1) {
        setNotifications([]);
      }
      setUnreadCount(0);
      
      if (error.message !== 'Request timeout') {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      }
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
