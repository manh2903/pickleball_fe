import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.io server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server');
    });

    return this.socket;
  }

  joinCourt(courtId: number | string) {
    this.socket?.emit('join-court', courtId);
  }

  joinVenue(venueId: number | string) {
    this.socket?.emit('join-venue', venueId);
  }

  joinUser(userId: number | string) {
    this.socket?.emit('join-user', userId);
  }

  joinAdmin() {
    this.socket?.emit('join-admin');
  }

  onSlotsUpdated(callback: (data: { ids: number[], status: string }) => void) {
    this.socket?.on('slots-updated', callback);
  }

  onNewBooking(callback: (data: any) => void) {
    this.socket?.on('new-booking', callback);
  }

  onNewNotification(callback: (data: any) => void) {
    this.socket?.on('new-notification', callback);
  }

  onBookingStatusUpdated(callback: (data: { id: number, status: string }) => void) {
    this.socket?.on('booking-status-updated', callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();
