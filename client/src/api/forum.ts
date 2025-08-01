import axios from "axios";

const API_URL = "http://localhost:5050/api/boards";
const POST_API_URL = "http://localhost:5050/api/post";
const COMMENT_API_URL = "http://localhost:5050/api/comment";
const FORUMLIKE_API_URL = "http://localhost:5050/api/like";



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
    console.log(response.data);
       return response.data;
    }

export async function postPost(cID: string, bID: string, message: string) {
    const token = localStorage.getItem("token");
        const response = await axios.post(`${POST_API_URL}/`, { cID,bID, message}, {
    headers: { Authorization: `Bearer ${token}` }
  });
       return response.data;
    }

export async function initComment(pID: string) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${COMMENT_API_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { pID },
  });
  return response.data;
}

export async function postComment(cID: string, pID: string, message: string) {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${COMMENT_API_URL}`, 
    { cID, pID, message }, 
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
}

export async function initPostDetail(postId: string) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${POST_API_URL}/details/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data; // returns { post, comments }
}

export async function deletePostDetail(postId: string) {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${POST_API_URL}/details/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data; // returns { message }
}

export async function getComments(pID: string,) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${COMMENT_API_URL}/${pID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Check if user liked a post
export async function checkUserLiked(cID: string, forumID: string) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${FORUMLIKE_API_URL}/status`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { cID, forumID, isPost: true }
  });
  return response.data; // { liked: boolean }
}

// Toggle like/unlike
export async function toggleLike(cID: string, forumID: string) {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${FORUMLIKE_API_URL}/toggle`,
    { cID, forumID, isPost: true },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data; // { liked: true/false }
}