import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const NotificationDropdown = () => {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load notifications when dropdown opens for the first time
  useEffect(() => {
    if (isOpen && !hasLoaded && !isLoading) {
      loadNotifications().finally(() => {
        setHasLoaded(true);
      });
    }
  }, [isOpen, hasLoaded, isLoading, loadNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PROOF_APPROVED':
        return '🎉';
      case 'PROOF_REJECTED':
        return '❌';
      case 'CHALLENGE_COMPLETED':
        return '✅';
      case 'BADGE_EARNED':
        return '🏆';
      case 'LEVEL_UP':
        return '⬆️';
      case 'SYSTEM_ANNOUNCEMENT':
        return '📢';
      case 'POST_VOTED':
        return '👍';
      default:
        return '📬';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'HIGH') {
      return 'border-l-red-500';
    }
    
    switch (type) {
      case 'PROOF_APPROVED':
      case 'CHALLENGE_COMPLETED':
      case 'BADGE_EARNED':
      case 'LEVEL_UP':
        return 'border-l-green-500';
      case 'PROOF_REJECTED':
        return 'border-l-red-500';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'border-l-blue-500';
      case 'POST_VOTED':
        return 'border-l-purple-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) {
      return t('notifications.timeAgo.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('notifications.timeAgo.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('notifications.timeAgo.hoursAgo', { count: hours });
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return t('notifications.timeAgo.daysAgo', { count: days });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-zinc-800"
        >
          <Bell className="h-5 w-5 text-zinc-400" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-zinc-900 border-zinc-700"
        sideOffset={5}
      >
        <DropdownMenuHeader className="px-4 py-3 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{t('notifications.title')}</h3>
            <div className="flex items-center gap-2">
              {/* {!isConnected && (
                // <Badge variant="outline" className="text-xs border-red-500 text-red-400">
                //   {t('notifications.offline')}
                // </Badge>
              )} */}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-6 px-2 text-xs text-zinc-400 hover:text-white"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  {t('notifications.markAllRead')}
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuHeader>

        <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {isLoading ? (
            <div className="p-4 text-center text-zinc-400">
              {t('notifications.loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-zinc-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('notifications.noNotifications')}</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.slice(0, 20).map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 cursor-pointer border-l-4 hover:bg-zinc-800/30 ${getNotificationColor(
                    notification.type,
                    notification.priority
                  )} ${
                    !notification.isRead
                      ? 'bg-zinc-800/50'
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-white' : 'text-zinc-300'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteNotification(e, notification._id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-zinc-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.data?.pointsAwarded && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                            +{notification.data.pointsAwarded} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length > 20 && (
                <div className="border-t border-zinc-700 mx-4" />
              )}
            </div>
          )}
        </div>

        {/* {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="border-zinc-700" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-zinc-400 hover:text-white"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if you have one
                  // navigate('/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
