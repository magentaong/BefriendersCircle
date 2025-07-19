import axios from "axios";

const API_URL = "http://localhost:5050/api/auth";

export async function login(email: string, password: string) {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    return res.data;
  } catch (err: any) {
    // Extract the backend error message
    throw new Error(err.response?.data?.message || "Login failed");
  }
}

export async function register(email: string, password: string, name: string) {
  try {
    const res = await axios.post(`${API_URL}/register`, { email, password , name});
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Signup failed");
  }
}

export async function fetchCurrentUser() {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:5050/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
