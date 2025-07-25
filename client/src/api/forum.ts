import axios from "axios";

const API_URL = "http://localhost:5050/api/boards";
const POST_API_URL = "http://localhost:5050/api/post";
const COMMENT_API_URL = "http://localhost:5050/api/comment";


export async function initTopics(category: string) {
    const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/${category}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
       return response.data;
    }

export async function uploadImage(image: File) {
    const token = localStorage.getItem("token");
    // Create a FormData instance
    const formData = new FormData();
    formData.append('image', image);  // Append the file with the key 'image'
    
    try {
        console.log(formData);
        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // Do NOT manually set 'Content-Type' when using FormData
            },
        });
        console.log(response.data)
        return response.data; // Return the response from the backend
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error; // Throw the error for further handling
    }
}

export async function postTopic(cID: string, category: string, name: string, coverImg: string) {
    const token = localStorage.getItem("token");
        const response = await axios.post(`${API_URL}/`, { cID,category, name, coverImg}, {
    headers: { Authorization: `Bearer ${token}` }
  });
       return response.data;
    }

export async function initPost(name: string) {
    console.log("get Post");
    const token = localStorage.getItem("token");
    const response = await axios.get(`${POST_API_URL}/${name}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
    console.log("Done!");
       return response.data;
    }

export async function postPost(cID: string, bID: string, message: string) {
    const token = localStorage.getItem("token");
        const response = await axios.post(`${POST_API_URL}/`, { cID,bID, message}, {
    headers: { Authorization: `Bearer ${token}` }
  });
       return response.data;
    }