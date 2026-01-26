import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10_000,
});

console.log('API baseURL:', process.env.EXPO_PUBLIC_API_URL);

api.interceptors.request.use((config) => {
  console.log(
    'HTTP',
    config.method?.toUpperCase(),
    (config.baseURL ?? '') + (config.url ?? ''),
  );
  return config;
});
