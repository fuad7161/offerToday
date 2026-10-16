import axios from 'axios'

// Single Axios instance for the whole app.
// VITE_API_URL should include the `/api` prefix, e.g. http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

export default api
