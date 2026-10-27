import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { api_url, api_url_v1 } from "./config";

const api = axios.create({
  baseURL: api_url_v1,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Set by the app root so a 401 can reset auth state without a circular import
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // If the server says "Go away," clean up locally
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userData");
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;