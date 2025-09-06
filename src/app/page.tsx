'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, List, Settings, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useActivity } from '@/contexts/ActivityContext';
import { Activity, ActivityFormData } from '@/types/activity';

import { Dashboard } from '@/components/Dashboard';
import { ActivityList } from '@/components/ActivityList';
import { Calendar } from '@/components/Calendar';
import { ActivityForm } from '@/components/ActivityForm';
import { NotificationSystem } from '@/components/NotificationSystem';
import { ExportImport } from '@/components/ExportImport';

export default function HomePage() {
  const { state, addActivity, updateActivity, deleteActivity, toggleActivityStatus, exportData, importData } = useActivity();
  const { setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const handleCreateActivity = () => {
    setEditingActivity(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: ActivityFormData) => {
    if (formMode === 'create') {
      addActivity(data);
    } else if (editingActivity) {
      updateActivity(editingActivity.id, data);
    }
    setIsFormOpen(false);
    setEditingActivity(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingActivity(null);
  };

  const handleViewActivities = () => {
    setActiveTab('activities');
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Recordatorio de Actividades
          </h1>
          <p className="text-muted-foreground mt-1">
            Organiza tu día y mantente productivo
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationSystem 
            activities={state.activities} 
            onViewActivities={handleViewActivities}
          />
          
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-2" />
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-2" />
                Oscuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="h-4 w-4 mr-2" />
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Actividades</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuración</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Dashboard
            activities={state.activities}
            stats={state.stats}
            onCreateActivity={handleCreateActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={deleteActivity}
            onToggleComplete={toggleActivityStatus}
          />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Todas las Actividades</h2>
            <Button onClick={handleCreateActivity}>
              Nueva Actividad
            </Button>
          </div>
          
          <ActivityList
            activities={state.activities}
            onEdit={handleEditActivity}
            onDelete={deleteActivity}
            onToggleComplete={toggleActivityStatus}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Calendar
            activities={state.activities}
            onCreateActivity={handleCreateActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={deleteActivity}
            onToggleComplete={toggleActivityStatus}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Configuración</h2>
              <p className="text-muted-foreground">
                Gestiona tus datos y configuración de la aplicación
              </p>
            </div>
            
            <ExportImport
              onExport={exportData}
              onImport={importData}
              totalActivities={state.activities.length}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Activity Form Modal */}
      <ActivityForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        activity={editingActivity}
        mode={formMode}
      />
    </div>
  );
}