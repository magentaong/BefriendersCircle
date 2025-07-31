import axios from "axios";

const TRAINING_API_URL = "http://localhost:5050/api/training";

export async function createTraining(tID: string, cID: string, title: string, coverImg?: string) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    TRAINING_API_URL,
    {
      tID,
      cID,
      title,
      coverImg: coverImg || null,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateTraining(tID: string, progress: number, status: boolean) {
  const token = localStorage.getItem("token");

  const response = await axios.patch(
    `${TRAINING_API_URL}/${tID}`,
    {
      progress,
      status,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getTraining(cID: string, title: string) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    TRAINING_API_URL,
    {
      params: { 
        cID, 
        title 
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}