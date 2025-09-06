'use client';

import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, Edit, Trash2, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

import { Activity } from '@/types/activity';
import { PRIORITY_COLORS, CATEGORY_COLORS, STATUS_COLORS } from '@/types/activity';
import { isActivityOverdue } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function ActivityCard({ activity, onEdit, onDelete, onToggleComplete }: ActivityCardProps) {
  const isOverdue = activity.status === 'pendiente' && isActivityOverdue(activity.date, activity.time);
  const isCompleted = activity.status === 'completado';

  const handleToggleComplete = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      onToggleComplete(activity.id);
    }
  };

  const getPriorityIcon = () => {
    switch (activity.priority) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baja': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = () => {
    switch (activity.category) {
      case 'trabajo': return '💼';
      case 'personal': return '👤';
      case 'salud': return '🏥';
      case 'estudio': return '📚';
      case 'hogar': return '🏠';
      default: return '📋';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isCompleted && "opacity-75",
      isOverdue && "border-red-300 bg-red-50/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
              className="mt-1"
            />
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold text-lg leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {activity.title}
              </h3>
              {activity.description && (
                <p className={cn(
                  "text-sm text-muted-foreground mt-1",
                  isCompleted && "line-through"
                )}>
                  {activity.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(activity)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La actividad "{activity.title}" será eliminada permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(activity.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(activity.date, 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{activity.time}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", PRIORITY_COLORS[activity.priority])}
            >
              <span className="mr-1">{getPriorityIcon()}</span>
              {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs", CATEGORY_COLORS[activity.category])}
            >
              <span className="mr-1">{getCategoryIcon()}</span>
              {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs", STATUS_COLORS[activity.status])}
            >
              {activity.status === 'completado' && <Check className="h-3 w-3 mr-1" />}
              {activity.status === 'vencido' && <X className="h-3 w-3 mr-1" />}
              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
            </Badge>
          </div>
        </div>

        {isOverdue && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Esta actividad está vencida
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}