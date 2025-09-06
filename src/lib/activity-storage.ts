import { Activity } from '@/types/activity';

const STORAGE_KEY = 'activity-reminders-app';

export class ActivityStorage {
  static getActivities(): Activity[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const activities = JSON.parse(stored);
      return activities.map((activity: any) => ({
        ...activity,
        date: new Date(activity.date),
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }

  static saveActivities(activities: Activity[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  }

  static addActivity(activity: Activity): void {
    const activities = this.getActivities();
    activities.push(activity);
    this.saveActivities(activities);
  }

  static updateActivity(updatedActivity: Activity): void {
    const activities = this.getActivities();
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    
    if (index !== -1) {
      activities[index] = {
        ...updatedActivity,
        updatedAt: new Date()
      };
      this.saveActivities(activities);
    }
  }

  static deleteActivity(id: string): void {
    const activities = this.getActivities();
    const filtered = activities.filter(a => a.id !== id);
    this.saveActivities(filtered);
  }

  static exportData(): string {
    const activities = this.getActivities();
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0',
      activities
    }, null, 2);
  }

  static importData(jsonData: string): { success: boolean; message: string; count?: number } {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.activities || !Array.isArray(data.activities)) {
        return {
          success: false,
          message: 'Formato de datos inválido. No se encontraron actividades.'
        };
      }

      const activities = data.activities.map((activity: any) => ({
        ...activity,
        date: new Date(activity.date),
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt)
      }));

      this.saveActivities(activities);
      
      return {
        success: true,
        message: `${activities.length} actividades importadas correctamente.`,
        count: activities.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al procesar el archivo. Verifica que sea un archivo JSON válido.'
      };
    }
  }

  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}