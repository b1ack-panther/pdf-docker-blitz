export interface User {
  id: number;
  email: string;
}

// Backend camera model
export interface BackendCamera {
  id: number;
  name: string;
  rtspUrl: string;
  location: string | null;
  enabled: boolean;
  userId: number;
  createdAt: string;
}

// Frontend camera model (extends backend with UI state)
export interface Camera extends BackendCamera {
  isStreaming?: boolean;
  status?: 'active' | 'inactive' | 'error' | 'connecting';
  fps?: number;
  faceDetectionEnabled?: boolean;
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

// Backend alert model
export interface BackendAlert {
  id: number;
  cameraId: number;
  timestamp: string;
  confidence: number;
  imageUrl: string | null;
}

// Frontend alert model (extends backend with UI features)
export interface Alert extends BackendAlert {
  cameraName?: string;
  type?: 'face_detected' | 'stream_error' | 'camera_offline';
  message?: string;
  isRead?: boolean;
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
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}