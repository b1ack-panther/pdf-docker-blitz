import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  Activity,
  Wifi,
  WifiOff,
  Bell
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { wsService } from '@/lib/websocket';
import { User as UserType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  totalCameras: number;
  activeCameras: number;
  unreadAlerts: number;
}

export function DashboardHeader({ totalCameras, activeCameras, unreadAlerts }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // WebSocket connection status
    wsService.on('connected', () => setIsConnected(true));
    wsService.on('error', () => setIsConnected(false));

    // Check initial connection status
    setIsConnected(true); // Mock connection status
  }, []);

  const handleLogout = () => {
    authService.logout();
    wsService.disconnect();
    navigate('/');
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Skylark Labs</h1>
              <p className="text-sm text-muted-foreground">Face Detection Dashboard</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="outline" className="status-active text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="status-error text-xs">
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>

        {/* Stats & User Menu */}
        <div className="flex items-center space-x-6">
          {/* System Stats */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cameras:</span>
              <Badge variant="outline" className="status-active">
                {activeCameras}/{totalCameras}
              </Badge>
            </div>

            {unreadAlerts > 0 && (
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Badge variant="destructive" className="text-xs">
                  {unreadAlerts} alert{unreadAlerts !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium">{user?.username || 'Admin'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium">{user?.username || 'Admin'}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Dashboard Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}