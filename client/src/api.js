import axios from 'axios';

export const api_git = axios.create({
  baseURL: import.meta.env.VITE_API_GIT_URL,
});

export const api_server = axios.create({
  baseURL: import.meta.env.VITE_API_SERVER_URL,
});