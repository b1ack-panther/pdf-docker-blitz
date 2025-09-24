# Skylark Labs - Real-Time Multi-Camera Face Detection Dashboard

A sophisticated surveillance dashboard application featuring real-time face detection, WebRTC streaming, and live alert notifications. Built with modern web technologies and designed for enterprise security monitoring.

## 🎯 Project Overview

This project implements the frontend portion of a comprehensive multi-camera face detection system as specified in the Skylark Labs Full Stack Engineer coding test. The application demonstrates:

- **Real-time camera monitoring** with live stream visualization
- **Face detection overlays** with confidence scoring and bounding boxes
- **WebSocket-based live alerts** with instant notifications
- **Responsive dashboard design** optimized for both desktop and mobile
- **JWT authentication** with secure login system
- **Professional surveillance UI** with dark theme optimized for monitoring

## 🏗️ Architecture

### Frontend (Implemented)
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system for surveillance aesthetics
- **Shadcn/UI** components customized for monitoring interfaces
- **React Router** for navigation and authentication flows

### Backend Architecture (Design Reference)
The frontend is designed to integrate with:
- **Backend API**: TypeScript + Hono + Prisma + PostgreSQL
- **Worker Service**: Golang + Gin + FFmpeg + OpenCV + go-face
- **Streaming**: MediaMTX for WebRTC signaling and media proxying
- **Infrastructure**: Docker + Docker Compose for microservices

## ✨ Key Features

### 🔐 Authentication System
- JWT-based secure authentication
- Session management with automatic token refresh
- Protected routes and API endpoints
- Demo credentials: `admin` / `password`

### 📹 Camera Management
- **CRUD Operations**: Add, edit, delete, and configure cameras
- **RTSP Stream Support**: Input validation for RTSP URLs
- **Real-time Status**: Active, inactive, connecting, and error states
- **Live Controls**: Start/stop streaming with instant feedback

### 🎯 Face Detection
- **Real-time Overlays**: Bounding boxes with confidence scores
- **Toggle Control**: Enable/disable per camera
- **Alert Generation**: Instant notifications on face detection
- **Performance Metrics**: FPS and stream quality monitoring

### 🚨 Live Alert System
- **WebSocket Integration**: Real-time alert notifications
- **Alert Types**: Face detection, stream errors, camera offline
- **Alert Management**: Mark as read, filter unread, batch operations
- **Historical Data**: Recent alerts with timestamps and details

### 📱 Responsive Design
- **Multi-device Support**: Desktop, tablet, and mobile optimized
- **Grid Layouts**: Adaptive camera tile arrangements
- **Dark Theme**: Eye-friendly monitoring interface
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skylark-face-detection-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:8080`

### Login Credentials
```
Username: admin
Password: password
```

## 🎨 Design System

The application uses a carefully crafted design system optimized for surveillance monitoring:

### Color Palette
- **Primary**: Blue accent (#3B82F6) for alerts and primary actions
- **Background**: Dark theme (#1A1A1A) to reduce eye strain
- **Status Colors**: 
  - Green (#10B981) for active streams
  - Red (#EF4444) for errors and alerts
  - Yellow (#F59E0B) for warnings and connecting states
  - Gray (#6B7280) for inactive states

### Typography
- **Font**: JetBrains Mono for technical precision
- **Hierarchy**: Clear information hierarchy for monitoring data

### Components
- **Camera Tiles**: Live stream visualization with overlays
- **Status Indicators**: Real-time status with animations
- **Alert Notifications**: Slide-in animations for new alerts
- **Control Buttons**: Contextual actions with loading states

## 🛠️ Technical Implementation

### State Management
- **React Hooks**: useState, useEffect for local state
- **Context Pattern**: Authentication state management
- **Real-time Updates**: WebSocket integration for live data

### API Integration
- **Mock Services**: Simulated backend with realistic delays
- **Error Handling**: Comprehensive error states and recovery
- **Loading States**: User feedback during operations
- **Optimistic Updates**: Immediate UI feedback

### WebSocket Simulation
- **Live Alerts**: Simulated face detection events
- **Status Updates**: Camera state changes
- **Connection Management**: Reconnection with exponential backoff

## 📋 Testing

The application includes comprehensive error handling and edge cases:

- **Authentication**: Invalid credentials, token expiration
- **Network**: Connection failures, timeout handling
- **Validation**: RTSP URL format, required fields
- **Real-time**: WebSocket disconnections, reconnection logic

## 🔧 Production Deployment

### Build for Production
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

## 🌟 Integration with Backend Services

This frontend is designed to integrate seamlessly with the specified backend architecture:

### API Endpoints Expected
```typescript
// Authentication
POST /api/auth/login
POST /api/auth/refresh
DELETE /api/auth/logout

// Camera Management  
GET /api/cameras
POST /api/cameras
PUT /api/cameras/:id
DELETE /api/cameras/:id
POST /api/cameras/:id/start
POST /api/cameras/:id/stop

// Alerts
GET /api/alerts
GET /api/cameras/:id/alerts
PUT /api/alerts/:id/read

// WebSocket
WS /api/ws (with JWT authentication)
```

### WebSocket Message Format
```typescript
interface WebSocketMessage {
  type: 'alert' | 'stream_status' | 'face_detection' | 'stats';
  payload: Alert | Camera | FaceDetection | StreamStats;
  timestamp: Date;
}
```

## 📊 Performance Considerations

- **Virtual Scrolling**: Efficient rendering of large alert lists
- **Image Optimization**: Lazy loading and responsive images  
- **Bundle Splitting**: Code splitting for optimal loading
- **Caching**: Smart caching of camera configurations and alerts

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTPS Ready**: SSL/TLS configuration for production
- **Input Validation**: Client-side validation with server-side backup
- **CSRF Protection**: Cross-site request forgery prevention
- **Content Security Policy**: XSS protection headers

## 🎯 Future Enhancements

- **Multi-tenant Support**: Organization-based camera groups
- **Advanced Analytics**: Heat maps, detection patterns
- **Mobile App**: React Native companion app
- **AI Model Selection**: Multiple face detection models
- **Cloud Storage**: Alert image archival
- **API Rate Limiting**: Request throttling and queuing

## 📝 License

This project is part of the Skylark Labs coding assessment and demonstrates enterprise-grade surveillance dashboard development capabilities.

---

**Built with ❤️ for Skylark Labs - Real-time surveillance made simple**