import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Relato {
  id: number;
  comunidade: string;
  tipoViolacao: string;
  descricao: string;
  local: string;
  dataOcorrido: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId?: number | null;
}

export interface PaginatedRelatos {
  data: Relato[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RelatoStats {
  total: number;
  abertos: number;
  encaminhados: number;
  resolvidos: number;
  tiposUnicos: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', {
      email,
      password,
    }),
  register: (email: string, password: string, name: string) =>
    api.post<{ access_token: string; user: User }>('/auth/register', {
      email,
      password,
      name,
    }),
};

export const relatoApi = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedRelatos>('/relatos', { params: { page, limit } }),
  getMeus: (page = 1, limit = 10) =>
    api.get<PaginatedRelatos>('/relatos/meus', { params: { page, limit } }),
  getStats: () => api.get<RelatoStats>('/relatos/stats'),
  getPendentes: () => api.get<Relato[]>('/relatos/pendentes'),
  create: (data: Omit<Relato, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Relato>('/relatos', data),
  update: (
    id: number,
    data: Partial<Omit<Relato, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => api.patch<Relato>(`/relatos/${id}`, data),
  delete: (id: number) => api.delete(`/relatos/${id}`),
};
