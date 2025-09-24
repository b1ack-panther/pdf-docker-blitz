import { useState, useEffect } from 'react';
import { Camera, Alert } from '@/types';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CameraGrid } from '@/components/dashboard/CameraGrid';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { AddCameraDialog } from '@/components/dashboard/AddCameraDialog';
import { apiService } from '@/lib/api';
import { wsService } from '@/lib/websocket';

export default function Dashboard() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddCamera, setShowAddCamera] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    wsService.connect();
    
    // Load initial data
    loadInitialData();

    // Setup WebSocket listeners
    wsService.on('alert', (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev].slice(0, 50));
    });

    return () => {
      wsService.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [camerasData, alertsData] = await Promise.all([
        apiService.getCameras(),
        apiService.getAlerts(50),
      ]);
      
      setCameras(camerasData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleCameraAdded = (newCamera: Camera) => {
    setCameras(prev => [...prev, newCamera]);
  };

  const activeCameras = cameras.filter(camera => camera.status === 'active').length;
  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <DashboardHeader 
        totalCameras={cameras.length}
        activeCameras={activeCameras}
        unreadAlerts={unreadAlerts}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
          <CameraGrid 
            cameras={cameras}
            onAddCamera={() => setShowAddCamera(true)}
            onUpdateCameras={(updater) => setCameras(updater)}
          />
        </div>
        
        {/* Alerts Sidebar */}
        <div className="w-80 border-l border-border/50 bg-card/30">
          <AlertsPanel />
        </div>
      </main>

      {/* Add Camera Dialog */}
      <AddCameraDialog
        open={showAddCamera}
        onOpenChange={setShowAddCamera}
        onCameraAdded={handleCameraAdded}
      />
    </div>
  );
}