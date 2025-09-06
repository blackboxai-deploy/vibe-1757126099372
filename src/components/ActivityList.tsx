'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Activity, ActivityFilter } from '@/types/activity';
import { ActivityCard } from './ActivityCard';

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

type SortOption = 'date-asc' | 'date-desc' | 'priority' | 'title';

export function ActivityList({ activities, onEdit, onDelete, onToggleComplete }: ActivityListProps) {
  const [filter, setFilter] = useState<ActivityFilter>({
    status: 'all',
    category: 'all',
    priority: 'all',
    searchTerm: ''
  });
  
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');

  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities;

    // Apply filters
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === filter.status);
    }

    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter(activity => activity.category === filter.category);
    }

    if (filter.priority && filter.priority !== 'all') {
      filtered = filtered.filter(activity => activity.priority === filter.priority);
    }

    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm) ||
        (activity.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'priority':
          const priorityOrder = { alta: 3, media: 2, baja: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [activities, filter, sortBy]);

  const handleFilterChange = (key: keyof ActivityFilter, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      status: 'all',
      category: 'all',
      priority: 'all',
      searchTerm: ''
    });
  };

  const hasActiveFilters = filter.status !== 'all' || 
                          filter.category !== 'all' || 
                          filter.priority !== 'all' || 
                          filter.searchTerm !== '';

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar actividades..."
              value={filter.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">
                  <div className="flex items-center">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Fecha (más próximo)
                  </div>
                </SelectItem>
                <SelectItem value="date-desc">
                  <div className="flex items-center">
                    <SortDesc className="h-4 w-4 mr-2" />
                    Fecha (más lejano)
                  </div>
                </SelectItem>
                <SelectItem value="priority">Prioridad</SelectItem>
                <SelectItem value="title">Título A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={filter.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">🟡 Pendiente</SelectItem>
              <SelectItem value="completado">✅ Completado</SelectItem>
              <SelectItem value="vencido">❌ Vencido</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.category || 'all'}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="trabajo">💼 Trabajo</SelectItem>
              <SelectItem value="personal">👤 Personal</SelectItem>
              <SelectItem value="salud">🏥 Salud</SelectItem>
              <SelectItem value="estudio">📚 Estudio</SelectItem>
              <SelectItem value="hogar">🏠 Hogar</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.priority || 'all'}
            onValueChange={(value) => handleFilterChange('priority', value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="alta">🔴 Alta</SelectItem>
              <SelectItem value="media">🟡 Media</SelectItem>
              <SelectItem value="baja">🟢 Baja</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedActivities.length} de {activities.length} actividades
        </p>
        
        {hasActiveFilters && (
          <div className="flex gap-2">
            {filter.status !== 'all' && (
              <Badge variant="secondary">{filter.status}</Badge>
            )}
            {filter.category !== 'all' && (
              <Badge variant="secondary">{filter.category}</Badge>
            )}
            {filter.priority !== 'all' && (
              <Badge variant="secondary">{filter.priority}</Badge>
            )}
            {filter.searchTerm && (
              <Badge variant="secondary">"{filter.searchTerm}"</Badge>
            )}
          </div>
        )}
      </div>

      {/* Activity Cards */}
      <div className="space-y-4">
        {filteredAndSortedActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              📋
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {activities.length === 0 ? 'No hay actividades' : 'No se encontraron actividades'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {activities.length === 0 
                ? 'Crea tu primera actividad para comenzar a organizar tu día'
                : 'Intenta ajustar los filtros para encontrar lo que buscas'
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          filteredAndSortedActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))
        )}
      </div>
    </div>
  );
}