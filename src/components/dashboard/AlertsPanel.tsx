import { useEffect, useState } from 'react';
import { Alert as AlertType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Eye, 
  AlertTriangle, 
  Camera,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { apiService } from '@/lib/api';
import { wsService } from '@/lib/websocket';
import { cn } from '@/lib/utils';

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadAlerts();
    setupWebSocketListener();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const alertsData = await apiService.getAlerts(50);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocketListener = () => {
    wsService.on('alert', (newAlert: AlertType) => {
      setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep only latest 50
    });
  };

  const markAsRead = async (alertId: string) => {
    try {
      await apiService.markAlertAsRead(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadAlerts = alerts.filter(alert => !alert.isRead);
    try {
      await Promise.all(unreadAlerts.map(alert => apiService.markAlertAsRead(alert.id)));
      setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  const getAlertIcon = (alert: AlertType) => {
    switch (alert.type) {
      case 'face_detected':
        return <Eye className="w-4 h-4 text-primary" />;
      case 'stream_error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'camera_offline':
        return <Camera className="w-4 h-4 text-warning" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertBadgeVariant = (alert: AlertType) => {
    switch (alert.type) {
      case 'face_detected':
        return 'default';
      case 'stream_error':
        return 'destructive';
      case 'camera_offline':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredAlerts = showUnreadOnly 
    ? alerts.filter(alert => !alert.isRead)
    : alerts;

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <Card className="h-full bg-card shadow-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">Live Alerts</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={cn(
                "text-xs",
                showUnreadOnly && "bg-accent"
              )}
            >
              {showUnreadOnly ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} 
          {showUnreadOnly && ' (unread only)'}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading alerts...</div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground">
                {showUnreadOnly ? 'No unread alerts' : 'No alerts yet'}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors cursor-pointer group",
                    alert.isRead 
                      ? "bg-muted/20 border-border/30" 
                      : "bg-accent/30 border-accent alert-notification"
                  )}
                  onClick={() => !alert.isRead && markAsRead(alert.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{alert.cameraName}</span>
                          <Badge 
                            variant={getAlertBadgeVariant(alert)}
                            className="text-xs"
                          >
                            {alert.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(alert.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground">{alert.message}</p>
                      
                      {alert.faceDetection && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Confidence: {Math.round(alert.faceDetection.confidence * 100)}%</div>
                          <div>
                            Position: ({alert.faceDetection.boundingBox.x}, {alert.faceDetection.boundingBox.y})
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                        </div>
                        <div>{format(alert.timestamp, 'MMM d, HH:mm:ss')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}