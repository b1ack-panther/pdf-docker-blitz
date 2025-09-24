import { useState } from 'react';
import { Camera, Alert as AlertType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  Settings, 
  Eye, 
  EyeOff,
  MapPin,
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff,
  MoreVertical,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CameraTileProps {
  camera: Camera;
  alerts: AlertType[];
  onStreamToggle: (cameraId: string, shouldStart: boolean) => void;
  onUpdateCamera: (camera: Camera) => void;
  onDeleteCamera: (cameraId: string) => void;
}

// Simulated face detection boxes for demo
const generateFaceBoxes = (camera: Camera, alerts: AlertType[]) => {
  if (!camera.faceDetectionEnabled || !camera.isStreaming || camera.status !== 'active') {
    return [];
  }
  
  // Generate 1-3 face boxes based on recent alerts
  const faceCount = Math.min(Math.floor(Math.random() * 3) + 1, alerts.length + 1);
  return Array.from({ length: faceCount }, (_, i) => ({
    id: `face-${i}`,
    x: Math.random() * 60 + 10, // 10-70% from left
    y: Math.random() * 50 + 15, // 15-65% from top
    width: 15 + Math.random() * 10, // 15-25% width
    height: 20 + Math.random() * 15, // 20-35% height
    confidence: 0.8 + Math.random() * 0.2, // 80-100% confidence
  }));
};

export function CameraTile({ 
  camera, 
  alerts, 
  onStreamToggle, 
  onUpdateCamera, 
  onDeleteCamera 
}: CameraTileProps) {
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [faceBoxes] = useState(() => generateFaceBoxes(camera, alerts));

  const handleStreamToggle = async () => {
    setIsStreamLoading(true);
    try {
      await onStreamToggle(camera.id, !camera.isStreaming);
    } finally {
      setIsStreamLoading(false);
    }
  };

  const toggleFaceDetection = () => {
    onUpdateCamera({
      ...camera,
      faceDetectionEnabled: !camera.faceDetectionEnabled,
    });
  };

  const handleFpsChange = (fps: string) => {
    onUpdateCamera({
      ...camera,
      fps: parseInt(fps),
    });
  };

  const getStatusIcon = () => {
    switch (camera.status) {
      case 'active':
        return <Wifi className="w-4 h-4 text-stream-active" />;
      case 'connecting':
        return <Activity className="w-4 h-4 text-stream-connecting animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-stream-error" />;
      default:
        return <WifiOff className="w-4 h-4 text-stream-inactive" />;
    }
  };

  const getStatusColor = () => {
    switch (camera.status) {
      case 'active':
        return 'status-active';
      case 'connecting':
        return 'status-connecting';
      case 'error':
        return 'status-error';
      default:
        return 'status-inactive';
    }
  };

  const recentAlerts = alerts.slice(0, 3);
  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <Card className={cn(
      "bg-card shadow-card border-border/50 transition-all duration-300 hover:shadow-camera",
      camera.status === 'active' && "pulse-active"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-sm">{camera.name}</h3>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{camera.location}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={toggleFaceDetection}>
                {camera.faceDetectionEnabled ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Disable Face Detection
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Enable Face Detection
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Camera Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDeleteCamera(camera.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Camera
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getStatusColor()}>
            {camera.status.toUpperCase()}
          </Badge>
          
          {unreadAlerts > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadAlerts} alert{unreadAlerts !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Stream Container */}
        <div className="aspect-video bg-muted/20 rounded-lg border border-border/30 relative overflow-hidden">
          {camera.isStreaming && camera.status === 'active' ? (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
              {/* Simulated video grid pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grid' width='5' height='5' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 5 0 L 0 0 0 5' fill='none' stroke='%23374151' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`
              }} />
              
              {/* Simulated streaming content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Face detection boxes */}
              {camera.faceDetectionEnabled && faceBoxes.map((face) => (
                <div
                  key={face.id}
                  className="face-detection-overlay absolute"
                  style={{
                    left: `${face.x}%`,
                    top: `${face.y}%`,
                    width: `${face.width}%`,
                    height: `${face.height}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 text-xs font-mono text-primary bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                    Face: {Math.floor(face.confidence * 100)}%
                  </div>
                </div>
              ))}
              
              {/* FPS and Stream Info */}
              <div className="absolute top-2 left-2 flex items-center space-x-2">
                <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono">
                  {camera.fps || 30} FPS
                </div>
                <div className="bg-stream-active/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono text-white">
                  LIVE
                </div>
              </div>
              
              {/* Recording indicator */}
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="text-center z-10">
                <Activity className="w-8 h-8 text-primary mb-2 animate-pulse" />
                <p className="text-xs text-white/80">Streaming Active</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/10">
              <div className="text-center">
                <WifiOff className="w-8 h-8 mb-2 mx-auto" />
                <p className="text-xs">Stream Offline</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {camera.status === 'error' ? 'Connection Failed' : 'Click Start to begin streaming'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant={camera.isStreaming ? "stop" : "stream"}
            size="sm"
            onClick={handleStreamToggle}
            disabled={isStreamLoading || !camera.isEnabled}
            className="flex items-center space-x-2"
          >
            {isStreamLoading ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : camera.isStreaming ? (
              <Square className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{camera.isStreaming ? 'Stop' : 'Start'}</span>
          </Button>

          {/* FPS Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">FPS:</span>
            <Select
              value={camera.fps?.toString() || "30"}
              onValueChange={handleFpsChange}
              disabled={camera.isStreaming}
            >
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Face Detection Status */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={camera.faceDetectionEnabled ? "default" : "secondary"}
            className="text-xs"
          >
            Face Detection {camera.faceDetectionEnabled ? 'ON' : 'OFF'}
          </Badge>
          
          {camera.faceDetectionEnabled && faceBoxes.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {faceBoxes.length} face{faceBoxes.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Alerts</h4>
            <div className="space-y-1">
              {recentAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={cn(
                    "text-xs p-2 rounded border",
                    alert.type === 'face_detected' 
                      ? "bg-primary/10 border-primary/30 text-primary-foreground" 
                      : "bg-destructive/10 border-destructive/30 text-destructive-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}