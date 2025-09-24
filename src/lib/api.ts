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
    // Initialize with no cameras - user must add them
    this.mockCameras = [];
    
    // Initialize with no cameras and no alerts - clean start
    this.mockAlerts = [];
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