import axios from 'axios';
import { API_BASE_URL } from './config.js';

export const api = axios.create({
  baseURL: API_BASE_URL
});

export const withAuth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});
