import { useState } from 'react';
import { Camera } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera as CameraIcon, MapPin, Link, Settings } from 'lucide-react';
import { apiService } from '@/lib/api';

interface AddCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCameraAdded: (camera: Camera) => void;
}

export function AddCameraDialog({ open, onOpenChange, onCameraAdded }: AddCameraDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    rtspUrl: '',
    location: '',
    faceDetectionEnabled: true,
    fps: 30,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newCamera = await apiService.createCamera({
        name: formData.name,
        rtspUrl: formData.rtspUrl,
        location: formData.location,
        enabled: true,
      });

      onCameraAdded(newCamera);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        rtspUrl: '',
        location: '',
        faceDetectionEnabled: true,
        fps: 30,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add camera');
    } finally {
      setIsLoading(false);
    }
  };

  const validateRtspUrl = (url: string) => {
    return url.startsWith('rtsp://') || url.startsWith('rtmps://');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CameraIcon className="w-5 h-5 text-primary" />
            <span>Add New Camera</span>
          </DialogTitle>
          <DialogDescription>
            Configure a new camera for monitoring and face detection. Make sure the RTSP stream is accessible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Camera Name */}
          <div className="space-y-2">
            <Label htmlFor="camera-name" className="text-sm font-medium">
              Camera Name *
            </Label>
            <Input
              id="camera-name"
              placeholder="e.g., Main Entrance, Parking Lot"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="bg-input border-border"
            />
          </div>

          {/* RTSP URL */}
          <div className="space-y-2">
            <Label htmlFor="rtsp-url" className="text-sm font-medium flex items-center space-x-1">
              <Link className="w-4 h-4" />
              <span>RTSP Stream URL *</span>
            </Label>
            <Input
              id="rtsp-url"
              placeholder="rtsp://username:password@camera-ip:port/stream"
              value={formData.rtspUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, rtspUrl: e.target.value }))}
              required
              className={`bg-input border-border ${
                formData.rtspUrl && !validateRtspUrl(formData.rtspUrl) 
                  ? 'border-destructive' 
                  : ''
              }`}
            />
            {formData.rtspUrl && !validateRtspUrl(formData.rtspUrl) && (
              <p className="text-xs text-destructive">URL must start with rtsp:// or rtmps://</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Location *</span>
            </Label>
            <Textarea
              id="location"
              placeholder="e.g., Building A - Main Door, Floor 2 - Conference Room"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
              className="bg-input border-border min-h-[60px] resize-none"
            />
          </div>

          {/* FPS Setting */}
          <div className="space-y-2">
            <Label htmlFor="fps" className="text-sm font-medium flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span>Target FPS</span>
            </Label>
            <select
              id="fps"
              value={formData.fps}
              onChange={(e) => setFormData(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={15}>15 FPS</option>
              <option value={30}>30 FPS</option>
              <option value={60}>60 FPS</option>
            </select>
          </div>

          {/* Face Detection Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Face Detection</Label>
              <p className="text-xs text-muted-foreground">
                Enable real-time face detection and alerts for this camera
              </p>
            </div>
            <Switch
              checked={formData.faceDetectionEnabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, faceDetectionEnabled: checked }))
              }
            />
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.rtspUrl || !formData.location}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding Camera...
                </>
              ) : (
                'Add Camera'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}