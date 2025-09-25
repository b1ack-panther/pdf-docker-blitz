import { WebSocketMessage, Alert, FaceDetection, Camera } from '@/types';
import { authService } from './auth';

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  
  private constructor() {}
  
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    const token = authService.getCurrentToken();
    if (!token) return;
    
    this.isConnecting = true;
    
    // Mock WebSocket URL - in real app this would be wss://api.skylarklabs.ai/ws
    const wsUrl = `ws://localhost:3001/ws?token=${token.token}`;
    
    try {
      // Since we can't actually connect to a WebSocket in this demo,  
      // we'll simulate WebSocket behavior with mock data
      this.simulateWebSocketConnection();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }
  
  private simulateWebSocketConnection(): void {
    // Simulate connection success
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.emit('connected');
    
    // Simulate periodic alerts and updates
    this.startMockDataStream();
  }
  
  private startMockDataStream(): void {
    // Simulate face detection alerts every 10-30 seconds
    const alertInterval = setInterval(() => {
      if (!authService.isAuthenticated()) {
        clearInterval(alertInterval);
        return;
      }
      
      const mockAlert: Alert = {
        id: Date.now(),
        cameraId: Math.random() > 0.5 ? 1 : 3,
        timestamp: new Date().toISOString(),
        confidence: Math.random() * 0.2 + 0.8,
        imageUrl: null,
        cameraName: Math.random() > 0.5 ? 'Main Entrance' : 'Conference Room',
        type: 'face_detected',
        message: `Face detected with ${Math.floor(Math.random() * 20 + 80)}% confidence`,
        isRead: false,
      };
      
      this.emit('alert', mockAlert);
    }, Math.random() * 20000 + 10000); // 10-30 seconds
    
    // Simulate camera status updates
    const statusInterval = setInterval(() => {
      if (!authService.isAuthenticated()) {
        clearInterval(statusInterval);
        return;
      }
      
      const cameraIds = ['1', '2', '3', '4'];
      const randomCameraId = cameraIds[Math.floor(Math.random() * cameraIds.length)];
      const statuses: Camera['status'][] = ['active', 'inactive', 'connecting', 'error'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      this.emit('stream_status', {
        cameraId: randomCameraId,
        status: randomStatus,
        isStreaming: randomStatus === 'active',
        timestamp: new Date(),
      });
    }, Math.random() * 15000 + 5000); // 5-20 seconds
  }
  
  private handleReconnect(): void {
    this.isConnecting = false;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('error', new Error('Connection failed after maximum attempts'));
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => this.connect(), delay);
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.listeners.clear();
  }
  
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }
  
  send(message: any): void {
    // In a real implementation, this would send to the actual WebSocket
    console.log('Mock WebSocket send:', message);
  }
}

export const wsService = WebSocketService.getInstance();