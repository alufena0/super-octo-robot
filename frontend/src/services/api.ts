import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductStats {
  total: number;
  stockValue: number;
  lowStock: number;
  avgMargin: number;
  categories: number;
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
    api.post('/auth/register', { email, password, name }),
};

export const productApi = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedProducts>('/products', { params: { page, limit } }),
  getStats: () => api.get<ProductStats>('/products/stats'),
  getLowStock: () => api.get<Product[]>('/products/low-stock'),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Product>('/products', data),
  update: (
    id: number,
    data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => api.patch<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};
