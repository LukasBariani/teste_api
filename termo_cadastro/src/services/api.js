import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Interceptor de requisição (mantido)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de resposta SIMPLIFICADO (sem redirecionamentos automáticos)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log("Não autorizado - removendo token inválido");
      localStorage.removeItem("token");
      // Não redireciona aqui - o componente deve tratar
    }
    return Promise.reject(error);
  }
);

export default api;