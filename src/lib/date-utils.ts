import { format, isToday, isTomorrow, isYesterday, isPast, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatActivityDate(date: Date): string {
  if (isToday(date)) return 'Hoy';
  if (isTomorrow(date)) return 'Mañana';
  if (isYesterday(date)) return 'Ayer';
  
  return format(date, 'dd/MM/yyyy', { locale: es });
}

export function formatActivityDateTime(date: Date, time: string): string {
  const dateStr = formatActivityDate(date);
  return `${dateStr} a las ${time}`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 0) {
    const pastHours = Math.abs(diffInHours);
    if (pastHours < 24) {
      return `Hace ${pastHours} horas`;
    }
    return `Hace ${Math.abs(diffInDays)} días`;
  }

  if (diffInHours < 24) {
    return `En ${diffInHours} horas`;
  }

  return `En ${diffInDays} días`;
}

export function isActivityOverdue(date: Date, time: string): boolean {
  const activityDateTime = combineDateAndTime(date, time);
  return isPast(activityDateTime);
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export function getActivitiesForDate(activities: any[], targetDate: Date) {
  const startOfTargetDay = startOfDay(targetDate);
  const endOfTargetDay = endOfDay(targetDate);
  
  return activities.filter(activity => {
    const activityDate = startOfDay(activity.date);
    return activityDate.getTime() >= startOfTargetDay.getTime() && 
           activityDate.getTime() <= endOfTargetDay.getTime();
  });
}

export function getTodayActivities(activities: any[]) {
  return activities.filter(activity => isToday(activity.date));
}

export function getUpcomingActivities(activities: any[], days: number = 7) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return activities.filter(activity => {
    const activityDateTime = combineDateAndTime(activity.date, activity.time);
    return activityDateTime > now && activityDateTime <= futureDate;
  });
}

export function getOverdueActivities(activities: any[]) {
  return activities.filter(activity => 
    activity.status === 'pendiente' && isActivityOverdue(activity.date, activity.time)
  );
}

export function formatCalendarMonth(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: es });
}

export function getCalendarDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  
  const startCalendar = new Date(firstDay);
  startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());
  
  const days: Date[] = [];
  const current = new Date(startCalendar);
  
  for (let i = 0; i < 42; i++) { // 6 semanas * 7 días
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}