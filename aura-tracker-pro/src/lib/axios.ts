import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1", // Proxy in vite.config.ts will handle this to backend
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default api;
