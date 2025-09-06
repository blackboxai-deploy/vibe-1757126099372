export type Priority = 'alta' | 'media' | 'baja';
export type Category = 'trabajo' | 'personal' | 'salud' | 'estudio' | 'hogar';
export type Status = 'pendiente' | 'completado' | 'vencido';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  priority: Priority;
  category: Category;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityFormData {
  title: string;
  description?: string;
  date: Date;
  time: string;
  priority: Priority;
  category: Category;
}

export interface ActivityStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  todayCount: number;
}

export interface ActivityFilter {
  status?: Status | 'all';
  category?: Category | 'all';
  priority?: Priority | 'all';
  searchTerm?: string;
}

export const PRIORITY_COLORS = {
  alta: 'bg-red-500 text-white border-red-600',
  media: 'bg-yellow-500 text-white border-yellow-600',
  baja: 'bg-green-500 text-white border-green-600'
} as const;

export const CATEGORY_COLORS = {
  trabajo: 'bg-blue-100 text-blue-800 border-blue-200',
  personal: 'bg-purple-100 text-purple-800 border-purple-200',
  salud: 'bg-green-100 text-green-800 border-green-200',
  estudio: 'bg-orange-100 text-orange-800 border-orange-200',
  hogar: 'bg-pink-100 text-pink-800 border-pink-200'
} as const;

export const STATUS_COLORS = {
  pendiente: 'bg-gray-100 text-gray-800 border-gray-200',
  completado: 'bg-green-100 text-green-800 border-green-200',
  vencido: 'bg-red-100 text-red-800 border-red-200'
} as const;