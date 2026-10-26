const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export type User = { id: number | string; name: string; email: string };
export type Task = {
  id: number | string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

async function request<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? `Request failed (${response.status})`);
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', undefined, { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', undefined, { method: 'POST', body: JSON.stringify(body) }),
  listTasks: (token: string) => request<{ tasks: Task[] }>('/tasks', token),
  createTask: (token: string, body: { title: string; description: string }) =>
    request<{ task: Task }>('/tasks', token, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (token: string, id: string | number, body: Partial<Pick<Task, 'title' | 'description' | 'completed'>>) =>
    request<{ task: Task }>(`/tasks/${id}`, token, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (token: string, id: string | number) =>
    request<void>(`/tasks/${id}`, token, { method: 'DELETE' })
};
