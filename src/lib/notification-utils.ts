import { Activity, ActivityStats } from '@/types/activity';
import { isActivityOverdue, getTodayActivities, getOverdueActivities } from './date-utils';

export function calculateActivityStats(activities: Activity[]): ActivityStats {
  const total = activities.length;
  const pending = activities.filter(a => a.status === 'pendiente').length;
  const completed = activities.filter(a => a.status === 'completado').length;
  
  // Update overdue activities
  const updatedActivities = activities.map(activity => {
    if (activity.status === 'pendiente' && isActivityOverdue(activity.date, activity.time)) {
      return { ...activity, status: 'vencido' as const };
    }
    return activity;
  });

  const overdue = updatedActivities.filter(a => a.status === 'vencido').length;
  const todayCount = getTodayActivities(activities).length;

  return {
    total,
    pending,
    completed,
    overdue,
    todayCount
  };
}

export function getNotificationBadgeCount(activities: Activity[]): number {
  const overdueCount = getOverdueActivities(activities).length;
  const todayCount = getTodayActivities(activities).filter(a => a.status === 'pendiente').length;
  
  return overdueCount + todayCount;
}

export function generateNotificationMessage(activities: Activity[]): string | null {
  const overdueCount = getOverdueActivities(activities).length;
  const todayCount = getTodayActivities(activities).filter(a => a.status === 'pendiente').length;

  if (overdueCount > 0 && todayCount > 0) {
    return `Tienes ${overdueCount} actividades vencidas y ${todayCount} para hoy`;
  } else if (overdueCount > 0) {
    return `Tienes ${overdueCount} actividades vencidas`;
  } else if (todayCount > 0) {
    return `Tienes ${todayCount} actividades para hoy`;
  }

  return null;
}

export function getPriorityActivities(activities: Activity[]): Activity[] {
  return activities
    .filter(a => a.status === 'pendiente')
    .sort((a, b) => {
      // Primero por prioridad
      const priorityOrder = { alta: 3, media: 2, baja: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Luego por fecha
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(0, 5); // Top 5 prioridades
}

export function shouldShowNotification(activities: Activity[]): boolean {
  const overdueCount = getOverdueActivities(activities).length;
  const todayCount = getTodayActivities(activities).filter(a => a.status === 'pendiente').length;
  
  return overdueCount > 0 || todayCount > 0;
}