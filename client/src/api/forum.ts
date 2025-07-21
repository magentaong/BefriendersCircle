import axios from "axios";

const API_URL = "http://localhost:5050/api/boards";

export async function initTopics(category: string) {
    const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/${category}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
       return response.data;
    }