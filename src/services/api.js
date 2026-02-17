import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'https://heyama-api-production.up.railway.app';

// Socket avec options de reconnexion
export const socket = io(API_URL, {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const createEvent = async (title, description, imageUri) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  });

  const response = await api.post('/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};