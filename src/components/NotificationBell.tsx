import React, { useState, useEffect } from "react";
import { Badge, IconButton, Menu, List, ListItem, ListItemText, Typography, Divider, Box, Button, CircularProgress, Tooltip } from "@mui/material";
import { Notifications as NotificationsIcon, CheckCircle, Error, Info, CreditCard } from "@mui/icons-material";
import { notificationApi } from "@/api/notificationApi";
import { socketService } from "@/utils/socket";
import { useAuthStore } from "@/stores/authStore";
import { useSnackbar } from "notistack";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at?: string;
  createdAt?: string; // Fallback for different casing
}

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res: any = await notificationApi.getNotifications({ limit: 5 });
      // The interceptor unwraps res.data, so res is the actual payload
      setNotifications(res?.notifications || []);
      setUnreadCount(res?.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();

      // Listen for new notifications (keep reference for cleanup)
      const handleNewNotif = (newNotif: Notification) => {
        setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
        setUnreadCount((prev) => prev + 1);

        // Global toast for any level of notification
        enqueueSnackbar(newNotif.title, {
          variant: "info",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });

        try {
          const audio = new Audio("/assets/notification.mp3");
          audio.play();
        } catch (e) {
          /* ignore audio policy errors */
        }
      };

      // Specific event for admins for withdrawal requests (just for cross-tab sync if needed, no toast)
      const handleDirectWithdrawal = (_data: any) => {
        // No toast here to avoid duplicates
      };

      socketService.socket?.on("new-notification", handleNewNotif);
      socketService.socket?.on("withdrawal-new-request", handleDirectWithdrawal);

      return () => {
        socketService.socket?.off("new-notification", handleNewNotif);
        socketService.socket?.off("withdrawal-new-request", handleDirectWithdrawal);
      };
    }
  }, [isAuthenticated, user?.id, enqueueSnackbar]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (unreadCount > 0) {
      // Logic for clearing or updating would go here if needed when opening
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking_confirmed":
      case "withdrawal_approved":
        return <CheckCircle color="success" />;
      case "booking_cancelled":
      case "withdrawal_rejected":
        return <Error color="error" />;
      case "payment_received":
        return <CreditCard color="primary" />;
      default:
        return <Info color="info" />;
    }
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton color="inherit" onClick={handleClick} sx={{ ml: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1.5,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead} sx={{ textTransform: "none", fontWeight: 700 }}>
              Đọc tất cả
            </Button>
          )}
        </Box>
        <Divider />

        {loading && notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Bạn chưa có thông báo nào
                </Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <React.Fragment key={notif.id}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                    sx={{
                      bgcolor: notif.is_read ? "transparent" : "rgba(34, 197, 94, 0.04)",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                    }}
                  >
                    <Box sx={{ mr: 2, mt: 0.5 }}>{getIcon(notif.type)}</Box>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: notif.is_read ? 600 : 800 }}>
                          {notif.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary" sx={{ my: 0.5 }} component="span" display="block">
                            {notif.body}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span" display="block">
                            {(() => {
                              const dateVal = notif.created_at || notif.createdAt;
                              if (!dateVal) return "Đang cập nhật...";
                              const d = new Date(dateVal);
                              if (isNaN(d.getTime())) return "Ngày không hợp lệ";
                              return formatDistanceToNow(d, { addSuffix: true, locale: vi });
                            })()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </List>
        )}

        <Box sx={{ p: 1.5, textAlign: "center" }}>
          <Button fullWidth variant="text" size="small" sx={{ textTransform: "none", fontWeight: 700 }}>
            Xem tất cả thông báo
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;
