import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
    console.log(config.headers.Authorization);
    console.log('token:', token);
  }

  return config;
});

export default api;
