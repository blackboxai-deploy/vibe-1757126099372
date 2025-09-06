'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, isSameMonth, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Activity } from '@/types/activity';

import { cn } from '@/lib/utils';
import { ActivityCard } from './ActivityCard';

interface CalendarProps {
  activities: Activity[];
  onCreateActivity: (date?: Date) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function Calendar({ 
  activities, 
  onCreateActivity,
  onEditActivity,
  onDeleteActivity,
  onToggleComplete 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getActivitiesForDay = (date: Date) => {
    return activities.filter(activity => 
      isSameDay(new Date(activity.date), date)
    );
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const selectedDayActivities = selectedDate ? getActivitiesForDay(selectedDate) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };



  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date) => {
              const dayActivities = getActivitiesForDay(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                    !isCurrentMonth && "opacity-40",
                    isTodayDate && "bg-primary/10 border-primary"
                  )}
                  onClick={() => handleDayClick(date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      isTodayDate && "text-primary font-bold"
                    )}>
                      {format(date, 'd')}
                    </span>
                    {dayActivities.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1">
                        {dayActivities.length}
                      </Badge>
                    )}
                  </div>

                  {/* Activity Indicators */}
                  <div className="space-y-1">
                    {dayActivities.slice(0, 3).map((activity) => (
                      <div
                        key={activity.id}
                        className={cn(
                          "w-full h-1.5 rounded-full",
                          getPriorityColor(activity.priority)
                        )}
                        title={`${activity.title} - ${activity.time}`}
                      />
                    ))}
                    {dayActivities.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayActivities.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Modal */}
      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: es })}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  onCreateActivity(selectedDate || undefined);
                  setShowDayModal(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Actividad
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDayActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  📅
                </div>
                <h3 className="font-semibold mb-2">No hay actividades</h3>
                <p className="text-muted-foreground mb-4">
                  No tienes actividades programadas para este día.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    onCreateActivity(selectedDate || undefined);
                    setShowDayModal(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Actividad
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {selectedDayActivities.length} actividad{selectedDayActivities.length !== 1 ? 'es' : ''}
                  </h4>
                  <div className="flex gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Completada</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Pendiente</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Vencida</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {selectedDayActivities
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={(activity) => {
                          onEditActivity(activity);
                          setShowDayModal(false);
                        }}
                        onDelete={onDeleteActivity}
                        onToggleComplete={onToggleComplete}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}