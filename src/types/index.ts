export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location: string;
  isEnabled: boolean;
  isStreaming: boolean;
  status: 'active' | 'inactive' | 'error' | 'connecting';
  fps?: number;
  faceDetectionEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FaceDetection {
  id: string;
  cameraId: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  timestamp: Date;
  snapshotUrl?: string;
}

export interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'face_detected' | 'stream_error' | 'camera_offline';
  message: string;
  timestamp: Date;
  isRead: boolean;
  faceDetection?: FaceDetection;
}

export interface StreamStats {
  cameraId: string;
  fps: number;
  bitrate: number;
  resolution: {
    width: number;
    height: number;
  };
  lastUpdate: Date;
}

export interface WebSocketMessage {
  type: 'alert' | 'stream_status' | 'face_detection' | 'stats';
  payload: Alert | Camera | FaceDetection | StreamStats;
  timestamp: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}