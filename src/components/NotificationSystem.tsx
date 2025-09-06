'use client';

import React, { useEffect } from 'react';
import { Bell, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Activity } from '@/types/activity';
import { 
  getNotificationBadgeCount, 
  generateNotificationMessage, 
  shouldShowNotification 
} from '@/lib/notification-utils';
import { getTodayActivities, getOverdueActivities } from '@/lib/date-utils';

interface NotificationSystemProps {
  activities: Activity[];
  onViewActivities: () => void;
}

export function NotificationSystem({ activities, onViewActivities }: NotificationSystemProps) {
  const badgeCount = getNotificationBadgeCount(activities);

  const shouldShow = shouldShowNotification(activities);
  
  const todayActivities = getTodayActivities(activities).filter(a => a.status === 'pendiente');
  const overdueActivities = getOverdueActivities(activities);

  // Show toast notifications when activities become overdue or are due today
  useEffect(() => {
    if (overdueActivities.length > 0) {
      toast.error(`${overdueActivities.length} actividades están vencidas`, {
        description: 'Revisa tus actividades pendientes',
        action: {
          label: 'Ver actividades',
          onClick: onViewActivities
        }
      });
    }

    if (todayActivities.length > 0) {
      toast.info(`Tienes ${todayActivities.length} actividades para hoy`, {
        description: 'No olvides completar tus tareas del día',
        action: {
          label: 'Ver actividades',
          onClick: onViewActivities
        }
      });
    }
  }, [overdueActivities.length, todayActivities.length, onViewActivities]);

  if (!shouldShow) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="relative"
        onClick={onViewActivities}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Notificaciones</span>
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notification Button */}
      <Button
        variant="outline"
        size="sm"
        className="relative"
        onClick={onViewActivities}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Notificaciones</span>
        {badgeCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </Badge>
        )}
      </Button>

      {/* Alert Messages */}
      {overdueActivities.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {overdueActivities.length === 1 
                ? 'Tienes 1 actividad vencida' 
                : `Tienes ${overdueActivities.length} actividades vencidas`
              }
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewActivities}
              className="ml-4"
            >
              Ver todas
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {todayActivities.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {todayActivities.length === 1 
                ? 'Tienes 1 actividad para hoy' 
                : `Tienes ${todayActivities.length} actividades para hoy`
              }
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewActivities}
              className="ml-4"
            >
              Ver todas
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Activity Summary */}
      {(overdueActivities.length > 0 || todayActivities.length > 0) && (
        <div className="space-y-2">
          {/* Today's Activities Preview */}
          {todayActivities.slice(0, 3).map(activity => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
              <Badge variant="outline">{activity.priority}</Badge>
            </div>
          ))}

          {/* Overdue Activities Preview */}
          {overdueActivities.slice(0, 2).map(activity => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-700">{activity.title}</p>
                  <p className="text-xs text-red-600">
                    Vencida - {activity.time}
                  </p>
                </div>
              </div>
              <Badge variant="destructive">Vencida</Badge>
            </div>
          ))}

          {(todayActivities.length > 3 || overdueActivities.length > 2) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewActivities}
              className="w-full"
            >
              Ver todas las actividades
            </Button>
          )}
        </div>
      )}
    </div>
  );
}