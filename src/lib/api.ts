import { Camera, Alert, FaceDetection, StreamStats } from '@/types';
import { authService } from './auth';

// Mock API service with realistic delays and responses
export class ApiService {
  private static instance: ApiService;
  private baseUrl = 'http://localhost:3001/api'; // Mock backend URL
  
  private constructor() {
    this.setupMockData();
  }
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  private mockCameras: Camera[] = [];
  private mockAlerts: Alert[] = [];
  
  private setupMockData() {
    // Initialize mock cameras
    this.mockCameras = [
      {
        id: '1',
        name: 'Main Entrance',
        rtspUrl: 'rtsp://camera1.example.com/stream',
        location: 'Building A - Main Door',
        isEnabled: true,
        isStreaming: true,
        status: 'active',
        fps: 30,
        faceDetectionEnabled: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Parking Lot',
        rtspUrl: 'rtsp://camera2.example.com/stream',
        location: 'Parking Area - North',
        isEnabled: true,
        isStreaming: false,
        status: 'inactive',
        fps: 25,
        faceDetectionEnabled: false,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Conference Room',
        rtspUrl: 'rtsp://camera3.example.com/stream',
        location: 'Building B - Room 201',
        isEnabled: true,
        isStreaming: true,
        status: 'active',
        fps: 30,
        faceDetectionEnabled: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Lobby Camera',
        rtspUrl: 'rtsp://camera4.example.com/stream',
        location: 'Main Lobby',
        isEnabled: false,
        isStreaming: false,
        status: 'error',
        fps: 0,
        faceDetectionEnabled: false,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date(),
      },
    ];
    
    // Initialize mock alerts
    this.mockAlerts = [
      {
        id: '1',
        cameraId: '1',
        cameraName: 'Main Entrance',
        type: 'face_detected',
        message: 'Face detected with 95% confidence',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        faceDetection: {
          id: 'fd1',
          cameraId: '1',
          boundingBox: { x: 150, y: 100, width: 80, height: 100 },
          confidence: 0.95,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      {
        id: '2',
        cameraId: '3',
        cameraName: 'Conference Room',
        type: 'face_detected',
        message: 'Multiple faces detected',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: true,
        faceDetection: {
          id: 'fd2',
          cameraId: '3',
          boundingBox: { x: 200, y: 150, width: 75, height: 95 },
          confidence: 0.87,
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
      {
        id: '3',
        cameraId: '4',
        cameraName: 'Lobby Camera',
        type: 'stream_error',
        message: 'Stream connection lost',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: true,
      },
    ];
  }
  
  private getAuthHeaders(): HeadersInit {
    const token = authService.getCurrentToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token.token}` }),
    };
  }
  
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Camera management endpoints
  async getCameras(): Promise<Camera[]> {
    await this.delay();
    return [...this.mockCameras];
  }
  
  async getCamera(id: string): Promise<Camera | null> {
    await this.delay();
    return this.mockCameras.find(c => c.id === id) || null;
  }
  
  async createCamera(camera: Omit<Camera, 'id' | 'createdAt' | 'updatedAt'>): Promise<Camera> {
    await this.delay();
    const newCamera: Camera = {
      ...camera,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockCameras.push(newCamera);
    return newCamera;
  }
  
  async updateCamera(id: string, updates: Partial<Camera>): Promise<Camera> {
    await this.delay();
    const index = this.mockCameras.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Camera not found');
    
    this.mockCameras[index] = {
      ...this.mockCameras[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.mockCameras[index];
  }
  
  async deleteCamera(id: string): Promise<void> {
    await this.delay();
    const index = this.mockCameras.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Camera not found');
    this.mockCameras.splice(index, 1);
  }
  
  async startStream(cameraId: string): Promise<void> {
    await this.delay(1000);
    await this.updateCamera(cameraId, { isStreaming: true, status: 'active' });
  }
  
  async stopStream(cameraId: string): Promise<void> {
    await this.delay(500);
    await this.updateCamera(cameraId, { isStreaming: false, status: 'inactive' });
  }
  
  // Alert endpoints
  async getAlerts(limit: number = 50): Promise<Alert[]> {
    await this.delay();
    return this.mockAlerts.slice(0, limit).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
  
  async getCameraAlerts(cameraId: string, limit: number = 20): Promise<Alert[]> {
    await this.delay();
    return this.mockAlerts
      .filter(alert => alert.cameraId === cameraId)
      .slice(0, limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async markAlertAsRead(alertId: string): Promise<void> {
    await this.delay(200);
    const alert = this.mockAlerts.find(a => a.id === alertId);
    if (alert) alert.isRead = true;
  }
  
  // Stream stats
  async getStreamStats(cameraId: string): Promise<StreamStats | null> {
    await this.delay();
    const camera = this.mockCameras.find(c => c.id === cameraId);
    if (!camera || !camera.isStreaming) return null;
    
    return {
      cameraId,
      fps: camera.fps || 0,
      bitrate: Math.floor(Math.random() * 5000) + 2000, // Random bitrate
      resolution: { width: 1920, height: 1080 },
      lastUpdate: new Date(),
    };
  }
}

export const apiService = ApiService.getInstance();