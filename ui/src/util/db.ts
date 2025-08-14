import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({});

export const API_URL = `${import.meta.env.VITE_API_HOST}${
  import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''
}`;
