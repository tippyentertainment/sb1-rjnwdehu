import React from "react";
import { Bell, Volume2, VolumeX, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import NotificationList from "./Notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { notificationSound } from "@/utils/sound";
import { type Notification } from "@/types/notification";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { useToast } from "./ui/use-toast";

const NotificationInbox = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isMuted, setIsMuted] = React.useState(() => notificationSound.isMuted());
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  // Only count unread notifications of type 'mention' or 'assignment'
  const unreadCount = notifications.filter(
    (n) => !n.read && (n.type === 'mention' || n.type === 'assignment')
  ).length;

  const handleNotificationClick = async (notification: Notification) => {
    console.log(`Clicked notification: ${notification.id} of type ${notification.type}`);
    
    try {
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      if (notification.reference) {
        setIsOpen(false); // Close popover before navigation
        
        // Add a small delay to ensure the popover closes smoothly before navigation
        setTimeout(() => {
          const { type, id } = notification.reference!;
          console.log(`Navigating to ${type} with id ${id}`);
          
          switch (type) {
            case 'message':
              navigate(`/chat/${id}`);
              break;
            case 'group':
              navigate(`/chat/group/${id}`);
              break;
            case 'task':
            case 'mention':
            case 'assignment':
              navigate(`/tasks?taskId=${id}`);
              break;
            case 'run':
              navigate(`/runs/${id}`);
              break;
            case 'scope':
              navigate(`/scopes/${id}`);
              break;
            case 'comment':
              navigate(`/tasks?taskId=${id}&comment=${notification.id}`);
              break;
            case 'tag':
              navigate(`/tasks?taskId=${id}&highlight=tag`);
              break;
            default:
              console.error('Unknown notification type:', type);
              toast({
                title: "Error",
                description: "Unable to navigate to this notification",
                variant: "destructive"
              });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive"
      });
    }
  };

  const toggleMute = () => {
    const newMutedState = notificationSound.toggleMute();
    setIsMuted(newMutedState);
    console.log('Notification sound muted:', newMutedState);
  };

  const handleMarkAllAsRead = async () => {
    console.log('Marking all notifications as read');
    await markAllAsRead();
    // Don't close the popover to allow users to still see the notifications
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="relative"
              aria-label={isMuted ? "Unmute notifications" : "Mute notifications"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? "Unmute notifications" : "Mute notifications"}</p>
          </TooltipContent>
        </Tooltip>
        
        <Popover 
          open={isOpen} 
          onOpenChange={setIsOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-primary flex items-center justify-center px-1">
                  <span className="text-[10px] font-medium text-primary-foreground">
                    {unreadCount}
                  </span>
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0" 
            align="end"
            sideOffset={5}
            alignOffset={0}
            onPointerDownOutside={(e) => {
              // Prevent closing on mobile scroll
              e.preventDefault();
            }}
            onInteractOutside={(e) => {
              // Only close if clicking outside, not when navigating or scrolling
              if (!isOpen) return;
              const target = e.target as HTMLElement;
              // Don't close if clicking on a tooltip
              if (target.closest('[role="tooltip"]')) return;
              setIsOpen(false);
            }}
          >
            <div className="p-2 border-b bg-background flex items-center justify-between">
              <h4 className="font-medium">Notifications ({unreadCount})</h4>
              {unreadCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleMarkAllAsRead}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark all as read</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <NotificationList 
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onHover={markAsRead}
            />
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
};

export default NotificationInbox;