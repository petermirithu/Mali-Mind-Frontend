import axios from "axios";

export const baseUrl = (__DEV__) ? process.env.EXPO_PUBLIC_API_BASE_URL_DEV : process.env.EXPO_PUBLIC_API_BASE_URL_PROD

export const api = axios.create({
  baseURL: baseUrl,
});