'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Activity, ActivityFormData, ActivityStats, Status } from '@/types/activity';
import { ActivityStorage } from '@/lib/activity-storage';
import { calculateActivityStats } from '@/lib/notification-utils';
import { isActivityOverdue } from '@/lib/date-utils';

interface ActivityState {
  activities: Activity[];
  stats: ActivityStats;
  loading: boolean;
}

type ActivityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'UPDATE_STATS'; payload: ActivityStats };

const ActivityContext = createContext<{
  state: ActivityState;
  addActivity: (data: ActivityFormData) => void;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  toggleActivityStatus: (id: string) => void;
  loadActivities: () => void;
  clearAllActivities: () => void;
  exportData: () => string;
  importData: (jsonData: string) => { success: boolean; message: string; count?: number };
} | null>(null);

function activityReducer(state: ActivityState, action: ActivityAction): ActivityState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'LOAD_ACTIVITIES':
      return {
        ...state,
        activities: action.payload,
        stats: calculateActivityStats(action.payload),
        loading: false
      };
    
    case 'ADD_ACTIVITY':
      const newActivities = [...state.activities, action.payload];
      return {
        ...state,
        activities: newActivities,
        stats: calculateActivityStats(newActivities)
      };
    
    case 'UPDATE_ACTIVITY':
      const updatedActivities = state.activities.map(activity =>
        activity.id === action.payload.id ? action.payload : activity
      );
      return {
        ...state,
        activities: updatedActivities,
        stats: calculateActivityStats(updatedActivities)
      };
    
    case 'DELETE_ACTIVITY':
      const filteredActivities = state.activities.filter(
        activity => activity.id !== action.payload
      );
      return {
        ...state,
        activities: filteredActivities,
        stats: calculateActivityStats(filteredActivities)
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload
      };
    
    default:
      return state;
  }
}

const initialState: ActivityState = {
  activities: [],
  stats: {
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    todayCount: 0
  },
  loading: true
};

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  const loadActivities = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const activities = ActivityStorage.getActivities();
    
    // Auto-update status for overdue activities
    const updatedActivities = activities.map(activity => {
      if (activity.status === 'pendiente' && isActivityOverdue(activity.date, activity.time)) {
        const updated = { ...activity, status: 'vencido' as Status };
        ActivityStorage.updateActivity(updated);
        return updated;
      }
      return activity;
    });
    
    dispatch({ type: 'LOAD_ACTIVITIES', payload: updatedActivities });
  };

  const addActivity = (data: ActivityFormData) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      ...data,
      status: 'pendiente',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    ActivityStorage.addActivity(newActivity);
    dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
  };

  const updateActivity = (id: string, data: Partial<Activity>) => {
    const activity = state.activities.find(a => a.id === id);
    if (!activity) return;
    
    const updatedActivity = {
      ...activity,
      ...data,
      updatedAt: new Date()
    };
    
    ActivityStorage.updateActivity(updatedActivity);
    dispatch({ type: 'UPDATE_ACTIVITY', payload: updatedActivity });
  };

  const deleteActivity = (id: string) => {
    ActivityStorage.deleteActivity(id);
    dispatch({ type: 'DELETE_ACTIVITY', payload: id });
  };

  const toggleActivityStatus = (id: string) => {
    const activity = state.activities.find(a => a.id === id);
    if (!activity) return;
    
    const newStatus: Status = activity.status === 'completado' ? 'pendiente' : 'completado';
    updateActivity(id, { status: newStatus });
  };

  const clearAllActivities = () => {
    ActivityStorage.clearAll();
    dispatch({ type: 'LOAD_ACTIVITIES', payload: [] });
  };

  const exportData = () => {
    return ActivityStorage.exportData();
  };

  const importData = (jsonData: string) => {
    const result = ActivityStorage.importData(jsonData);
    if (result.success) {
      loadActivities();
    }
    return result;
  };

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, []);

  // Auto-update stats periodically to catch overdue activities
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedStats = calculateActivityStats(state.activities);
      dispatch({ type: 'UPDATE_STATS', payload: updatedStats });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [state.activities]);

  return (
    <ActivityContext.Provider
      value={{
        state,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleActivityStatus,
        loadActivities,
        clearAllActivities,
        exportData,
        importData
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}