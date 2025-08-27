import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error.message);
      this.emit('connection_error', error);
    });

    // Listen for new notifications
    this.socket.on('new_notification', (data) => {
      console.log('📢 New notification received:', data.notification);
      this.emit('new_notification', data);
    });

    // Listen for unread count updates
    this.socket.on('unread_count', (data) => {
      this.emit('unread_count', data.count);
    });

    // Listen for unread notifications
    this.socket.on('unread_notifications', (data) => {
      this.emit('unread_notifications', data.notifications);
    });

    // Listen for all notifications marked as read
    this.socket.on('all_notifications_read', () => {
      this.emit('all_notifications_read');
    });

    // Listen for broadcast notifications
    this.socket.on('broadcast_notification', (data) => {
      console.log('📢 Broadcast notification received:', data.notification);
      this.emit('broadcast_notification', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Socket.IO methods
  getUnreadCount() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_unread_count');
    }
  }

  getUnreadNotifications() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_unread_notifications');
    }
  }

  markNotificationAsRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  markAllNotificationsAsRead() {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_all_notifications_read');
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    return 'disconnected';
  }
}

// Export singleton instance
export default new SocketService();
