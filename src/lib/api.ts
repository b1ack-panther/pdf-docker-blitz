import { Camera, BackendCamera, Alert, BackendAlert, FaceDetection, StreamStats } from '@/types';
import { authService } from './auth';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export class ApiService {
  private static instance: ApiService;
  
  private constructor() {}
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  private getAuthHeaders(): HeadersInit {
    const token = authService.getCurrentToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token.token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Health check
  async health(): Promise<{ status: string }> {
    const response = await fetch(`${BASE_URL}/health`);
    return this.handleResponse(response);
  }

  // Camera management endpoints
  async getCameras(): Promise<Camera[]> {
    const response = await fetch(`${BASE_URL}/cameras`, {
      headers: this.getAuthHeaders(),
    });
    const backendCameras: BackendCamera[] = await this.handleResponse(response);
    
    // Convert backend cameras to frontend cameras with default UI state
    return backendCameras.map(camera => ({
      ...camera,
      isStreaming: false,
      status: 'inactive' as const,
      fps: 30,
      faceDetectionEnabled: true,
    }));
  }

  async createCamera(camera: Omit<BackendCamera, 'id' | 'userId' | 'createdAt'>): Promise<Camera> {
    const response = await fetch(`${BASE_URL}/cameras`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(camera),
    });
    const backendCamera: BackendCamera = await this.handleResponse(response);
    
    return {
      ...backendCamera,
      isStreaming: false,
      status: 'inactive' as const,
      fps: 30,
      faceDetectionEnabled: true,
    };
  }

  async updateCamera(id: number, updates: Partial<Omit<BackendCamera, 'id' | 'userId' | 'createdAt'>>): Promise<Camera> {
    const response = await fetch(`${BASE_URL}/cameras/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const backendCamera: BackendCamera = await this.handleResponse(response);
    
    return {
      ...backendCamera,
      isStreaming: false,
      status: 'inactive' as const,
      fps: 30,
      faceDetectionEnabled: true,
    };
  }

  async deleteCamera(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/cameras/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  async startStream(cameraId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/cameras/${cameraId}/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  async stopStream(cameraId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/cameras/${cameraId}/stop`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  // Alert endpoints
  async getAlerts(params?: {
    cameraId?: number;
    page?: number;
    per?: number;
    from?: string;
    to?: string;
  }): Promise<{ total: number; page: number; per: number; alerts: Alert[] }> {
    const searchParams = new URLSearchParams();
    if (params?.cameraId) searchParams.append('cameraId', params.cameraId.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per) searchParams.append('per', params.per.toString());
    if (params?.from) searchParams.append('from', params.from);
    if (params?.to) searchParams.append('to', params.to);

    const response = await fetch(`${BASE_URL}/alerts?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<{ total: number; page: number; per: number; alerts: BackendAlert[] }>(response);
    
    // Convert backend alerts to frontend alerts with default UI state
    const alerts: Alert[] = result.alerts.map(alert => ({
      ...alert,
      type: 'face_detected' as const,
      message: `Face detected with ${Math.round(alert.confidence * 100)}% confidence`,
      isRead: false,
    }));

    return { ...result, alerts };
  }

  async getCameraAlerts(cameraId: number, limit: number = 20): Promise<Alert[]> {
    const result = await this.getAlerts({ cameraId, per: limit });
    return result.alerts;
  }

  // Legacy methods for backward compatibility (frontend-only state)
  async markAlertAsRead(alertId: string): Promise<void> {
    // This would need to be implemented on backend or handled locally
    console.log('Mark alert as read:', alertId);
  }

  async getStreamStats(cameraId: string): Promise<StreamStats | null> {
    // This would need to be implemented on backend
    return null;
  }
}

export const apiService = ApiService.getInstance();