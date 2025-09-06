'use client';

import React from 'react';
import { CalendarDays, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { Activity, ActivityStats } from '@/types/activity';
import { getPriorityActivities } from '@/lib/notification-utils';

import { ActivityCard } from './ActivityCard';

interface DashboardProps {
  activities: Activity[];
  stats: ActivityStats;
  onCreateActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function Dashboard({ 
  activities, 
  stats, 
  onCreateActivity,
  onEditActivity,
  onDeleteActivity,
  onToggleComplete 
}: DashboardProps) {
  const priorityActivities = getPriorityActivities(activities);
  
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const statCards = [
    {
      title: 'Total Actividades',
      value: stats.total,
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Completadas',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Vencidas',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestiona tus actividades y mantente organizado
          </p>
        </div>
        <Button onClick={onCreateActivity} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Actividad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === 'Para Hoy' && stats.todayCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  actividades programadas
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Section */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progreso General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Actividades completadas</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{stats.completed} Completadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>{stats.pending} Pendientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>{stats.overdue} Vencidas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Activities */}
      {stats.todayCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Actividades de Hoy
              <Badge variant="secondary">{stats.todayCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities
                .filter(activity => {
                  const today = new Date();
                  const activityDate = new Date(activity.date);
                  return activityDate.toDateString() === today.toDateString();
                })
                .slice(0, 3)
                .map(activity => (
                  <div key={activity.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.time} - {activity.category}
                        </p>
                      </div>
                      <Badge 
                        variant={activity.status === 'completado' ? 'default' : 'secondary'}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Activities */}
      {priorityActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Actividades Prioritarias
              <Badge variant="secondary">{priorityActivities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityActivities.slice(0, 3).map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={onEditActivity}
                  onDelete={onDeleteActivity}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                📋
              </div>
              <h3 className="text-xl font-semibold mb-2">¡Comienza a organizarte!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crea tu primera actividad y mantén el control de todas tus tareas importantes.
              </p>
              <Button onClick={onCreateActivity} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Crear Mi Primera Actividad
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}