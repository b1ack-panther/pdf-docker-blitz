import { useEffect, useState } from 'react';
import { Camera, Alert as AlertType } from '@/types';
import { CameraTile } from './CameraTile';
import { apiService } from '@/lib/api';
import { wsService } from '@/lib/websocket';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraGridProps {
  cameras: Camera[];
  onAddCamera: () => void;
  onUpdateCameras: (updater: (cameras: Camera[]) => Camera[]) => void;
}

export function CameraGrid({ cameras, onAddCamera, onUpdateCameras }: CameraGridProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cameraAlerts, setCameraAlerts] = useState<Record<string, AlertType[]>>({});

  useEffect(() => {
    if (cameras.length > 0) {
      loadCameraAlerts();
    }
    setupWebSocketListeners();
    
    return () => {
      // Cleanup WebSocket listeners would go here
    };
  }, [cameras]);

  const loadCameraAlerts = async () => {
    try {
      setIsLoading(true);
      
      // Load recent alerts for each camera
      const alertsPromises = cameras.map(async (camera) => {
        const alerts = await apiService.getCameraAlerts(camera.id, 5);
        return { cameraId: camera.id, alerts };
      });
      
      const alertsData = await Promise.all(alertsPromises);
      const alertsMap = alertsData.reduce((acc, { cameraId, alerts }) => {
        acc[cameraId] = alerts;
        return acc;
      }, {} as Record<string, AlertType[]>);
      
      setCameraAlerts(alertsMap);
    } catch (error) {
      console.error('Failed to load camera alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocketListeners = () => {
    wsService.on('alert', (alert: AlertType) => {
      setCameraAlerts(prev => ({
        ...prev,
        [alert.cameraId]: [alert, ...(prev[alert.cameraId] || [])].slice(0, 5),
      }));
    });

    wsService.on('stream_status', (data: { cameraId: string; status: Camera['status']; isStreaming: boolean }) => {
      onUpdateCameras(prev => prev.map(camera => 
        camera.id === data.cameraId 
          ? { ...camera, status: data.status, isStreaming: data.isStreaming }
          : camera
      ));
    });
  };

  const handleStreamToggle = async (cameraId: string, shouldStart: boolean) => {
    try {
      if (shouldStart) {
        await apiService.startStream(cameraId);
      } else {
        await apiService.stopStream(cameraId);
      }
      
      // Update local state optimistically
      onUpdateCameras(prev => prev.map(camera => 
        camera.id === cameraId 
          ? { 
              ...camera, 
              isStreaming: shouldStart,
              status: shouldStart ? 'connecting' : 'inactive'
            }
          : camera
      ));
    } catch (error) {
      console.error('Failed to toggle stream:', error);
    }
  };

  const handleUpdateCamera = async (updatedCamera: Camera) => {
    try {
      await apiService.updateCamera(updatedCamera.id, updatedCamera);
      onUpdateCameras(prev => prev.map(camera => 
        camera.id === updatedCamera.id ? updatedCamera : camera
      ));
    } catch (error) {
      console.error('Failed to update camera:', error);
    }
  };

  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await apiService.deleteCamera(cameraId);
      onUpdateCameras(prev => prev.filter(camera => camera.id !== cameraId));
      setCameraAlerts(prev => {
        const newAlerts = { ...prev };
        delete newAlerts[cameraId];
        return newAlerts;
      });
    } catch (error) {
      console.error('Failed to delete camera:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading cameras...</span>
        </div>
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No Cameras Configured</h3>
          <p className="text-muted-foreground max-w-md">
            Get started by adding your first camera to begin monitoring and face detection.
          </p>
        </div>
        <Button onClick={onAddCamera} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Your First Camera</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      {cameras.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onAddCamera} variant="default" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Camera</span>
          </Button>
        </div>
      )}

      {/* Camera Grid */}
      <div className="flex-1 grid gap-6" style={{
        gridTemplateColumns: cameras.length === 1 ? '1fr' : 
                           cameras.length === 2 ? 'repeat(2, 1fr)' :
                           cameras.length === 3 ? 'repeat(2, 1fr)' :
                           'repeat(2, 1fr)',
        gridTemplateRows: cameras.length <= 2 ? '1fr' : 'repeat(2, 1fr)'
      }}>
        {cameras.map(camera => (
          <CameraTile
            key={camera.id}
            camera={camera}
            alerts={cameraAlerts[camera.id] || []}
            onStreamToggle={handleStreamToggle}
            onUpdateCamera={handleUpdateCamera}
            onDeleteCamera={handleDeleteCamera}
          />
        ))}
      </div>

      {/* Grid Status */}
      <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground pt-4 border-t border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-stream-active rounded-full"></div>
          <span>{cameras.filter(c => c.status === 'active').length} Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-stream-inactive rounded-full"></div>
          <span>{cameras.filter(c => c.status === 'inactive').length} Offline</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-stream-error rounded-full"></div>
          <span>{cameras.filter(c => c.status === 'error').length} Error</span>
        </div>
      </div>
    </div>
  );
}